import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
const dashboardRoute: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(dashboardRoute)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
