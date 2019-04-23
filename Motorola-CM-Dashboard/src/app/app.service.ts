// app.service.ts
declare var require: any
 
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as OktaAuth from '@okta/okta-auth-js';
import { Routes, RouterModule }
  from '@angular/router';
  import { CookieService } from 'ngx-cookie-service';
@Injectable()
export class OktaAuthService {
  

  // oktaAuth = new OktaAuth({
  //   url: 'https://dev-661609.okta.com/oauth2/default',
  //   clientId: '0oahj98soNTDc4c0M356',
  //   issuer: 'https://dev-661609.okta.com/oauth2/default',
  //   redirectUri: 'http://localhost:4000/Motorola-CM-Dashboard/home/dashboard',
  // });
  
  oktaAuth = new OktaAuth({
    url: 'https://motorolasolutions.okta.com/oauth2/default',
    clientId: '0oaa7ok51xruc9PBy1t7',
    issuer: 'https://motorolasolutions.okta.com/oauth2/default',
    redirectUri: 'https://svccontractmetrics-dev.mot-solutions.com/Motorola-CM-Dashboard/home/dashboard',
  });


  constructor(private router: Router,) {}



  login() {
    // Launches the login redirect.
    this.oktaAuth.token.getWithRedirect({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile']
    })

  //  this.oktaAuth.loginRedirect('/home/dashboard');
  }

  async handleAuthentication() {

    console.log("i M Here");
   
    const tokens = await this.oktaAuth.token.parseFromUrl();
    console.log("tokens"+tokens);
    tokens.forEach(token => {
      if (token.idToken) {
        console.log("id_token::"+token);
        this.oktaAuth.tokenManager.add('idToken', token);
      }
      if (token.accessToken) {
        console.log("accessToken::"+token);
        this.oktaAuth.tokenManager.add('accessToken', token);
      }
    });

   
  }

  
  
}