import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';//important to load
import { MainLayoutComponent } from './main-layout.component';
import { AppHeaderComponent } from '../templates/app-header/app-header.component';
import { AppSidebarComponent } from '../templates/app-sidebar/app-sidebar.component';
import {SideDropdownViewModule} from '../side-dropdown-view/side-dropdown-view.module'
//import { MainLayoutRoutingModule } from './main-layout-routing.module';
@NgModule({
  declarations: [
    MainLayoutComponent,
    AppHeaderComponent,
    AppSidebarComponent],
  imports: [
    CommonModule,
    RouterModule,
    SideDropdownViewModule
    // MainLayoutRoutingModule
  ]
})
export class MainLayoutModule { }
