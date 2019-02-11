import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartclientCaseByStatusComponent } from './smartclient-case-by-status.component';
import { SmartclientCaseByStatusRoutingModule } from './smartclient-case-by-status-routing.module';

@NgModule({
  declarations: [SmartclientCaseByStatusComponent],
  imports: [
    CommonModule,
    SmartclientCaseByStatusRoutingModule
  ]
})
export class SmartclientCaseByStatusModule { }
