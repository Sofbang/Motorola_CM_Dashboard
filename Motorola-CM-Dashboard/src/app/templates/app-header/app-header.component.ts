import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { OktaAuthService } from '../../app.service';

import { AppComponent } from '../../app.component';

import { Router } from '@angular/router';

@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent implements OnInit {
  public toggleClkCount = 0;

  constructor(private okta: OktaAuthService, private router: Router, private appcomponent: AppComponent) { }
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

 logout(){
   this.appcomponent.logout();
 }

}
