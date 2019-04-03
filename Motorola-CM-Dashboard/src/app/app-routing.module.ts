import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { mainRoute } from './main-layout/main-layout-routing.module';
const routes: Routes = [...mainRoute,{path: 'login', loadChildren:'./login/login.module#LoginModule'}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
