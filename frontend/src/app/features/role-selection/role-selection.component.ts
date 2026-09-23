import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { TemporaryRoleService, TemporaryUserRole } from '../../core/services/temporary-role.service';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="min-h-screen bg-[#0b0b0d] px-4 py-10 text-white sm:px-6">
      <div class="mx-auto max-w-5xl">
        <div class="mb-10 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-red-500">AUTOLOG by CICLO MOTOR</p>
          <h1 class="mt-4 text-3xl font-black tracking-tight sm:text-5xl">¿Cómo deseas ingresar?</h1>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <button
            type="button"
            class="group rounded-3xl border border-red-800/60 bg-gradient-to-br from-red-950 via-neutral-950 to-neutral-900 p-8 text-left shadow-2xl shadow-red-950/20 transition hover:-translate-y-1 hover:border-red-500"
            (click)="selectRole('mechanic')"
            aria-label="Ingresar como mecánico"
          >
            <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-2xl font-black text-white">M</div>
            <h2 class="text-2xl font-bold text-white">Ingresar como mecánico</h2>
            <p class="mt-3 text-sm leading-6 text-neutral-300">
              Accede al tablero, gestión de vehículos, inventario y seguimiento del taller.
            </p>
            <span class="mt-6 inline-flex items-center rounded-full border border-red-500/80 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200">
              Continuar →
            </span>
          </button>

          <button
            type="button"
            class="group rounded-3xl border border-neutral-700 bg-gradient-to-br from-neutral-900 via-neutral-950 to-[#111115] p-8 text-left shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-neutral-500"
            (click)="selectRole('client')"
            aria-label="Ingresar como cliente"
          >
            <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-700 text-2xl font-black text-white">C</div>
            <h2 class="text-2xl font-bold text-white">Ingresar como cliente</h2>
            <p class="mt-3 text-sm leading-6 text-neutral-300">
              Consulta el estado del servicio y la información permitida de tu vehículo.
            </p>
            <span class="mt-6 inline-flex items-center rounded-full border border-neutral-600 bg-neutral-800 px-4 py-2 text-sm font-bold text-neutral-100">
              Continuar →
            </span>
          </button>
        </div>
      </div>
    </main>
  `
})
export class RoleSelectionComponent {
  private readonly router = inject(Router);
  private readonly temporaryRoleService = inject(TemporaryRoleService);

  // TODO: reemplazar la selección temporal de rol por autenticación y autorización reales con Spring Security y el mecanismo de tokens definido para el proyecto.
  selectRole(role: TemporaryUserRole): void {
    this.temporaryRoleService.setRole(role);
    this.router.navigateByUrl(role === 'mechanic' ? '/mecanico' : '/cliente');
  }
}
