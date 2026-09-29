import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import {
  ClientRequest,
  ClientResponse,
  ServiceOrderRequest,
  ServiceOrderResponse,
  ServiceOrderUpdateRequest,
  VehicleIntakeDraft,
  VehicleRequest,
  VehicleResponse
} from '../../../core/models/api.models';

export interface IntakeEvidenceNames {
  photoFront?: string;
  photoRightSide?: string;
  photoBack?: string;
  photoOdometer?: string;
  photoExtra?: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleIntakeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  getVehicles(): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(`${this.baseUrl}${API_CONFIG.vehiclesPath}`);
  }

  getVehicle(id: number): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.baseUrl}${API_CONFIG.vehiclesPath}/${id}`);
  }

  getServiceOrders(): Observable<ServiceOrderResponse[]> {
    return this.http.get<ServiceOrderResponse[]>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}`);
  }

  getServiceOrder(id: number): Observable<ServiceOrderResponse> {
    return this.http.get<ServiceOrderResponse>(`${this.baseUrl}${API_CONFIG.serviceOrdersPath}/${id}`);
  }

  createIntake(draft: VehicleIntakeDraft, evidence: IntakeEvidenceNames): Observable<ServiceOrderResponse> {
    const clientRequest: ClientRequest = draft.customer;
    return this.http.post<ClientResponse>(`${this.baseUrl}${API_CONFIG.clientsPath}`, clientRequest).pipe(
      switchMap((client) => {
        const vehicleRequest: VehicleRequest = {
          ...draft.vehicle,
          client: { id: client.id }
        };
        return this.http.post<VehicleResponse>(`${this.baseUrl}${API_CONFIG.vehiclesPath}`, vehicleRequest);
      }),
      switchMap((vehicle) => {
        const serviceOrderRequest: ServiceOrderRequest = {
          entryDate: this.todayAsIsoDate(),
          ...draft.entry,
          ...evidence,
          vehicle: { id: vehicle.id }
        };
        return this.http.post<ServiceOrderResponse>(
          `${this.baseUrl}${API_CONFIG.serviceOrdersPath}`,
          serviceOrderRequest
        );
      })
    );
  }

  updateIntake(vehicle: VehicleResponse, order: ServiceOrderResponse, draft: VehicleIntakeDraft): Observable<ServiceOrderResponse> {
    const clientRequest: ClientRequest = draft.customer;
    const vehicleRequest: VehicleRequest = {
      ...draft.vehicle,
      client: { id: vehicle.client.id }
    };
    const orderRequest: ServiceOrderUpdateRequest = {
      primaryReason: draft.entry.primaryReason,
      currentMileage: draft.entry.currentMileage,
      customerObservations: draft.entry.customerObservations
    };

    return this.http.put<ClientResponse>(
      `${this.baseUrl}${API_CONFIG.clientsPath}/${vehicle.client.id}`,
      clientRequest
    ).pipe(
      switchMap(() => this.http.put<VehicleResponse>(
        `${this.baseUrl}${API_CONFIG.vehiclesPath}/${vehicle.id}`,
        vehicleRequest
      )),
      switchMap(() => this.http.put<ServiceOrderResponse>(
        `${this.baseUrl}${API_CONFIG.serviceOrdersPath}/${order.id}`,
        orderRequest
      ))
    );
  }

  private todayAsIsoDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
