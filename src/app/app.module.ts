import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { DbService } from './core/db.service';
import { PdfService } from './core/pdf.service';

import { HomeComponent } from './pages/home/home.component';
import { HematologiaPageComponent } from './pages/hematologia-page/hematologia-page.component';
import { OrinaPageComponent } from './pages/orina-page/orina-page.component';
import { HecesPageComponent } from './pages/heces-page/heces-page.component';
import { RapidasPageComponent } from './pages/rapidas-page/rapidas-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HematologiaPageComponent,
    OrinaPageComponent,
    HecesPageComponent,
    RapidasPageComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [DbService, PdfService],
  bootstrap: [AppComponent],
})
export class AppModule {}
