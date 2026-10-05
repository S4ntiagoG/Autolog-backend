import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ServiceOrderResponse } from '../../../core/models/api.models';
import { ClientPortalService } from '../client-portal/client-portal.service';

interface EvidenceImage {
  slot: 'front' | 'right-side' | 'back' | 'odometer' | 'extra';
  label: string;
  path: string | null | undefined;
}

@Component({
  selector: 'app-client-service-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-service-order-detail.component.html',
  styleUrl: './client-service-order-detail.component.css'
})
export class ClientServiceOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly portal = inject(ClientPortalService);

  readonly order = signal<ServiceOrderResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly selectedEvidence = signal<EvidenceImage['slot']>('front');

  readonly evidenceImages = computed<EvidenceImage[]>(() => {
    const order = this.order();
    if (!order) {
      return [];
    }

    const images: EvidenceImage[] = [
      { slot: 'front', label: 'Frente', path: order.photoFront },
      { slot: 'right-side', label: 'Lado derecho', path: order.photoRightSide },
      { slot: 'back', label: 'Parte trasera', path: order.photoBack },
      { slot: 'odometer', label: 'Odómetro', path: order.photoOdometer },
      { slot: 'extra', label: 'Evidencia adicional', path: order.photoExtra }
    ];
    return images.filter((image) => this.isStoredEvidencePath(image.path, order.id));
  });

  readonly selectedImageUrl = computed(() => {
    const order = this.order();
    const image = this.evidenceImages().find((item) => item.slot === this.selectedEvidence()) ??
      this.evidenceImages()[0];
    return order && image ? this.evidenceUrl(order.id, image.slot) : null;
  });

  readonly partsSubtotal = computed(() => this.roundCurrency(
    (this.order()?.parts ?? []).reduce((total, part) => total + part.quantity * part.unitPrice, 0)
  ));
  readonly laborSubtotal = computed(() => this.roundCurrency(
    (this.order()?.labor ?? []).reduce((total, labor) => total + labor.hours * labor.rate, 0)
  ));
  readonly shopSupplies = computed(() => this.roundCurrency(this.partsSubtotal() * 0.05));
  readonly calculatedTotal = computed(() => this.roundCurrency(
    this.partsSubtotal() + this.laborSubtotal() + this.shopSupplies()
  ));
  readonly totalPaid = computed(() => {
    const serviceCost = this.order()?.serviceCost;
    return serviceCost !== null && serviceCost !== undefined
      ? Number(serviceCost)
      : this.calculatedTotal();
  });
  readonly partsShare = computed(() =>
    this.totalPaid() === 0 ? 0 : this.roundCurrency((this.partsSubtotal() / this.totalPaid()) * 100)
  );

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(orderId) || orderId < 1) {
      this.error.set('El número de orden no es válido.');
      this.loading.set(false);
      return;
    }

    this.portal.getServiceOrder(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        const firstImage = this.evidenceImages()[0];
        if (firstImage) {
          this.selectedEvidence.set(firstImage.slot);
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Error cargando detalle del servicio:', error);
        this.error.set('No se pudo cargar el detalle del servicio. Intenta nuevamente desde el historial.');
        this.loading.set(false);
      }
    });
  }

  selectEvidence(slot: EvidenceImage['slot']): void {
    this.selectedEvidence.set(slot);
  }

  evidenceUrl(orderId: number, slot: EvidenceImage['slot']): string {
    return `/api/service-orders/${orderId}/evidence/${slot}`;
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) {
      return 'Sin costo registrado';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  }

  orderNumber(id: number): string {
    return `SO-${new Date(this.order()?.entryDate ?? Date.now()).getFullYear()}-${String(id).padStart(6, '0')}`;
  }

  formatServiceDate(date: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(`${date}T12:00:00`));
  }

  statusClass(status: string | null | undefined): string {
    switch (status?.toUpperCase()) {
      case 'LISTO':
        return 'status-pill--ready';
      case 'EN PROGRESO':
        return 'status-pill--in-progress';
      default:
        return 'status-pill--pending';
    }
  }

  downloadInvoice(): void {
    window.print();
  }

  private isStoredEvidencePath(path: string | null | undefined, orderId: number): boolean {
    return Boolean(path?.startsWith(`service-orders/${orderId}/`));
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
