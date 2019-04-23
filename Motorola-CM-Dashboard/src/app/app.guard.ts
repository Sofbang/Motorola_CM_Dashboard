// app.guard.ts

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OktaAuthService } from '@okta/okta-angular';

@Injectable()
export class OktaAuthGuard implements CanActivate {
  oktaAuth;
  authenticated;
  isAuthenticated: Boolean;
  constructor(private okta: OktaAuthService, private router: Router) {
    this.oktaAuth.$authenticationState.subscribe(
      (isAuthenticated: boolean)  => this.isAuthenticated = isAuthenticated
    );
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.isAuthenticated) { return true; }
console.log("isAuthenticated in canactivated"+this.isAuthenticated);
    // Redirect to login flow.
    this.oktaAuth.login();
    return false;
  }
}