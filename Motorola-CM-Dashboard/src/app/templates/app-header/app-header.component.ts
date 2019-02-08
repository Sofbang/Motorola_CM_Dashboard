import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent implements OnInit {
  public toggleClkCount=0;
  constructor() { }
  sidebarTogglerClk(){
    this.toggleClkCount++;
    $('.slimScrollDiv').css('height','90rem');
    $('.slimScrollDiv').css('max-height','100rem');
    $('.page-sidebar-menu').css('height','90rem');
    $('.page-sidebar-menu').css('max-height','100rem');
    if(this.toggleClkCount%2==0){
     $('#app-logo').removeClass('app-logo-shrink').addClass('app-logo-expand');
    }
    else{
      $('#app-logo').removeClass('app-logo-expand').addClass('app-logo-shrink');
    }
  }
  ngOnInit() {
  }

}
