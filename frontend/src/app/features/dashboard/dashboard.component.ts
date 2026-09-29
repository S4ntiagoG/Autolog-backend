import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MechanicVehicleItem, VehicleStatus } from '../vehicles/models/vehicle-mechanic.models';
import { VehicleMechanicService } from '../vehicles/services/vehicle-mechanic.service';

interface ActivityItem {
  time: string;
  label: string;
  description: string;
  tone: 'red' | 'yellow' | 'green' | 'orange';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly mechanicService = inject(VehicleMechanicService);

  readonly vehicles = signal<MechanicVehicleItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly stats = computed(() => {
    const list = this.vehicles();
    return {
      activeServices: list.filter((vehicle) => vehicle.status !== 'LISTO').length,
      pendingTasks: list.filter((vehicle) => vehicle.status === 'PENDIENTE').length,
      completedToday: list.filter((vehicle) => vehicle.status === 'LISTO').length
    };
  });

  readonly visibleVehicles = computed(() => this.vehicles().slice(0, 4));

  readonly recentActivity: ActivityItem[] = [
    {
      time: '19:45 AM',
      label: 'Diagnóstico Finalizado',
      description: 'BMW M3 - Transmission issue identified. Quote generated.',
      tone: 'red'
    },
    {
      time: '09:30 AM',
      label: 'Servicio Listo',
      description: 'Ford Transit - Oil change complete. Ready for pickup.',
      tone: 'green'
    },
    {
      time: '08:15 AM',
      label: 'Piezas Pendientes',
      description: 'Audi Q5 - Brake pads ordered from main supplier. ETA: 2PM.',
      tone: 'yellow'
    },
    {
      time: '07:30 AM',
      label: 'Workshop Opened',
      description: 'System initialized. Daily sync complete.',
      tone: 'orange'
    }
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');

    this.mechanicService.getMechanicVehicles().subscribe({
      next: (data) => {
        this.vehicles.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando tablero:', err);
        this.error.set('No se pudo sincronizar el tablero con el backend. Asegúrate de que Spring Boot esté ejecutándose.');
        this.vehicles.set([]);
        this.loading.set(false);
      }
    });
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
}
