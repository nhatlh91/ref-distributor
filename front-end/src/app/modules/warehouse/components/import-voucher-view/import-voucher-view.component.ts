import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Product} from '../../models/product';
import {Observable} from 'rxjs';
import {ProductService} from '../../service/product.service';
import {VoucherService} from '../../service/voucher.service';
import {WarehouseService} from '../../service/warehouse.service';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-import-voucher-view',
  templateUrl: './import-voucher-view.component.html'
})
export class ImportVoucherViewComponent implements OnInit {
  voucherForm: FormGroup;
  product = new FormControl();
  products: Product[] = [];
  filteredProduct: Observable<Product[]>;
  decryptedName: string;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private voucherService: VoucherService,
    private warehouseService: WarehouseService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {
    await this.getUser();

    this.voucherForm = this.fb.group({
      details: this.fb.array([]),
      postingDate: [this.today(), Validators.required],
      voucherCode: ['', [Validators.required, Validators.pattern(/^PNK-\d{6}$/)]],
      createdBy: [this.decryptedName, Validators.required],
      billing: ['', Validators.required],
      address: [''],
      supplier: ['', Validators.required],
      description: ['Phiếu nhập kho', Validators.required],
      totalAmount: ['', Validators.required],
    });
    await this.getProducts();

    this.filteredProduct = this.product.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filterProduct(name) : this.products.slice())
      );

    this.addNewItem();
  }

  get details() {
    return (this.voucherForm.get('details') as FormArray).controls;
  }

  addNewItem() {
    const newItem = this.fb.group({
      product: this.product,
      productId: [''],
      productName: [''],
      unit: [''],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unitPrice: ['', [Validators.required, Validators.min(1)]],
      rowTotalAmount: [0],
    });

    this.voucherForm.get('details').valueChanges.subscribe(() => {
      this.calculateTotalAmount();
    });

    (this.voucherForm.get('details') as FormArray).push(newItem);
  }

  removeItem(index: number) {
    (this.voucherForm.get('details') as FormArray).removeAt(index);
    this.calculateTotalAmount();
  }

  async getProducts() {
    try {
      this.products = await this.productService.getProducts().toPromise();
    } catch (e) {
      this.snackBarOpen('Không tìm thấy dữ liệu sản phẩm');
    }
  }

  displayProduct(product: Product): string {
    return product && product.barcode ? product.barcode : '';
  }

  private _filterProduct(name: string): Product[] {
    const filterValue = name.toLowerCase();

    return this.products.filter(option => option.barcode.toLowerCase().indexOf(filterValue) === 0);
  }

  today() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Thêm '0' phía trước nếu cần
    const day = String(today.getDate()).padStart(2, '0'); // Thêm '0' phía trước nếu cần
    return `${year}-${month}-${day}`;
  }

  formatDate(inputDateStr: string): string {
    const date = new Date(inputDateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0 nên cần cộng thêm 1
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getUser() {
    if (this.tokenStorageService.getToken()) {
      this.decryptedName = this.tokenStorageService.getDecryptedName();
    }
  }

  calculateRowTotal(item: AbstractControl) {
    const quantity = item.get('quantity').value || 0;
    const unitPrice = item.get('unitPrice').value || 0;

    const rowTotalAmount = quantity * unitPrice;
    item.get('rowTotalAmount').setValue(rowTotalAmount);

    this.calculateTotalAmount();
  }

  calculateTotalAmount() {
    const details = (this.voucherForm.get('details') as FormArray).controls;
    let totalAmount = 0;

    details.forEach((item: FormGroup) => {
      totalAmount += item.get('rowTotalAmount').value || 0;
    });

    this.voucherForm.get('totalAmount').setValue(totalAmount);
  }

  changeItem(item: AbstractControl) {
    const product = (item.get('product') as FormControl).value || 0;
    item.get('productId').setValue(product.productId);
    item.get('productName').setValue(product.productName);
    item.get('unit').setValue(product.unit);
  }

  snackBarOpen(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 2000, // (ms)
      horizontalPosition: 'center', // (start, center, end)
      verticalPosition: 'top', // (top, bottom)
    });
  }

  async submitVoucherForm() {
    try {
      /**
       * Voucher
       */
      const voucher = this.voucherForm.value;
      voucher.createdBy = this.decryptedName;
      await this.voucherService.saveImport(voucher).toPromise();

      this.snackBarOpen('Thêm mới Thành công!');
      await this.router.navigateByUrl('warehouse/import');
      this.warehouseService.fetchDataImport(null, null);
    } catch (error) {
      this.snackBarOpen('Đã xảy ra lỗi!');
    }
  }

}
