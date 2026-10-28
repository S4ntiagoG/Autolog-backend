import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutoDismissDirective } from '../../core/directives/auto-dismiss.directive';
import { WorkshopCurrency, WorkshopSettings } from '../../core/models/api.models';
import { WorkshopSettingsService } from '../../core/services/workshop-settings.service';

@Component({
  selector: 'app-workshop-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoDismissDirective],
  templateUrl: './workshop-settings.component.html',
  styleUrl: './workshop-settings.component.css'
})
export class WorkshopSettingsComponent implements OnInit {
  private readonly settingsService = inject(WorkshopSettingsService);

  readonly settings = signal<WorkshopSettings | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly currencies: { value: WorkshopCurrency; label: string }[] = [
    { value: 'COP', label: 'COP — Peso Colombiano' },
    { value: 'USD', label: 'USD — Dólar estadounidense' },
    { value: 'EUR', label: 'EUR — Euro' }
  ];

  private savedSettings: WorkshopSettings | null = null;

  ngOnInit(): void {
    this.loadSettings();
  }

  save(): void {
    const settings = this.settings();
    if (!settings || this.saving()) {
      return;
    }

    this.error.set('');
    this.success.set('');
    if (this.savedSettings && !this.hasSettingsChanged(settings)) {
      this.success.set('No hubo cambios detectados');
      return;
    }

    this.saving.set(true);
    this.settingsService.updateSettings(settings).subscribe({
      next: (savedSettings) => {
        this.setSettings(savedSettings);
        this.success.set('La configuración del taller se guardó correctamente.');
        this.saving.set(false);
      },
      error: (error: unknown) => {
        console.error('Error guardando la configuración del taller:', error);
        this.error.set('No se pudieron guardar los cambios. Verifica la conexión e inténtalo de nuevo.');
        this.saving.set(false);
      }
    });
  }

  cancel(): void {
    if (this.savedSettings) {
      this.settings.set({ ...this.savedSettings });
    }
    this.error.set('');
    this.success.set('');
  }

  clearMessages(): void {
    this.error.set('');
    this.success.set('');
  }

  private loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.setSettings(settings);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Error cargando la configuración del taller:', error);
        this.error.set('No se pudo cargar la configuración del taller. Verifica la conexión e inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }

  private setSettings(settings: WorkshopSettings): void {
    this.savedSettings = { ...settings };
    this.settings.set({ ...settings });
  }

  private hasSettingsChanged(settings: WorkshopSettings): boolean {
    const savedSettings = this.savedSettings;
    return savedSettings !== null && (
      settings.hourlyRateCop !== savedSettings.hourlyRateCop ||
      settings.vatPercentage !== savedSettings.vatPercentage ||
      settings.currency !== savedSettings.currency ||
      settings.invoiceNote !== savedSettings.invoiceNote
    );
  }
}
