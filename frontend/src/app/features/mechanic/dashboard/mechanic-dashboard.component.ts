import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { VehicleResponse } from '../../../core/models/api.models';
import { VehicleIntakeService } from '../../vehicle-intake/services/vehicle-intake.service';

@Component({
  selector: 'app-mechanic-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="min-h-screen bg-neutral-950 p-6 text-white lg:p-8">
      <div class="mx-auto max-w-6xl">
        <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">AUTOLOG</p>
            <h1 class="mt-2 text-3xl font-black tracking-tight">Tablero</h1>
            <p class="mt-2 text-sm text-neutral-400">Monitor de vehículos en servicio y avance del trabajo.</p>
          </div>
        </header>

        @if (loading()) {
          <div class="rounded-2xl border border-neutral-800 bg-neutral-900 p-10 text-center text-neutral-400">
            Cargando vehículos en servicio…
          </div>
        } @else if (error()) {
          <div class="rounded-2xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">{{ error() }}</div>
        } @else {
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (vehicle of vehicles(); track vehicle.id) {
              <article class="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-lg shadow-black/10">
                <div class="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-neutral-500">{{ vehicle.plate }}</p>
                    <h2 class="mt-2 text-xl font-bold">{{ vehicle.brand }} {{ vehicle.model }}</h2>
                  </div>
                  <span class="rounded-full border px-2 py-1 text-xs font-semibold" [ngClass]="statusClass(vehicle.status)">{{ statusLabel(vehicle.status) }}</span>
                </div>

                <div class="space-y-2 text-sm text-neutral-300">
                  <p><span class="text-neutral-500">VIN:</span> {{ vehicle.chassisNumber }}</p>
                  <p><span class="text-neutral-500">Cliente:</span> {{ vehicle.client.name }}</p>
                </div>

                <div class="mt-5">
                  <div class="mb-2 flex items-center justify-between text-xs text-neutral-400">
                    <span>Progreso</span>
                    <span>{{ vehicle.progress ?? 0 }}%</span>
                  </div>
                  <div class="h-2.5 overflow-hidden rounded-full bg-neutral-800">
                    <div class="h-full rounded-full bg-red-500 transition-all duration-300" [style.width.%]="vehicle.progress ?? 0"></div>
                  </div>
                </div>

                <div class="mt-5 flex justify-end">
                  <a [routerLink]="['/mecanico/vehiculos', vehicle.id]" class="text-sm font-semibold text-red-300 hover:text-red-200">Ver detalle →</a>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `:host { display:block; }`
  ]
})
export class MechanicDashboardComponent implements OnInit {
  private readonly vehicleService = inject(VehicleIntakeService);
  readonly vehicles = signal<VehicleResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar el tablero del taller.');
        this.loading.set(false);
      }
    });
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'border-yellow-500/60 bg-yellow-500/10 text-yellow-200';
      case 'IN_PROGRESS':
        return 'border-blue-500/60 bg-blue-500/10 text-blue-200';
      case 'READY':
        return 'border-green-500/60 bg-green-500/10 text-green-200';
      default:
        return 'border-neutral-600 bg-neutral-800 text-neutral-200';
    }
  }

  statusLabel(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'IN_PROGRESS':
        return 'En progreso';
      case 'READY':
        return 'Listo';
      default:
        return 'Pendiente';
    }
  }
}
