import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';


const routes: Routes = [
  {path: '', loadChildren: () => import('./modules/login/login.module').then(module => module.LoginModule)},
  // {path: '', loadChildren: () => import('./common/header/header.module').then(module => module.HeaderModule)},
  {path: 'dashboard', loadChildren: () => import('./modules/dashboard/dashboard.module').then(module => module.DashboardModule)},
  {path: 'warehouse', loadChildren: () => import('./modules/warehouse/warehouse.module').then(module => module.WarehouseModule)},
  {path: 'report', loadChildren: () => import('./modules/report/report.module').then(module => module.ReportModule)},
  {
    path: 'account-receivable',
    loadChildren: () => import('./modules/account-receivable/account-receivable.module').then(module => module.AccountReceivableModule)
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
