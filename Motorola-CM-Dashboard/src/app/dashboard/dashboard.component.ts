import { Component, OnInit } from '@angular/core';
import { LookupService } from '../services/lookup/lookup.service';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(private _lookupService: LookupService,private _dataHandlerService: DataHandlerService) {
    this._dataHandlerService.setDataForMainLayout(false);
   }
   linkClick(link){
     this._dataHandlerService.clickDashboardLink(link);
     console.log("click");
   }
  ngOnInit() {
  
    // demo test service for starting the Project
    // this._lookupService.getLookup()
    //   .subscribe(res => {
    //     console.log("service" + JSON.stringify(res));
    //   });

  }

}
