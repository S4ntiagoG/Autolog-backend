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
  { path: '**', redirectTo: 'vehicle-intake' }
];
