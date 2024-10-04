import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Product} from '../../models/product';
import {Observable} from 'rxjs';
import {ProductService} from '../../service/product.service';
import {VoucherDetail, VoucherService} from '../../service/voucher.service';
import {WarehouseService} from '../../service/warehouse.service';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map, startWith} from 'rxjs/operators';
import Swal from 'sweetalert2';
import {ImportVoucher} from '../../models/import-voucher';

@Component({
  selector: 'app-import-voucher-edit',
  templateUrl: './import-voucher-edit.component.html',
  styleUrls: ['./import-voucher-edit.component.css']
})
export class ImportVoucherEditComponent implements OnInit {
  voucherForm: FormGroup;
  searchProduct = new FormControl();
  products: Product[] = [];
  filteredProduct: Observable<Product[]>;
  decryptedName: string;
  isValid = true;
  message = '';
  voucherCode?: string;
  postingDate?: string;
  voucher?: ImportVoucher;
  voucherDetails: VoucherDetail[] = [];
  mapProductName: Map<number, string>;
  mapUnit: Map<number, string>;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private voucherService: VoucherService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.paramMap.subscribe({
      next: value => this.voucherCode = value.get('voucherCode')
    });
  }

  async ngOnInit() {
    await this.getUser();

    this.voucherForm = this.fb.group({
      details: this.fb.array([]),
      postingDate: [''],
      voucherCode: [this.voucherCode, Validators.required],
      createdBy: [''],
      billing: [''],
      address: [''],
      supplier: [''],
      description: [''],
      totalAmount: [''],
      searchProduct: this.searchProduct,
    });
    await this.getProducts();

    this.filteredProduct = this.searchProduct.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.productName),
        map(name => name ? this._filterProduct(name) : this.products.slice())
      );

    // this.addNewItem();
    await this.getData(this.voucherCode);
  }

  async getData(voucherCode: string) {
    if (voucherCode != null) {
      this.voucher = await this.voucherService.getImportVoucherById(voucherCode).toPromise();
      this.voucherForm.controls.voucherCode.setValue(this.voucher.voucherCode);
      this.voucherForm.controls.createdBy.setValue(this.voucher.createdBy);
      this.voucherForm.controls.supplier.setValue(this.voucher.supplier);
      this.voucherForm.controls.address.setValue(this.voucher.address);
      this.voucherForm.controls.billing.setValue(this.voucher.billing);
      this.voucherForm.controls.description.setValue(this.voucher.description);
      this.voucherForm.controls.totalAmount.setValue(this.voucher.totalAmount);

      // Form array processing
      this.voucherDetails = await this.voucherService.getVoucherDetails(voucherCode).toPromise();
      const itemsFormArray = this.voucherForm.get('details') as FormArray;
      itemsFormArray.clear();
      this.voucherDetails.forEach((item: VoucherDetail) => {
        this.detailFormGroup(item);
      });

    } else {
      this.openSnackBar('Không tìm thấy dữ liệu');
    }
  }

  get details() {
    return (this.voucherForm.get('details') as FormArray).controls;
  }

  detailFormGroup(itemData: VoucherDetail) {
    const newItem = this.fb.group({
      productId: [itemData.productId || ''],
      productName: [this.mapProductName.get(itemData.productId) || 'Khong lay duoc ten san pham'],
      unit: [this.mapUnit.get(itemData.productId) || 'Khong lay duoc DVT'],
      unitPrice: [itemData.unitPrice || 0],
      quantity: [itemData.quantity || 0],
      rowTotalAmount: [itemData.unitPrice * itemData.quantity || 0],
    });
    this.voucherForm.get('details').valueChanges.subscribe(() => {
      this.calculateTotalAmount();
    });
    (this.voucherForm.get('details') as FormArray).push(newItem);
    return newItem;
  }

  removeItem(index: number) {
    (this.voucherForm.get('details') as FormArray).removeAt(index);
    this.calculateTotalAmount();
  }

  async getProducts() {
    try {
      this.products = await this.productService.getProducts().toPromise();

      this.mapProductName = new Map(
        this.products.map(item => [item.productId, item.productName])
      );
      this.mapUnit = new Map(
        this.products.map(item => [item.productId, item.unit])
      );
    } catch (e) {
      this.openSnackBar('Không tìm thấy dữ liệu sản phẩm');
    }
  }

  displayProduct(product: Product): string {
    return product && product.productName ? product.productName : '';
  }

  private _filterProduct(name: string): Product[] {
    const filterValue = name.toLowerCase();

    return this.products.filter(option => option.productName.toLowerCase().includes(filterValue));
  }

  changeItemSelected() {
    const selected = this.voucherForm.get('searchProduct')?.value;

    if (this.products.includes(selected)) {
      this.detailFormGroup(selected);

      this.voucherForm.get('searchProduct')?.setValue('');
      this.openSnackBar('Đã thêm sản phẩm vào đơn hàng!');
    }
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
    // const hours = date.getHours().toString().padStart(2, '0');
    // const minutes = date.getMinutes().toString().padStart(2, '0');
    // const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getUser() {
    if (this.tokenStorageService.getToken()) {
      this.decryptedName = this.tokenStorageService.getDecryptedName();
    }
  }

  calculateUnitPrice(item: AbstractControl) {
    const rowTotalAmount = +item.get('rowTotalAmount').value || 0;
    const quantity = +item.get('quantity').value || 0;

    const unitPrice = rowTotalAmount / quantity;
    item.get('unitPrice').setValue(unitPrice);

    this.calculateTotalAmount();
  }

  calculateRowTotal(item: AbstractControl) {
    const quantity = +item.get('quantity').value || 0;
    const unitPrice = +item.get('unitPrice').value || 0;

    const rowTotalAmount = quantity * unitPrice;
    item.get('rowTotalAmount').setValue(rowTotalAmount);

    this.calculateTotalAmount();
  }

  calculateTotalAmount() {
    const details = (this.voucherForm.get('details') as FormArray).controls;
    let totalAmount = 0;
    this.voucherForm.get('totalAmount').setValue(0);

    details.forEach((item: FormGroup) => {
      totalAmount += item.get('rowTotalAmount').value || 0;
    });

    this.voucherForm.get('totalAmount').setValue(totalAmount);
  }

  changeItem(item: AbstractControl) {
    const product = (item.get('product') as FormControl).value || '';
    if (typeof product !== 'string') {
      item.get('productId').setValue(product.productId);
      item.get('unit').setValue(product.unit);
      this.isValid = true;
      this.message = '';
    } else {
      this.isValid = false;
      this.message = 'Sai định dạng sản phẩm!';
    }
  }

  openSnackBar(message: string) {
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
      await this.voucherService.updateImport(this.voucherForm.value).toPromise();
      await Swal.fire({text: `Lưu thành công`, icon: 'success', timer: 1000, showConfirmButton: false});
      await this.router.navigateByUrl('/warehouse/import');
    } catch (error) {
      error.status === 406 ?
        // tslint:disable-next-line:max-line-length
        await Swal.fire({html: `<p>Hàng đã được xuất bán</p> <p>Không cho phép sửa phiếu nhập</p>`, icon: 'error', showConfirmButton: false}) :
        await Swal.fire({text: `Đã xảy ra lỗi ${error.status}`, icon: 'warning', showConfirmButton: false});
    }
  }
}
