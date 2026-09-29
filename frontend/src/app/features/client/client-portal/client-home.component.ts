import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ClientVehicleHomeResponse, ServiceHistoryItem } from '../../../core/models/api.models';
import { ClientPortalService } from './client-portal.service';

type ClientTab = 'HISTORY' | 'TRACKING';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-home.component.html',
  styleUrl: './client-home.component.css'
})
export class ClientHomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly portal = inject(ClientPortalService);

  readonly activeTab = signal<ClientTab>('HISTORY');
  readonly vehicle = this.portal.vehicle;
  readonly historyItems = signal<ServiceHistoryItem[]>([]);
  readonly historyLoading = signal(false);
  readonly historyError = signal('');

  ngOnInit(): void {
    const vehicle = this.vehicle() ?? history.state.clientVehicle as ClientVehicleHomeResponse | undefined;
    if (!vehicle) {
      void this.router.navigate(['/client/search']);
      return;
    }
    this.portal.vehicle.set(vehicle);
    this.loadHistory(vehicle.vehicleId);
  }

  selectTab(tab: ClientTab): void {
    this.activeTab.set(tab);
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return year && month && day ? `${day}/${month}/${year}` : date;
  }

  formatCost(cost: number | null): string {
    if (cost === null) {
      return 'Sin costo registrado';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(cost);
  }

  private loadHistory(vehicleId: number): void {
    this.historyLoading.set(true);
    this.historyError.set('');
    this.portal.getVehicleHistory(vehicleId).subscribe({
      next: (history) => {
        this.historyItems.set(history);
        this.historyLoading.set(false);
      },
      error: () => {
        this.historyItems.set([]);
        this.historyError.set('No fue posible cargar el historial de servicios.');
        this.historyLoading.set(false);
      }
    });
  }
}