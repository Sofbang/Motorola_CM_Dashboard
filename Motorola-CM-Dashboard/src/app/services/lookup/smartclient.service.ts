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

  // drilldowmn service
  getScDrillDown(status){
    return this.http.get('api/sc_cases_drilldown?casestatus='+status)
      .map(result => this.result = result.json().data);
  }

  getScDrillDownDates(first,last){
    console.log("the first is:"+JSON.stringify(first));
    console.log("the first is:"+JSON.stringify(last));

    return this.http.get('api/sc_cases_drilldownfilter?start='+first+'?end='+last)
      .map(result => this.result = result.json().data);
  }

  getScMinMaxDates(){
    return this.http.get("api/sc_dates_max_min")
    .map(response => this.result = response.json().data);
  }

  getScDateFilteredReults(dates,uri){
    return this.http.post("api/"+uri, JSON.stringify(dates), this.options)
    .map(response => this.result = response.json().data);
  }

  getScNewCases(){
    return this.http.get('api/sc_new_cases')
    .map(result => this.result = result.json().data);
  }

}
