import { Component, OnInit } from '@angular/core';
import { LookupService } from '../services/lookup/lookup.service';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
//import { Component } from '@angular/core';
//import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { Router, NavigationStart} from '@angular/router';
import * as OktaSignIn from '@okta/okta-signin-widget';
import { logging } from 'protractor';


interface ResourceServerExample {
  label: String;
  url: String;
}
@Component({
   
  selector: 'app-dashboard', 
  template: `
    <!-- Container to inject the Sign-In Widget -->
    <div id="okta-signin-container"></div>
  `,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  signIn;
  widget = new OktaSignIn({
    baseUrl: 'https://{motorolasolutions.okta.com}'
  });
  constructor(public oktaAuth: OktaAuthService,private _lookupService: LookupService,private _dataHandlerService: DataHandlerService) {
    this._dataHandlerService.setDataForMainLayout(false);
    this.signIn = oktaAuth;
   }
   linkClick(link){
     this._dataHandlerService.clickDashboardLink(link);
     console.log("click");
   }
   login() {
    this.oktaAuth.loginRedirect()
  }
   async ngOnInit() { 
    this.widget.renderEl({
      el: '#okta-signin-container'},
      (res) => {
        if (res.status === 'SUCCESS') {
          this.signIn.loginRedirect('/', { sessionToken: res.session.token });
          // Hide the widget
          this.widget.hide();
        }
      },
      (err) => {
        throw err;
      }
    );
    
  
  
    // demo test service for starting the Project
    // this._lookupService.getLookup()
    //   .subscribe(res => {
    //     console.log("service" + JSON.stringify(res));
    //   });

  }
}
