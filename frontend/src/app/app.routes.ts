import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'client/search'
  },
  {
    path: 'client/search',
    title: 'AUTOLOG · Cliente',
    loadComponent: () =>
      import('./features/client-portal/client-vehicle-search.component').then(
        ({ ClientVehicleSearchComponent }) => ClientVehicleSearchComponent
      )
  },
  {
    path: 'client/home',
    title: 'AUTOLOG · Portal del cliente',
    loadComponent: () =>
      import('./features/client-portal/client-home.component').then(
        ({ ClientHomeComponent }) => ClientHomeComponent
      )
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/mechanic-layout.component').then(
        ({ MechanicLayoutComponent }) => MechanicLayoutComponent
      ),
    children: [
      {
        path: 'vehicle-intake',
        title: 'AUTOLOG · Ingreso de vehículo',
        loadComponent: () =>
          import('./features/vehicle-intake/vehicle-intake.component').then(
            ({ VehicleIntakeComponent }) => VehicleIntakeComponent
          )
      },
      {
        path: 'service-orders/:id/edit',
        title: 'AUTOLOG · Editar servicio',
        loadComponent: () =>
          import('./features/vehicle-intake/vehicle-intake.component').then(
            ({ VehicleIntakeComponent }) => VehicleIntakeComponent
          )
      },
      {
        path: 'vehicles',
        title: 'AUTOLOG · Vehículos',
        loadComponent: () =>
          import('./features/vehicles/vehicle-list.component').then(
            ({ VehicleListComponent }) => VehicleListComponent
          )
      },
      {
        path: 'mechanic/vehicles',
        title: 'AUTOLOG · Vehículos del mecánico',
        loadComponent: () =>
          import('./features/vehicles/vehicle-list.component').then(
            ({ VehicleListComponent }) => VehicleListComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: 'client/search' }
];
