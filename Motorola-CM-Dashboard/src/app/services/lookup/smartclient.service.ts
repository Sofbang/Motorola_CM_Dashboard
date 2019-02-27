import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
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

  getSCCases() {
    return this.http.get('api/sc_case_status')
      .map(result => this.result = result.json().data);
  }
  getSCCasesAvg() {
    return this.http.get('api/sc_case_status_avg')
      .map(result => this.result = result.json().data);
  }
  getScTerritories() {
    return this.http.get('api/sc_territories')
      .map(result => this.result = result.json().data);
  }

  getScWorkflowStatus() {
    return this.http.get('api/sc_workflow_status')
      .map(result => this.result = result.json().data);
  }

  // getScArrivalType(){
  //   return this.http.get('api/sc_arrival_type')
  //     .map(result => this.result = result.json().data);
  // }

  getScDateFilteredReults(dates,uri){
    return this.http.post("api/"+uri, JSON.stringify(dates), this.options)
    .map(response => this.result = response.json().data);
  }
}
