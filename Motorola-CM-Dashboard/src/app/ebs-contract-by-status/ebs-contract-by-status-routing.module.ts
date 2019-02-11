import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EbsContractByStatusComponent } from './ebs-contract-by-status.component';
const routes: Routes = [{path:'',component:EbsContractByStatusComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EbsContractByStatusRoutingModule { }
