import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainLayoutModule } from './main-layout/main-layout.module';
import { HttpModule } from '@angular/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import {
  OktaAuthGuard,
  OktaAuthModule,
  OktaCallbackComponent,
} from '@okta/okta-angular';
import { Routes, RouterModule } from '@angular/router';
// import { ScNewCasesComponent } from './sc-new-cases/sc-new-cases.component';
// import { EbsCycleTimesComponent } from './ebs-cycle-times/ebs-cycle-times.component';
//import { AppSidebarComponent } from './app-sidebar/app-sidebar.component';//imp to import to run services
// import { DashboardComponent } from './dashboard/dashboard.component';
//import { MainLayoutComponent } from './main-layout/main-layout.component';
// import { AppHeaderComponent } from './app-header/app-header.component';
// import { AppFooterComponent } from './app-footer/app-footer.component';


const config = {
  issuer: 'https://motorolasolutions.okta.com/oauth2/default',
  redirectUri: 'https://svccontractmetrics-dev.mot-solutions.com/Motorola-CM-Dashboard/home/dashboard/implicit/callback',
  clientId: '0oaa7ok51xruc9PBy1t7'
}

export function onAuthRequired({ oktaAuth, router }) {
  // Redirect the user to your custom login page
  router.navigate(['/Motorola-CM-Dashboard/home/dashboard']);
}

const appRoutes: Routes = [
  {
    path: 'implicit/callback',
    
    component: OktaCallbackComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [ OktaAuthGuard ],
  },
  
]
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent
    // ScNewCasesComponent,
    // EbsCycleTimesComponent
    //AppSidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MainLayoutModule,
    HttpModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    OktaAuthModule.initAuth(config),
    RouterModule.forRoot(appRoutes),
  ],
  providers: [],
  bootstrap: [AppComponent]
    
})


export class AppModule { }
