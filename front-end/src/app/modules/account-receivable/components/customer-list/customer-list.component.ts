import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {Customer} from '../../models/customer';
import {CustomerService} from '../../services/customer.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogUpdateReceivablesComponent} from '../dialog-update-receivables/dialog-update-receivables.component';
import {DialogPaymentHistoryComponent} from '../dialog-payment-history/dialog-payment-history.component';
import {DialogCustomerCreateComponent} from '../dialog-customer-create/dialog-customer-create.component';
import {DialogCustomerEditComponent} from '../dialog-customer-edit/dialog-customer-edit.component';
import {saveAs} from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import {AuthService} from '../../../login/service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['../account-receivable/account-receivable.component.css']
})
export class CustomerListComponent implements OnInit {
  dataSource = new MatTableDataSource<Customer>();
  length = 0;
  displayedColumns: string[] = ['customerName', 'customerType', 'phone', 'address', 'accountsReceivable', 'action'];
  decryptedRole: string;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private customerService: CustomerService,
              private tokenStorageService: TokenStorageService,
              private authService: AuthService,
              private dialog: MatDialog) {
  }

  async ngOnInit() {
    await this.checkToken();
    this.getRole();

    this.customerService.getCustomers().toPromise().then(
      data => {
        this.dataSource.data = data;
        this.length = data.length;
      }, error => {
        switch (error.status) {
          case 404:
            this.dataSource.data = [];
            break;
          default:
            console.log(error);
            Swal.fire({text: `Có lỗi`, icon: 'error', timer: 2000, showConfirmButton: false});
        }
      }
    );
    this.customerService.data$.subscribe(data => {
      this.dataSource.data = data;
    });
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  checkToken() {
    const today = new Date().getTime();
    const cre = this.tokenStorageService.getCreateDate();
    const parsedDateString = cre.replace(/"/g, '').trim();
    const expDate = new Date(parsedDateString).getTime();
    if (today > expDate) {
      alert('Phiên đăng nhập kết thúc, vui lòng đăng nhập lại !');
      this.authService.signOut();
    }
  }

  edit(customerId: number) {
    this.dialog.open(DialogCustomerEditComponent, {
      data: customerId,
      width: '60%',
      // disableClose: true
    });
  }

  getRole() {
    if (this.tokenStorageService.getRole()) {
      this.decryptedRole = this.tokenStorageService.getDecryptedRole();
    }
  }

  async delete(customerId: number) {
    const {value: confirmation} = await Swal.fire({
      title: 'Xác nhận thao tác xóa',
      input: 'text',
      icon: 'warning',
      inputPlaceholder: 'Nhập "delete" để xác nhận thao tác xóa',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy bỏ',
    });
    if (confirmation === 'delete') {
      await this.customerService.deleteCustomer(customerId).toPromise();
      await Swal.fire({title: `Đã xóa`, icon: 'success', timer: 1000, showConfirmButton: false});
      this.customerService.fetchData();
    } else {
      await Swal.fire({title: `Đã hủy thao tác`, icon: 'info', timer: 1000, showConfirmButton: false});
    }
  }

  updateReceivables(customerId: number) {
    const dialogRef = this.dialog.open(DialogUpdateReceivablesComponent, {
      data: customerId,
      width: '60%',
      // disableClose: true
    });
  }

  paymentHistory(customerId: number) {
    const dialogRef = this.dialog.open(DialogPaymentHistoryComponent, {
      data: customerId,
      width: '60%',
      // disableClose: true
    });
  }

  customerCreate() {
    this.dialog.open(DialogCustomerCreateComponent, {
      width: '60%',
      // disableClose: true
    });
  }

  today() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Thêm '0' phía trước nếu cần
    const day = String(today.getDate()).padStart(2, '0'); // Thêm '0' phía trước nếu cần

    return `${day}-${month}-${year}`;
  }

  onExportExcelClicked() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Thêm dòng header
    const headerRow = worksheet.addRow(['TÊN KHÁCH HÀNG', 'NHÓM', 'ĐIỆN THOẠI', 'ĐỊA CHỈ', 'CÔNG NỢ PHẢI THU']);

    // Định dạng dòng header
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {argb: '2980b9'},
      };
      cell.font = {
        color: {argb: 'f5f6fa'}, // Màu chữ trắng
        bold: true // Chữ in đậm
      };
      cell.border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      };
    });

    // Thêm dữ liệu vào sheet
    this.dataSource.data.forEach((item, index) => {
      const row = worksheet.addRow([
        item.customerName,
        item.customerTypeId,
        item.phone,
        item.address,
        item.accountsReceivable,
      ]);
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
      });
    });

    // Lưu workbook và tải xuống tệp Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      saveAs(blob, 'Danh_sách_khách_hàng_' + this.today() + '.xlsx');
    });
  }
}
