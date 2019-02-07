import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.css']
})
export class AppSidebarComponent implements OnInit {

  constructor() { }

  // side bar events for close and open created by vishal as on 7/2/2019
  public openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
  }
  
  public closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
  }

  ngOnInit() {
    
  }

}
