import {Component, OnInit} from '@angular/core';
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
import Swal from 'sweetalert2';
import {Customer} from '../../../account-receivable/models/customer';
import {CustomerService} from '../../../account-receivable/services/customer.service';
import {Receipt} from '../../../account-receivable/models/receipt';
import {QuotationDto} from '../../models/quotation-dto';
import {ProductWithInventoryAndPrice, QuotationService} from '../../service/quotation.service';

@Component({
  selector: 'app-return-voucher-create',
  templateUrl: './return-voucher-create.component.html'
})
export class ReturnVoucherCreateComponent implements OnInit {
  voucherForm: FormGroup;
  product = new FormControl();
  products: ProductWithInventoryAndPrice[] = [];
  filteredProduct: Observable<Product[]>;
  address: string;
  isValid = true;
  message = '';
  customer = new FormControl();
  customers: Customer[] = [];
  filteredCustomer: Observable<Customer[]>;
  customerValid = false;
  messageForCustomer = '';
  quotations: QuotationDto[];
  mapQuotation: Map<number, number>;
  customerType = 0;

  constructor(
    private fb: FormBuilder,
    private voucherService: VoucherService,
    private customerService: CustomerService,
    private warehouseService: WarehouseService,
    private quotationService: QuotationService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {
    this.voucherForm = this.fb.group({
      details: this.fb.array([]),
      postingDate: [this.formatDate(undefined), Validators.required],
      voucherCode: ['', Validators.required],
      createdBy: [this.tokenStorageService.getDecryptedName(), Validators.required],
      customer: this.customer,
      customerId: [''],
      customerName: [''],
      description: ['', Validators.required],
      totalAmount: ['', Validators.required],
    });
    await this.generateVoucherCode();
    await this.getCustomers();

    this.filteredProduct = this.product.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filterProduct(name) : this.products.slice())
      );

    this.filteredCustomer = this.customer.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.customerName),
        map(name => name ? this._filterCustomer(name) : this.customers.slice())
      );

    this.addNewItem();
  }

  get details() {
    return (this.voucherForm.get('details') as FormArray).controls;
  }

  addNewItem() {
    if (this.isValid) {
      const newItem = this.fb.group({
        product: this.product,
        productId: [''],
        unit: [''],
        quantity: ['', [Validators.required, Validators.min(0)]],
        unitPrice: ['', [Validators.required, Validators.min(0)]],
        rowTotalAmount: [''],
      });

      this.voucherForm.get('details').valueChanges.subscribe(() => {
        this.calculateTotalAmount();
      });

      (this.voucherForm.get('details') as FormArray).push(newItem);
    }
  }

  removeItem(index: number) {
    (this.voucherForm.get('details') as FormArray).removeAt(index);
    this.calculateTotalAmount();
  }

  async generateVoucherCode() {
    try {
      const lastCode: string = await this.warehouseService.getLastReturnCode().toPromise();
      const newNumber: number = parseInt(lastCode.split('-')[1], 10) + 1;
      const voucherCode = 'PTH-' + newNumber.toString().padStart(6, '0');
      this.voucherForm.controls.voucherCode.setValue(voucherCode);
    } catch (e) {
      this.voucherForm.controls.voucherCode.setValue('PTH-000001');
    }
  }

  displayProduct(product: Product): string {
    return product && product.productName ? product.productName : '';
  }

  private _filterProduct(name: string): Product[] {
    const filterValue = name.toLowerCase();

    return this.products.filter(option => option.productName.toLowerCase().includes(filterValue));
  }

  // today() {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = String(today.getMonth() + 1).padStart(2, '0'); // Thêm '0' phía trước nếu cần
  //   const day = String(today.getDate()).padStart(2, '0'); // Thêm '0' phía trước nếu cần
  //   return `${year}-${month}-${day}`;
  // }

  formatDate(inputDateStr: string | undefined): string {
    const date: Date = inputDateStr ? new Date(inputDateStr) : new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0 nên cần cộng thêm 1
    const year = date.getFullYear().toString();
    // const hours = date.getHours().toString().padStart(2, '0');
    // const minutes = date.getMinutes().toString().padStart(2, '0');
    // const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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

      const unitPrice = this.getUnitPrice(product.productId);
      item.get('unitPrice').setValue(unitPrice);

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

  async getCustomers() {
    try {
      this.customers = await this.customerService.getCustomers().toPromise();
    } catch (e) {
      this.openSnackBar('Không tìm thấy dữ liệu khách hàng');
    }
  }

  async changeCustomer() {
    this.customer.valueChanges.subscribe(cus => {
      if (this.customers.includes(cus)) {
        this.voucherForm.get('customerId').setValue(cus.customerId);
        this.voucherForm.get('customerName').setValue(cus.customerName);
        this.address = cus.address;
        const description = String(`Phiếu trả hàng | ${cus.customerName} | ${this.formatDate(undefined)}`);
        this.voucherForm.controls.description.setValue(description);
        this.customerValid = true;
        this.messageForCustomer = '';
        if (this.customerType !== cus.customerTypeId) {
          try {
            this.quotationService.getAllProductWithPriceAndInventoryByCustomerTypeId(cus.customerTypeId).toPromise().then(value => {
              if (value) {
                this.products = value;
                this.mapQuotation = new Map(
                  value.map(item => [item.productId, item.unitPrice])
                );
              }
            });
          } catch (e) {
            this.openSnackBar('Không tìm thấy bảng giá phù hợp !');
            this.quotations = [];
            this.mapQuotation = null;
          }
        }
      } else {
        this.customerValid = false;
        this.messageForCustomer = 'Sai định dạng khách hàng!';
      }
    });
  }

  getQuotations(customer: Customer) {
    try {
      this.quotations = [];
      this.quotationService.getQuotationsByCustomerTypeId(customer.customerTypeId).toPromise().then(value => {
        if (value) {
          this.quotations = value;
          this.mapQuotation = null;
          this.mapQuotation = new Map(
            this.quotations.map(item => [item.product_Id, item.unit_Price])
          );
        }
      });
    } catch (e) {
      this.openSnackBar('Không tìm thấy giá tương ứng !');
      this.quotations = null;
      this.mapQuotation = null;
    }
  }

  getUnitPrice(productId: number): number {
    return this.mapQuotation.get(productId);
  }

  displayCustomer(customer: Customer): string {
    return customer && customer.customerName ? customer.customerName : '';
  }

  private _filterCustomer(name: string): Customer[] {
    const filterValue = name.toLowerCase();

    return this.customers.filter(option =>
      option.customerName.toLowerCase().includes(filterValue)
    );
  }

  async submitVoucherForm(close: boolean) {
    try {
      /**
       * Voucher
       */
        // this.voucherForm.controls.postingDate.setValue(this.formatDate(this.voucherForm.controls.postingDate.value));
        // this.voucherForm.controls.createdBy.setValue(this.decryptedName);
      const receipt: Receipt = {
          customerId: this.voucherForm.controls.customerId.value,
          postingDate: new Date(),
          amount: this.voucherForm.controls.totalAmount.value,
          typeOfTransaction: 'payment'
        };

      await this.voucherService.saveReturn(this.voucherForm.value).toPromise();
      await this.customerService.saveReceipt(receipt).toPromise();
      await Swal.fire({text: `Lưu thành công`, icon: 'success', timer: 1000, showConfirmButton: false});

      if (close) {
        await this.router.navigateByUrl('warehouse/return');
      } else {
        await this.ngOnInit();
      }
      // this.warehouseService.fetchDataImport(null, null);
    } catch (error) {
      await Swal.fire({text: `Đã xảy ra lỗi ${error.status}`, icon: 'warning', showConfirmButton: false});
    }
  }
}
