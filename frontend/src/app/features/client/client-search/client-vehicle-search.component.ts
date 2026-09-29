import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { colombianPlateValidator } from '../../../core/colombian-plate.validator';
import { ClientPortalService } from '../client-portal/client-portal.service';

@Component({
  selector: 'app-client-vehicle-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-vehicle-search.component.html',
  styleUrl: './client-vehicle-search.component.css'
})
export class ClientVehicleSearchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly portal = inject(ClientPortalService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    plate: ['', [Validators.required, colombianPlateValidator]],
    identificationNumber: ['', [Validators.required, Validators.pattern(/\S+/)]]
  });

  search(): void {
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.portal.searchVehicle(this.form.getRawValue()).subscribe({
      next: (vehicle) => {
        this.portal.vehicle.set(vehicle);
        this.loading.set(false);
        void this.router.navigate(['/client/home'], { state: { clientVehicle: vehicle } });
      },
      error: (requestError: unknown) => {
        this.loading.set(false);
        if (requestError instanceof HttpErrorResponse && requestError.status === 404) {
          this.error.set('No encontramos un vehículo asociado a esa placa y documento. Verifica los datos e intenta de nuevo.');
          return;
        }
        if (requestError instanceof HttpErrorResponse && requestError.status === 400) {
          this.error.set('La placa no tiene un formato válido.');
          return;
        }
        this.error.set('No fue posible consultar el vehículo. Verifica tu conexión e intenta de nuevo.');
      }
    });
  }

  normalizePlateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value.toUpperCase();
    if (input.value !== normalized) {
      const cursorPosition = input.selectionStart;
      input.value = normalized;
      this.form.controls.plate.setValue(normalized);
      if (cursorPosition !== null) {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
  }

  showError(field: 'plate' | 'identificationNumber'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  errorFor(field: 'plate' | 'identificationNumber'): string {
    const control = this.form.controls[field];
    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    if (control.hasError('invalidColombianPlate')) {
      return 'Formato de placa inválido. Ejemplo: ABC123 o ABC12D.';
    }
    if (control.hasError('pattern')) {
      return 'Ingresa un documento válido.';
    }
    return '';
  }
}