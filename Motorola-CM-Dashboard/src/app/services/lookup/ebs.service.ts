import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable({
  providedIn: 'root'
})
export class EbsService {
  result: any;
  headers = new Headers({
    'Content-Type': 'application/json',
    //"Authorization": "Bearer " + this._cookieService.get('tokenId') ,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });
  options = new RequestOptions({ headers: this.headers });


  constructor(private http: Http) { }



  // EBS data service implemented by Vishal Sehgal as on 8/2/2019
  getContracts(territory) {
    return this.http.get('api/contract_state?territory='+territory)
    .map(result => this.result = result.json().data);
  }

  // EBS Case territories data
  getCaseStatusTerritories() {
    return this.http.get('api/case_territories').map(result => this.result = result.json().data);
  }

}





