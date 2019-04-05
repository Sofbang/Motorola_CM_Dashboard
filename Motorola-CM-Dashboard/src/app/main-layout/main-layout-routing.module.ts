import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { OktaAuthGuard } from '@okta/okta-angular';
export const mainRoute: Routes = [
  {
    path: 'home', component: MainLayoutComponent,
    children: [
      { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
      { path: 'ebs-contractByStatus', loadChildren: './ebs-contract-by-status/ebs-contract-by-status.module#EbsContractByStatusModule' },
      { path: 'sc-caseByStatus', loadChildren: './smartclient-case-by-status/smartclient-case-by-status.module#SmartclientCaseByStatusModule' },
      { path: 'smartclient-average-renewal', loadChildren: './smartclient-average-renewal/smartclient-average-renewal.module#SmartclientAverageRenewalModule' },
      { path: 'ebs-cycle-times', loadChildren: './ebs-cycle-times/ebs-cycle-times.module#EbsCycleTimesModule' },
      { path: 'sc-new-cases', loadChildren: './sc-new-cases/sc-new-cases.modules#ScNewCasesModule' }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(mainRoute)],
  exports: [RouterModule]
})
export class MainLayoutRoutingModule { }
