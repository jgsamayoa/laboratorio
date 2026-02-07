import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DbService } from '../../core/db.service';
import { PdfService } from '../../core/pdf.service';
import { uid } from '../../core/uid';
import type { Patient, CBCReport, Sex } from '../../core/models';

@Component({
  selector: 'app-hematologia-page',
  templateUrl: './hematologia-page.component.html',
  styleUrls: ['./hematologia-page.component.css']
})
export class HematologiaPageComponent implements OnInit {
  loading = true;

  lab: any = null;
  reference: Record<string, string> = {};

  patients: Patient[] = [];
  reports: CBCReport[] = [];

  sexOptions: Sex[] = ['Masculino', 'Femenino', 'Otro'];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private db: DbService,
    private pdf: PdfService
  ) {
    // Inicializar form aquí (ya existe fb)
    this.form = this.fb.group({
      // paciente
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      dpi: [''],
      birthDate: [''],
      sex: ['Masculino' as Sex, [Validators.required]],
      doctor: [''],

      // identificacion reporte
      validationCode: ['1888-0001', [Validators.required]],
      receptionAt: [new Date().toISOString(), [Validators.required]],
      printedAt: [new Date().toISOString(), [Validators.required]],
      machine: ['Genrui KT6300', [Validators.required]],

      // serie roja
      RBC: [null as number | null],
      HGB: [null as number | null],
      HCT: [null as number | null],
      MCV: [null as number | null],
      MCH: [null as number | null],
      MCHC: [null as number | null],
      RDW_CV: [null as number | null],
      RDW_SD: [null as number | null],

      // serie blanca
      WBC: [null as number | null],
      NEU_PCT: [null as number | null],
      LYM_PCT: [null as number | null],
      MONO_PCT: [null as number | null],
      EOS_PCT: [null as number | null],
      BASO_PCT: [null as number | null],
      NEU_ABS: [null as number | null],
      LYM_ABS: [null as number | null],
      MONO_ABS: [null as number | null],
      EOS_ABS: [null as number | null],
      BASO_ABS: [null as number | null],

      // plaquetas
      PLT: [null as number | null],
      MPV: [null as number | null],
      PDW: [null as number | null],
      PCT: [null as number | null],

      // notas
      notes: [''],
    });
  }

  async ngOnInit() {
    await this.db.init();
    this.lab = this.db.getLab();
    this.reference = (this.db.getReferenceRanges() as any)['adult_male'] ?? {};

    this.patients = this.db.listPatients();
    this.reports = this.db.listReports();

    this.loading = false;
  }

  saveAndDownload() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Completa los campos obligatorios (Nombre, código de validación, fechas, equipo).');
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
    this.db.savePatient(patient);

    const report: CBCReport = {
      id: uid('r_'),
      patientId: patient.id,
      createdAt: new Date().toISOString(),
      patientSnapshot: patient,
      result: {
        validationCode: v.validationCode,
        receptionAt: v.receptionAt,
        printedAt: v.printedAt,
        machine: v.machine,

        RBC: v.RBC, HGB: v.HGB, HCT: v.HCT, MCV: v.MCV, MCH: v.MCH, MCHC: v.MCHC, RDW_CV: v.RDW_CV, RDW_SD: v.RDW_SD,
        WBC: v.WBC,
        NEU_PCT: v.NEU_PCT, LYM_PCT: v.LYM_PCT, MONO_PCT: v.MONO_PCT, EOS_PCT: v.EOS_PCT, BASO_PCT: v.BASO_PCT,
        NEU_ABS: v.NEU_ABS, LYM_ABS: v.LYM_ABS, MONO_ABS: v.MONO_ABS, EOS_ABS: v.EOS_ABS, BASO_ABS: v.BASO_ABS,
        PLT: v.PLT, MPV: v.MPV, PDW: v.PDW, PCT: v.PCT,
        notes: v.notes || null,
      }
    };

    this.db.saveReport(report);
    this.patients = this.db.listPatients();
    this.reports = this.db.listReports();

    // referencia (ejemplo simple) - luego se mejora por edad/sexo
    const ref = (this.db.getReferenceRanges() as any)['adult_male'] ?? {};

    this.pdf.downloadCBC(report, this.lab, ref);
  }

  loadFromHistory(reportId: string) {
    const r = this.reports.find(x => x.id === reportId);
    if (!r) return;

    const p = r.patientSnapshot;
    const res: any = r.result;

    this.form.patchValue({
      fullName: p.fullName,
      dpi: p.dpi ?? '',
      birthDate: p.birthDate ?? '',
      sex: p.sex,
      doctor: p.doctor ?? '',

      validationCode: res.validationCode,
      receptionAt: res.receptionAt,
      printedAt: res.printedAt,
      machine: res.machine,

      RBC: res.RBC ?? null, HGB: res.HGB ?? null, HCT: res.HCT ?? null,
      MCV: res.MCV ?? null, MCH: res.MCH ?? null, MCHC: res.MCHC ?? null,
      RDW_CV: res.RDW_CV ?? null, RDW_SD: res.RDW_SD ?? null,

      WBC: res.WBC ?? null,
      NEU_PCT: res.NEU_PCT ?? null, LYM_PCT: res.LYM_PCT ?? null, MONO_PCT: res.MONO_PCT ?? null,
      EOS_PCT: res.EOS_PCT ?? null, BASO_PCT: res.BASO_PCT ?? null,
      NEU_ABS: res.NEU_ABS ?? null, LYM_ABS: res.LYM_ABS ?? null, MONO_ABS: res.MONO_ABS ?? null,
      EOS_ABS: res.EOS_ABS ?? null, BASO_ABS: res.BASO_ABS ?? null,

      PLT: res.PLT ?? null, MPV: res.MPV ?? null, PDW: res.PDW ?? null, PCT: res.PCT ?? null,
      notes: res.notes ?? '',
    });
  }

  now() {
    this.form.patchValue({ printedAt: new Date().toISOString() });
  }
}
