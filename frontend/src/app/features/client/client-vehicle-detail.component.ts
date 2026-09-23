import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { VehicleResponse } from '../../core/models/api.models';
import { VehicleIntakeService } from '../vehicle-intake/services/vehicle-intake.service';

@Component({
  selector: 'app-client-vehicle-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      @if (loading()) {
        <div class="text-neutral-400">Cargando detalle del vehículo…</div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">{{ error() }}</div>
      } @else if (vehicle(); as currentVehicle) {
        <div class="space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-red-500">AUTOLOG</p>
              <h2 class="mt-2 text-3xl font-black">{{ currentVehicle.brand }} {{ currentVehicle.model }}</h2>
            </div>
            <span class="rounded-full border px-3 py-1 text-xs font-semibold" [ngClass]="statusClass(currentVehicle.status)">{{ statusLabel(currentVehicle.status) }}</span>
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
              <p class="text-sm text-neutral-500">Estado</p>
              <p class="mt-1 text-lg font-semibold text-white">{{ statusLabel(currentVehicle.status) }}</p>
            </div>
            <div class="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p class="text-sm text-neutral-500">Progreso</p>
              <p class="mt-1 text-lg font-semibold text-white">{{ currentVehicle.progress ?? 0 }}%</p>
            </div>
          </div>

          <div class="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div class="mb-2 flex items-center justify-between text-sm text-neutral-400">
              <span>Avance del servicio</span>
              <span>{{ currentVehicle.progress ?? 0 }}%</span>
            </div>
            <div class="h-3 overflow-hidden rounded-full bg-neutral-800">
              <div class="h-full rounded-full bg-red-500 transition-all duration-300" [style.width.%]="currentVehicle.progress ?? 0"></div>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-neutral-400">No se encontró la información del vehículo.</div>
      }
    </section>
  `
})
export class ClientVehicleDetailComponent implements OnInit {
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
