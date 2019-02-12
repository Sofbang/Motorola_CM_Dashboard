import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EbsContractByStatusComponent } from './ebs-contract-by-status.component';
import { EbsContractByStatusRoutingModule } from './ebs-contract-by-status-routing.module';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { EbsService } from '../services/lookup/ebs.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@NgModule({
  declarations: [EbsContractByStatusComponent],
  imports: [
    CommonModule,
    EbsContractByStatusRoutingModule,
    Ng2GoogleChartsModule,
    NgMultiSelectDropDownModule.forRoot()

  ],
  providers:[EbsService]

})
export class EbsContractByStatusModule { }
