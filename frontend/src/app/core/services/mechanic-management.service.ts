import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import { MechanicRecord, MechanicRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MechanicManagementService {
  private readonly http = inject(HttpClient);
  private readonly mechanicsUrl = `${API_CONFIG.baseUrl}${API_CONFIG.mechanicsPath}`;

  getMechanics(): Observable<MechanicRecord[]> {
    return this.http.get<MechanicRecord[]>(this.mechanicsUrl);
  }

  createMechanic(request: MechanicRequest): Observable<MechanicRecord> {
    return this.http.post<MechanicRecord>(this.mechanicsUrl, request);
  }

  updateMechanic(id: number, request: MechanicRequest): Observable<MechanicRecord> {
    return this.http.put<MechanicRecord>(`${this.mechanicsUrl}/${id}`, request);
  }

  deleteMechanic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.mechanicsUrl}/${id}`);
  }
}
