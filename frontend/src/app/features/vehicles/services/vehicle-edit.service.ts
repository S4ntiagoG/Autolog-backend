import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import {
  ClientRequest,
  ClientResponse,
  OrderTask,
  ServiceOrderRequest,
  ServiceOrderResponse,
  VehicleRequest,
  VehicleResponse
} from '../../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class VehicleEditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  getVehicle(id: number): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.baseUrl}${API_CONFIG.vehiclesPath}/${id}`);
  }

  getServiceOrders(): Observable<ServiceOrderResponse[]> {
    return this.http.get<ServiceOrderResponse[]>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}`);
  }

  updateVehicle(id: number, payload: Partial<VehicleRequest>): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.baseUrl}${API_CONFIG.vehiclesPath}/${id}`, payload);
  }

  updateClient(id: number, payload: Partial<ClientRequest>): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(`${this.baseUrl}${API_CONFIG.clientsPath}/${id}`, payload);
  }

  updateServiceOrder(id: number, payload: Partial<ServiceOrderRequest & { orderStatus?: string; initialObservations?: string; workshopPreliminaryObservations?: string; mileageUnit?: string; primaryReason?: string; reasons?: string[] }>): Observable<ServiceOrderResponse> {
    return this.http.put<ServiceOrderResponse>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}/${id}`, payload);
  }

  addTask(orderId: number, description: string): Observable<OrderTask> {
    return this.http.post<OrderTask>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}/${orderId}/tasks`, {
      description,
      completed: false
    });
  }

  toggleTask(orderId: number, taskId: number, completed: boolean): Observable<OrderTask> {
    return this.http.put<OrderTask>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}/${orderId}/tasks/${taskId}`, {
      completed
    });
  }

  getServiceOrder(id: number): Observable<ServiceOrderResponse> {
    return this.http.get<ServiceOrderResponse>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}/${id}`);
  }

  updateServiceOrderStatus(id: number, status: string): Observable<ServiceOrderResponse> {
    return this.http.put<ServiceOrderResponse>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}/${id}`, {
      orderStatus: status,
      currentMileage: 0,
      primaryReason: 'Actualización de estado'
    });
  }
}
