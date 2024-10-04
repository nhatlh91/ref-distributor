import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ReportRoutingModule} from './report-routing.module';
import {ReportComponent} from './components/report/report.component';
import {HeaderModule} from '../../common/header/header.module';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {TransactionHistoryComponent} from './components/transaction-history/transaction-history.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule, MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {SalesHistoryComponent} from './components/sales-history/sales-history.component';
import {PurchaseHistoryComponent} from './components/purchase-history/purchase-history.component';
import {GrossProfitHistoryComponent} from './components/gross-profit-history/gross-profit-history.component';
import {
  SalesDetailsByCustomerComponent
} from './components/sales-details-by-customer/sales-details-by-customer.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ItemLedgerEntryComponent} from './components/item-ledger-entry/item-ledger-entry.component';
import {MatDatepickerModule} from '@angular/material/datepicker';


@NgModule({
  declarations: [ReportComponent, TransactionHistoryComponent, SalesHistoryComponent, PurchaseHistoryComponent, GrossProfitHistoryComponent, SalesDetailsByCustomerComponent, ItemLedgerEntryComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    HeaderModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ]
})
export class ReportModule {
}
