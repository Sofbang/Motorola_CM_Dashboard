import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SmartclientAverageRenewalComponent } from './smartclient-average-renewal.component';
const routes: Routes = [{path:'',component:SmartclientAverageRenewalComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmartclientAverageRenewalRoutingModule { }
