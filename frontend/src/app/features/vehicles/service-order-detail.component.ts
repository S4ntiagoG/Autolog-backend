import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { OrderTask, ServiceOrderResponse } from '../../core/models/api.models';
import { VehicleEditService } from './services/vehicle-edit.service';

@Component({
  selector: 'app-service-order-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-order-detail.component.html',
  styleUrl: './service-order-detail.component.css'
})
export class ServiceOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly vehicleEditService = inject(VehicleEditService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly order = signal<ServiceOrderResponse | null>(null);
  readonly taskInput = signal('');
  readonly tasks = signal<OrderTask[]>([]);

  form = this.fb.nonNullable.group({
    primaryReason: ['', Validators.required],
    currentMileage: [0, [Validators.required, Validators.min(0)]],
    mileageUnit: ['KM'],
    initialObservations: [''],
    workshopPreliminaryObservations: [''],
    customerObservations: [''],
    orderStatus: ['PENDIENTE']
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || Number(this.route.snapshot.paramMap.get('vehicleId'));
    if (!id) {
      this.error.set('Orden no válida');
      return;
    }

    this.loading.set(true);
    this.vehicleEditService.getServiceOrder(id).subscribe({
      next: (response) => {
        this.order.set(response);
        this.tasks.set(response.tasks ?? []);
        this.form.patchValue({
          primaryReason: response.primaryReason ?? '',
          currentMileage: response.currentMileage ?? 0,
          mileageUnit: response.mileageUnit ?? 'KM',
          initialObservations: response.initialObservations ?? '',
          workshopPreliminaryObservations: response.workshopPreliminaryObservations ?? '',
          customerObservations: response.customerObservations ?? '',
          orderStatus: response.orderStatus ?? 'PENDIENTE'
        });
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo cargar la orden de servicio.');
      }
    });
  }

  saveOrder(): void {
    const currentOrder = this.order();
    if (!currentOrder) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();
    this.vehicleEditService.updateServiceOrder(currentOrder.id, {
      primaryReason: payload.primaryReason,
      currentMileage: payload.currentMileage,
      mileageUnit: payload.mileageUnit,
      initialObservations: payload.initialObservations,
      workshopPreliminaryObservations: payload.workshopPreliminaryObservations,
      customerObservations: payload.customerObservations,
      orderStatus: payload.orderStatus,
      reasons: payload.primaryReason ? [payload.primaryReason] : []
    }).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.success.set('Diagnóstico actualizado correctamente.');
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'No fue posible guardar la actualización.');
        this.saving.set(false);
      }
    });
  }

  addTask(): void {
    const current = this.order();
    const description = this.taskInput().trim();
    if (!current || !description) {
      this.error.set('La descripción de la tarea no puede ir vacía.');
      return;
    }

    this.vehicleEditService.addTask(current.id, description).subscribe({
      next: (task) => {
        this.tasks.update((items) => [...items, task]);
        this.taskInput.set('');
        this.success.set('Tarea agregada correctamente.');
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'No se pudo guardar la tarea.');
      }
    });
  }

  toggleTask(task: OrderTask): void {
    const current = this.order();
    if (!current) {
      return;
    }

    this.vehicleEditService.toggleTask(current.id, task.id, !task.completed).subscribe({
      next: (updated) => {
        this.tasks.update((items) => items.map((item) => item.id === updated.id ? updated : item));
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'No se pudo cambiar el estado de la tarea.');
      }
    });
  }

  setStatus(status: string): void {
    const current = this.order();
    if (!current) {
      return;
    }
    this.form.patchValue({ orderStatus: status });
    this.vehicleEditService.updateServiceOrderStatus(current.id, status).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.success.set('Estado de la orden actualizado.');
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'No fue posible actualizar el estado.');
      }
    });
  }
}
