import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  ServiceLaborRequest,
  ServiceOrderRequest,
  ServiceOrderResponse,
  ServicePartRequest,
  ServiceTaskRequest,
  VehicleResponse,
  VehicleServiceStatus
} from '../../core/models/api.models';
import { VehicleMechanicService } from '../vehicles/services/vehicle-mechanic.service';

@Component({
  selector: 'app-service-work-order',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-work-order.component.html',
  styleUrl: './service-work-order.component.css'
})
export class ServiceWorkOrderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly mechanicService = inject(VehicleMechanicService);

  readonly vehicle = signal<VehicleResponse | null>(null);
  readonly order = signal<ServiceOrderResponse | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly diagnosis = computed(() => {
    const order = this.order();
    return order?.mechanicDiagnosis || order?.primaryReason || 'No se registró un diagnóstico en el ingreso del vehículo.';
  });
  readonly mileage = signal<number | null>(null);
  readonly status = signal<VehicleServiceStatus>('PENDIENTE');
  readonly tasks = signal<ServiceTaskRequest[]>([]);
  readonly parts = signal<ServicePartRequest[]>([]);
  readonly labor = signal<ServiceLaborRequest[]>([]);
  readonly showInvoice = signal(false);

  readonly partsSubtotal = computed(() =>
    this.roundCurrency(this.parts().reduce((sum, part) => sum + part.quantity * part.unitPrice, 0))
  );
  readonly laborSubtotal = computed(() =>
    this.roundCurrency(this.labor().reduce((sum, item) => sum + item.hours * item.rate, 0))
  );
  readonly shopSupplies = computed(() => this.roundCurrency(this.partsSubtotal() * 0.05));
  readonly total = computed(() =>
    this.roundCurrency(this.partsSubtotal() + this.laborSubtotal() + this.shopSupplies())
  );
  readonly partsShare = computed(() =>
    this.total() === 0 ? 0 : this.roundCurrency((this.partsSubtotal() / this.total()) * 100)
  );

  ngOnInit(): void {
    const vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));
    if (!Number.isInteger(vehicleId) || vehicleId < 1) {
      this.error.set('El identificador del vehículo no es válido.');
      this.loading.set(false);
      return;
    }

    forkJoin({
      vehicle: this.mechanicService.getVehicle(vehicleId),
      orders: this.mechanicService.getServiceOrders()
    }).subscribe({
      next: ({ vehicle, orders }) => {
        const existingOrder = orders
          .filter((item) => item.vehicle.id === vehicleId)
          .sort((left, right) => {
            const dateDifference = right.entryDate.localeCompare(left.entryDate);
            return dateDifference || right.id - left.id;
          })[0] ?? null;

        this.vehicle.set(vehicle);
        this.order.set(existingOrder);
        this.loadOrder(existingOrder);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Error cargando la orden de trabajo:', error);
        this.error.set('No se pudo cargar el vehículo y sus órdenes. Verifica que el backend esté ejecutándose e inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'PENDIENTE' || value === 'EN PROGRESO' || value === 'LISTO') {
      this.status.set(value);
      this.success.set('');
    }
  }

  addTask(): void {
    this.tasks.update((items) => [...items, { description: '', completed: false }]);
    this.success.set('');
  }

  updateTaskDescription(index: number, event: Event): void {
    const description = (event.target as HTMLInputElement).value;
    this.tasks.update((items) => items.map((item, position) =>
      position === index ? { ...item, description } : item
    ));
    this.success.set('');
  }

  toggleTask(index: number, event: Event): void {
    const completed = (event.target as HTMLInputElement).checked;
    this.tasks.update((items) => items.map((item, position) =>
      position === index ? { ...item, completed } : item
    ));
    this.success.set('');
  }

  removeTask(index: number): void {
    this.tasks.update((items) => items.filter((_, position) => position !== index));
  }

  addPart(): void {
    this.parts.update((items) => [...items, { name: '', partNumber: '', quantity: 1, unitPrice: 0 }]);
    this.success.set('');
  }

  updatePart(index: number, field: keyof ServicePartRequest, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = field === 'quantity' || field === 'unitPrice' ? Number(input.value) : input.value;
    this.parts.update((items) => items.map((item, position) =>
      position === index ? { ...item, [field]: value } : item
    ));
    this.success.set('');
  }

  removePart(index: number): void {
    this.parts.update((items) => items.filter((_, position) => position !== index));
  }

  addLabor(): void {
    this.labor.update((items) => [...items, { description: '', hours: 1, rate: 0 }]);
    this.success.set('');
  }

  updateLabor(index: number, field: keyof ServiceLaborRequest, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = field === 'hours' || field === 'rate' ? Number(input.value) : input.value;
    this.labor.update((items) => items.map((item, position) =>
      position === index ? { ...item, [field]: value } : item
    ));
    this.success.set('');
  }

  removeLabor(index: number): void {
    this.labor.update((items) => items.filter((_, position) => position !== index));
  }

  save(): void {
    const vehicle = this.vehicle();
    if (!vehicle || this.saving()) {
      return;
    }

    this.error.set('');
    this.success.set('');

    if (!Number.isInteger(this.mileage()) || (this.mileage() ?? -1) < 0) {
      this.error.set('Esta orden no tiene un kilometraje registrado. Registra primero el ingreso del vehículo.');
      return;
    }
    if (!this.hasValidItems()) {
      this.error.set('Completa los datos de las tareas, repuestos e insumos y mano de obra, o elimina las filas vacías.');
      return;
    }

    const existingOrder = this.order();
    const request: ServiceOrderRequest = {
      entryDate: existingOrder?.entryDate ?? this.todayAsIso(),
      primaryReason: existingOrder?.primaryReason ?? '',
      currentMileage: this.mileage()!,
      customerObservations: existingOrder?.customerObservations ?? '',
      ...(existingOrder?.mechanicDiagnosis ? { mechanicDiagnosis: existingOrder.mechanicDiagnosis } : {}),
      status: this.status(),
      tasks: this.tasks(),
      parts: this.parts(),
      labor: this.labor(),
      serviceCost: this.total(),
      vehicle: { id: vehicle.id }
    };

    this.saving.set(true);
    this.mechanicService.saveServiceOrder(existingOrder?.id ?? null, request).subscribe({
      next: (savedOrder) => {
        if (!this.matchesSavedWorkOrder(savedOrder, request)) {
          this.error.set('El backend respondió sin confirmar las tareas, repuestos, mano de obra y estado. Reinicia Spring Boot para cargar los cambios de persistencia y vuelve a guardar.');
          this.saving.set(false);
          return;
        }

        this.order.set(savedOrder);
        this.loadOrder(savedOrder);
        this.success.set('La orden de trabajo y sus cambios se guardaron correctamente.');
        this.saving.set(false);
      },
      error: (error: unknown) => {
        console.error('Error guardando la orden de trabajo:', error);
        this.error.set('No se pudo guardar la orden. Revisa la conexión con el backend e inténtalo de nuevo.');
        this.saving.set(false);
      }
    });
  }

  printInvoice(): void {
    if (this.order()) {
      this.showInvoice.set(true);
    }
  }

  closeInvoice(): void {
    this.showInvoice.set(false);
  }

  printInvoiceDocument(): void {
    window.print();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  }

  orderNumber(): string {
    const id = this.order()?.id;
    return id ? `SO-${new Date().getFullYear()}-${String(id).padStart(6, '0')}` : 'NUEVA ORDEN';
  }

  private loadOrder(order: ServiceOrderResponse | null): void {
    this.mileage.set(order?.currentMileage ?? null);
    this.status.set(order?.status ?? 'PENDIENTE');
    this.tasks.set(order?.tasks ?? []);
    this.parts.set(order?.parts ?? []);
    this.labor.set(order?.labor ?? []);
  }

  private hasValidItems(): boolean {
    const validTasks = this.tasks().every((task) => task.description.trim().length > 0);
    const validParts = this.parts().every((part) =>
      part.name.trim().length > 0 &&
      Number.isInteger(part.quantity) &&
      part.quantity > 0 &&
      Number.isFinite(part.unitPrice) &&
      part.unitPrice >= 0
    );
    const validLabor = this.labor().every((item) =>
      item.description.trim().length > 0 &&
      Number.isFinite(item.hours) &&
      item.hours > 0 &&
      Number.isFinite(item.rate) &&
      item.rate >= 0
    );
    return validTasks && validParts && validLabor;
  }

  private matchesSavedWorkOrder(savedOrder: ServiceOrderResponse, request: ServiceOrderRequest): boolean {
    const sameTasks = JSON.stringify((savedOrder.tasks ?? []).map(({ description, completed }) => ({ description, completed }))) ===
      JSON.stringify((request.tasks ?? []).map(({ description, completed }) => ({ description, completed })));
    const sameParts = JSON.stringify((savedOrder.parts ?? []).map(({ name, partNumber, quantity, unitPrice }) =>
      ({ name, partNumber, quantity, unitPrice })
    )) === JSON.stringify((request.parts ?? []).map(({ name, partNumber, quantity, unitPrice }) =>
      ({ name, partNumber, quantity, unitPrice })
    ));
    const sameLabor = JSON.stringify((savedOrder.labor ?? []).map(({ description, hours, rate }) =>
      ({ description, hours, rate })
    )) === JSON.stringify((request.labor ?? []).map(({ description, hours, rate }) =>
      ({ description, hours, rate })
    ));

    return savedOrder.status === request.status &&
      Number(savedOrder.serviceCost) === Number(request.serviceCost) &&
      sameTasks &&
      sameParts &&
      sameLabor;
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private todayAsIso(): string {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 10);
  }
}
