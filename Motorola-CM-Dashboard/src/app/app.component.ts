import { Component }
    from '@angular/core';
// import { OktaAuthService }
//     from '@okta/okta-angular';
//import {oktaAuth} from './app.service';
import { Injectable }
    from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute }
    from '@angular/router';

import { OktaAuthService } from './app.service';
import { CookieService } from 'ngx-cookie-service';
import { GenerateTokenService } from './services/generate_token/generate-token.service';
// import *
//     as OktaAuth from
//     '@okta/okta-auth-js';

// import {
//     OKTA_CONFIG,
//     OktaAuthModule
// } from '@okta/okta-angular';
// import { logging } from 'protractor';
// import { LoginComponent } from './login/login.component';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [OktaAuthService]
})
export class AppComponent {
    title = 'Motorola-CM-Dashboard';
    isAuthenticated: any;
    isInit: boolean = false;
    //authenticationSessionVariable=sessionStorage.getItem('isAuthenticated')
    constructor(public oktaAuth: OktaAuthService, private _genTokenService: GenerateTokenService, public router: Router, private activatedRoute: ActivatedRoute, private cookieService: CookieService) {
        // Subscribe to authentication state changes
        this.cookieService.set('cookieApp', 'Welcome you, Anil!');
        cookieService.deleteAll();
    }


    async ngOnInit() {
        //console.log("this._envService.app_secret"+this._envService.app_secret)
        //validating id_token from the url
        let id_token = this.getParameterByName('id_token');

        let error = this.getParameterByName('error')

        if (error != null) {
            id_token = 'error';
            this.router.navigate(['/logout']);
        }

        if (id_token != null && id_token != '') {
            this.isInit = true;
            //if (!this.cookieService.check('id_token'))
                this.cookieService.set("id_token", id_token);

            if (!this.cookieService.check('app-access-token')) {
                this._genTokenService.generateToken()
                    .subscribe(res => {
                        //console.log("generateToken::" + JSON.stringify(res));
                        this.cookieService.delete("app-access-token");
                        this.cookieService.set("app-access-token", res.accessToken,1);
                        //console.log("this.cookieService.get('app-access-token')" + this.cookieService.get('app-access-token'));
                    })
            }
            // console.log("this.cookieService.check('app-access-token')"+this.cookieService.check('app-access-token'));
            // console.log("this.cookieService.get('id_token')"+this.cookieService.get('id_token'));
            // console.log("this.cookieService.get('app-access-token')"+this.cookieService.get('app-access-token'));
        } else {
            this.oktaAuth.handleAuthentication();
            this.oktaAuth.login();
            console.log("id_token is null::" + id_token);
        }
    }

    getParameterByName(name) {
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[#&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }



}