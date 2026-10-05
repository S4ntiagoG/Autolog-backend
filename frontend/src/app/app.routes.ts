import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'client/search',
    title: 'AUTOLOG · Cliente',
    loadComponent: () =>
      import('./features/client/client-search/client-vehicle-search.component').then(
        ({ ClientVehicleSearchComponent }) => ClientVehicleSearchComponent
      )
  },
  {
    path: 'client/home',
    title: 'AUTOLOG · Portal del cliente',
    loadComponent: () =>
      import('./features/client/client-portal/client-home.component').then(
        ({ ClientHomeComponent }) => ClientHomeComponent
      )
  },
  {
    path: 'client/service-orders/:id',
    title: 'AUTOLOG · Detalle de servicio',
    loadComponent: () =>
      import('./features/client/service-order-detail/client-service-order-detail.component').then(
        ({ ClientServiceOrderDetailComponent }) => ClientServiceOrderDetailComponent
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
        path: 'dashboard',
        title: 'AUTOLOG · Tablero',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            ({ DashboardComponent }) => DashboardComponent
          )
      },
      {
        path: 'vehicle-intake',
        title: 'AUTOLOG · Ingreso de vehículo',
        loadComponent: () =>
          import('./features/vehicle-intake/vehicle-intake.component').then(
            ({ VehicleIntakeComponent }) => VehicleIntakeComponent
          )
      },
      {
        path: 'service-orders',
        children: [
          {
            path: 'vehicle',
            children: [
              {
                path: ':vehicleId',
                children: [
                  {
                    path: 'work',
                    title: 'AUTOLOG · Orden de trabajo',
                    loadComponent: () =>
                      import('./features/service-work-order/service-work-order.component').then(
                        ({ ServiceWorkOrderComponent }) => ServiceWorkOrderComponent
                      )
                  }
                ]
              }
            ]
          },
          {
            path: ':id',
            children: [
              {
                path: 'edit',
                title: 'AUTOLOG · Editar servicio',
                loadComponent: () =>
                  import('./features/vehicle-intake/vehicle-intake.component').then(
                    ({ VehicleIntakeComponent }) => VehicleIntakeComponent
                  )
              }
            ]
          }
        ]
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
