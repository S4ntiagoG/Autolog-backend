import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AutoDismissDirective } from '../core/directives/auto-dismiss.directive';
import { MechanicAuthService } from '../features/mechanic-auth/mechanic-auth.service';

@Component({
  selector: 'app-mechanic-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AutoDismissDirective],
  templateUrl: './mechanic-layout.component.html',
  styleUrl: './mechanic-layout.component.css'
})
export class MechanicLayoutComponent {
  private readonly auth = inject(MechanicAuthService);
  private readonly router = inject(Router);

  readonly mechanic = this.auth.mechanic;
  readonly logoutError = signal('');

  dashboardRoute(): string {
    return this.mechanic()?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
  }

  logout(): void {
    this.logoutError.set('');
    this.auth.logout().subscribe({
      next: () => void this.router.navigate(['/mechanic/login']),
      error: (error: unknown) => {
        console.error('Error cerrando la sesión del mecánico:', error);
        this.logoutError.set('No fue posible cerrar la sesión.');
      }
    });
  }
}