import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { csrfBootstrapInterceptor } from './csrf-bootstrap.interceptor';

describe('csrfBootstrapInterceptor', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([csrfBootstrapInterceptor])),
        provideHttpClientTesting()
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads the CSRF cookie before sending a state-changing request', () => {
    const client = TestBed.inject(HttpClient);
    let completed = false;

    client.post<void>('/api/mechanics/auth/login', {}).subscribe(() => {
      completed = true;
    });

    const csrfRequest = httpTestingController.expectOne('/api/mechanics/auth/csrf');
    expect(csrfRequest.request.method).toBe('GET');
    csrfRequest.flush(null);

    const loginRequest = httpTestingController.expectOne('/api/mechanics/auth/login');
    expect(loginRequest.request.method).toBe('POST');
    loginRequest.flush(null);

    expect(completed).toBeTrue();
  });
});
