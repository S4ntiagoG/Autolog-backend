import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ClientVehicleHomeResponse, ServiceHistoryItem } from '../../../core/models/api.models';
import { ClientPortalService } from './client-portal.service';

type ClientTab = 'HISTORY' | 'TRACKING';
type TimelineState = 'complete' | 'active' | 'pending';

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
  readonly latestOrder = computed(() => this.historyItems()[0] ?? null);
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
    this.loadHistory(vehicle.vehicleId);
  }

  selectTab(tab: ClientTab): void {
    this.activeTab.set(tab);
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
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((history) => {
      if (history) {
        this.historyItems.set(history);
        const currentVehicle = this.vehicle();
        if (currentVehicle) {
          this.portal.vehicle.set({
            ...currentVehicle,
            status: history[0]?.status ?? (history.length ? 'PENDIENTE' : 'SIN ORDEN')
          });
        }
        this.historyError.set('');
      }
      this.historyLoading.set(false);
    });
  }
}