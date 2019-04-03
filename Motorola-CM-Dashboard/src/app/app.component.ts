import { Component }
    from '@angular/core';
import { OktaAuthService }
    from '@okta/okta-angular';
//import {oktaAuth} from './app.service';
import { Injectable }
    from '@angular/core';
import { Router, RouterOutlet }
    from '@angular/router';
import *
    as OktaAuth from
    '@okta/okta-auth-js';

import {
    OKTA_CONFIG,
    OktaAuthModule
} from '@okta/okta-angular';
import { logging } from 'protractor';
import { LoginComponent } from './login/login.component';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [OktaAuthService]
})
export class AppComponent {
    title = 'Motorola-CM-Dashboard';
    verifyauthentication: boolean;
    public count = 0;
    oktaAuth = new OktaAuth({
        url: 'https://motorolasolutions.okta.com/oauth2/default',
        clientId: '0oaa7ok51xruc9PBy1t7',
        issuer: 'https://motorolasolutions.okta.com/oauth2/default',
        redirectUri: 'https://svccontractmetrics-dev.mot-solutions.com/Motorola-CM-Dashboard/home/dashboard',
    });


    async isAuthenticated() {
        // Checks if there is a current accessToken in the TokenManger.
        return !!(await
            this.oktaAuth.tokenManager.get('accessToken'));
    }
    login() {

        console.log(" Login request");
        // Launches the login redirect.
        this.oktaAuth.token.getWithRedirect({
            responseType: ['id_token',
                'token'],
            scopes: ['openid',
                'email', 'profile']
        });

        this.oktaAuth.loginRedirect('/home/dashboard');


    }
    ngOnInit() {
        if (localStorage.getItem('countValues') == null) {
            localStorage.setItem('countValues', '0');
            this.login()
        }

    }

    async handleAuthentication() {
        const tokens =
            await this.oktaAuth.token.parseFromUrl();
        tokens.forEach(token => {
            if (token.idToken) {
                this.oktaAuth.tokenManager.add('idToken', token);
            }
            if (token.accessToken) {
                this.oktaAuth.tokenManager.add('accessToken', token);
            }
        });
    }
    async logout() {
        this.oktaAuth.tokenManager.clear();
        await this.oktaAuth.signOut();
    }
}