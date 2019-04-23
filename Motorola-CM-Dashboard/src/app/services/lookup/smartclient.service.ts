import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class SmartclientService {
  result: any;
  headers = new Headers({
    'Content-Type': 'application/json',
    "Authorization": "Bearer " + this._cookieService.get('app-access-token') ,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });
  options = new RequestOptions({ headers: this.headers });
  constructor(private http: Http,private _cookieService:CookieService) { }

  getSCCases() {
    return this.http.get('api/sc_case_status', this.options)
      .map(result => this.result = result.json().data);
  }
  getSCCasesAvg() {
    return this.http.get('api/sc_case_status_avg', this.options)
      .map(result => this.result = result.json().data);
  }
  getScTerritories() {
    return this.http.get('api/sc_territories', this.options)
      .map(result => this.result = result.json().data);
  }

  getScWorkflowStatus() {
    return this.http.get('api/sc_workflow_status', this.options)
      .map(result => this.result = result.json().data);
  }

  // drilldowmn service
  getScDrillDown(jsonobj) {
    return this.http.post('api/sc_case_by_status_drilldown', JSON.stringify(jsonobj), this.options)
      .map(result => this.result = result.json().data);

  }
  getScCycleTimesDrillDown(jsonobj) {
    return this.http.post('api/sc_cycle_times_drilldown', JSON.stringify(jsonobj), this.options)
      .map(result => this.result = result.json().data);

  }

  getSCNewCasesDrillDown(jsonobj) {
    return this.http.post('api/sc_new_cases_drilldown', JSON.stringify(jsonobj), this.options)

      .map(result => this.result = result.json().data);
  }

  getScDrillDownDates(jsonObj) {
    return this.http.post('api/sc_cases_drilldownfilter', JSON.stringify(jsonObj), this.options)
      .map(result => this.result = result.json().data);
  }

  getScMinMaxDates() {
    return this.http.get("api/sc_dates_max_min", this.options)
      .map(response => this.result = response.json().data);
  }

  getScDateFilteredReults(dates, uri) {
    return this.http.post("api/" + uri, JSON.stringify(dates), this.options)
      .map(response => this.result = response.json().data);
  }

  getScNewCases(dates) {
    return this.http.post('api/sc_new_cases', JSON.stringify(dates), this.options)
      .map(result => this.result = result.json().data);
  }
  getScArrivalType() {
    return this.http.get('api/sc_arrival_type', this.options)
      .map(result => this.result = result.json().data);
  }
  getSCByStatus(scObj) {
    return this.http.post('api/sc_case_by_status', JSON.stringify(scObj), this.options)
      .map(result => this.result = result.json().data);
  }
  getSCCycleTimes(scObj) {
    return this.http.post('api/sc_cycle_times', JSON.stringify(scObj), this.options)
      .map(result => this.result = result.json().data);
  }
}
