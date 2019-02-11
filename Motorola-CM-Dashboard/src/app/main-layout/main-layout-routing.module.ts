import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
export const mainRoute: Routes = [
  {
    path: 'home', component: MainLayoutComponent,
    children: [
      { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
      { path: 'ebs-contractByStatus', loadChildren: './ebs-contract-by-status/ebs-contract-by-status.module#EbsContractByStatusModule' },
      { path: 'sc-caseByStatus', loadChildren: './smartclient-case-by-status/smartclient-case-by-status.module#SmartclientCaseByStatusModule' }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(mainRoute)],
  exports: [RouterModule]
})
export class MainLayoutRoutingModule { }
