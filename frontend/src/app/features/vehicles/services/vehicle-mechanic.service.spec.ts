import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../../core/config/api.config';
import { ServiceOrderResponse, VehicleResponse } from '../../../core/models/api.models';
import { MechanicVehicleItem } from '../models/vehicle-mechanic.models';
import { VehicleMechanicService } from './vehicle-mechanic.service';

describe('VehicleMechanicService', () => {
  let service: VehicleMechanicService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VehicleMechanicService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(VehicleMechanicService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('uses the newest service order ID when multiple orders were entered on the same day', () => {
    const vehicle: VehicleResponse = {
      id: 2,
      vehicleType: 'Automóvil',
      brand: 'Chevrolet',
      model: 'Corolla',
      plate: 'ABC123',
      chassisNumber: 'CHASSIS-2',
      vehicleYear: 2026,
      client: {
        id: 1,
        name: 'David Guzman Rivera',
        identificationNumber: '123456',
        email: 'david@example.com',
        phone: '3000000000'
      }
    };
    const order = (id: number, status: ServiceOrderResponse['status']): ServiceOrderResponse => ({
      id,
      entryDate: '2026-10-07',
      primaryReason: 'Servicio',
      currentMileage: 100,
      customerObservations: '',
      serviceCost: 0,
      status,
      vehicle: { ...vehicle, client: vehicle.client },
      parts: [],
      labor: []
    });
    let result: MechanicVehicleItem[] | undefined;

    service.getMechanicVehicles().subscribe((items) => {
      result = items;
    });

    httpTestingController.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.vehiclesPath}`).flush([vehicle]);
    httpTestingController.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.serviceOrdersPath}`).flush([
      order(12, 'PENDIENTE'),
      order(11, 'LISTO')
    ]);

    expect(result?.[0].serviceOrderId).toBe(12);
    expect(result?.[0].status).toBe('PENDIENTE');
  });
});
