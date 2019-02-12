import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideDropdownViewComponent } from './side-dropdown-view.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
@NgModule({
  declarations: [SideDropdownViewComponent],
  imports: [
    CommonModule,
    NgMultiSelectDropDownModule
  ],
  exports:[SideDropdownViewComponent]
})
export class SideDropdownViewModule { }
