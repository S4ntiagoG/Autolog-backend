import { TestBed } from '@angular/core/testing';

import { TemporaryRoleService } from './temporary-role.service';

describe('TemporaryRoleService', () => {
  let service: TemporaryRoleService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemporaryRoleService);
  });

  it('should persist mechanic role in sessionStorage', () => {
    service.setRole('mechanic');

    expect(service.getRole()).toBe('mechanic');
    expect(sessionStorage.getItem('autolog-demo-role')).toBe('mechanic');
  });

  it('should clear the role and session storage when switching user', () => {
    service.setRole('client');
    service.clearRole();

    expect(service.getRole()).toBeNull();
    expect(sessionStorage.getItem('autolog-demo-role')).toBeNull();
  });
});
