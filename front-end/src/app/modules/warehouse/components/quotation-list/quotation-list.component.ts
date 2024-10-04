import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CustomerType} from '../../../account-receivable/models/customer-type';
import {ProductType} from '../../models/product-type';
import {QuotationService} from '../../service/quotation.service';
import {ProductService} from '../../service/product.service';
import {CustomerService} from '../../../account-receivable/services/customer.service';
import {QuotationDto} from '../../models/quotation-dto';
import {DialogProductEditComponent} from '../dialog-product-edit/dialog-product-edit.component';
import {MatDialog} from '@angular/material/dialog';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import {AuthService} from '../../../login/service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quotation-list',
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.css']
})
export class QuotationListComponent implements OnInit {
  rf?: FormGroup;
  quotations?: QuotationDto[];
  customerTypes?: CustomerType[];
  productTypes?: ProductType[];
  dataSource = new MatTableDataSource<QuotationDto>();
  displayedColumns: string[] = ['product_Name', 'unit', 'packing_Specifications', 'barcode', 'product_Type',
    'customer_Type', 'unit_Price', 'action'];
  decryptedRole: string;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private quotationService: QuotationService,
              private productService: ProductService,
              private customerService: CustomerService,
              private tokenStorageService: TokenStorageService,
              private authService: AuthService,
              private dialog: MatDialog) {
  }

  async ngOnInit() {
    await this.checkToken();
    this.getRole();
    this.loadData();
    this.rf = new FormGroup({
      customerTypeId: new FormControl(''),
      productTypeId: new FormControl('')
    });
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.quotationService.data$.subscribe(data => {
      this.quotations = data;
      this.listProcess();
    });
  }

  private loadData() {
    try {
      this.quotationService.getQuotations().toPromise().then(
        data => {
          this.quotations = data;
          this.listProcess();
        });
      this.customerService.getCustomerTypes().toPromise().then(data => this.customerTypes = data);
      this.productService.getProductTypes().toPromise().then(data => this.productTypes = data);
    } catch (error) {
      error.status === 404 ?
        this.dataSource.data = [] :
        Swal.fire({text: `Lỗi ${error.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
    }
  }

  listProcess() {
    const customerTypeId = parseInt(this.rf.controls.customerTypeId.value, 10);
    const productTypeId = parseInt(this.rf.controls.productTypeId.value, 10);
    let result = this.quotations;
    if (!isNaN(productTypeId)) {
      result = result.filter(item => (item.product_Type_Id === productTypeId));
    }
    if (!isNaN(customerTypeId)) {
      result = result.filter(item => (item.customer_Type_Id === customerTypeId));
    }
    this.dataSource.data = result;
  }

  checkToken() {
    const today = new Date().getTime();
    const cre = this.tokenStorageService.getCreateDate();
    const parsedDateString = cre.replace(/"/g, '').trim();
    const expDate = new Date(parsedDateString).getTime();
    if (today > expDate) {
      Swal.fire({
        text: `Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại`,
        icon: 'warning',
        timer: 1000,
        showConfirmButton: false
      }).then(() => this.authService.signOut()
      )
      ;
    }
  }

  getRole() {
    if (this.tokenStorageService.getRole()) {
      this.decryptedRole = this.tokenStorageService.getDecryptedRole();
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  edit(productId: number) {
    this.dialog.open(DialogProductEditComponent, {
      data: productId,
      width: '60%'
      // disableClose: true
    });
  }

  async delete(id: number) {
    const {value: confirmation} = await Swal.fire({
      title: 'Xác nhận thao tác xóa',
      input: 'text',
      icon: 'warning',
      inputPlaceholder: 'Nhập "delete" để xác nhận xóa dữ liệu',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy bỏ',
    });
    if (confirmation === 'delete') {
      await this.quotationService.deleteById(id).toPromise();
      await Swal.fire({text: `Đã xóa`, icon: 'success', timer: 1000, showConfirmButton: false});
      await this.ngOnInit();
    }
  }
}
