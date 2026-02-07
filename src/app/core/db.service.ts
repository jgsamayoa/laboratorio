import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { LabProfile, Patient, CBCReport, RapidReport } from './models';

type DbFile = {
  lab: LabProfile;
  referenceRanges: Record<string, any>;
  patients: Patient[];
  cbcReports: CBCReport[];
  rapidReports: RapidReport[];
  catalogs?: any;
};

const LS_KEY = 'hematologia_util_db_v1';

@Injectable()
export class DbService {
  private db!: DbFile;
  private ready = false;

  constructor(private http: HttpClient) {}

  async init(): Promise<void> {
    if (this.ready) return;

    // 1) Cargar base (assets)
    const base = await firstValueFrom(this.http.get<DbFile>('assets/db.json'));

    // 2) Merge con localStorage
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const persisted = JSON.parse(raw) as Partial<DbFile>;
        this.db = {
          ...base,
          ...persisted,
          lab: { ...base.lab, ...(persisted.lab ?? {}) },
          referenceRanges: { ...base.referenceRanges, ...(persisted.referenceRanges ?? {}) },
          patients: persisted.patients ?? base.patients,
          cbcReports: persisted.cbcReports ?? base.cbcReports,
          rapidReports: (persisted as any).rapidReports ?? (base as any).rapidReports ?? [],
          catalogs: { ...(base as any).catalogs, ...((persisted as any).catalogs ?? {}) },
        };
      } catch {
        this.db = { ...(base as any), rapidReports: (base as any).rapidReports ?? [] } as any;
      }
    } else {
      this.db = { ...(base as any), rapidReports: (base as any).rapidReports ?? [] } as any;
    }

    this.persist();
    this.ready = true;
  }

  getLab(): LabProfile { return this.db.lab; }
  getReferenceRanges(): DbFile['referenceRanges'] { return this.db.referenceRanges; }

  getCatalogs(): any { return (this.db as any).catalogs ?? {}; }

  listPatients(): Patient[] { return [...this.db.patients]; }
  savePatient(p: Patient): void {
    const idx = this.db.patients.findIndex(x => x.id === p.id);
    if (idx >= 0) this.db.patients[idx] = p;
    else this.db.patients.unshift(p);
    this.persist();
  }

  listReports(): CBCReport[] { return [...this.db.cbcReports]; }
  saveReport(r: CBCReport): void {
    const idx = this.db.cbcReports.findIndex(x => x.id === r.id);
    if (idx >= 0) this.db.cbcReports[idx] = r;
    else this.db.cbcReports.unshift(r);
    this.persist();
  }


  listRapidReports(): RapidReport[] { return [...(this.db.rapidReports ?? [])]; }
  saveRapidReport(r: RapidReport): void {
    const arr = (this.db.rapidReports ??= []);
    const idx = arr.findIndex(x => x.id === r.id);
    if (idx >= 0) arr[idx] = r;
    else arr.unshift(r);
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(LS_KEY, JSON.stringify({
      lab: this.db.lab,
      referenceRanges: this.db.referenceRanges,
      patients: this.db.patients,
      cbcReports: this.db.cbcReports,
      rapidReports: (this.db as any).rapidReports ?? [],
      catalogs: (this.db as any).catalogs ?? undefined,
    }));
  }

saveGenericReport(key: string, report: any) {
  const items = this.listGenericReports(key);
  items.unshift(report);
  localStorage.setItem(key, JSON.stringify(items.slice(0, 200)));
}

listGenericReports(key: string): any[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

}
