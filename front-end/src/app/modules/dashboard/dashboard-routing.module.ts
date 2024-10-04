import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ProductCreateComponent} from '../warehouse/components/product-create/product-create.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {AuthGuard} from '../../auth.guard';
import {RoleGuard} from '../../role.guard';


const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {roles: ['ADMIN', 'MANAGER', 'STAFF', 'USER']},
    children: [
      {
        path: 'product-create', // child route path
        component: ProductCreateComponent, // child route component that the router renders
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
