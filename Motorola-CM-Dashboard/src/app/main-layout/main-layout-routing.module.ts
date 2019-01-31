import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
export const mainRoute: Routes = [
  {
    path: 'home', component: MainLayoutComponent,
    children: [
      { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(mainRoute)],
  exports: [RouterModule]
})
export class MainLayoutRoutingModule { }
