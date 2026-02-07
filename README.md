# Hematología (Genrui KT6300) – Util Angular

Utilidad local (sin backend) para:
- Ingresar datos de paciente y resultados CBC
- Guardar en "base de datos" JSON (assets) + persistencia en `localStorage`
- Emitir PDF descargable con estructura compatible con el formato del laboratorio

## Requisitos
- Node.js 18+
- Angular CLI 17+

## Instalación
```bash
npm install
npm start
```
Abrir: http://localhost:4200

## Base de datos JSON
Archivo base: `src/assets/db.json`

- `lab`: datos de laboratorio + URL de validación
- `referenceRanges`: rangos de referencia (ejemplo: adulto masculino)
- `patients`: (vacío) se llena en runtime y se persiste en `localStorage`
- `cbcReports`: (vacío) se llena en runtime y se persiste en `localStorage`

> Nota: En modo estático, Angular no puede escribir a `assets/db.json` en disco.
> Por eso se usa `localStorage` como persistencia local.

## PDF
Se genera con `pdfmake` y descarga un archivo tipo:
`Hematologia_<Paciente>_<CodigoValidacion>.pdf`

## Siguientes ajustes típicos
- Agregar logo y QR real (generación de QR en base64)
- Rangos por edad/sexo
- Exportar historial a JSON (descarga) / importar JSON
- Integración directa con LIS / API
