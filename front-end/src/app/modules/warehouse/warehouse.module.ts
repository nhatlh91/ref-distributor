import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {WarehouseRoutingModule} from './warehouse-routing.module';
import {WarehouseComponent} from './components/warehouse/warehouse.component';
import {HeaderModule} from '../../common/header/header.module';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {ImportVoucherListComponent} from './components/import-voucher-list/import-voucher-list.component';
import {ExportVoucherListComponent} from './components/export-voucher-list/export-voucher-list.component';
import {InventoryComponent} from './components/inventory/inventory.component';
import {ProductComponent} from './components/product/product.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ProductCreateComponent} from './components/product-create/product-create.component';
import {ProductTypeComponent} from './components/product-type/product-type.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {ImportVoucherCreateComponent} from './components/import-voucher-create/import-voucher-create.component';
import {ExportVoucherCreateComponent} from './components/export-voucher-create/export-voucher-create.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatNativeDateModule} from '@angular/material/core';
import {QuotationListComponent} from './components/quotation-list/quotation-list.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {PrintExportVoucherComponent} from './components/print-export-voucher/print-export-voucher.component';
import {ImportVoucherViewComponent} from './components/import-voucher-view/import-voucher-view.component';
import {PrintImportVoucherComponent} from './components/print-import-voucher/print-import-voucher.component';
import {DialogProductEditComponent} from './components/dialog-product-edit/dialog-product-edit.component';
import {NgxPrintModule} from 'ngx-print';
import { ReturnVoucherCreateComponent } from './components/return-voucher-create/return-voucher-create.component';
import { ExportVoucherEditComponent } from './components/export-voucher-edit/export-voucher-edit.component';
import { ImportVoucherEditComponent } from './components/import-voucher-edit/import-voucher-edit.component';
import { ReturnVoucherListComponent } from './components/return-voucher-list/return-voucher-list.component';
import { PrintReturnVoucherComponent } from './components/print-return-voucher/print-return-voucher.component';


@NgModule({
  declarations: [WarehouseComponent,
    ImportVoucherListComponent,
    ExportVoucherListComponent,
    InventoryComponent,
    ProductComponent,
    ProductCreateComponent,
    ProductTypeComponent,
    ImportVoucherCreateComponent,
    ExportVoucherCreateComponent,
    QuotationListComponent,
    PrintExportVoucherComponent,
    ImportVoucherViewComponent,
    PrintImportVoucherComponent,
    DialogProductEditComponent,
    ReturnVoucherCreateComponent,
    ExportVoucherEditComponent,
    ImportVoucherEditComponent,
    ReturnVoucherListComponent,
    PrintReturnVoucherComponent,
  ],
    imports: [
        CommonModule,
        WarehouseRoutingModule,
        HeaderModule,
        MatButtonModule,
        MatMenuModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatTableModule,
        MatSortModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        MatSelectModule,
        MatDialogModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        MatNativeDateModule,
        MatSlideToggleModule,
        NgxPrintModule,
    ]
})
export class WarehouseModule {
}
