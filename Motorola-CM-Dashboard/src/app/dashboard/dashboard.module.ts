import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import {LookupService} from '../services/lookup/lookup.service';
@NgModule({
  
  imports: [
    CommonModule,
    DashboardRoutingModule
  ],
  declarations: [DashboardComponent],
  providers:[LookupService]
})
export class DashboardModule { }
