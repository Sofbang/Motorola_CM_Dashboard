import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  showSideDrpdowns = false;
  constructor(private router: Router, private _dataHandlerService: DataHandlerService) {
    this._dataHandlerService.dataForMainLayout
      .subscribe(res => {
        this.showSideDrpdowns = res;
      });
  }

  ngOnInit() {
    // if (this.router.url === '/home/dashboard') {
    //   this.showSideDrpdowns = false;
    // } else {
    //   this.showSideDrpdowns = true;
    // }
     console.log("main" + this.router.url)
  }

}
