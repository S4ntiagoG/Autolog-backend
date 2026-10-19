import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_CONFIG } from '../../core/config/api.config';

export interface MechanicSession {
  id: number;
  codigoMecanico: string;
  nombre: string;
  role: 'MECHANIC' | 'ADMIN';
}

interface MechanicLoginRequest {
  codigoMecanico: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class MechanicAuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${API_CONFIG.baseUrl}/mechanics/auth`;

  readonly mechanic = signal<MechanicSession | null>(null);

  login(request: MechanicLoginRequest): Observable<MechanicSession> {
    return this.http.post<MechanicSession>(`${this.authUrl}/login`, request).pipe(
      tap((mechanic) => this.mechanic.set(mechanic))
    );
  }

  loadCurrentMechanic(): Observable<MechanicSession> {
    return this.http.get<MechanicSession>(`${this.authUrl}/me`).pipe(
      tap((mechanic) => this.mechanic.set(mechanic))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/logout`, {}).pipe(
      tap(() => this.mechanic.set(null))
    );
  }
}
