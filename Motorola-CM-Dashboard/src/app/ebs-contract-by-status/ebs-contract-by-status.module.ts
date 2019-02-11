import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EbsContractByStatusComponent } from './ebs-contract-by-status.component';
import { EbsContractByStatusRoutingModule } from './ebs-contract-by-status-routing.module';

@NgModule({
  declarations: [EbsContractByStatusComponent],
  imports: [
    CommonModule,
    EbsContractByStatusRoutingModule
  ]
})
export class EbsContractByStatusModule { }
