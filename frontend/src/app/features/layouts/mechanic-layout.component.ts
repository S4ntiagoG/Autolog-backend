import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TemporaryRoleService } from '../../core/services/temporary-role.service';

@Component({
  selector: 'app-mechanic-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-[#0b0b0d] text-white">
      <aside class="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-neutral-800 bg-[#111214] px-4 py-5">
        <div class="mb-8 px-2">
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">AUTOLOG</p>
          <h2 class="mt-2 text-xl font-bold">Panel mecánico</h2>
        </div>

        <nav class="flex flex-1 flex-col gap-2" aria-label="Menú principal de mecánico">
          <a routerLink="/mecanico/tablero" routerLinkActive="bg-red-600/20 text-red-200 border-red-600/50" [routerLinkActiveOptions]="{ exact: false }" class="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800">
            <span aria-hidden="true">▣</span>
            Tablero
          </a>
          <a routerLink="/mecanico/vehiculos" routerLinkActive="bg-red-600/20 text-red-200 border-red-600/50" [routerLinkActiveOptions]="{ exact: false }" class="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800">
            <span aria-hidden="true">🚗</span>
            Vehículos
          </a>
          <a routerLink="/mecanico/inventario" routerLinkActive="bg-red-600/20 text-red-200 border-red-600/50" [routerLinkActiveOptions]="{ exact: false }" class="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800">
            <span aria-hidden="true">📦</span>
            Inventario
          </a>
        </nav>

        <div class="mt-4 border-t border-neutral-800 pt-4">
          <button
            type="button"
            class="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            routerLink="/mecanico/vehiculos/nuevo"
          >
            + REGISTRAR NUEVO VEHÍCULO
          </button>
        </div>

        <button
          type="button"
          class="mt-4 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-500"
          (click)="changeUser()"
        >
          Cambiar tipo de usuario
        </button>
      </aside>

      <main class="flex-1">
        <router-outlet />
      </main>
    </div>
  `
})
export class MechanicLayoutComponent {
  private readonly router = inject(Router);
  private readonly temporaryRoleService = inject(TemporaryRoleService);

  // TODO: reemplazar la selección temporal de rol por autenticación y autorización reales con Spring Security y el mecanismo de tokens definido para el proyecto.
  changeUser(): void {
    this.temporaryRoleService.clearRole();
    this.router.navigate(['/seleccionar-rol']);
  }
}
