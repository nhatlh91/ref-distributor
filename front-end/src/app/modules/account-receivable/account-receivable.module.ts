import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AccountReceivableRoutingModule} from './account-receivable-routing.module';
import {CustomerListComponent} from './components/customer-list/customer-list.component';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {HeaderModule} from '../../common/header/header.module';
import {MatMenuModule} from '@angular/material/menu';
import {CustomerTypeComponent} from './components/customer-type/customer-type.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {DialogUpdateReceivablesComponent} from './components/dialog-update-receivables/dialog-update-receivables.component';
import {MatDialogModule} from '@angular/material/dialog';
import { AccountReceivableComponent } from './components/account-receivable/account-receivable.component';
import { DialogPaymentHistoryComponent } from './components/dialog-payment-history/dialog-payment-history.component';
import { DialogCustomerCreateComponent } from './components/dialog-customer-create/dialog-customer-create.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { DialogCustomerEditComponent } from './components/dialog-customer-edit/dialog-customer-edit.component';


@NgModule({
  declarations: [CustomerListComponent,
    CustomerTypeComponent,
    DialogUpdateReceivablesComponent,
    AccountReceivableComponent,
    DialogPaymentHistoryComponent,
    DialogCustomerCreateComponent,
    DialogCustomerEditComponent],
    imports: [
        CommonModule,
        AccountReceivableRoutingModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        HeaderModule,
        MatMenuModule,
        FormsModule,
        ReactiveFormsModule,
        MatOptionModule,
        MatSelectModule,
        MatDialogModule,
        MatSlideToggleModule
    ]
})
export class AccountReceivableModule {
}
