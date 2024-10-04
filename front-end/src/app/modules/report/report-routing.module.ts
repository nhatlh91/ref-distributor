import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from '../../auth.guard';
import {RoleGuard} from '../../role.guard';
import {CustomerListComponent} from '../account-receivable/components/customer-list/customer-list.component';
import {CustomerTypeComponent} from '../account-receivable/components/customer-type/customer-type.component';
import {ReportComponent} from './components/report/report.component';
import {TransactionHistoryComponent} from './components/transaction-history/transaction-history.component';
import {SalesHistoryComponent} from './components/sales-history/sales-history.component';
import {PurchaseHistoryComponent} from "./components/purchase-history/purchase-history.component";
import {GrossProfitHistoryComponent} from "./components/gross-profit-history/gross-profit-history.component";
import {SalesDetailsByCustomerComponent} from './components/sales-details-by-customer/sales-details-by-customer.component';
import {ItemLedgerEntryComponent} from "./components/item-ledger-entry/item-ledger-entry.component";


const routes: Routes = [
  {
    path: '',
    component: ReportComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {roles: ['ADMIN', 'MANAGER', 'STAFF', 'USER']},
    children: [
      {
        path: '', // child route path
        component: TransactionHistoryComponent, // child route component that the router renders
      },
      {
        path: 'sales-history', // child route path
        component: SalesHistoryComponent, // child route component that the router renders
      },
      {
        path: 'purchase-history', // child route path
        component: PurchaseHistoryComponent, // child route component that the router renders
      },
      {
        path: 'gross-profit-history', // child route path
        component: GrossProfitHistoryComponent, // child route component that the router renders
      },
      {
        path: 'sales-detail-by-customer', // child route path
        component: SalesDetailsByCustomerComponent, // child route component that the router renders
      },
      {
        path: 'item-ledger-entry', // child route path
        component: ItemLedgerEntryComponent, // child route component that the router renders
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
