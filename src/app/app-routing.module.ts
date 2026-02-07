import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { HematologiaPageComponent } from './pages/hematologia-page/hematologia-page.component';
import { OrinaPageComponent } from './pages/orina-page/orina-page.component';
import { HecesPageComponent } from './pages/heces-page/heces-page.component';
import { RapidasPageComponent } from './pages/rapidas-page/rapidas-page.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'hematologia', component: HematologiaPageComponent },
  { path: 'orina', component: OrinaPageComponent },
  { path: 'heces', component: HecesPageComponent },
  { path: 'rapidas', component: RapidasPageComponent },
  { path: '**', redirectTo: '' },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
