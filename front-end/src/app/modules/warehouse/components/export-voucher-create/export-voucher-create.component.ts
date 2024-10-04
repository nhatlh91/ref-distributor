import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {Product} from '../../models/product';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map, startWith} from 'rxjs/operators';
import {VoucherService} from '../../service/voucher.service';
import {Customer} from '../../../account-receivable/models/customer';
import {CustomerService} from '../../../account-receivable/services/customer.service';
import {WarehouseService} from '../../service/warehouse.service';
import {QuotationDto} from '../../models/quotation-dto';
import {ProductWithInventoryAndPrice, QuotationService} from '../../service/quotation.service';
import Swal from 'sweetalert2';
import {
  DialogCustomerCreateComponent
} from '../../../account-receivable/components/dialog-customer-create/dialog-customer-create.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-export-voucher-create',
  templateUrl: './export-voucher-create.component.html',
  styleUrls: ['./export-voucher-create.component.css']
})
export class ExportVoucherCreateComponent implements OnInit {
  voucherForm: FormGroup;
  product = new FormControl();
  products: ProductWithInventoryAndPrice[] = [];
  filteredProduct: Observable<Product[]>;
  customer = new FormControl();
  customers: Customer[] = [];
  filteredCustomer: Observable<Customer[]>;

  isValid = true; // true cho thêm row
  customerType: string;
  customerTypeId = 0;
  accountsReceivable: string;
  mapInventories: Map<string, number>;
  quotations: QuotationDto[];
  mapQuotation: Map<number, number>;
  itemValid = false;
  message = '';
  customerValid = false;
  messageForCustomer = '';

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private customerService: CustomerService,
    private warehouseService: WarehouseService,
    private quotationService: QuotationService,
    private tokenStorageService: TokenStorageService,
    private voucherService: VoucherService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {
    this.voucherForm = this.fb.group({
      details: this.fb.array([]),
      map: this.fb.array([]),
      postingDate: this.today(),
      voucherCode: ['', [Validators.required, Validators.pattern(/^PXK-\d{6}$/)]],
      createdBy: [this.tokenStorageService.getDecryptedName(), Validators.required],
      customer: this.customer,
      customerId: [''],
      address: [''],
      accountReceivable: [''],
      description: ['', Validators.required],
      preTotalAmount: [0, Validators.required],
      discount: [0],
      totalAmount: [0, Validators.required],
    });
    await this.generateVoucherCode();
    await this.getCustomers();

    this.filteredCustomer = this.customer.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.customerName),
        map(name => name ? this._filterCustomer(name) : this.customers.slice())
      );

    this.filteredProduct = this.product.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.productName),
        map(name => name ? this._filterProduct(name) : this.products.slice())
      );


    this.addItem();
  }

  get details() {
    return (this.voucherForm.get('details') as FormArray).controls;
  }

  addItem() {
    if (this.isValid) {

      const newItem = this.fb.group({
        product: this.product,
        productId: [''],
        unit: [''],
        remainingQuantity: [''],
        catchWeight: [''],
        unitPrice: ['', [Validators.required, Validators.min(0)]],
        quantity: ['', [Validators.required, Validators.min(0)]],
        rowTotalAmount: [0],
      });

      this.voucherForm.get('details').valueChanges.subscribe(() => {
        this.calculatePreTotalAmount();
      });

      (this.voucherForm.get('details') as FormArray).push(newItem);
    }

    setTimeout(this.scrollToBottom, 500);
  }

  scrollToBottom(): void {
    const scrollHeight = document.body.scrollHeight; // Chiều cao tổng của tài liệu
    const clientHeight = window.innerHeight; // Chiều cao của viewport

    // Cuộn đến cuối trang
    window.scrollTo({
      top: scrollHeight,
      behavior: 'smooth' // Cuộn mượt mà
    });
  }

  removeItem(index: number) {
    (this.voucherForm.get('details') as FormArray).removeAt(index);
    this.calculatePreTotalAmount();
  }

  async getCustomers() {
    try {
      this.customers = await this.customerService.getCustomers().toPromise();
    } catch (e) {
      this.openSnackBar('Không tìm thấy dữ liệu khách hàng');
    }
  }

  sortProductsAtoZ() {
    this.products.sort((a, b) => {
      // Sắp xếp theo tên sản phẩm (từ a->z)
      if (a.productName < b.productName) {
        return -1;
      }
      if (a.productName > b.productName) {
        return 1;
      }
      return 0;
    });
  }

  getInventory(name: string): number {
    return this.mapInventories.get(name);
  }

  getUnitPrice(productId: number): number {
    return this.mapQuotation.get(productId);
  }

  async generateVoucherCode() {
    try {
      const lastCode: string = await this.warehouseService.getLastExportCode().toPromise();
      const newNumber: number = parseInt(lastCode.split('-')[1], 10) + 1;
      const newCode = 'PXK-' + newNumber.toString().padStart(6, '0');
      this.voucherForm.controls.voucherCode.setValue(newCode);
    } catch (e) {
      this.voucherForm.controls.voucherCode.setValue('PXK-000001');
    }
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

  displayProduct(product: Product): string {
    return product && product.productName ? product.productName : '';
  }

  private _filterProduct(name: string): Product[] {
    const filterValue = name.toLowerCase();

    return this.products.filter(option =>
      option.productName.toLowerCase().includes(filterValue)
    );
  }

  today() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Thêm '0' phía trước nếu cần
    const day = String(today.getDate()).padStart(2, '0'); // Thêm '0' phía trước nếu cần
    return `${year}-${month}-${day}`;
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000, // (ms)
      horizontalPosition: 'center', // (start, center, end)
      verticalPosition: 'top', // (top, bottom)
    });
  }

  formatDate(inputDateStr: string): string {
    const date = new Date(inputDateStr);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0 nên cần cộng thêm 1
    const year = date.getFullYear().toString();
    return `${year}-${month}-${day}`;
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

  changeItem(item: AbstractControl) {
    const customer = this.voucherForm.get('customer').value;

    if (customer) {
      const product = (item.get('product') as FormControl).value || 0;

      if (this.products.includes(product)) {
        item.get('productId').setValue(product.productId);
        item.get('unit').setValue(product.unit);

        const remainingQuantity = this.getInventory(product.productName) || 0;
        item.get('remainingQuantity').setValue(remainingQuantity);

        const unitPrice = this.getUnitPrice(product.productId);
        item.get('unitPrice').setValue(unitPrice);

        this.itemValid = true;
        this.message = ' ';
      } else {
        this.itemValid = false;
        this.message = 'Sai định dạng sản phẩm!';
      }
    } else {
      this.openSnackBar('Vui lòng chọn Khách hàng trước khi chọn sản phẩm!');
    }
  }

  changeQuantity(item: AbstractControl) {
    const product = (item.get('product') as FormControl).value || 0;
    const quantity = (item.get('quantity') as FormControl).value || 0;
    const remainingQuantity = this.getInventory(product.productName) || 0;
    const catchWeight = quantity / product.packingSpecifications;
    item.get('catchWeight').setValue(catchWeight);

    if (quantity > remainingQuantity) {
      this.openSnackBar('Số lượng tồn kho không đủ!');
      this.isValid = false;
    } else {
      this.isValid = true;
    }
  }

  async changeCustomer() {
    this.customer.valueChanges.subscribe(cus => {
      if (this.customers.includes(cus)) {
        this.customerType = cus.customerType;
        this.voucherForm.get('customerId').setValue(cus.customerId);
        this.accountsReceivable = cus.accountsReceivable;
        const description = String(`Phiếu xuất kho | ${cus.customerName} | ${this.formatDate(new Date().toString())}`);
        this.voucherForm.controls.description.setValue(description);
        this.customerValid = true;
        this.messageForCustomer = '';
        if (this.customerType !== cus.customerTypeId) {
          try {
            this.quotationService.getAllProductWithPriceAndInventoryByCustomerTypeId(cus.customerTypeId).toPromise().then(value => {
              if (value) {
                this.products = value;
                this.sortProductsAtoZ();
                this.mapQuotation = new Map(
                  value.map(item => [item.productId, item.unitPrice])
                );
                this.mapInventories = new Map(
                  value.map(item => [item.productName, item.totalRemainingQuantity])
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

  customerCreate() {
    const dialogRef = this.dialog.open(DialogCustomerCreateComponent, {
      width: '60%',
      // disableClose: true
    });
    dialogRef.afterClosed().subscribe(next => {
      if (!next) {
        return;
      }
      this.customerService.getCustomers().subscribe(value => {
        this.customers = value;
      });
    });
  }

  async submitVoucherForm(isClose: boolean) {
    try {
      /**
       * Voucher
       */
      this.voucherForm.controls.postingDate.setValue(this.formatDate(this.voucherForm.controls.postingDate.value));

      // const resultArray = this.details.reduce((acc, current) => {
      //   const productId = current.get('productId').value; // Lưu productId vào biến
      //   const found = acc.find(item => item.productId === productId);
      //
      //   if (found) {
      //     found.quantity += current.get('quantity').value; // Cộng dồn quantity
      //   } else if (found === undefined) {
      //     acc.push({
      //       productId,
      //       quantity: current.get('quantity').value
      //     });
      //   }
      //
      //   return acc;
      // }, []);
      // console.log(resultArray); // update lại list

      await this.voucherService.saveExport(this.voucherForm.value).toPromise();
      await Swal.fire({text: `Lưu thành công`, icon: 'success', timer: 1000, showConfirmButton: false});
      if (isClose) {
        await this.router.navigateByUrl('warehouse/export');
      } else {
        await this.ngOnInit();
      }
      this.warehouseService.fetchDataExport(null, null);
    } catch (error) {
      console.log(error);
      await Swal.fire({text: `Đã xảy ra lỗi ${error.status}`, icon: 'warning', showConfirmButton: false});
    }
  }
}
