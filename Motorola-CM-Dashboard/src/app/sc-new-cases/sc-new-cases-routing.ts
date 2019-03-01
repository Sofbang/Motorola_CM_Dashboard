import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScNewCasesComponent } from './sc-new-cases.component';
const routes: Routes = [{path:'',component:ScNewCasesComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScNewCasesRoutingModule { }
