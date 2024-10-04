import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {WarehouseComponent} from './components/warehouse/warehouse.component';
import {ImportVoucherListComponent} from './components/import-voucher-list/import-voucher-list.component';
import {ExportVoucherListComponent} from './components/export-voucher-list/export-voucher-list.component';
import {InventoryComponent} from './components/inventory/inventory.component';
import {ProductComponent} from './components/product/product.component';
import {ProductTypeComponent} from './components/product-type/product-type.component';
import {ProductCreateComponent} from './components/product-create/product-create.component';
import {ImportVoucherCreateComponent} from './components/import-voucher-create/import-voucher-create.component';
import {ExportVoucherCreateComponent} from './components/export-voucher-create/export-voucher-create.component';
import {QuotationListComponent} from './components/quotation-list/quotation-list.component';
import {AuthGuard} from '../../auth.guard';
import {RoleGuard} from '../../role.guard';
import {ReturnVoucherCreateComponent} from './components/return-voucher-create/return-voucher-create.component';
import {ExportVoucherEditComponent} from './components/export-voucher-edit/export-voucher-edit.component';
import {ImportVoucherEditComponent} from './components/import-voucher-edit/import-voucher-edit.component';
import {ReturnVoucherListComponent} from './components/return-voucher-list/return-voucher-list.component';


const routes: Routes = [
  {
    path: '',
    component: WarehouseComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {roles: ['ADMIN', 'MANAGER', 'STAFF', 'USER']},
    children: [
      {
        path: '', // child route path
        component: QuotationListComponent, // child route component that the router renders
      },
      {
        path: 'import', // child route path
        component: ImportVoucherListComponent, // child route component that the router renders
      },
      {
        path: 'create-import', // child route path
        component: ImportVoucherCreateComponent, // child route component that the router renders
      },
      {
        path: 'edit-import/:voucherCode', // child route path
        component: ImportVoucherEditComponent, // child route component that the router renders
      },
      {
        path: 'return',
        component: ReturnVoucherListComponent,
      },
      {
        path: 'create-return', // child route path
        component: ReturnVoucherCreateComponent, // child route component that the router renders
      },
      {
        path: 'export', // child route path
        component: ExportVoucherListComponent, // child route component that the router renders
      },
      {
        path: 'create-export', // child route path
        component: ExportVoucherCreateComponent, // child route component that the router renders
      },
      {
        path: 'edit-export/:voucher_Code', // child route path
        component: ExportVoucherEditComponent, // child route component that the router renders
      },
      {
        path: 'inventory', // child route path
        component: InventoryComponent, // child route component that the router renders
      },
      {
        path: 'product', // child route path
        component: ProductComponent, // child route component that the router renders
      },
      {
        path: 'product-type', // child route path
        component: ProductTypeComponent, // child route component that the router renders
      },
      {
        path: 'product-create', // child route path
        component: ProductCreateComponent, // child route component that the router renders
      },
      {
        path: 'quotation-list', // child route path
        component: QuotationListComponent, // child route component that the router renders
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WarehouseRoutingModule {
}
