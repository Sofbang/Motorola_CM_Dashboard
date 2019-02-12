import { Component, OnInit } from '@angular/core';
import { LookupService } from '../services/lookup/lookup.service';
import { reject } from 'q';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
 
 

 

  constructor(private _lookupService: LookupService) { }

  
 

  ngOnInit() {


    // demo test service for starting the Project
    this._lookupService.getLookup()
      .subscribe(res => {
        console.log("service" + JSON.stringify(res));
      });

  }

}
