import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-service-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-screen bg-neutral-950 p-6 text-white lg:p-8">
      <div class="mx-auto max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">AUTOLOG</p>
        <h1 class="mt-3 text-3xl font-black tracking-tight">Historial del servicio</h1>
        <p class="mt-2 text-sm text-neutral-400">Se cargarán las ordenes y registros de mantenimiento desde el backend cuando existan los endpoints de historial.</p>
      </div>
    </section>
  `
})
export class ServiceHistoryComponent {}
