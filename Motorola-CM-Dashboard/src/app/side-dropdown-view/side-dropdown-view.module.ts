import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SideDropdownViewComponent } from './side-dropdown-view.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
@NgModule({
  declarations: [SideDropdownViewComponent],
  imports: [
    CommonModule,
    NgMultiSelectDropDownModule,
    BrowserModule,
    FormsModule
  ],
  exports:[SideDropdownViewComponent]
})
export class SideDropdownViewModule { }
