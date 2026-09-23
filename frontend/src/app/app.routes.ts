import { Routes } from '@angular/router';

import { TemporaryRoleGuard } from './features/auth/temporary-role.guard';

export const routes: Routes = [
  {
    path: 'seleccionar-rol',
    loadComponent: () =>
      import('./features/role-selection/role-selection.component').then(
        ({ RoleSelectionComponent }) => RoleSelectionComponent
      )
  },
  {
    path: 'mecanico',
    canActivate: [TemporaryRoleGuard],
    loadComponent: () =>
      import('./features/layouts/mechanic-layout.component').then(
        ({ MechanicLayoutComponent }) => MechanicLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'tablero', pathMatch: 'full' },
      {
        path: 'tablero',
        loadComponent: () =>
          import('./features/mechanic/dashboard/mechanic-dashboard.component').then(
            ({ MechanicDashboardComponent }) => MechanicDashboardComponent
          )
      },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./features/vehicles/vehicle-list.component').then(
            ({ VehicleListComponent }) => VehicleListComponent
          )
      },
      {
        path: 'vehiculos/nuevo',
        loadComponent: () =>
          import('./features/vehicle-intake/vehicle-intake.component').then(
            ({ VehicleIntakeComponent }) => VehicleIntakeComponent
          )
      },
      {
        path: 'vehiculos/:id',
        loadComponent: () =>
          import('./features/vehicles/vehicle-detail.component').then(
            ({ VehicleDetailComponent }) => VehicleDetailComponent
          )
      },
      {
        path: 'vehiculos/:id/editar',
        loadComponent: () =>
          import('./features/vehicles/vehicle-form.component').then(
            ({ VehicleFormComponent }) => VehicleFormComponent
          )
      },
      {
        path: 'vehiculos/:id/historial',
        loadComponent: () =>
          import('./features/vehicles/service-history.component').then(
            ({ ServiceHistoryComponent }) => ServiceHistoryComponent
          )
      },
      {
        path: 'vehiculos/:id/orden-trabajo',
        loadComponent: () =>
          import('./features/vehicles/work-order.component').then(
            ({ WorkOrderComponent }) => WorkOrderComponent
          )
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/inventory/inventory.component').then(
            ({ InventoryComponent }) => InventoryComponent
          )
      }
    ]
  },
  {
    path: 'cliente',
    canActivate: [TemporaryRoleGuard],
    loadComponent: () =>
      import('./features/layouts/client-layout.component').then(
        ({ ClientLayoutComponent }) => ClientLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'vehiculos', pathMatch: 'full' },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./features/client/client-vehicle-list.component').then(
            ({ ClientVehicleListComponent }) => ClientVehicleListComponent
          )
      },
      {
        path: 'vehiculos/:id',
        loadComponent: () =>
          import('./features/client/client-vehicle-detail.component').then(
            ({ ClientVehicleDetailComponent }) => ClientVehicleDetailComponent
          )
      }
    ]
  },
  {
    path: 'vehicle-intake',
    redirectTo: 'mecanico/vehiculos/nuevo',
    pathMatch: 'full'
  },
  {
    path: 'vehicles',
    redirectTo: 'mecanico/vehiculos',
    pathMatch: 'full'
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'seleccionar-rol'
  },
  { path: '**', redirectTo: 'seleccionar-rol' }
];
