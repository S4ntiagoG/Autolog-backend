import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TemporaryRoleService } from '../../core/services/temporary-role.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-[#0b0b0d] text-white">
      <header class="border-b border-neutral-800 bg-[#111214] px-4 py-4 sm:px-8">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">AUTOLOG</p>
            <h1 class="mt-2 text-xl font-bold">Cliente</h1>
          </div>
          <button
            type="button"
            class="rounded-lg border border-neutral-600 bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-100 transition hover:border-neutral-400"
            (click)="changeUser()"
          >
            Cambiar tipo de usuario
          </button>
        </div>
      </header>

      <nav class="border-b border-neutral-800 bg-[#0f1012] px-4 py-3 sm:px-8" aria-label="Menú principal de cliente">
        <div class="mx-auto flex max-w-6xl gap-3">
          <a routerLink="/cliente/vehiculos" routerLinkActive="bg-red-600/20 text-red-200 border-red-600/50" [routerLinkActiveOptions]="{ exact: false }" class="rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800">
            Mis vehículos
          </a>
        </div>
      </nav>

      <main class="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <router-outlet />
      </main>
    </div>
  `
})
export class ClientLayoutComponent {
  private readonly router = inject(Router);
  private readonly temporaryRoleService = inject(TemporaryRoleService);

  // TODO: reemplazar la selección temporal de rol por autenticación y autorización reales con Spring Security y el mecanismo de tokens definido para el proyecto.
  changeUser(): void {
    this.temporaryRoleService.clearRole();
    this.router.navigate(['/seleccionar-rol']);
  }
}
