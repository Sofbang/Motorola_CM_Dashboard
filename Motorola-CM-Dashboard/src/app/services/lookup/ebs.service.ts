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

  getEBSContractState() {
    return this.http.get('api/ebs_contract_state')
      .map(result => this.result = result.json().data);
  }

  getEBSTerritories() {
    return this.http.get('api/ebs_territories')
      .map(result => this.result = result.json().data);
  }

  getEBSWorkflowStatus() {
    return this.http.get('api/ebs_workflow_status')
      .map(result => this.result = result.json().data);
  }


  // New REST SERVICES FOR EBS CYCLE TIMES (to be Used)
  // drilldowmn service
  getEBSDrillDown(status){
    return this.http.get('api/ebs_contracts_drilldown?contractstatus='+status)
    .map(result => this.result = result.json().data);
  }
  

  getEBSMinMaxDates(){
    return this.http.get("api/ebs_dates_max_min")
    .map(response => this.result = response.json().data);
  }

  getEBSArrivalType(){
    return this.http.get("api/ebs_arrival_type")
    .map(response => this.result = response.json().data);
  }
}





