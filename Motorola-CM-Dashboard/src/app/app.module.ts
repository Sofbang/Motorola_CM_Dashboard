import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainLayoutModule } from './main-layout/main-layout.module';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { LoginModule } from './login/login.module';
import { OktaConfig } from '@okta/okta-angular/dist/okta/models/okta.config';
// Okta Guard and Service
//import { OktaAuthGuard } from './app.guard';
import { OktaAuthGuard, OktaAuthModule, OktaCallbackComponent, } from '@okta/okta-angular';
import { Routes, RouterModule } from '@angular/router';
import *  as OktaAuth from '@okta/okta-auth-js';
import { oktaConfiguration } from './ocka_config/okta_config';

const oktaAuth = new OktaAuth({
  url: oktaConfiguration.url,
  clientId: oktaConfiguration.clientId,
  issuer: oktaConfiguration.issuer,
  redirectUri: oktaConfiguration.redirectUri,
});
export function onAuthRequired({ oktaAuth, router }) {
  // // Redirect the user to your custom login page
  router.navigate(['/Motorola-CM-Dashboard/home/dashboard']);
}
// const appRoutes: Routes = [
//   {
//     path: 'implicit/callback',
//     component: OktaCallbackComponent,
//   }
// ]
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MainLayoutModule,
    HttpModule,
    HttpClientModule,
    // RouterModule.forRoot(appRoutes),
    OktaAuthModule.initAuth(oktaAuth),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }