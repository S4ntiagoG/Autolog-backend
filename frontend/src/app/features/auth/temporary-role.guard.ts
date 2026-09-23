import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { TemporaryRoleService } from '../../core/services/temporary-role.service';

@Injectable({ providedIn: 'root' })
export class TemporaryRoleGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly temporaryRoleService = inject(TemporaryRoleService);

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const role = this.temporaryRoleService.getRole();
    const target = state.url;

    if (target.startsWith('/mecanico')) {
      if (role === 'mechanic') {
        return true;
      }
      this.router.navigate(['/seleccionar-rol']);
      return false;
    }

    if (target.startsWith('/cliente')) {
      if (role === 'client') {
        return true;
      }
      this.router.navigate(['/seleccionar-rol']);
      return false;
    }

    this.router.navigate(['/seleccionar-rol']);
    return false;
  }
}
