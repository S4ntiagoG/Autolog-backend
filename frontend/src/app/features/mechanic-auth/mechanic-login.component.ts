import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AutoDismissDirective } from '../../core/directives/auto-dismiss.directive';
import { MechanicAuthService } from './mechanic-auth.service';

@Component({
  selector: 'app-mechanic-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AutoDismissDirective],
  templateUrl: './mechanic-login.component.html',
  styleUrl: '../client/client-search/client-vehicle-search.component.css'
})
export class MechanicLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(MechanicAuthService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    codigoMecanico: ['', [Validators.required, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.maxLength(72)]]
  });

  login(): void {
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const request = this.form.getRawValue();
    this.auth.login({ ...request, codigoMecanico: request.codigoMecanico.trim() }).subscribe({
      next: (session) => {
        this.loading.set(false);
        void this.router.navigate([
          session.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
        ]);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.error.set('Usuario o contraseña incorrectos.');
        } else if (error instanceof HttpErrorResponse && error.status === 400) {
          this.error.set('Revisa el usuario y la contraseña ingresados.');
        } else {
          this.error.set('No fue posible iniciar sesión. Verifica tu conexión e inténtalo de nuevo.');
        }
      }
    });
  }

  showError(field: 'codigoMecanico' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }
}
