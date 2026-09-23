import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { VehicleResponse } from '../../core/models/api.models';
import { VehicleIntakeService } from '../vehicle-intake/services/vehicle-intake.service';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="min-h-screen bg-neutral-950 p-6 text-white lg:p-8">
      <div class="mx-auto max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        @if (loading()) {
          <div class="text-neutral-400">Cargando detalle del vehículo…</div>
        } @else if (error()) {
          <div class="rounded-xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">{{ error() }}</div>
        } @else if (vehicle(); as currentVehicle) {
          <div class="space-y-6">
            <div class="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-red-500">AUTOLOG</p>
                <h1 class="mt-2 text-3xl font-black tracking-tight">{{ currentVehicle.brand }} {{ currentVehicle.model }}</h1>
              </div>
              <div class="flex gap-3">
                <a [routerLink]="['/mecanico/vehiculos', currentVehicle.id, 'editar']" class="rounded-lg border border-neutral-700 px-3 py-2 text-sm font-semibold text-neutral-200 hover:border-red-600">Editar</a>
                <a [routerLink]="['/mecanico/vehiculos', currentVehicle.id, 'historial']" class="rounded-lg border border-neutral-700 px-3 py-2 text-sm font-semibold text-neutral-200 hover:border-red-600">Historial</a>
                <a [routerLink]="['/mecanico/vehiculos', currentVehicle.id, 'orden-trabajo']" class="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700">Orden</a>
              </div>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <div class="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <p class="text-sm text-neutral-500">Placa</p>
                <p class="mt-1 text-lg font-semibold text-white">{{ currentVehicle.plate }}</p>
              </div>
              <div class="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <p class="text-sm text-neutral-500">VIN / Chasis</p>
                <p class="mt-1 text-lg font-semibold text-white">{{ currentVehicle.chassisNumber }}</p>
              </div>
              <div class="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <p class="text-sm text-neutral-500">Propietario</p>
                <p class="mt-1 text-lg font-semibold text-white">{{ currentVehicle.client.name }}</p>
              </div>
              <div class="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <p class="text-sm text-neutral-500">Estado</p>
                <p class="mt-1 text-lg font-semibold text-white">{{ statusLabel(currentVehicle.status) }}</p>
              </div>
            </div>

            <div class="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <div class="mb-2 flex items-center justify-between text-sm text-neutral-400">
                <span>Progreso</span>
                <span>{{ currentVehicle.progress ?? 0 }}%</span>
              </div>
              <div class="h-3 overflow-hidden rounded-full bg-neutral-800">
                <div class="h-full rounded-full bg-red-500 transition-all duration-300" [style.width.%]="currentVehicle.progress ?? 0"></div>
              </div>
            </div>
          </div>
        } @else {
          <div class="text-neutral-400">No se encontró el vehículo solicitado.</div>
        }
      </div>
    </section>
  `
})
export class VehicleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vehicleService = inject(VehicleIntakeService);
  readonly vehicle = signal<VehicleResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No se indicó el vehículo a consultar.');
      this.loading.set(false);
      return;
    }

    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        const match = vehicles.find((vehicle) => String(vehicle.id) === id) ?? null;
        this.vehicle.set(match);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible obtener el detalle del vehículo.');
        this.loading.set(false);
      }
    });
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
