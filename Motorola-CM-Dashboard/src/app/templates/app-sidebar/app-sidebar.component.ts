import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { DataHandlerService } from '../../services/data-handler/data-handler.service';
@Component({
  selector: 'app-app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.css']
})
export class AppSidebarComponent implements OnInit {
  public elmClkCount: number = 0;
  constructor(private _dataHandlerService: DataHandlerService) {
    this._dataHandlerService.clickDashboard
      .subscribe(result => {
        let len = result.length, linkStr, j;
        for (let i = len; i > 0; i--) {
          if (result[i] == '/') {
            j = i;
            break;
          }
          linkStr = result.substring(i, len);
        }
        if (linkStr == 'sc-caseByStatus') {
          $('.sidebar-elm-parent2').find("ul").css("display", "block");
          $('.sidebar-elm-parent2').find('a.nav-link.nav-toggle ').find('span.arrow').addClass('open');
          $('.sidebar-elm-parent2').find('a.nav-link.nav-toggle').find('span.title-black').addClass('title-blue').removeClass('title-black');
        } else if (linkStr == 'sc-new-cases') {
          $('.sidebar-elm-parent2').find("ul").css("display", "block");
          $('.sidebar-elm-parent2').find('a.nav-link.nav-toggle ').find('span.arrow').addClass('open');
          $('.sidebar-elm-parent2').find('a.nav-link.nav-toggle').find('span.title-black').addClass('title-blue').removeClass('title-black');

        } else if (linkStr == 'ebs-cycle-times') {

          $('.sidebar-elm-parent3').find("ul").css("display", "block");
          $('.sidebar-elm-parent3').find('a.nav-link.nav-toggle ').find('span.arrow').addClass('open');
          $('.sidebar-elm-parent3').find('a.nav-link.nav-toggle').find('span.title-black').addClass('title-blue').removeClass('title-black');

        } else if (linkStr == 'smartclient-average-renewal') {
          $('.sidebar-elm-parent3').find("ul").css("display", "block");
          $('.sidebar-elm-parent3').find('a.nav-link.nav-toggle ').find('span.arrow').addClass('open');
          $('.sidebar-elm-parent3').find('a.nav-link.nav-toggle').find('span.title-black').addClass('title-blue').removeClass('title-black');
        } else if (linkStr == 'ebs-contractByStatus') {
          $('.sidebar-elm-parent2').find("ul").css("display", "block");
          $('.sidebar-elm-parent2').find('a.nav-link.nav-toggle ').find('span.arrow').addClass('open');
          $('.sidebar-elm-parent2').find('a.nav-link.nav-toggle').find('span.title-black').addClass('title-blue').removeClass('title-black');
        }

      });
  }

  sidebarElmClk(id) {
    this.elmClkCount++;
    // $('.slimScrollDiv').css('height', '90rem');
    // $('.slimScrollDiv').css('max-height', '100rem');
    // $('.page-sidebar-menu').css('height', '90rem');
    // $('.page-sidebar-menu').css('max-height', '100rem');

    //close
    if ((this.elmClkCount % 2) == 0) {
      //check li has submenu ul
      if ($('.' + id).has("ul").length) {
        //check submenu open
        if ($('.' + id).find('a.nav-link.nav-toggle').has('span.arrow.open').length) {
          $('.' + id).find('a.nav-link.nav-toggle').find('span.arrow').removeClass('open');
          $('.' + id).find('a.nav-link.nav-toggle').find('span.title-blue').addClass('title-black').removeClass('title-blue');
          $('.' + id).find("ul").css("display", "none");
          // $('#'+ id+' ul:first').css('display', 'none');
        }
        //sub menu close
        else {
          $('.' + id).find('a.nav-link.nav-toggle ').find('span.arrow').addClass('open');
          $('.' + id).find('a.nav-link.nav-toggle').find('span.title-black').addClass('title-blue').removeClass('title-black');
          $('.' + id).find("ul").css("display", "block");
          // $('#'+ id+' ul:first').css('display', 'block');
        }
      }
    }
    //open
    else {
      //check li has submenu ul
      if ($('.' + id).has("ul").length) {
        if ($('.' + id).find('a.nav-link.nav-toggle').has('span.arrow.open').length) {
          $('.' + id).find('a.nav-link.nav-toggle').find('span.arrow').removeClass('open');
          $('.' + id).find('a.nav-link.nav-toggle').find('span.title-blue').addClass('title-black').removeClass('title-blue');
          $('.' + id).find("ul").css("display", "none");
          //$('#'+ id+' ul:first').css('display', 'none');
        } else {
          $('.' + id).find('a.nav-link.nav-toggle ').find('span.arrow').addClass('open');
          $('.' + id).find('a.nav-link.nav-toggle').find('span.title-black').addClass('title-blue').removeClass('title-black');
          $('.' + id).find("ul").css("display", "block");
          //$('#'+ id+' ul:first').css('display', 'block');
        }
      }
      //$('#' + id).find('a.nav-link.nav-toggle').find('span.title-black').addClass('title-blue').removeClass('title-black');
    }
  }
  ngOnInit() {

  }

}
