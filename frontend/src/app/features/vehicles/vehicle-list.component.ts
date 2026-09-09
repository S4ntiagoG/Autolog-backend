import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { VehicleResponse } from '../../core/models/api.models';
import { VehicleIntakeService } from '../vehicle-intake/services/vehicle-intake.service';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-100 sm:px-6 lg:px-10">
      <div class="mx-auto max-w-6xl">
        <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-red-500">AUTOLOG by CICLO MOTOR</p>
            <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Vehículos registrados</h1>
          </div>
          <a routerLink="/vehicle-intake" class="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700">
            + Nuevo ingreso
          </a>
        </header>

        @if (error()) {
          <div class="mb-6 rounded-xl border border-red-900/80 bg-red-950/50 p-4 text-sm text-red-200">{{ error() }}</div>
        }

        @if (loading()) {
          <div class="rounded-2xl border border-neutral-800 bg-neutral-900 p-10 text-center text-neutral-400">Cargando vehículos…</div>
        } @else if (vehicles().length === 0) {
          <div class="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/70 p-12 text-center">
            <p class="text-lg font-semibold">Aún no hay vehículos registrados</p>
            <p class="mt-2 text-sm text-neutral-400">Registra el primer ingreso para verlo aquí.</p>
          </div>
        } @else {
          <div class="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-sm">
                <thead class="border-b border-neutral-800 bg-neutral-800/70 text-xs uppercase tracking-wider text-neutral-400">
                  <tr>
                    <th class="px-5 py-4">Placa</th>
                    <th class="px-5 py-4">Vehículo</th>
                    <th class="px-5 py-4">VIN / Chasis</th>
                    <th class="px-5 py-4">Cliente</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-800">
                  @for (vehicle of vehicles(); track vehicle.id) {
                    <tr class="transition hover:bg-neutral-800/40">
                      <td class="px-5 py-4 font-semibold text-white">{{ vehicle.plate }}</td>
                      <td class="px-5 py-4 text-neutral-300">{{ vehicle.brand }} {{ vehicle.model }} · {{ vehicle.vehicleYear }}</td>
                      <td class="px-5 py-4 text-neutral-400">{{ vehicle.chassisNumber }}</td>
                      <td class="px-5 py-4 text-neutral-300">{{ vehicle.client.name }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </main>
  `
})
export class VehicleListComponent implements OnInit {
  private readonly intakeService = inject(VehicleIntakeService);
  readonly vehicles = signal<VehicleResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.intakeService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar el listado de vehículos. Verifica que el backend esté disponible.');
        this.loading.set(false);
      }
    });
  }
}
