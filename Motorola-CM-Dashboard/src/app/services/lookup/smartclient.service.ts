import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable({
  providedIn: 'root'
})
export class SmartclientService {

  result: any;
  headers = new Headers({
    'Content-Type': 'application/json',
    //"Authorization": "Bearer " + this._cookieService.get('tokenId') ,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });
  options = new RequestOptions({ headers: this.headers });


  constructor(private http: Http) { }


  getCases(territory) {
    return this.http.get('api/case_status?territory='+territory).map(result => this.result = result.json().data);
  }

  getTerritories() {
    return this.http.get('api/territories').map(result => this.result = result.json().data);
  }




}
