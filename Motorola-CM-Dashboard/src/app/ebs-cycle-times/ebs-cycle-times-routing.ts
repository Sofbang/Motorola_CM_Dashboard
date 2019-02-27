import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EbsCycleTimesComponent } from './ebs-cycle-times.component';
const routes: Routes = [{path:'',component:EbsCycleTimesComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EbsCycleTimesRoutingModule { }
