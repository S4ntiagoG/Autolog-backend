import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import { WorkshopSettings } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class WorkshopSettingsService {
  private readonly http = inject(HttpClient);
  private readonly settingsUrl = `${API_CONFIG.baseUrl}${API_CONFIG.workshopSettingsPath}`;

  getSettings(): Observable<WorkshopSettings> {
    return this.http.get<WorkshopSettings>(this.settingsUrl);
  }

  updateSettings(settings: WorkshopSettings): Observable<WorkshopSettings> {
    return this.http.put<WorkshopSettings>(this.settingsUrl, settings);
  }
}
