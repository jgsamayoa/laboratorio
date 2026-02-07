import { Injectable } from '@angular/core';
import type { CBCReport, RapidReport, LabProfile } from './models';

// pdfmake (CommonJS) - import compatible en Angular/Vite
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

//import * as pdfMake from 'pdfmake/build/pdfmake';
//7import * as pdfFonts from 'pdfmake/build/vfs_fonts';


function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2,'0');
    const hh = d.getHours() % 12 || 12;
    const ampm = d.getHours() >= 12 ? 'P.M.' : 'A.M.';
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}  ${hh}:${pad(d.getMinutes())} ${ampm}`;
  } catch { return iso; }
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2,'0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

function val(n: any): string {
  if (n === null || n === undefined || n === '') return '';
  const num = typeof n === 'number' ? n : Number(n);
  if (Number.isFinite(num)) return String(num);
  return String(n);
}

@Injectable({ providedIn: 'root' })
export class PdfService {
  private vfsReady = false;

  /** Inicializa las fuentes (vfs) de pdfmake de forma segura (Angular 17/Vite). */
private ensureVfs(): boolean {
  try {
    // ✅ Vite/Angular 17: el shape puede variar
    const vfs =
      (pdfFonts as any)?.pdfMake?.vfs ||
      (pdfFonts as any)?.vfs ||
      (pdfFonts as any)?.default?.pdfMake?.vfs ||
      (pdfFonts as any)?.default?.vfs;

    if (vfs) {
      // ✅ IMPORTANTE: (pdfMake as any).vfs  (no pdfMake.vfs)
      (pdfMake as any).vfs = vfs;
      return true;
    }

    console.warn('pdfmake vfs_fonts no expuso vfs. Revisa import de vfs_fonts.', pdfFonts);
    return false;
  } catch (e) {
    console.warn('No se pudo inicializar pdfmake vfs:', e);
    return false;
  }
}


  /** Hematología (CBC) */
  downloadCBC(report: CBCReport, lab: LabProfile, reference?: Record<string, string>): void {
    this.ensureVfs();
    if (!this.ensureVfs()) {
      alert('No se pudo inicializar pdfmake (fuentes). Revisa vfs_fonts.');
      return;
    }

    const p = report.patientSnapshot;
    const r = report.result;

    const ref: Record<string, string> | null = reference ?? null;
const docDef: any = {
      pageSize: 'LETTER',
      pageMargins: [36, 24, 36, 36],
      defaultStyle: { fontSize: 10 },
      styles: {
        labName: { fontSize: 14, bold: true, alignment: 'center' },
        labMeta: { fontSize: 9, alignment: 'center' },
        title: { fontSize: 11, bold: true, alignment: 'center' },
        section: { bold: true, margin: [0, 10, 0, 4] },
        th: { bold: true, fillColor: '#eeeeee' },
      },
      content: [
        { text: lab.name, style: 'labName' },
        { text: lab.address ?? '', style: 'labMeta' },
        { text: `${lab.phone ?? ''}${lab.hours ? '  •  ' + lab.hours : ''}`, style: 'labMeta' },

        { text: 'RESULTADOS DE ANÁLISIS DE LABORATORIO', style: 'title', margin: [0, 10, 0, 2] },
        { text: 'HEMATOLOGÍA', bold: true, fontSize: 11, margin: [0, 0, 0, 8] },

        {
          columns: [
            { width: '*', text: `Paciente: ${p.fullName}` },
            { width: 'auto', text: `Código: ${r.validationCode}` },
          ],
          margin: [0, 0, 0, 4],
        },
        {
          columns: [
            { width: '*', text: `DPI: ${p.dpi ?? ''}` },
            { width: 'auto', text: `Sexo: ${p.sex}` },
          ],
          margin: [0, 0, 0, 4],
        },
        { text: `Fecha de nacimiento: ${fmtDate(p.birthDate)}`, margin: [0, 0, 0, 4] },
        { text: `Médico: ${p.doctor ?? ''}`, margin: [0, 0, 0, 6] },

        {
          columns: [
            { width: '*', text: `Recepción: ${fmtDateTime(r.receptionAt)}` },
            { width: 'auto', text: `Impresión: ${fmtDateTime(r.printedAt)}` },
          ],
          margin: [0, 0, 0, 10],
        },

        { text: 'SERIE ROJA', style: 'section' },
        {
          table: {
            widths: ['*', 80, 70, 110],
            body: [
              [{ text: 'Parámetro', style: 'th' }, { text: 'Resultado', style: 'th' }, { text: 'Unidad', style: 'th' }, { text: 'Referencia', style: 'th' }],
              ['Eritrocitos (RBC)', val(r.RBC), 'x10⁶/µL', (reference ? (reference as any)['RBC'] ?? '' : '')],
              ['Hemoglobina (HGB)', val(r.HGB), 'g/dL', (reference ? (reference as any)['HGB'] ?? '' : '')],
              ['Hematocrito (HCT)', val(r.HCT), '%', (reference ? (reference as any)['HCT'] ?? '' : '')],
              ['MCV', val(r.MCV), 'fL', (reference ? (reference as any)['MCV'] ?? '' : '')],
              ['MCH', val(r.MCH), 'pg', (reference ? (reference as any)['MCH'] ?? '' : '')],
              ['MCHC', val(r.MCHC), 'g/dL', (reference ? (reference as any)['MCHC'] ?? '' : '')],
              ['RDW-CV', val(r.RDW_CV), '%', (reference ? (reference as any)['RDW_CV'] ?? '' : '')],
            ],
          },
          layout: 'lightHorizontalLines',
        },

        { text: 'SERIE BLANCA', style: 'section' },
        {
          table: {
            widths: ['*', 80, 70, 110],
            body: [
              [{ text: 'Parámetro', style: 'th' }, { text: 'Resultado', style: 'th' }, { text: 'Unidad', style: 'th' }, { text: 'Referencia', style: 'th' }],
              ['Leucocitos (WBC)', val(r.WBC), 'x10³/µL', (reference ? (reference as any)['WBC'] ?? '' : '')],
              ['Neutrófilos (NEU)', `${val(r.NEU_PCT)} / ${val(r.NEU_ABS)}`, '% / x10³/µL', (reference ? (reference as any)['NEU_PCT'] ?? '' : '')],
              ['Linfocitos (LYM)', `${val(r.LYM_PCT)} / ${val(r.LYM_ABS)}`, '% / x10³/µL', (reference ? (reference as any)['LYM_PCT'] ?? '' : '')],
              ['Monocitos (MONO)', `${val(r.MONO_PCT)} / ${val(r.MONO_ABS)}`, '% / x10³/µL', (reference ? (reference as any)['MONO_PCT'] ?? '' : '')],
              ['Eosinófilos (EOS)', `${val(r.EOS_PCT)} / ${val(r.EOS_ABS)}`, '% / x10³/µL', (reference ? (reference as any)['EOS_PCT'] ?? '' : '')],
              ['Basófilos (BASO)', `${val(r.BASO_PCT)} / ${val(r.BASO_ABS)}`, '% / x10³/µL', (reference ? (reference as any)['BASO_PCT'] ?? '' : '')],
            ],
          },
          layout: 'lightHorizontalLines',
        },

        { text: 'PLAQUETAS', style: 'section' },
        {
          table: {
            widths: ['*', 80, 70, 110],
            body: [
              [{ text: 'Parámetro', style: 'th' }, { text: 'Resultado', style: 'th' }, { text: 'Unidad', style: 'th' }, { text: 'Referencia', style: 'th' }],
              ['Plaquetas (PLT)', val(r.PLT), 'x10³/µL', (reference ? (reference as any)['PLT'] ?? '' : '')],
              ['MPV', val(r.MPV), 'fL', (reference ? (reference as any)['MPV'] ?? '' : '')],
            ],
          },
          layout: 'lightHorizontalLines',
        },

        { text: `Observaciones: ${r.notes ?? ''}`, margin: [0, 10, 0, 0] },
        { text: lab.disclaimer ?? '', italics: true, fontSize: 9, alignment: 'center', margin: [0, 12, 0, 0] },
      ],
    };

    (pdfMake as any).createPdf(docDef).download(`${safeName(p.fullName)}_hematologia.pdf`);
  }

  /** Pruebas rápidas */
  downloadRapid(report: RapidReport, lab: LabProfile): void {
    this.ensureVfs();
    if (!this.ensureVfs()) {
      alert('No se pudo inicializar pdfmake (fuentes). Revisa vfs_fonts.');
      return;
    }

    const p = report.patientSnapshot;
    const r = report.result;

    const rows: any[] = [
      [{ text: 'Prueba', bold: true }, { text: 'Resultado', bold: true }, { text: 'Referencia', bold: true }],
    ];

    for (const it of (r.items ?? [])) {
      rows.push([it.testName, it.result ?? '', it.reference ?? '']);
    }

    const docDef: any = {
      pageSize: 'LETTER',
      pageMargins: [36, 24, 36, 36],
      defaultStyle: { fontSize: 10 },
      styles: {
        labName: { fontSize: 14, bold: true, alignment: 'center' },
        labMeta: { fontSize: 9, alignment: 'center' },
        title: { fontSize: 11, bold: true, alignment: 'center' },
      },
      content: [
        { text: lab.name, style: 'labName' },
        { text: lab.address ?? '', style: 'labMeta' },
        { text: `${lab.phone ?? ''}${lab.hours ? '  •  ' + lab.hours : ''}`, style: 'labMeta' },

        { text: 'RESULTADOS DE ANÁLISIS DE LABORATORIO', style: 'title', margin: [0, 10, 0, 2] },
        { text: 'PRUEBAS RÁPIDAS', bold: true, fontSize: 11, margin: [0, 0, 0, 8] },

        {
          columns: [
            { width: '*', text: `Paciente: ${p.fullName}` },
            { width: 'auto', text: `Código: ${r.validationCode}` },
          ],
          margin: [0, 0, 0, 4],
        },
        {
          columns: [
            { width: '*', text: `Fecha de nacimiento: ${fmtDate(p.birthDate)}` },
            { width: 'auto', text: `Sexo: ${p.sex}` },
          ],
          margin: [0, 0, 0, 4],
        },
        { text: `Médico: ${p.doctor ?? ''}`, margin: [0, 0, 0, 6] },

        {
          columns: [
            { width: '*', text: `Recepción: ${fmtDateTime(r.receptionAt)}` },
            { width: 'auto', text: `Impresión: ${fmtDateTime(r.printedAt)}` },
          ],
          margin: [0, 0, 0, 10],
        },

        { table: { widths: ['*', 120, 140], body: rows }, layout: 'lightHorizontalLines' },

        { text: `Observaciones: ${r.notes ?? ''}`, margin: [0, 10, 0, 0] },
        { text: lab.disclaimer ?? '', italics: true, fontSize: 9, alignment: 'center', margin: [0, 12, 0, 0] },
      ],
    };

    (pdfMake as any).createPdf(docDef).download(`${safeName(p.fullName)}_pruebas_rapidas.pdf`);
  }
}

function safeName(name: string): string {
  return (name || 'Paciente').replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 40);
}
