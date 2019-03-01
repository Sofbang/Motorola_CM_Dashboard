import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScNewCasesComponent } from './sc-new-cases.component';
import { ScNewCasesRoutingModule } from './sc-new-cases-routing';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {ExcelServiceService} from '../services/convert_to_excel/excel-service.service'

@NgModule({
  declarations: [ScNewCasesComponent],
  imports: [
    CommonModule,
    ScNewCasesRoutingModule,
    Ng2GoogleChartsModule,
    NgMultiSelectDropDownModule.forRoot()

  ],
  providers:[SmartclientService,ExcelServiceService]
})
export class ScNewCasesModule { }
