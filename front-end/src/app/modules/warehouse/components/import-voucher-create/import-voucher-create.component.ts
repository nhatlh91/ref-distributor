import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Product} from '../../models/product';
import {map, startWith} from 'rxjs/operators';
import {ProductService} from '../../service/product.service';
import {VoucherService} from '../../service/voucher.service';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import {WarehouseService} from '../../service/warehouse.service';
import Swal from 'sweetalert2';
import {MatDialog} from '@angular/material/dialog';
import {ProductCreateComponent} from '../product-create/product-create.component';

@Component({
  selector: 'app-import-voucher-create',
  templateUrl: './import-voucher-create.component.html',
  styleUrls: ['./import-voucher-create.component.css']
})
export class ImportVoucherCreateComponent implements OnInit {
  voucherForm: FormGroup;
  product = new FormControl();
  products: Product[] = [];
  filteredProduct: Observable<Product[]>;
  isValid = true;
  message = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private voucherService: VoucherService,
    private warehouseService: WarehouseService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {
    this.voucherForm = this.fb.group({
      details: this.fb.array([]),
      postingDate: [this.today(), Validators.required],
      voucherCode: ['', [Validators.required, Validators.pattern(/^PNK-\d{6}$/)]],
      createdBy: [this.tokenStorageService.getDecryptedName(), Validators.required],
      billing: ['', Validators.required],
      address: [''],
      supplier: ['', Validators.required],
      description: ['Phiếu nhập kho', Validators.required],
      totalAmount: ['', Validators.required],
    });
    await this.generateVoucherCode();
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
    if (this.isValid) {
      const newItem = this.fb.group({
        product: this.product,
        productId: [''],
        unit: [''],
        quantity: ['', [Validators.required, Validators.min(0)]],
        unitPrice: ['', [Validators.required, Validators.min(0)]],
        rowTotalAmount: [0],
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
      const lastCode: string = await this.warehouseService.getLastImportCode().toPromise();
      const newNumber: number = parseInt(lastCode.split('-')[1], 10) + 1;
      const newCode = 'PNK-' + newNumber.toString().padStart(6, '0');
      this.voucherForm.controls.voucherCode.setValue(newCode);
    } catch (e) {
      this.voucherForm.controls.voucherCode.setValue('PNK-000001');
    }
  }

  async getProducts() {
    try {
      this.products = await this.productService.getProducts().toPromise();
    } catch (e) {
      this.snackBarOpen('Không tìm thấy dữ liệu sản phẩm');
    }
  }

  displayProduct(product: Product): string {
    return product && product.productName ? product.productName : '';
  }

  private _filterProduct(name: string): Product[] {
    const filterValue = name.toLowerCase();

    return this.products.filter(option => option.productName.toLowerCase().includes(filterValue));
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

  snackBarOpen(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 2000, // (ms)
      horizontalPosition: 'center', // (start, center, end)
      verticalPosition: 'top', // (top, bottom)
    });
  }

  async submitVoucherForm(isClose: boolean) {
    try {
      /**
       * Voucher
       */
      this.voucherForm.controls.postingDate.setValue(this.formatDate(this.voucherForm.controls.postingDate.value));
      await this.voucherService.saveImport(this.voucherForm.value).toPromise();
      await Swal.fire({text: `Lưu thành công`, icon: 'success', timer: 1000, showConfirmButton: false});
      if (isClose) {
        await this.router.navigateByUrl('warehouse/import');
      } else {
        await this.ngOnInit();
      }
    } catch (error) {
      await Swal.fire({text: `Đã xảy ra lỗi ${error.status}`, icon: 'warning', showConfirmButton: false});
    }
  }

  productCreate() {
    const dialogRef = this.dialog.open(ProductCreateComponent, {
      width: '60%',
      // disableClose: true
    });
    dialogRef.afterClosed().subscribe(next => {
      if (!next) {
        return;
      }
      this.productService.getProducts().subscribe(value => {
        this.products = value;
      });
    });
  }

  updateDescription() {
    const description = String(`Phiếu nhập kho | ${this.voucherForm.controls.supplier.value} | ${this.formatDate(new Date().toString())}`);
    this.voucherForm.controls.description.setValue(description);
  }
}
