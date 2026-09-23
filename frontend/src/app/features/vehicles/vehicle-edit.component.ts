import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { VehicleEditService } from './services/vehicle-edit.service';

@Component({
  selector: 'app-vehicle-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vehicle-edit.component.html',
  styleUrl: './vehicle-edit.component.css'
})
export class VehicleEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vehicleEditService = inject(VehicleEditService);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  form = this.fb.nonNullable.group({
    vehicleType: ['', Validators.required],
    brand: ['', Validators.required],
    plate: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2,4}[-]?[0-9A-Za-z]{3,8}$/)]],
    chassisNumber: ['', [Validators.required, Validators.pattern(/^[A-HJ-NPR-Z0-9]{17}$/)]],
    model: ['', Validators.required],
    vehicleYear: [new Date().getFullYear(), [Validators.required, Validators.min(1886), Validators.max(new Date().getFullYear() + 1)]],
    clientName: ['', [Validators.required, Validators.pattern(/\S+/)]],
    identificationNumber: ['', [Validators.required, Validators.pattern(/\S+/)]],
    phone: ['', [Validators.required, Validators.pattern(/^(\+?\d{7,15}|\d{7,15})$/)]],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    const vehicleId = Number(this.id);
    if (!vehicleId) {
      this.error.set('Vehículo no válido');
      return;
    }

    this.loading.set(true);
    this.vehicleEditService.getVehicle(vehicleId).subscribe({
      next: (vehicle) => {
        this.form.patchValue({
          vehicleType: vehicle.vehicleType ?? '',
          brand: vehicle.brand ?? '',
          plate: vehicle.plate ?? '',
          chassisNumber: vehicle.chassisNumber ?? '',
          model: vehicle.model ?? '',
          vehicleYear: vehicle.vehicleYear ?? new Date().getFullYear(),
          clientName: vehicle.client?.name ?? '',
          identificationNumber: vehicle.client?.identificationNumber ?? '',
          phone: vehicle.client?.phone ?? '',
          email: vehicle.client?.email ?? ''
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del vehículo.');
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const vehicleId = Number(this.id);
    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.vehicleEditService.getVehicle(vehicleId).subscribe({
      next: (vehicle) => {
        this.vehicleEditService.updateVehicle(vehicleId, {
          vehicleType: raw.vehicleType,
          brand: raw.brand,
          plate: raw.plate,
          chassisNumber: raw.chassisNumber,
          model: raw.model,
          vehicleYear: raw.vehicleYear
        }).subscribe({
          next: () => {
            this.vehicleEditService.updateClient(vehicle.client.id, {
              name: raw.clientName,
              identificationNumber: raw.identificationNumber,
              phone: raw.phone,
              email: raw.email
            }).subscribe({
              next: () => {
                this.success.set('Vehículo y cliente actualizados correctamente.');
                this.saving.set(false);
                setTimeout(() => this.router.navigate(['/vehicles']), 600);
              },
              error: (err: HttpErrorResponse) => {
                this.saving.set(false);
                this.error.set(err.error?.message ?? 'No fue posible actualizar la información del cliente.');
              }
            });
          },
          error: (err: HttpErrorResponse) => {
            this.saving.set(false);
            this.error.set(err.error?.message ?? 'No fue posible actualizar la información del vehículo.');
          }
        });
      },
      error: () => {
        this.saving.set(false);
        this.error.set('No se pudo recuperar el vehículo para completar la edición.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/vehicles']);
  }

  showError(path: string): boolean {
    const control = this.form.get(path);
    return Boolean(control?.invalid && (control.touched || control.dirty));
  }

  errorFor(path: string): string {
    const control = this.form.get(path);
    if (!control?.errors) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    if (control.hasError('email')) {
      return 'Ingresa un correo válido.';
    }
    if (control.hasError('pattern')) {
      return 'Formato inválido.';
    }
    if (control.hasError('min')) {
      return 'El valor no puede ser menor.';
    }
    if (control.hasError('max')) {
      return 'El año no es válido.';
    }
    return 'Revisa este campo.';
  }
}
