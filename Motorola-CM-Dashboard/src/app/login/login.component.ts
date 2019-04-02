import { Component, OnInit } from '@angular/core';
import { OktaAuthService }
  from '@okta/okta-angular';
import { Router, NavigationStart }
  from '@angular/router';
import *
  as OktaSignIn
  from '@okta/okta-signin-widget';

@Component({
  selector: 'app-login',
  template: `
  <!-- Container to inject the Sign-In Widget -->
  <div id="okta-signin-container"></div>
  `,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    signIn;
    widget = new OktaSignIn({
      baseUrl: 'https://motorolasolutions.okta.com/oauth2/default'
    });

    constructor(public oktaAuth: OktaAuthService, ) {
      this.signIn = oktaAuth;
    }

    // login() {
    //   this.oktaAuth.loginRedirect()
    // }
    async ngOnInit() {
    
      this.widget.renderEl({
        el: '#okta-signin-container'
      },
        (res) => {
          if (res.status ===
            'SUCCESS') {
            this.signIn.loginRedirect('/home/dashboard', { sessionToken: res.session.token });
            // Hide the widget
            this.widget.hide();
          }
        },
        (err) => {
          throw err;
        }
  
      );

}
}
