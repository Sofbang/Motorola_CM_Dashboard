import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EbsCycleTimesComponent } from './ebs-cycle-times.component';
import { EbsCycleTimesRoutingModule } from './ebs-cycle-times-routing';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { EbsService } from '../services/lookup/ebs.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {ExcelServiceService} from '../services/convert_to_excel/excel-service.service'

@NgModule({
  declarations: [EbsCycleTimesComponent],
  imports: [
    CommonModule,
    EbsCycleTimesRoutingModule,
    Ng2GoogleChartsModule,
    NgMultiSelectDropDownModule.forRoot()

  ],
  providers:[EbsService,ExcelServiceService]
})
export class EbsCycleTimesModule { }
