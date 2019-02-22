import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppSidebarComponent} from './app-sidebar.component';
import {RouterModule} from '@angular/router';
@NgModule({
  declarations: [AppSidebarComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports:[AppSidebarComponent]
})
export class AppSidebarModule { }
