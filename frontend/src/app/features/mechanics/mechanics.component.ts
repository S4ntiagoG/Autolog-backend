import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MechanicRecord } from '../../core/models/api.models';
import { MechanicManagementService } from '../../core/services/mechanic-management.service';

@Component({
  selector: 'app-mechanics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mechanics.component.html',
  styleUrl: './mechanics.component.css'
})
export class MechanicsComponent implements OnInit {
  private readonly mechanicService = inject(MechanicManagementService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly mechanics = signal<MechanicRecord[]>([]);
  readonly loading = signal(true);
  readonly deletingId = signal<number | null>(null);
  readonly error = signal('');
  readonly success = signal('');
  readonly totalMechanics = computed(() => this.mechanics().length);
  readonly occupiedMechanics = computed(() => this.mechanics().filter((item) => !item.available).length);
  readonly availableMechanics = computed(() => this.mechanics().filter((item) => item.available).length);

  ngOnInit(): void {
    const navigationMessage = history.state?.mechanicsSuccess;
    if (typeof navigationMessage === 'string') {
      this.success.set(navigationMessage);
    }
    this.loadMechanics();
    timer(15_000, 15_000).pipe(
      switchMap(() => this.mechanicService.getMechanics().pipe(
        catchError((error: unknown) => {
          console.error('Error actualizando disponibilidad de mecánicos:', error);
          this.error.set('No se pudo actualizar la disponibilidad. Revisa la conexión o usa “Actualizar”.');
          return EMPTY;
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((mechanics) => {
      this.mechanics.set(mechanics);
      this.error.set('');
    });
  }

  loadMechanics(): void {
    this.loading.set(true);
    this.error.set('');
    this.mechanicService.getMechanics().subscribe({
      next: (mechanics) => {
        this.mechanics.set(mechanics);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Error cargando el directorio de mecánicos:', error);
        this.error.set('No se pudo cargar el directorio de mecánicos. Verifica la conexión con el backend e inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }

  openCreateForm(): void {
    void this.router.navigate(['/mechanics/new']);
  }

  openEditForm(mechanic: MechanicRecord): void {
    void this.router.navigate(['/mechanics', mechanic.id, 'edit']);
  }

  deleteMechanic(mechanic: MechanicRecord): void {
    if (!mechanic.deletable || this.deletingId() !== null) {
      return;
    }
    if (!confirm(`¿Eliminar el registro de ${mechanic.fullName}?`)) {
      return;
    }

    this.error.set('');
    this.success.set('');
    this.deletingId.set(mechanic.id);
    this.mechanicService.deleteMechanic(mechanic.id).subscribe({
      next: () => {
        this.mechanics.update((items) => items.filter((item) => item.id !== mechanic.id));
        this.success.set('El mecánico se eliminó correctamente.');
        this.deletingId.set(null);
      },
      error: (error: unknown) => {
        console.error('Error eliminando el mecánico:', error);
        this.error.set(error instanceof HttpErrorResponse && error.status === 409
          ? 'No se puede eliminar: el mecánico está vinculado a una orden de servicio.'
          : 'No se pudo eliminar el mecánico. Inténtalo de nuevo.');
        this.deletingId.set(null);
      }
    });
  }
}
