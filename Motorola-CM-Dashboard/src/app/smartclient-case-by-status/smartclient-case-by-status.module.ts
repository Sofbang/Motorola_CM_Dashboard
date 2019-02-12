import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartclientCaseByStatusComponent } from './smartclient-case-by-status.component';
import { SmartclientCaseByStatusRoutingModule } from './smartclient-case-by-status-routing.module';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@NgModule({
  declarations: [SmartclientCaseByStatusComponent],
  imports: [
    CommonModule,
    SmartclientCaseByStatusRoutingModule,
    Ng2GoogleChartsModule,
    NgMultiSelectDropDownModule.forRoot()

  ],
  providers:[SmartclientService]
})
export class SmartclientCaseByStatusModule { }
