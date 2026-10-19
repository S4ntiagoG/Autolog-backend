import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { MechanicLayoutComponent } from '../../layouts/mechanic-layout.component';
import { MechanicLoginComponent } from './mechanic-login.component';
import { MechanicAuthService, MechanicSession } from './mechanic-auth.service';

describe('workshop role navigation', () => {
  it('sends a mechanic to the mechanic dashboard after login', () => {
    verifyLoginDestination('MECHANIC', '/dashboard');
  });

  it('sends an administrator to the administrator dashboard after login', () => {
    verifyLoginDestination('ADMIN', '/admin/dashboard');
  });

  it('shows only the mechanic modules in the mechanic sidebar', async () => {
    const session: MechanicSession = {
      id: 1,
      codigoMecanico: 'MEC-001',
      nombre: 'Mecánico de pruebas',
      role: 'MECHANIC'
    };
    const auth = {
      mechanic: signal<MechanicSession | null>(session),
      logout: () => of(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [MechanicLayoutComponent],
      providers: [{ provide: MechanicAuthService, useValue: auth }, provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(MechanicLayoutComponent);
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.mechanic-nav__link') as NodeListOf<HTMLAnchorElement>
    ).map((link) => link.textContent?.trim());

    expect(links).toEqual(['Tablero', 'Vehículos', 'Inventario']);
  });
});

function verifyLoginDestination(role: MechanicSession['role'], destination: string): void {
  const session: MechanicSession = {
    id: 1,
    codigoMecanico: 'TEST-USER',
    nombre: 'Usuario de pruebas',
    role
  };
  const auth = {
    login: jasmine.createSpy('login').and.returnValue(of(session))
  };

  TestBed.configureTestingModule({
    imports: [MechanicLoginComponent],
    providers: [{ provide: MechanicAuthService, useValue: auth }, provideRouter([])]
  });

  const fixture: ComponentFixture<MechanicLoginComponent> = TestBed.createComponent(MechanicLoginComponent);
  const router = TestBed.inject(Router);
  const navigate = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  fixture.componentInstance.form.setValue({
    codigoMecanico: 'TEST-USER',
    password: 'Test-Password-123'
  });

  fixture.componentInstance.login();

  expect(navigate).toHaveBeenCalledWith([destination]);
  TestBed.resetTestingModule();
}
