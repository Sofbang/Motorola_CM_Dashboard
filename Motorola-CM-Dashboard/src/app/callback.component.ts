// callback.component.ts

import { Component } from '@angular/core';
import { OktaAuthService } from './app.service';

@Component({ template: `` })
export class CallbackComponent {

  constructor(private okta: OktaAuthService) {
    console.log("I am in the calback component");
    // Handles the response from Okta and parses tokens
    okta.handleAuthentication();
  }
}