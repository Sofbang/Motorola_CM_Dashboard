import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
@Injectable({
  providedIn: 'root'
})
export class LookupService {
  result: any;
  headers = new Headers({
    'Content-Type': 'application/json',
    //"Authorization": "Bearer " + this._cookieService.get('tokenId') ,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });
  options = new RequestOptions({ headers: this.headers });
  constructor(private http: Http) { }

  /**
   * Get lookup data 
   */
  getLookup():Observable<any> {
    return this.http.get("api/lookup", this.options)
      .map(result => this.result = result.json().data);
  }
}
