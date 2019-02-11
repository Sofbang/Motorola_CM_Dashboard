import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SmartclientCaseByStatusComponent } from './smartclient-case-by-status.component';
const routes: Routes = [{path:'',component:SmartclientCaseByStatusComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmartclientCaseByStatusRoutingModule { }
