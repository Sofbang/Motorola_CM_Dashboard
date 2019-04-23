import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class LookupService {
  result: any;
  headers = new Headers({
    'Content-Type': 'application/json',
    "Authorization": "Bearer " + this._cookieService.get('app-access-token'),
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });
  options = new RequestOptions({ headers: this.headers });
  constructor(private http: Http,private _cookieService:CookieService) { }

  /**
   * Get lookup data 
   */
  // TESTING SERVICE implemented by Abhinav Singh as on 4/2/2019
  getLookup():Observable<any> {
    return this.http.get("api/lookup", this.options)
      .map(result => this.result = result.json().data);
  }

  // EBS data service implemented by Vishal Sehgal as on 8/2/2019
  getContracts(territory) {
    return this.http.get('api/contract_state?territory='+territory)
    .map(result => this.result = result.json().data);
  }
   
// Territories Data from Aurora DB 
// getTerritories() {
//     return this.http.get('cm_dashboard_api/v1/territories');
// }
// // Uses Observable.forkJoin() to run multiple concurrent http.get() requests.
// // The entire operation will result in an error state if any single request fails.
// getCases(territory) {
//     return this.http.get('cm_dashboard_api/v1/case_status?territory='+territory);
// }


// getCaseStatusTerritories() {
//     return this.http.get('cm_dashboard_api/v1/case_territories');
// }

// getBatchTime() {
//     return this.http.get('cm_dashboard_api/v1/batchtime');
// }

// getyearlyactivecontracts(){
//     return this.http.get('cm_dashboard_api/v1/yearlyactivecontracts');
// }


}
