import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { OktaAuthService } from '../../app.service';

import { CookieService } from 'ngx-cookie-service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent implements OnInit {
  public toggleClkCount = 0;

  constructor(private okta: OktaAuthService, private router: Router, private cookieService: CookieService) { }
  sidebarTogglerClk() {
    this.toggleClkCount++;
    if (this.toggleClkCount % 2 == 0) {
      $('#app-logo').removeClass('app-logo-shrink').addClass('app-logo-expand');
    }
    else {
      $('#app-logo').removeClass('app-logo-expand').addClass('app-logo-shrink');
    }
  }
  ngOnInit() {
  }

  logout() {

    console.log("In logut");

    localStorage.clear();
    sessionStorage.clear();

    // Get all cookies as an object
    this.cookieService.deleteAll();
    this.cookieService.delete('okta-oauth-state');
    this.cookieService.delete('okta-oauth-redirect-params');
    this.cookieService.delete('okta-oauth-nonce');
  // this.okta.login();
    // Redirect the user to your custom login page
   this.router.navigate(['/logout']);

  }

}
