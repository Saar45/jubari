import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmployesPage } from './employes.page';

const routes: Routes = [
  {
    path: '',
    component: EmployesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPageRoutingModule {}
