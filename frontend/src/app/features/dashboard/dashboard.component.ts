import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

import { AutoDismissDirective } from '../../core/directives/auto-dismiss.directive';
import {
  PaymentMethod,
  PAYMENT_METHOD_LABELS,
  WorkshopActivityResponse
} from '../../core/models/api.models';
import { MechanicVehicleItem, VehicleStatus } from '../vehicles/models/vehicle-mechanic.models';
import { VehicleMechanicService } from '../vehicles/services/vehicle-mechanic.service';

interface ActivityItem {
  id: number;
  time: string;
  label: string;
  description: string;
  tone: 'red' | 'yellow' | 'green' | 'orange' | 'blue';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AutoDismissDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly mechanicService = inject(VehicleMechanicService);
  private readonly route = inject(ActivatedRoute);
  readonly isAdministratorDashboard = this.route.snapshot.data['administratorDashboard'] === true;

  readonly vehicles = signal<MechanicVehicleItem[]>([]);
  readonly loading = signal(true);
  readonly activityLoading = signal(true);
  readonly error = signal('');
  readonly activityError = signal('');

  readonly stats = computed(() => {
    const list = this.vehicles();
    return {
      activeServices: list.filter((vehicle) => vehicle.status !== 'LISTO').length,
      pendingTasks: list.filter((vehicle) => vehicle.status === 'PENDIENTE').length,
      completedToday: list.filter((vehicle) => vehicle.status === 'LISTO').length
    };
  });

  readonly visibleVehicles = computed(() => this.vehicles().slice(0, 4));

  readonly recentActivity = signal<ActivityItem[]>([]);

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');

    this.mechanicService.getMechanicVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando el tablero:', err);
        this.error.set('No se pudo sincronizar el tablero con el backend. Asegúrate de que Spring Boot esté ejecutándose.');
        this.loading.set(false);
      }
    });

    this.mechanicService.getRecentActivity().subscribe({
      next: (activity) => {
        this.recentActivity.set(activity.map((item) => this.toActivityItem(item)));
        this.activityLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando la actividad del taller:', err);
        this.activityError.set('No se pudo cargar la actividad reciente. Intenta actualizar el tablero.');
        this.activityLoading.set(false);
      }
    });
  }

  private toActivityItem(item: WorkshopActivityResponse): ActivityItem {
    const labels: Record<WorkshopActivityResponse['type'], string> = {
      VEHICLE_RECEIVED: 'Vehículo ingresado',
      STATUS_CHANGED: 'Estado actualizado',
      TASK_COMPLETED: 'Trabajo completado'
    };
    const tones: Record<WorkshopActivityResponse['type'], ActivityItem['tone']> = {
      VEHICLE_RECEIVED: 'blue',
      STATUS_CHANGED: 'yellow',
      TASK_COMPLETED: 'green'
    };
    const time = new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(item.occurredAt));

    return {
      id: item.id,
      time,
      label: labels[item.type],
      description: `${item.vehicleBrand} ${item.vehicleModel} (${item.plate}) · ${item.detail} · ${item.mechanicName}`,
      tone: tones[item.type]
    };
  }

  getVehicleServiceLabel(vehicle: MechanicVehicleItem): string {
    const status = vehicle.status;
    const serviceMap: Record<VehicleStatus, string> = {
      LISTO: 'Cambio de Aceite y Filtros',
      'EN PROGRESO': 'Reparación General de Transmisión',
      PENDIENTE: 'Cambio de Pastillas de Freno'
    };

    return serviceMap[status];
  }

  getStatusClass(status: VehicleStatus): string {
    const classes: Record<VehicleStatus, string> = {
      LISTO: 'status-listo',
      'EN PROGRESO': 'status-progress',
      PENDIENTE: 'status-pending'
    };

    return classes[status];
  }

  paymentMethodLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method];
  }

  onVehicleImageError(vehicleId: number): void {
    this.vehicles.update((vehicles) => vehicles.map((vehicle) =>
      vehicle.id === vehicleId ? { ...vehicle, photoFrontUrl: null } : vehicle
    ));
  }
}
