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
    constructor(public oktaAuth: OktaAuthService, private _genTokenService: GenerateTokenService, public router: Router, private activatedRoute: ActivatedRoute, private _cookieService: CookieService) {

    }


    async ngOnInit() {
        //console.log("this._envService.app_secret"+this._envService.app_secret)
        //validating id_token from the url
        this._cookieService.set("test", "test");
        console.log("Set Test Cookie as Test");
        this._cookieService.get("test");
        this._cookieService.delete('test');
        let id_token = this.getParameterByName('id_token');

        let error = this.getParameterByName('error')

        if (error != null) {
            id_token = 'error';
            this.router.navigate(['/logout']);
        }

        if (id_token != null && id_token != '') {
            this.isInit = true;
            //if (!this._cookieService.check('id_token'))
                this._cookieService.set("id_token", id_token);

           
                this._genTokenService.generateToken()
                    .subscribe(res => {
                        //console.log("generateToken::" + JSON.stringify(res));
                    //   this._cookieService.delete("app-access-token");
                       this._cookieService.set("app-access-token", res.accessToken,1);
                        console.log("this._cookieService.get('app-access-token')" + this._cookieService.get('okta-oauth-state'));
                    })
            
            console.log("this._cookieService.check('app-access-token')"+this._cookieService.check('app-access-token'));
         console.log("this._cookieService.get('id_token')"+this._cookieService.get('id_token'));
             console.log("this._cookieService.get('app-access-token')"+this._cookieService.get('app-access-token'));
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

    logout() {

        console.log("In logut");
    
        localStorage.clear();
        sessionStorage.clear();
    
        // Get all cookies as an object
        this._cookieService.deleteAll();
        this._cookieService.delete('okta-oauth-state');
        this._cookieService.delete('okta-oauth-redirect-params');
        this._cookieService.delete('okta-oauth-nonce');
      // this.okta.login();
        // Redirect the user to your custom login page
       this.router.navigate(['/logout']);
    
      }

}