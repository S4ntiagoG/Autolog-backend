import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../core/config/api.config';
import { ClientVehicleHomeResponse, ServiceHistoryItem, VehicleLookupRequest } from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class ClientPortalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  readonly vehicle = signal<ClientVehicleHomeResponse | null>(null);

  searchVehicle(request: VehicleLookupRequest): Observable<ClientVehicleHomeResponse> {
    return this.http.post<ClientVehicleHomeResponse>(
      `${this.baseUrl}${API_CONFIG.vehicleSearchPath}`,
      request
    );
  }

  getVehicleHistory(vehicleId: number): Observable<ServiceHistoryItem[]> {
    return this.http.get<ServiceHistoryItem[]>(
      `${this.baseUrl}${API_CONFIG.vehicleHistoryPath}/${vehicleId}`
    );
  }
}