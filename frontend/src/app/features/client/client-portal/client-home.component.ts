import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { TimeoutError, catchError, finalize, map, of, switchMap, timer, timeout } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  ClientVehicleHomeResponse,
  PaymentMethod,
  PAYMENT_METHOD_LABELS,
  ServiceHistoryItem,
  ServiceOrderResponse
} from '../../../core/models/api.models';
import { ClientPortalService } from './client-portal.service';

type ClientTab = 'HISTORY' | 'TRACKING';
type TimelineState = 'complete' | 'active' | 'pending';

interface LatestOrderSnapshot {
  history: ServiceHistoryItem[];
  order: ServiceOrderResponse | null;
  costBreakdownError: string;
}

interface TimelineStep {
  label: string;
  description: string;
}

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-home.component.html',
  styleUrl: './client-home.component.css'
})
export class ClientHomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly portal = inject(ClientPortalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeTab = signal<ClientTab>('HISTORY');
  readonly vehicle = this.portal.vehicle;
  readonly historyItems = signal<ServiceHistoryItem[]>([]);
  readonly historyLoading = signal(false);
  readonly historyError = signal('');
  readonly latestOrderDetails = signal<ServiceOrderResponse | null>(null);
  readonly costBreakdownError = signal('');
  readonly clientIdentificationNumber = signal('');
  readonly paymentOrderId = signal<number | null>(null);
  readonly paymentMethod = signal<PaymentMethod>('EFECTIVO');
  readonly paymentLoadingOrderId = signal<number | null>(null);
  readonly paymentError = signal('');
  readonly paymentSuccessOrderId = signal<number | null>(null);
  readonly latestOrder = computed(() => this.historyItems()[0] ?? null);
  readonly partsSubtotal = computed(() => this.roundCurrency(
    (this.latestOrderDetails()?.parts ?? []).reduce((total, part) => total + part.quantity * part.unitPrice, 0)
  ));
  readonly laborSubtotal = computed(() => this.roundCurrency(
    (this.latestOrderDetails()?.labor ?? []).reduce((total, labor) => total + labor.hours * labor.rate, 0)
  ));
  readonly costBreakdownTotal = computed(() =>
    this.roundCurrency(this.partsSubtotal() + this.laborSubtotal())
  );
  readonly includedVat = computed(() =>
    this.roundCurrency(this.costBreakdownTotal() * 19 / 119)
  );
  readonly hasCostBreakdown = computed(() =>
    Boolean(this.latestOrderDetails()?.parts?.length || this.latestOrderDetails()?.labor?.length)
  );
  readonly laborDescriptions = computed(() =>
    (this.latestOrderDetails()?.labor ?? [])
      .map((labor) => labor.description.trim())
      .filter(Boolean)
  );
  readonly timelineSteps: TimelineStep[] = [
    { label: 'Ingresado al taller', description: 'Recepción y registro inicial.' },
    { label: 'En diagnóstico', description: 'El taller revisa el vehículo.' },
    { label: 'En reparación', description: 'Se realizan los trabajos de servicio.' },
    { label: 'Listo para entrega', description: 'El vehículo está listo para recoger.' }
  ];
  readonly progressTitle = computed(() => {
    const vehicleType = this.vehicle()?.vehicleType;
    return `Progreso de tu ${(vehicleType || 'vehículo').toLocaleLowerCase('es-CO')}`;
  });

  ngOnInit(): void {
    const vehicle = this.vehicle() ?? history.state.clientVehicle as ClientVehicleHomeResponse | undefined;
    if (!vehicle) {
      void this.router.navigate(['/client/search']);
      return;
    }
    this.portal.vehicle.set(vehicle);
    const identificationNumber = history.state.clientIdentificationNumber;
    this.clientIdentificationNumber.set(
      typeof identificationNumber === 'string' ? identificationNumber : ''
    );
    this.loadHistory(vehicle.vehicleId);
  }

  selectTab(tab: ClientTab): void {
    this.activeTab.set(tab);
  }

  togglePayment(orderId: number): void {
    this.paymentError.set('');
    this.paymentSuccessOrderId.set(null);
    this.paymentOrderId.update((currentId) => currentId === orderId ? null : orderId);
    this.paymentMethod.set('EFECTIVO');
  }

  setPaymentMethod(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'EFECTIVO' || value === 'TRANSFERENCIA' ||
        value === 'TARJETA_DEBITO' || value === 'TARJETA_CREDITO') {
      this.paymentMethod.set(value);
    }
  }

  paymentMethodLabel(method: PaymentMethod | null | undefined): string {
    return method ? PAYMENT_METHOD_LABELS[method] : 'Sin registrar';
  }

  simulatePayment(item: ServiceHistoryItem): void {
    const vehicle = this.vehicle();
    if (!vehicle || !this.clientIdentificationNumber() ||
        item.status !== 'LISTO' || item.paymentMethod || this.paymentLoadingOrderId() !== null) {
      return;
    }

    this.paymentError.set('');
    this.paymentLoadingOrderId.set(item.serviceOrderId);
    this.portal.simulatePayment(item.serviceOrderId, {
      plate: vehicle.plate,
      identificationNumber: this.clientIdentificationNumber(),
      paymentMethod: this.paymentMethod()
    }).pipe(
      timeout({ first: 30_000 }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.paymentLoadingOrderId.set(null))
    ).subscribe({
      next: (payment) => {
        this.historyItems.update((items) => items.map((historyItem) =>
          historyItem.serviceOrderId === payment.serviceOrderId
            ? {
                ...historyItem,
                paymentMethod: payment.paymentMethod,
                paymentRecordedAt: payment.paymentRecordedAt,
                paymentAmount: payment.amount
              }
            : historyItem
        ));
        this.latestOrderDetails.update((order) => order?.id === payment.serviceOrderId
          ? {
              ...order,
              paymentMethod: payment.paymentMethod,
              paymentRecordedAt: payment.paymentRecordedAt,
              paymentAmount: payment.amount
            }
          : order);
        this.paymentSuccessOrderId.set(payment.serviceOrderId);
        this.paymentOrderId.set(null);
      },
      error: (error: unknown) => {
        console.error('Error registrando el medio de pago simulado:', error);
        if (error instanceof TimeoutError) {
          this.paymentError.set('No se recibió confirmación en 30 segundos. Actualiza el historial antes de volver a intentarlo para verificar si el pago quedó registrado.');
        } else if (error instanceof HttpErrorResponse && error.status === 409) {
          this.paymentError.set('El servicio ya no está disponible para pago o el pago ya fue registrado. Actualiza la página.');
        } else if (error instanceof HttpErrorResponse && error.status === 404) {
          this.paymentError.set('No se pudo validar la orden con los datos del vehículo. Vuelve a consultar el vehículo.');
        } else {
          this.paymentError.set('No se pudo registrar el pago simulado. Verifica tu conexión e inténtalo de nuevo.');
        }
      }
    });
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return year && month && day ? `${day}/${month}/${year}` : date;
  }

  formatCost(cost: number | null): string {
    if (cost === null) {
      return 'Sin costo registrado';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(cost);
  }

  downloadQuote(): void {
    window.print();
  }

  statusClass(status: string | null | undefined): string {
    switch (status?.toUpperCase()) {
      case 'LISTO':
        return 'border-green-800 bg-green-950/60 text-green-300';
      case 'EN PROGRESO':
        return 'border-sky-800 bg-sky-950/60 text-sky-300';
      case 'PENDIENTE':
        return 'border-amber-800 bg-amber-950/60 text-amber-300';
      default:
        return 'border-neutral-700 bg-neutral-900 text-neutral-400';
    }
  }

  timelineState(index: number): TimelineState {
    const status = this.latestOrder()?.status?.toUpperCase() ?? this.vehicle()?.status?.toUpperCase();
    if (index === 0 || status === 'LISTO') {
      return 'complete';
    }
    const activeIndex = status === 'EN PROGRESO' ? 2 : 1;
    if (index < activeIndex) {
      return 'complete';
    }
    return index === activeIndex ? 'active' : 'pending';
  }

  showProgressNote(index: number): boolean {
    const status = this.latestOrder()?.status?.toUpperCase();
    return Boolean(this.latestOrder()?.progressNote) &&
      (status === 'LISTO' ? index === this.timelineSteps.length - 1 : this.timelineState(index) === 'active');
  }

  taskTimelineState(index: number): TimelineState {
    const tasks = this.latestOrder()?.tasks ?? [];
    const task = tasks[index];
    if (task?.completed) {
      return 'complete';
    }
    const status = this.latestOrder()?.status?.toUpperCase();
    const firstIncompleteTask = tasks.findIndex((item) => !item.completed);
    return status === 'EN PROGRESO' && index === firstIncompleteTask ? 'active' : 'pending';
  }

  orderTasks(order: ServiceHistoryItem): ServiceHistoryItem['tasks'] {
    return order.tasks ?? [];
  }

  formatPickupTime(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(value));
  }

  private loadHistory(vehicleId: number): void {
    this.historyLoading.set(true);
    this.historyError.set('');
    timer(0, 15000).pipe(
      switchMap(() => this.portal.getVehicleHistory(vehicleId).pipe(
        catchError((error: unknown) => {
          console.error('Error cargando historial del vehículo:', error);
          this.historyError.set('No fue posible actualizar el historial de servicios.');
          this.historyLoading.set(false);
          return of(null);
        })
      )),
      switchMap((history) => {
        if (history === null) {
          return of(null);
        }
        const latestOrder = history[0];
        if (!latestOrder) {
          return of({ history, order: null, costBreakdownError: '' });
        }
        return this.portal.getServiceOrder(latestOrder.serviceOrderId).pipe(
          map((order) => ({ history, order, costBreakdownError: '' })),
          catchError((error: unknown) => {
            console.error('Error cargando el desglose de costos:', error);
            return of({
              history,
              order: null,
              costBreakdownError: 'No fue posible cargar el desglose de costos.'
            });
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((snapshot) => {
      if (snapshot) {
        this.historyItems.set(snapshot.history);
        this.latestOrderDetails.set(snapshot.order);
        this.costBreakdownError.set(snapshot.costBreakdownError);
        const currentVehicle = this.vehicle();
        if (currentVehicle) {
          this.portal.vehicle.set({
            ...currentVehicle,
            status: snapshot.history[0]?.status ?? (snapshot.history.length ? 'PENDIENTE' : 'SIN ORDEN')
          });
        }
        this.historyError.set('');
      }
      this.historyLoading.set(false);
    });
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}