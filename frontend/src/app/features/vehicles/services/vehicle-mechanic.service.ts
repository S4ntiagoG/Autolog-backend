import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { ServiceOrderRequest, ServiceOrderResponse, VehicleResponse } from '../../../core/models/api.models';
import { MechanicVehicleItem, VehicleStatus } from '../models/vehicle-mechanic.models';

@Injectable({ providedIn: 'root' })
export class VehicleMechanicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  getMechanicVehicles(): Observable<MechanicVehicleItem[]> {
    return forkJoin({
      vehicles: this.http.get<VehicleResponse[]>(`${this.baseUrl}${API_CONFIG.vehiclesPath}`),
      orders: this.http.get<ServiceOrderResponse[]>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}`).pipe(
        catchError(() => of<ServiceOrderResponse[]>([]))
      )
    }).pipe(
      map(({ vehicles, orders }) => {
        if (!vehicles || vehicles.length === 0) {
          return [];
        }

        return vehicles.map((v): MechanicVehicleItem => {
          // Buscar última orden de servicio para este vehículo en la base de datos
          const vehicleOrders = (orders || []).filter((o) => o.vehicle?.id === v.id);
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

          // Si el vehículo tiene orden de servicio, asigna estado según antigüedad o estado activo
          const status: VehicleStatus = latestOrder?.status ?? 'PENDIENTE';

          return {
            id: v.id,
            serviceOrderId: latestOrder?.id ?? null,
            plate: v.plate,
            brand: v.brand,
            model: v.model,
            vehicleYear: v.vehicleYear,
            ownerName: v.client?.name || 'Propietario no asignado',
            lastServiceDate,
            status
          };
        });
      })
    );
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${API_CONFIG.vehiclesPath}/${id}`);
  }

  getVehicle(id: number): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.baseUrl}${API_CONFIG.vehiclesPath}/${id}`);
  }

  getServiceOrders(): Observable<ServiceOrderResponse[]> {
    return this.http.get<ServiceOrderResponse[]>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}`);
  }

  saveServiceOrder(orderId: number | null, request: ServiceOrderRequest): Observable<ServiceOrderResponse> {
    const url = `${this.baseUrl}${API_CONFIG.serviceOrdersPath}`;
    return orderId === null
      ? this.http.post<ServiceOrderResponse>(url, request)
      : this.http.put<ServiceOrderResponse>(`${url}/${orderId}`, request);
  }
}
