import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-screen bg-neutral-950 p-6 text-white lg:p-8">
      <div class="mx-auto max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">AUTOLOG</p>
        <h1 class="mt-3 text-3xl font-black tracking-tight">Inventario</h1>
        <p class="mt-2 text-sm text-neutral-400">Este módulo queda habilitado para repuestos, lubricantes y materiales del taller.</p>
        <div class="mt-8 rounded-xl border border-dashed border-neutral-700 bg-neutral-950/40 p-8 text-center text-neutral-300">
          El inventario se conectará al backend con la entidad y servicios correspondientes cuando se defina el catálogo de productos.
        </div>
      </div>
    </section>
  `
})
export class InventoryComponent {}
