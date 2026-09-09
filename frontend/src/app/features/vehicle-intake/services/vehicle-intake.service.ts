import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import {
  ClientRequest,
  ClientResponse,
  ServiceOrderRequest,
  ServiceOrderResponse,
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

  private todayAsIsoDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
