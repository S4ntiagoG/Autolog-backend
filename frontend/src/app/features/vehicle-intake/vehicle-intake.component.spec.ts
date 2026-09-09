import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ServiceOrderResponse } from '../../core/models/api.models';
import { VehicleIntakeComponent } from './vehicle-intake.component';
import { VehicleIntakeService } from './services/vehicle-intake.service';

describe('VehicleIntakeComponent', () => {
  let fixture: ComponentFixture<VehicleIntakeComponent>;
  let component: VehicleIntakeComponent;
  let intakeService: jasmine.SpyObj<VehicleIntakeService>;

  beforeEach(async () => {
    intakeService = jasmine.createSpyObj<VehicleIntakeService>('VehicleIntakeService', ['createIntake']);
    intakeService.createIntake.and.returnValue(of({ id: 1 } as ServiceOrderResponse));

    await TestBed.configureTestingModule({
      imports: [VehicleIntakeComponent],
      providers: [
        { provide: VehicleIntakeService, useValue: intakeService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleIntakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not submit when the plate is empty', () => {
    component.form.patchValue({
      vehicle: { plate: '' },
      customer: { name: 'Ana Torres', phone: '3000000000', email: 'ana@example.com', identificationNumber: '123' },
      entry: { primaryReason: 'Revisión general', currentMileage: 100 }
    });

    component.save();

    expect(component.form.get('vehicle.plate')?.invalid).toBeTrue();
    expect(intakeService.createIntake).not.toHaveBeenCalled();
  });

  it('rejects an invalid email, empty name, empty phone and negative mileage', () => {
    component.form.patchValue({
      customer: { name: '', phone: '', email: 'correo-invalido', identificationNumber: '123' },
      entry: { currentMileage: -1 }
    });

    component.save();

    expect(component.form.get('customer.email')?.hasError('email')).toBeTrue();
    expect(component.form.get('customer.name')?.hasError('required')).toBeTrue();
    expect(component.form.get('customer.phone')?.hasError('required')).toBeTrue();
    expect(component.form.get('entry.currentMileage')?.hasError('min')).toBeTrue();
    expect(intakeService.createIntake).not.toHaveBeenCalled();
  });

  it('resets the form and clears messages when cancelled', () => {
    component.form.patchValue({ vehicle: { plate: 'ABC123' }, customer: { name: 'Cliente' } });

    component.cancel();

    expect(component.form.getRawValue().vehicle.plate).toBe('');
    expect(component.form.getRawValue().customer.name).toBe('');
    expect(intakeService.createIntake).not.toHaveBeenCalled();
  });

  it('submits a valid intake through the service', () => {
    component.form.patchValue({
      vehicle: {
        vehicleType: 'Automóvil',
        brand: 'Toyota',
        plate: 'ABC123',
        chassisNumber: 'VIN123',
        model: 'Corolla',
        vehicleYear: 2024
      },
      customer: { name: 'Ana Torres', identificationNumber: '123', phone: '3000000000', email: 'ana@example.com' },
      entry: { primaryReason: 'Revisión general', currentMileage: 100, customerObservations: '' }
    });

    component.save();

    expect(intakeService.createIntake).toHaveBeenCalled();
  });

  it('keeps the form data and shows a friendly message when the backend fails', () => {
    intakeService.createIntake.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    component.form.patchValue({
      vehicle: {
        vehicleType: 'Automóvil',
        brand: 'Toyota',
        plate: 'ABC123',
        chassisNumber: 'VIN123',
        model: 'Corolla',
        vehicleYear: 2024
      },
      customer: { name: 'Ana Torres', identificationNumber: '123', phone: '3000000000', email: 'ana@example.com' },
      entry: { primaryReason: 'Revisión general', currentMileage: 100 }
    });

    component.save();

    expect(component.form.getRawValue().vehicle.plate).toBe('ABC123');
    expect(component.errorMessage()).toContain('No fue posible registrar');
    expect(component.loading()).toBeFalse();
  });
});
