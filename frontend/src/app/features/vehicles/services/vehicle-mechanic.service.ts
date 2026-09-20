import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { ServiceOrderResponse, VehicleResponse } from '../../../core/models/api.models';
import { MechanicVehicleItem, VehicleStatus } from '../models/vehicle-mechanic.models';

const SAMPLE_VEHICLES: MechanicVehicleItem[] = [
  {
    id: 1,
    plate: 'B7X-982',
    brand: 'Toyota',
    model: 'Corolla',
    vehicleYear: 2022,
    color: 'Silver',
    ownerName: 'Michael Johnson',
    lastServiceDate: '12/05/2023',
    status: 'LISTO'
  },
  {
    id: 2,
    plate: 'ABC-123',
    brand: 'Honda',
    model: 'Civic',
    vehicleYear: 2020,
    color: 'Black',
    ownerName: 'Sarah Williams',
    lastServiceDate: '20/09/2023',
    status: 'EN PROGRESO'
  },
  {
    id: 3,
    plate: 'XYZ-789',
    brand: 'Ford',
    model: 'F-150',
    vehicleYear: 2019,
    color: 'White',
    ownerName: 'David Smith',
    lastServiceDate: '-- / -- / ----',
    status: 'PENDIENTE'
  },
  {
    id: 4,
    plate: 'MND-456',
    brand: 'BMW',
    model: '3 Series',
    vehicleYear: 2021,
    color: 'Blue',
    ownerName: 'Emily Brown',
    lastServiceDate: '05/08/2023',
    status: 'LISTO'
  },
  {
    id: 5,
    plate: 'KDJ-502',
    brand: 'Chevrolet',
    model: 'Tracker',
    vehicleYear: 2023,
    color: 'Red',
    ownerName: 'Carlos Gómez',
    lastServiceDate: '14/10/2023',
    status: 'EN PROGRESO'
  },
  {
    id: 6,
    plate: 'WER-834',
    brand: 'Mazda',
    model: 'CX-30',
    vehicleYear: 2021,
    color: 'Grey',
    ownerName: 'Lucía Fernández',
    lastServiceDate: '02/11/2023',
    status: 'LISTO'
  },
  {
    id: 7,
    plate: 'PLM-911',
    brand: 'Nissan',
    model: 'Sentra',
    vehicleYear: 2018,
    color: 'Silver',
    ownerName: 'Roberto Ruiz',
    lastServiceDate: '-- / -- / ----',
    status: 'PENDIENTE'
  },
  {
    id: 8,
    plate: 'TRQ-445',
    brand: 'Volkswagen',
    model: 'Golf GTI',
    vehicleYear: 2022,
    color: 'White',
    ownerName: 'Mateo Ortiz',
    lastServiceDate: '18/11/2023',
    status: 'EN PROGRESO'
  },
  {
    id: 9,
    plate: 'HGB-310',
    brand: 'Hyundai',
    model: 'Tucson',
    vehicleYear: 2020,
    color: 'Black',
    ownerName: 'Valeria Restrepo',
    lastServiceDate: '30/11/2023',
    status: 'LISTO'
  },
  {
    id: 10,
    plate: 'ZXC-777',
    brand: 'Kia',
    model: 'Sportage',
    vehicleYear: 2024,
    color: 'Dark Blue',
    ownerName: 'Andrés Morales',
    lastServiceDate: '-- / -- / ----',
    status: 'PENDIENTE'
  },
  {
    id: 11,
    plate: 'QWE-109',
    brand: 'Audi',
    model: 'A4',
    vehicleYear: 2021,
    color: 'Black',
    ownerName: 'Sofía Pineda',
    lastServiceDate: '05/12/2023',
    status: 'LISTO'
  },
  {
    id: 12,
    plate: 'VBN-662',
    brand: 'Renault',
    model: 'Duster',
    vehicleYear: 2019,
    color: 'Orange',
    ownerName: 'Esteban Cárdenas',
    lastServiceDate: '12/12/2023',
    status: 'EN PROGRESO'
  }
];

@Injectable({ providedIn: 'root' })
export class VehicleMechanicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  getMechanicVehicles(): Observable<MechanicVehicleItem[]> {
    return forkJoin({
      vehicles: this.http.get<VehicleResponse[]>(`${this.baseUrl}${API_CONFIG.vehiclesPath}`).pipe(
        catchError(() => of<VehicleResponse[]>([]))
      ),
      orders: this.http.get<ServiceOrderResponse[]>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}`).pipe(
        catchError(() => of<ServiceOrderResponse[]>([]))
      )
    }).pipe(
      map(({ vehicles, orders }) => {
        if (!vehicles || vehicles.length === 0) {
          return SAMPLE_VEHICLES;
        }

        return vehicles.map((v, index): MechanicVehicleItem => {
          // Buscar última orden de servicio para este vehículo
          const vehicleOrders = orders.filter((o) => o.vehicle?.id === v.id);
          const latestOrder = vehicleOrders.sort((a, b) =>
            new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
          )[0];

          let lastServiceDate = '-- / -- / ----';
          if (latestOrder?.entryDate) {
            const [year, month, day] = latestOrder.entryDate.split('-');
            if (year && month && day) {
              lastServiceDate = `${day}/${month}/${year}`;
            }
          }

          // Determinamos un estado cíclico o derivado si la orden no especifica estado
          const statuses: VehicleStatus[] = ['LISTO', 'EN PROGRESO', 'PENDIENTE'];
          const status = statuses[index % statuses.length];

          return {
            id: v.id,
            plate: v.plate,
            brand: v.brand,
            model: v.model,
            vehicleYear: v.vehicleYear,
            ownerName: v.client?.name || 'Propietario no asignado',
            lastServiceDate,
            status
          };
        });
      }),
      catchError(() => of(SAMPLE_VEHICLES))
    );
  }
}

