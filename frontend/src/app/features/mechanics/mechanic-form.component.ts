import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AutoDismissDirective } from '../../core/directives/auto-dismiss.directive';
import {
  MechanicExperienceLevel,
  MechanicRecord,
  MechanicRequest,
  MechanicSpecialty
} from '../../core/models/api.models';
import { MechanicManagementService } from '../../core/services/mechanic-management.service';

interface MechanicForm {
  accessEmail: string;
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  specialty: MechanicSpecialty | '';
  experienceLevel: MechanicExperienceLevel | '';
  hireDate: string;
  password: string;
}

const EMPTY_FORM: MechanicForm = {
  accessEmail: '',
  fullName: '',
  documentNumber: '',
  phone: '',
  email: '',
  specialty: '',
  experienceLevel: '',
  hireDate: '',
  password: ''
};

@Component({
  selector: 'app-mechanic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoDismissDirective],
  templateUrl: './mechanic-form.component.html',
  styleUrl: './mechanic-form.component.css'
})
export class MechanicFormComponent implements OnInit {
  private readonly fullNamePattern = /^(?=.*\p{L})[\p{L}\p{M} ]{3,100}$/u;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mechanicService = inject(MechanicManagementService);

  readonly mechanicId = signal<number | null>(null);
  readonly form = signal<MechanicForm>({ ...EMPTY_FORM });
  readonly formReady = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  private originalForm: MechanicForm | null = null;
  readonly specialties: MechanicSpecialty[] = [
    'Mecánica general', 'Motores', 'Frenos', 'Transmisión', 'Electricidad', 'Inyección', 'Suspensión'
  ];
  readonly experienceLevels: MechanicExperienceLevel[] = ['Junior', 'Semi-senior', 'Senior'];

  ngOnInit(): void {
    const idValue = this.route.snapshot.paramMap.get('id');
    if (idValue === null) {
      this.formReady.set(true);
      return;
    }

    const id = Number(idValue);
    if (!Number.isInteger(id) || id < 1) {
      this.error.set('El identificador del mecánico no es válido.');
      return;
    }

    this.mechanicId.set(id);
    this.loading.set(true);
    this.mechanicService.getMechanics().subscribe({
      next: (mechanics) => {
        const mechanic = mechanics.find((item) => item.id === id);
        if (!mechanic) {
          this.error.set('No se encontró el mecánico solicitado.');
        } else {
          this.setFormFromRecord(mechanic);
          this.formReady.set(true);
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Error cargando datos del mecánico:', error);
        this.error.set('No se pudieron cargar los datos del mecánico. Verifica la conexión e inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }

  setFormField(field: keyof MechanicForm, value: string): void {
    this.error.set('');
    this.success.set('');
    this.form.update((form) => {
      switch (field) {
        case 'accessEmail': return { ...form, accessEmail: value };
        case 'fullName':
          return { ...form, fullName: value.replace(/[^\p{L}\p{M} ]/gu, '').slice(0, 100) };
        case 'documentNumber':
          return { ...form, documentNumber: value.replace(/[^0-9]/g, '').slice(0, 10) };
        case 'phone':
          return { ...form, phone: value.replace(/[^0-9]/g, '').slice(0, 10) };
        case 'email': return { ...form, email: value };
        case 'specialty':
          return { ...form, specialty: this.specialties.find((item) => item === value) ?? '' };
        case 'experienceLevel':
          return { ...form, experienceLevel: this.experienceLevels.find((item) => item === value) ?? '' };
        case 'hireDate': return { ...form, hireDate: value };
        case 'password': return { ...form, password: value };
      }
      return form;
    });
  }

  isPersonalInformationValid(): boolean {
    const { fullName, documentNumber, phone } = this.form();
    return this.fullNamePattern.test(fullName) &&
      /^[0-9]{3,10}$/.test(documentNumber) &&
      /^[0-9]{10}$/.test(phone);
  }

  save(formIsValid: boolean): void {
    const values = this.form();
    const id = this.mechanicId();
    if (!formIsValid || !this.isPersonalInformationValid() || this.saving() || this.loading() ||
        !values.specialty || !values.experienceLevel ||
        (id === null && values.password.length < 8)) {
      return;
    }

    if (id !== null && !this.hasFormChanged(values)) {
      this.error.set('');
      this.success.set('No hubo cambios detectados');
      return;
    }

    const request: MechanicRequest = {
      ...values,
      specialty: values.specialty,
      experienceLevel: values.experienceLevel
    };
    this.error.set('');
    this.saving.set(true);
    const saveRequest = id === null
      ? this.mechanicService.createMechanic(request)
      : this.mechanicService.updateMechanic(id, request);

    saveRequest.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/mechanics'], {
          state: {
            mechanicsSuccess: id === null
              ? 'El mecánico se registró correctamente.'
              : 'Los datos del mecánico se actualizaron correctamente.'
          }
        });
      },
      error: (error: unknown) => {
        console.error('Error guardando el mecánico:', error);
        this.error.set(this.getSaveErrorMessage(error));
        this.saving.set(false);
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/mechanics']);
  }

  private setFormFromRecord(mechanic: MechanicRecord): void {
    this.form.set({
      accessEmail: mechanic.accessEmail,
      fullName: mechanic.fullName,
      documentNumber: mechanic.documentNumber ?? '',
      phone: mechanic.phone ?? '',
      email: mechanic.email ?? '',
      specialty: mechanic.specialty ?? '',
      experienceLevel: mechanic.experienceLevel ?? '',
      hireDate: mechanic.hireDate ?? '',
      password: ''
    });
    this.originalForm = { ...this.form() };
  }

  private hasFormChanged(form: MechanicForm): boolean {
    const originalForm = this.originalForm;
    if (!originalForm) {
      return false;
    }

    const fields: (keyof MechanicForm)[] = [
      'accessEmail',
      'fullName',
      'documentNumber',
      'phone',
      'email',
      'specialty',
      'experienceLevel',
      'hireDate',
      'password'
    ];
    return fields.some((field) => form[field] !== originalForm[field]);
  }

  private getSaveErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No se pudo guardar el mecánico. Inténtalo de nuevo.';
    }

    switch (error.status) {
      case 0:
        return 'No se pudo conectar con el servidor. Verifica que el backend esté activo e inténtalo de nuevo.';
      case 400:
        return 'El servidor rechazó uno de los campos. Verifica que los correos tengan un formato válido y que los campos obligatorios estén completos.';
      case 401:
        return 'La sesión expiró. Inicia sesión nuevamente como administrador.';
      case 403:
        return 'El servidor rechazó la solicitud. Verifica que tu sesión de administrador siga activa e inténtalo de nuevo.';
      case 409:
        return 'El correo de acceso o el documento ya está registrado.';
      default:
        return error.status >= 500
          ? `El servidor no pudo guardar el mecánico (error ${error.status}). Revisa el backend e inténtalo de nuevo.`
          : `No se pudo guardar el mecánico (error ${error.status}). Revisa los datos e inténtalo de nuevo.`;
    }
  }
}
