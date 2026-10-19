import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, throwError } from 'rxjs';

import { MechanicAuthService } from './mechanic-auth.service';

export const mechanicAuthGuard: CanActivateFn = () => {
  const auth = inject(MechanicAuthService);
  const router = inject(Router);

  return auth.loadCurrentMechanic().pipe(
    map(() => true),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.mechanic.set(null);
        return of(router.createUrlTree(['/mechanic/login']));
      }
      return throwError(() => error);
    })
  );
};

export const mechanicDashboardGuard: CanActivateFn = () => {
  const auth = inject(MechanicAuthService);
  const router = inject(Router);
  return auth.mechanic()?.role === 'ADMIN'
    ? router.createUrlTree(['/admin/dashboard'])
    : true;
};

export const administratorOnlyGuard: CanActivateFn = () => {
  const auth = inject(MechanicAuthService);
  const router = inject(Router);
  return auth.mechanic()?.role === 'ADMIN'
    ? true
    : router.createUrlTree(['/dashboard']);
};
