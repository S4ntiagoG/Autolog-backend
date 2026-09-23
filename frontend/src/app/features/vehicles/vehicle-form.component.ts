import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-screen bg-neutral-950 p-6 text-white lg:p-8">
      <div class="mx-auto max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">AUTOLOG</p>
        <h1 class="mt-3 text-3xl font-black tracking-tight">Editar vehículo</h1>
        <p class="mt-2 text-sm text-neutral-400">La edición completa quedará conectada al backend con el modelo real cuando se termine la entidad y validaciones de administración.</p>
      </div>
    </section>
  `
})
export class VehicleFormComponent {}
