export type Sex = 'Masculino' | 'Femenino' | 'Otro';

export interface LabProfile {
  name: string;
  address: string;
  hours: string;
  phone: string;
  validationUrl: string;
  disclaimer: string;
}

export interface Patient {
  id: string;
  fullName: string;
  dpi?: string | null;
  birthDate?: string | null;  // ISO date
  sex: Sex;
  doctor?: string | null;
}

export interface CBCResult {
  // Identificación
  validationCode: string;
  receptionAt: string; // ISO datetime
  printedAt: string;   // ISO datetime
  machine: string;     // Genrui KT6300

  // Serie roja
  RBC?: number | null;    // x10^6/µL
  HGB?: number | null;    // g/dL
  HCT?: number | null;    // %
  MCV?: number | null;    // fL
  MCH?: number | null;    // pg
  MCHC?: number | null;   // g/dL
  RDW_CV?: number | null; // %
  RDW_SD?: number | null; // fL

  // Serie blanca
  WBC?: number | null;    // x10^3/µL
  NEU_PCT?: number | null; // %
  LYM_PCT?: number | null; // %
  MONO_PCT?: number | null; // %
  EOS_PCT?: number | null; // %
  BASO_PCT?: number | null; // %
  NEU_ABS?: number | null; // x10^3/µL
  LYM_ABS?: number | null;
  MONO_ABS?: number | null;
  EOS_ABS?: number | null;
  BASO_ABS?: number | null;

  // Plaquetas
  PLT?: number | null;    // x10^3/µL
  MPV?: number | null;    // fL
  PDW?: number | null;    // fL or % (depende equipo)
  PCT?: number | null;    // %

  // Observaciones
  notes?: string | null;
}

export interface CBCReport {
  id: string;
  patientId: string;
  createdAt: string; // ISO datetime
  patientSnapshot: Patient;
  result: CBCResult;
}


export interface RapidTestItem {
  testId: string;
  testName: string;
  result: string;
  reference?: string | null;
  units?: string | null;
}

export interface RapidResult {
  validationCode: string;
  receptionAt: string;
  printedAt: string;
  items: RapidTestItem[];
  notes?: string | null;
}

export interface RapidReport {
  id: string;
  patientId: string;
  createdAt: string; // ISO datetime
  patientSnapshot: Patient;
  result: RapidResult;
}
