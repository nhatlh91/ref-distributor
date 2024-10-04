import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Product} from '../../models/product';
import {Observable} from 'rxjs';
import {Customer} from '../../../account-receivable/models/customer';
import {CustomerService} from '../../../account-receivable/services/customer.service';
import {QuotationService} from '../../service/quotation.service';
import {VoucherDetail, VoucherService} from '../../service/voucher.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map, startWith} from 'rxjs/operators';
import Swal from 'sweetalert2';
import {ExportVoucher} from '../../models/export-voucher';

@Component({
  selector: 'app-export-voucher-edit',
  templateUrl: './export-voucher-edit.component.html',
  styleUrls: ['./export-voucher-edit.component.css']
})
export class ExportVoucherEditComponent implements OnInit {
  voucherForm: FormGroup;
  searchProduct = new FormControl();
  product = new FormControl();
  products: Product[] = [];
  filteredProduct: Observable<Product[]>;
  isValid = true; // true cho thêm row
  mapRemaining: Map<number, number>;
  mapProductName: Map<number, string>;
  mapPackingSpecifications: Map<number, number>;
  mapUnit: Map<number, string>;
  mapQuotation: Map<number, number>;
  message = '';
  messageForCustomer = '';
  selectedCustomer: Customer;
  voucherDetails: VoucherDetail[] = [];
  voucherCode?: string;
  postingDate?: string;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private quotationService: QuotationService,
    private voucherService: VoucherService,
    private router: Router,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.paramMap.subscribe({
      next: value => this.voucherCode = value.get('voucher_Code')
    });
  }

  async ngOnInit() {
    this.voucherForm = this.fb.group({
      details: this.fb.array([]),
      map: this.fb.array([]),
      voucherCode: [this.voucherCode, Validators.required],
      exportVoucherId: ['', Validators.required],
      createdBy: [''],
      customer: [''],
      customerId: [''],
      address: [''],
      accountReceivable: [''],
      description: [''],
      preTotalAmount: [0, Validators.required],
      discount: [0],
      totalAmount: ['', Validators.required],
      searchProduct: this.searchProduct,
    });

    this.filteredProduct = this.searchProduct.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.productName),
        map(name => name ? this._filterProduct(name) : this.products.slice())
      );

    await this.getData(this.voucherCode);
  }

  async getData(voucherCode: string) {
    if (voucherCode != null) {
      const voucher: ExportVoucher = await this.voucherService.getExportVoucherById(voucherCode).toPromise();
      this.postingDate = voucher.postingDate;
      this.voucherForm.controls.createdBy.setValue(voucher.createdBy);
      this.voucherForm.controls.description.setValue(voucher.description);
      this.voucherForm.controls.customerId.setValue(voucher.customerId);
      this.voucherForm.controls.exportVoucherId.setValue(voucher.exportVoucherId);
      this.voucherForm.controls.totalAmount.setValue(voucher.totalAmount);
      this.voucherForm.controls.discount.setValue(voucher.discount);
      // Maps creating
      await this.quotationService.getAllProductWithPriceAndInventoryByCustomerId(voucher.customerId).toPromise().then(products => {
        this.products = products;
        this.mapQuotation = new Map(
          products.map(item => [item.productId, item.unitPrice])
        );
        this.mapProductName = new Map(
          products.map(item => [item.productId, item.productName])
        );
        this.mapUnit = new Map(
          products.map(item => [item.productId, item.unit])
        );
        this.mapPackingSpecifications = new Map(
          products.map(item => [item.productId, item.packingSpecifications])
        );
        this.mapRemaining = new Map(
          products.map(item => [item.productId, item.totalRemainingQuantity])
        );
      });

      // Form array processing
      this.voucherDetails = await this.voucherService.getVoucherDetails(voucherCode).toPromise();
      const itemsFormArray = this.voucherForm.get('details') as FormArray;
      itemsFormArray.clear();
      this.voucherDetails.forEach((item: VoucherDetail) => {
        this.detailFormGroup(item);
      });

      this.customerService.getCustomerById(voucher.customerId).toPromise().then(customerValue => {
        this.selectedCustomer = customerValue;
      });
    } else {
      this.openSnackBar('Không tìm thấy dữ lieu');
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
      remainingQuantity: [this.mapRemaining.get(itemData.productId) + (itemData.quantity || 0)],
      catchWeight: [itemData.quantity / this.mapPackingSpecifications.get(itemData.productId) || ''],
      unitPrice: [itemData.unitPrice || this.mapQuotation.get(itemData.productId)],
      quantity: [itemData.quantity || ''],
      rowTotalAmount: [itemData.unitPrice * itemData.quantity || 0],
    });
    this.voucherForm.get('details').valueChanges.subscribe(() => {
      this.calculatePreTotalAmount();
    });
    (this.voucherForm.get('details') as FormArray).push(newItem);
    return newItem;
  }

  removeItem(index: number) {
    (this.voucherForm.get('details') as FormArray).removeAt(index);
    this.calculatePreTotalAmount();
  }

  displayProduct(product: Product): string {
    return product && product.productName ? product.productName : '';
  }

  private _filterProduct(name: string): Product[] {
    const filterValue = name.toLowerCase();

    return this.products.filter(option =>
      option.productName.toLowerCase().includes(filterValue)
    );
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000, // (ms)
      horizontalPosition: 'center', // (start, center, end)
      verticalPosition: 'top', // (top, bottom)
    });
  }

  calculateRowTotal(item: AbstractControl) {
    const quantity = +item.get('quantity').value || 0;
    const unitPrice = +item.get('unitPrice').value || 0;

    const rowTotalAmount = quantity * unitPrice;
    item.get('rowTotalAmount').setValue(rowTotalAmount);

    this.calculatePreTotalAmount();
  }

  calculatePreTotalAmount() {
    const details = (this.voucherForm.get('details') as FormArray).controls;
    let totalAmount = 0;

    details.forEach((item: FormGroup) => {
      totalAmount += +item.get('rowTotalAmount').value || 0;
    });
    this.voucherForm.get('preTotalAmount').setValue(totalAmount);

    this.calculateTotalAmount();
  }

  calculateTotalAmount() {
    const preTotalAmount = this.voucherForm.get('preTotalAmount').value || 0;
    const discount = this.voucherForm.get('discount').value || 0;
    const totalAmount = preTotalAmount - discount;

    this.voucherForm.get('totalAmount').setValue(totalAmount);
  }

  changeItemSelected() {
    const selected = this.voucherForm.get('searchProduct')?.value;

    if (this.products.includes(selected)) {
      this.detailFormGroup(selected);

      this.voucherForm.get('searchProduct')?.setValue('');
      this.openSnackBar('Đã thêm sản phẩm vào đơn hàng!');
    }
  }

  changeQuantity(item: AbstractControl) {
    console.table(item);
    const product = item.value || 0;
    const quantity = (item.get('quantity') as FormControl).value || 0;
    const remainingQuantity = (item.get('remainingQuantity') as FormControl).value || 0;
    const catchWeight = quantity / this.mapPackingSpecifications.get(product.productId);

    item.get('catchWeight').setValue(catchWeight);

    if (quantity > remainingQuantity) {
      this.openSnackBar('Số lượng tồn kho không đủ!');
      this.isValid = false;
    } else {
      this.isValid = true;
    }
  }

  async save() {
    try {
      await this.voucherService.updateExport(this.voucherForm.value).toPromise();
      await Swal.fire({text: `Lưu thành công`, icon: 'success', timer: 1000, showConfirmButton: false});
      await this.router.navigateByUrl('warehouse/export');
    } catch (error) {
      await Swal.fire({text: `Đã xảy ra lỗi ${error.status}`, icon: 'warning', showConfirmButton: false});
    }
  }
}
