import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { MechanicAuthService } from '../mechanic-auth/mechanic-auth.service';

@Component({
  selector: 'app-workshop-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './workshop-placeholder.component.html',
  styleUrl: './workshop-placeholder.component.css'
})
export class WorkshopPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(MechanicAuthService);

  readonly title = String(this.route.snapshot.data['moduleTitle'] ?? 'Módulo');
  readonly description = String(this.route.snapshot.data['moduleDescription'] ?? '');

  dashboardRoute(): string {
    return this.auth.mechanic()?.role === 'ADMIN'
      ? '/admin/dashboard'
      : '/dashboard';
  }
}
