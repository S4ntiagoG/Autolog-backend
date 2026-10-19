import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs';

const csrfEndpoint = '/api/mechanics/auth/csrf';

export const csrfBootstrapInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.method === 'GET' || request.url === csrfEndpoint) {
    return next(request);
  }

  return inject(HttpClient).get<void>(csrfEndpoint).pipe(
    switchMap(() => next(request))
  );
};
