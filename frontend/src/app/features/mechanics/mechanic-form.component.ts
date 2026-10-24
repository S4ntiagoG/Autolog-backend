import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './mechanic-form.component.html',
  styleUrl: './mechanic-form.component.css'
})
export class MechanicFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mechanicService = inject(MechanicManagementService);

  readonly mechanicId = signal<number | null>(null);
  readonly form = signal<MechanicForm>({ ...EMPTY_FORM });
  readonly formReady = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
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
    this.form.update((form) => {
      switch (field) {
        case 'accessEmail': return { ...form, accessEmail: value };
        case 'fullName': return { ...form, fullName: value };
        case 'documentNumber': return { ...form, documentNumber: value };
        case 'phone': return { ...form, phone: value };
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

  save(formIsValid: boolean): void {
    const values = this.form();
    const id = this.mechanicId();
    if (!formIsValid || this.saving() || this.loading() ||
        !values.specialty || !values.experienceLevel ||
        (id === null && values.password.length < 8)) {
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
        this.error.set(error instanceof HttpErrorResponse && error.status === 409
          ? 'El correo de acceso o el documento ya está registrado.'
          : 'No se pudo guardar el mecánico. Verifica los datos e inténtalo de nuevo.');
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
  }
}
