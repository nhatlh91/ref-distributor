import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {WarehouseService} from '../../service/warehouse.service';
import {ExportVoucherDto} from '../../models/export-voucher-dto';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {PrintExportVoucherComponent} from '../print-export-voucher/print-export-voucher.component';
import {CustomerService} from '../../../account-receivable/services/customer.service';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import {AuthService} from '../../../login/service/auth.service';
import Swal from 'sweetalert2';
import {saveAs} from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';

@Component({
  selector: 'app-export-voucher-list',
  templateUrl: './export-voucher-list.component.html',
  styleUrls: ['./export-voucher-list.component.css']
})
export class ExportVoucherListComponent implements OnInit {
  rf?: FormGroup;
  dataSource = new MatTableDataSource<ExportVoucherDto>();
  length?: number;
  vouchers?: ExportVoucherDto[];
  displayedColumns: string[] = ['posting_Date', 'voucher_Code', 'description', 'total_Amount', 'customer_Name', 'phone',
    'created_By', 'action'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  decryptedRole: string;

  constructor(private warehouseService: WarehouseService,
              private customerService: CustomerService,
              private tokenStorageService: TokenStorageService,
              private authService: AuthService,
              public dialog: MatDialog) {
  }

  async ngOnInit() {
    await this.checkToken();

    this.getRole();
    this.rf = new FormGroup({
      month: new FormControl(new Date().getMonth() + 1, [Validators.min(1), Validators.max(12)]),
      year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(2024)])
    });
    this.loadVouchers();
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadVouchers() {
    this.warehouseService.getExportVouchers(this.rf.controls.year.value, this.rf.controls.month.value).toPromise().then(
      data => {
        this.dataSource.data = data;
        this.vouchers = data;
        this.length = data.length;
      }, error => {
        error.status === 404 ?
          Swal.fire({text: `Không tìm thấy dữ liệu tương ứng`, icon: 'info', showConfirmButton: false}) :
          Swal.fire({text: `Lỗi ${error.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
      }
    );
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

  getRole() {
    if (this.tokenStorageService.getRole()) {
      this.decryptedRole = this.tokenStorageService.getDecryptedRole();
    }
  }

  detail(param: any) {
    const dialogRef = this.dialog.open(PrintExportVoucherComponent, {
      data: param,
      width: '21cm', // Độ rộng tương đương với khổ giấy A4
      minWidth: '21cm', // Độ rộng tương đương với khổ giấy A4
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  async delete(voucherCode: string) {
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
      const voucher = this.vouchers.filter((item => item.voucher_Code === voucherCode));
      const customer = await this.customerService.getCustomerById(voucher[0].customer_Id).toPromise();
      if (customer.accountsReceivable < voucher[0].total_Amount) {
        await Swal.fire({
          text: `Không thể xóa phiếu do công nợ hiện đang thấp hơn giá trị của phiếu`, icon: 'error',
          showConfirmButton: false
        });
      } else {
        await this.warehouseService.deleteExportVoucher(voucherCode).toPromise();
        await Swal.fire({text: `Đã xóa`, icon: 'success', timer: 1000, showConfirmButton: false});
        await this.ngOnInit();
      }
    }
  }

  onExportExcelClicked() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Thêm dòng header
    const headerRow = worksheet.addRow(
      ['NGÀY XUẤT', 'MÃ CHỨNG TỪ', 'NỘI DUNG', 'SỐ TIỀN', 'KHÁCH HÀNG', 'SDT', 'NGƯỜI TẠO']
    );

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
        item.posting_Date,
        item.voucher_Code,
        item.description,
        item.total_Amount,
        item.customer_Name,
        item.phone,
        item.created_By]);
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
      saveAs(blob, 'Báo_cáo_bán_hàng_' + '.xlsx');
    });
  }
}
