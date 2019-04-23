import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { EnvService } from '../env_service/env.service';
import { CookieService } from 'ngx-cookie-service';
import 'rxjs/add/operator/map';
@Injectable({
  providedIn: 'root'
})
export class GenerateTokenService {
  result: any;
  tokenJson = {
    oktatoken: this._cookieService.get('id_token') + this._envService.app_secret
  };
  headers = new Headers({
    'Content-Type': 'application/json',
    //"Authorization": "Bearer " + this._cookieService.get('tokenId')+this._envService.app_secret ,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });
  constructor(private http: Http, private _envService: EnvService, private _cookieService: CookieService) { }
  options = new RequestOptions({ headers: this.headers });
  generateToken() {
    return this.http.post('api/generateToken', JSON.stringify(this.tokenJson), this.options)
      .map(result => this.result = result.json().data);
  }

}
