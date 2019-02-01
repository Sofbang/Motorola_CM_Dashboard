import { Component, OnInit } from '@angular/core';
import { LookupService } from '../services/lookup/lookup.service'
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private _lookupService: LookupService) { }

  ngOnInit() {

    this._lookupService.getLookup()
      .subscribe(res => {
        console.log("service" + JSON.stringify(res));
      })
  }

}
