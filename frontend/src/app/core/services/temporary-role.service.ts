import { Injectable } from '@angular/core';

export type TemporaryUserRole = 'mechanic' | 'client';

@Injectable({ providedIn: 'root' })
export class TemporaryRoleService {
  private readonly storageKey = 'autolog-demo-role';

  // TODO: reemplazar la selección temporal de rol por autenticación y autorización reales con Spring Security y el mecanismo de tokens definido para el proyecto.
  setRole(role: TemporaryUserRole): void {
    sessionStorage.setItem(this.storageKey, role);
  }

  getRole(): TemporaryUserRole | null {
    const value = sessionStorage.getItem(this.storageKey);
    return value === 'mechanic' || value === 'client' ? value : null;
  }

  clearRole(): void {
    sessionStorage.removeItem(this.storageKey);
  }
}
