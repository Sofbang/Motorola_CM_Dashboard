import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { mainRoute } from './main-layout/main-layout-routing.module';
import { OktaCallbackComponent, } from '@okta/okta-angular';
const routes: Routes = [...mainRoute,
{
  path: 'login', loadChildren: './login/login.module#LoginModule'
}, {
  path: 'implicit/callback',
  component: OktaCallbackComponent,
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
