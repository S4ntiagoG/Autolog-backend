import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';

import { ServiceOrderResponse, VehicleIntakeDraft, VehicleResponse } from '../../core/models/api.models';
import { colombianPlateValidator } from '../../core/colombian-plate.validator';
import {
  MAX_EVIDENCE_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  VEHICLE_BRANDS,
  VEHICLE_TYPES,
  VISIT_REASONS
} from './models/vehicle-intake.constants';
import { IntakeEvidenceNames, VehicleIntakeService } from './services/vehicle-intake.service';

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-vehicle-intake',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vehicle-intake.component.html',
  styleUrl: './vehicle-intake.component.css'
})
export class VehicleIntakeComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly intakeService = inject(VehicleIntakeService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly vehicleTypes = VEHICLE_TYPES;
  readonly vehicleBrands = VEHICLE_BRANDS;
  readonly visitReasons = VISIT_REASONS;
  readonly currentYear = new Date().getFullYear();
  currentSystemDisplayDate(): string {
    return new Intl.DateTimeFormat('es-CO').format(new Date());
  }
  readonly maxEvidenceImages = MAX_EVIDENCE_IMAGES;
  readonly selectedImages = signal<SelectedImage[]>([]);
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly evidenceMessage = signal('');
  readonly isEditing = signal(false);
  readonly loadingRecord = signal(false);
  readonly recordLoaded = signal(false);
  readonly editingVehicle = signal<VehicleResponse | null>(null);
  readonly editingOrder = signal<ServiceOrderResponse | null>(null);

  readonly form = this.fb.nonNullable.group({
    vehicle: this.fb.nonNullable.group({
      vehicleType: ['', Validators.required],
      brand: ['', Validators.required],
      plate: ['', [Validators.required, colombianPlateValidator]],
      chassisNumber: ['', Validators.required],
      model: ['', Validators.required],
      vehicleYear: [this.currentYear, [Validators.required, Validators.min(1886), Validators.max(this.currentYear + 1)]]
    }),
    customer: this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.pattern(/\S+/)]],
      identificationNumber: ['', [Validators.required, Validators.pattern(/\S+/)]],
      phone: ['', [Validators.required, Validators.pattern(/\S+/)]],
      email: ['', [Validators.required, Validators.email]]
    }),
    entry: this.fb.nonNullable.group({
      entryDate: [this.currentDateAsIso(), Validators.required],
      primaryReason: ['', Validators.required],
      currentMileage: [0, [Validators.required, Validators.min(0)]],
      customerObservations: ['']
    })
  });

  ngOnDestroy(): void {
    this.revokeImageUrls(this.selectedImages());
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.isEditing.set(true);
      this.loadIntake(id);
    }
  }

  save(): void {
    this.submitted.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();
    const draft: VehicleIntakeDraft = {
      vehicle: raw.vehicle,
      customer: raw.customer,
      entry: raw.entry
    };

    const vehicle = this.editingVehicle();
    const order = this.editingOrder();
    const saveRequest = vehicle && order
      ? this.intakeService.updateIntake(vehicle, order, draft)
      : this.intakeService.createIntake(draft, this.evidenceNames());

    saveRequest.subscribe({
      next: (savedOrder) => {
        this.loading.set(false);
        if (this.isEditing()) {
          this.editingOrder.set(savedOrder);
          this.form.controls.entry.controls.entryDate.setValue(savedOrder.entryDate);
          this.successMessage.set('Cambios guardados correctamente. La fecha se actualizó automáticamente.');
          return;
        }

        this.successMessage.set('Ingreso registrado correctamente. Abriendo el listado de vehículos…');
        window.setTimeout(() => void this.router.navigate(['/vehicles']), 900);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.getFriendlyError(error));
      }
    });
  }

  cancel(): void {
    if (this.loading()) {
      return;
    }

    void this.router.navigate(['/vehicles']);
  }

  private loadIntake(id: number): void {
    this.loadingRecord.set(true);
    this.intakeService.getServiceOrder(id).pipe(
      switchMap((order) => this.intakeService.getVehicle(order.vehicle.id).pipe(
        map((vehicle) => ({ vehicle, order }))
      ))
    ).subscribe({
      next: ({ vehicle, order }) => {
        this.editingVehicle.set(vehicle);
        this.editingOrder.set(order);
        this.recordLoaded.set(true);
        this.form.reset({
          vehicle: {
            vehicleType: vehicle.vehicleType,
            brand: vehicle.brand,
            plate: vehicle.plate,
            chassisNumber: vehicle.chassisNumber,
            model: vehicle.model,
            vehicleYear: vehicle.vehicleYear
          },
          customer: {
            name: vehicle.client.name,
            identificationNumber: vehicle.client.identificationNumber,
            phone: vehicle.client.phone,
            email: vehicle.client.email
          },
          entry: {
            entryDate: order.entryDate,
            primaryReason: order.primaryReason,
            currentMileage: order.currentMileage,
            customerObservations: order.customerObservations || ''
          }
        });
        this.loadingRecord.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getFriendlyError(error));
        this.loadingRecord.set(false);
      }
    });
  }

  showError(path: string): boolean {
    const control = this.form.get(path);
    return Boolean(control?.invalid && (control.touched || this.submitted()));
  }

  hasOption(options: readonly string[], value: string): boolean {
    return options.includes(value);
  }

  errorFor(path: string): string {
    const control = this.form.get(path);
    if (!control?.errors) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    if (control.hasError('email')) {
      return 'Ingresa un correo electrónico válido.';
    }
    if (control.hasError('min')) {
      return 'El valor no puede ser negativo.';
    }
    if (control.hasError('max')) {
      return 'Ingresa un año válido.';
    }
    if (control.hasError('pattern')) {
      return 'Ingresa un valor válido.';
    }
    if (control.hasError('invalidColombianPlate')) {
      return 'Formato inválido. Ejemplos: ABC123, ABC12D, ABC12, R12345 o CD1234.';
    }
    return 'Revisa este campo.';
  }

  normalizePlateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value.toUpperCase();
    if (input.value !== normalized) {
      const cursorPosition = input.selectionStart;
      input.value = normalized;
      this.form.controls.vehicle.controls.plate.setValue(normalized);
      if (cursorPosition !== null) {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
  }

  private currentDateAsIso(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
    }
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  removeImage(id: string): void {
    const image = this.selectedImages().find((item) => item.id === id);
    if (image) {
      URL.revokeObjectURL(image.previewUrl);
    }
    this.selectedImages.update((images) => images.filter((item) => item.id !== id));
    this.evidenceMessage.set('');
  }

  trackImage(_: number, image: SelectedImage): string {
    return image.id;
  }

  private addFiles(files: FileList | File[]): void {
    this.evidenceMessage.set('');
    const currentImages = this.selectedImages();
    const nextImages: SelectedImage[] = [];
    const availableSlots = MAX_EVIDENCE_IMAGES - currentImages.length;

    for (const file of Array.from(files).slice(0, availableSlots)) {
      if (!file.type.startsWith('image/')) {
        this.evidenceMessage.set('Solo puedes seleccionar archivos de imagen.');
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        this.evidenceMessage.set('Cada imagen debe pesar máximo 10 MB.');
        continue;
      }
      const duplicate = [...currentImages, ...nextImages].some(
        (image) => image.file.name === file.name && image.file.size === file.size && image.file.lastModified === file.lastModified
      );
      if (!duplicate) {
        nextImages.push({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file)
        });
      }
    }

    if (files.length > availableSlots) {
      this.evidenceMessage.set(`Puedes adjuntar hasta ${MAX_EVIDENCE_IMAGES} imágenes.`);
    }
    this.selectedImages.set([...currentImages, ...nextImages]);
  }

  private clearImages(): void {
    this.revokeImageUrls(this.selectedImages());
    this.selectedImages.set([]);
    this.fileInput()?.nativeElement.blur();
  }

  private revokeImageUrls(images: SelectedImage[]): void {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
  }

  private evidenceNames(): IntakeEvidenceNames {
    const names = this.selectedImages().map((image) => image.file.name);
    return {
      photoFront: names[0],
      photoRightSide: names[1],
      photoBack: names[2],
      photoOdometer: names[3],
      photoExtra: names[4]
    };
  }

  private getFriendlyError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No fue posible registrar el ingreso. Intenta nuevamente.';
    }
    if (error.status === 0) {
      return 'No se pudo conectar con el backend. Verifica que Spring Boot esté ejecutándose en el puerto 8080.';
    }
    if (error.status === 404) {
      return 'El recurso relacionado no fue encontrado. Actualiza la página e intenta nuevamente.';
    }
    if (error.status === 409) {
      return 'La cédula, el correo, la placa o el VIN ya están registrados.';
    }
    if (error.status === 400) {
      return 'El backend rechazó los datos enviados. Revisa la información del formulario.';
    }
    return 'No fue posible registrar el ingreso. Revisa los datos e intenta nuevamente.';
  }
}
