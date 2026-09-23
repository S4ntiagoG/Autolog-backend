import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'vehicle-intake'
  },
  {
    path: 'vehicle-intake',
    loadComponent: () =>
      import('./features/vehicle-intake/vehicle-intake.component').then(
        ({ VehicleIntakeComponent }) => VehicleIntakeComponent
      )
  },
  {
    path: 'vehicles',
    loadComponent: () =>
      import('./features/vehicles/vehicle-list.component').then(
        ({ VehicleListComponent }) => VehicleListComponent
      )
  },
  {
    path: 'vehicles/:id/edit',
    loadComponent: () =>
      import('./features/vehicles/vehicle-edit.component').then(
        ({ VehicleEditComponent }) => VehicleEditComponent
      )
  },
  {
    path: 'service-orders/:id',
    loadComponent: () =>
      import('./features/vehicles/service-order-detail.component').then(
        ({ ServiceOrderDetailComponent }) => ServiceOrderDetailComponent
      )
  },
  {
    path: 'service-orders/vehicle/:vehicleId',
    loadComponent: () =>
      import('./features/vehicles/service-order-detail.component').then(
        ({ ServiceOrderDetailComponent }) => ServiceOrderDetailComponent
      )
  },
  {
    path: 'mechanic/vehicles',
    loadComponent: () =>
      import('./features/vehicles/vehicle-list.component').then(
        ({ VehicleListComponent }) => VehicleListComponent
      )
  },
  { path: '**', redirectTo: 'vehicle-intake' }
];
