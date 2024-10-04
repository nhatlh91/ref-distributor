import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CustomerListComponent} from './components/customer-list/customer-list.component';
import {CustomerTypeComponent} from './components/customer-type/customer-type.component';
import {AccountReceivableComponent} from './components/account-receivable/account-receivable.component';
import {AuthGuard} from '../../auth.guard';
import {RoleGuard} from '../../role.guard';


const routes: Routes = [
  {
    path: '',
    component: AccountReceivableComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {roles: ['ADMIN', 'MANAGER', 'STAFF', 'USER']},
    children: [
      {
        path: '', // child route path
        component: CustomerListComponent, // child route component that the router renders
      },
      {
        path: 'customer-type', // child route path
        component: CustomerTypeComponent, // child route component that the router renders
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountReceivableRoutingModule {
}
