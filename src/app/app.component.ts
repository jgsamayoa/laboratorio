import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div class="container">
    <div class="header">
      <div class="brand">
        <h1>Util de Laboratorio – Resultados</h1>
        <small>Hematología, orina, heces y pruebas rápidas (PDF descargable).</small>
      </div>
      <div class="btns">
        <a class="pill" routerLink="/">Inicio</a>
        <a class="pill" routerLink="/hematologia">Hematología</a>
        <a class="pill" routerLink="/orina">Orina</a>
        <a class="pill" routerLink="/heces">Heces</a>
        <a class="pill" routerLink="/rapidas">Pruebas rápidas</a>
      </div>
    </div>

    <router-outlet></router-outlet>
  </div>
  `,
})
export class AppComponent {}
