import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DbService } from '../../core/db.service';
import { PdfService } from '../../core/pdf.service';
import { uid } from '../../core/uid';
import type { Sex, Patient } from '../../core/models';

@Component({
  selector: 'app-orina-page',
  templateUrl: './orina-page.component.html',
})
export class OrinaPageComponent implements OnInit {
  loading = true;
  lab: any = null;
  sexOptions: Sex[] = ['Masculino', 'Femenino', 'Otro'];

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    dpi: [''],
    birthDate: [''],
    sex: ['Masculino' as Sex, [Validators.required]],
    doctor: [''],

    validationCode: ['1888-0001', [Validators.required]],
    receptionAt: [new Date().toISOString(), [Validators.required]],
    printedAt: [new Date().toISOString(), [Validators.required]],

    color: [''],
    appearance: [''],
    ph: [''],
    specificGravity: [''],
    glucose: [''],
    protein: [''],
    ketones: [''],
    bilirubin: [''],
    urobilinogen: [''],
    nitrite: [''],
    leukocytes: [''],
    blood: [''],
    sediment: [''],
    notes: [''],
  });

  constructor(private fb: FormBuilder, private db: DbService, private pdf: PdfService) {}

  async ngOnInit() {
    await this.db.init();
    this.lab = this.db.getLab();
    this.loading = false;
  }

  saveAndDownload() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Completa los campos obligatorios.');
      return;
    }

    const v: any = this.form.getRawValue();

    const patient: Patient = {
      id: uid('p_'),
      fullName: v.fullName,
      dpi: v.dpi || null,
      birthDate: v.birthDate || null,
      sex: v.sex,
      doctor: v.doctor || null,
    };

    const report = {
      id: uid('u_'),
      type: 'URINE',
      createdAt: new Date().toISOString(),
      patientSnapshot: patient,
      result: v,
    };

    this.db.saveGenericReport('urineReports', report);
    this.pdf.downloadUrine(report, this.lab);
  }

  get history() {
    return this.db.listGenericReports('urineReports');
  }

  reprint(r: any) {
    this.pdf.downloadUrine(r, this.lab);
  }
}
