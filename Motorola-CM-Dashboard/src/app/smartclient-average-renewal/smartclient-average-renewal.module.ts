import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartclientAverageRenewalComponent } from './smartclient-average-renewal.component';
import { SmartclientAverageRenewalRoutingModule } from './smartclient-average-renewal-routing';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@NgModule({
  declarations: [SmartclientAverageRenewalComponent],
  imports: [
    CommonModule,
    SmartclientAverageRenewalRoutingModule,
    Ng2GoogleChartsModule,
    NgMultiSelectDropDownModule.forRoot()

  ],
  providers:[SmartclientService]
})
export class SmartclientAverageRenewalModule { }
