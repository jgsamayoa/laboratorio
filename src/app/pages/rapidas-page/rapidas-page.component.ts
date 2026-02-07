import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DbService } from '../../core/db.service';
import { PdfService } from '../../core/pdf.service';
import { uid } from '../../core/uid';
import type { Patient, Sex, RapidReport } from '../../core/models';

type RapidCatalogItem = { id: string; name: string; units?: string; reference?: string };

@Component({
  selector: 'app-rapidas-page',
  templateUrl: './rapidas-page.component.html',
})
export class RapidasPageComponent implements OnInit {
  loading = true;
  lab: any = null;

  reports: RapidReport[] = [];
  catalog: RapidCatalogItem[] = [];
  sexOptions: Sex[] = ['Masculino', 'Femenino', 'Otro'];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private db: DbService,
    private pdf: PdfService,
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      dpi: [''],
      birthDate: [''],
      sex: ['Masculino' as Sex, [Validators.required]],
      doctor: [''],

      validationCode: ['1888-0001', [Validators.required]],
      receptionAt: [new Date().toISOString(), [Validators.required]],
      printedAt: [new Date().toISOString(), [Validators.required]],

      selectedTestId: ['', [Validators.required]],
      selectedResult: ['Negativo', [Validators.required]],
      notes: [''],
    });
  }

  async ngOnInit() {
    await this.db.init();
    this.lab = this.db.getLab();

    // catálogo desde JSON
    const catalogs = (this.db as any).getCatalogs ? (this.db as any).getCatalogs() : ((this.db as any).db?.catalogs ?? {});
    this.catalog = (catalogs?.rapidTests ?? []) as RapidCatalogItem[];

    if (this.catalog.length) {
      this.form.patchValue({ selectedTestId: this.catalog[0].id });
    }

    // historial (localStorage)
    this.reports = (this.db as any).listRapidReports ? (this.db as any).listRapidReports() : [];
    this.loading = false;
  }

  saveAndDownload() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Completa los campos obligatorios.');
      return;
    }

    const v: any = this.form.getRawValue();
    const test = this.catalog.find(x => x.id === v.selectedTestId);
    if (!test) {
      alert('No se encontró la prueba en el catálogo.');
      return;
    }

    const patient: Patient = {
      id: uid('p_'),
      fullName: v.fullName,
      dpi: v.dpi || null,
      birthDate: v.birthDate || null,
      sex: v.sex,
      doctor: v.doctor || null,
    };

    (this.db as any).savePatient?.(patient);

    const report: RapidReport = {
      id: uid('rt_'),
      patientId: patient.id,
      createdAt: new Date().toISOString(),
      patientSnapshot: patient,
      result: {
        validationCode: v.validationCode,
        receptionAt: v.receptionAt,
        printedAt: v.printedAt,
        notes: v.notes || null,
        items: [
          {
            testId: test.id,
            testName: test.name,
            result: v.selectedResult,
            units: test.units ?? null,
            reference: test.reference ?? null,
          },
        ],
      },
    };

    (this.db as any).saveRapidReport?.(report);
    this.reports = (this.db as any).listRapidReports?.() ?? this.reports;

    this.pdf.downloadRapid(report, this.lab);
  }

  loadFromHistory(id: string) {
    const r = this.reports.find(x => x.id === id);
    if (!r) return;

    const p = r.patientSnapshot;
    const res = r.result;
    const first = res.items?.[0];

    this.form.patchValue({
      fullName: p.fullName,
      dpi: p.dpi ?? '',
      birthDate: p.birthDate ?? '',
      sex: p.sex,
      doctor: p.doctor ?? '',
      validationCode: res.validationCode,
      receptionAt: res.receptionAt,
      printedAt: res.printedAt,
      selectedTestId: first?.testId ?? (this.catalog[0]?.id ?? ''),
      selectedResult: first?.result ?? 'Negativo',
      notes: res.notes ?? '',
    });
  }
}
