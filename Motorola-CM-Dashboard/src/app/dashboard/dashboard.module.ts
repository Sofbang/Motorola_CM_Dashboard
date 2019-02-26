import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import {LookupService} from '../services/lookup/lookup.service';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import {RouterModule} from '@angular/router';


@NgModule({
  
  imports: [
    CommonModule,
    DashboardRoutingModule,
    Ng2GoogleChartsModule,
    RouterModule
  ],
  declarations: [DashboardComponent],
  providers:[LookupService]
})
export class DashboardModule { }
