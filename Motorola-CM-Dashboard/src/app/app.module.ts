import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainLayoutModule } from './main-layout/main-layout.module';
import { HttpModule } from '@angular/http';
//import { AppSidebarComponent } from './app-sidebar/app-sidebar.component';//imp to import to run services
// import { DashboardComponent } from './dashboard/dashboard.component';
//import { MainLayoutComponent } from './main-layout/main-layout.component';
// import { AppHeaderComponent } from './app-header/app-header.component';
// import { AppFooterComponent } from './app-footer/app-footer.component';

@NgModule({
  declarations: [
    AppComponent
    //AppSidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MainLayoutModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
