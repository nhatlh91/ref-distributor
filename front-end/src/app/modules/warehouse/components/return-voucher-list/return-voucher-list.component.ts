import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {WarehouseService} from '../../service/warehouse.service';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import {AuthService} from '../../../login/service/auth.service';
import {MatDialog} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {PrintImportVoucherComponent} from '../print-import-voucher/print-import-voucher.component';
import {PrintReturnVoucherComponent} from '../print-return-voucher/print-return-voucher.component';

@Component({
  selector: 'app-return-voucher-list',
  templateUrl: './return-voucher-list.component.html',
  styleUrls: ['./return-voucher-list.component.css']
})
export class ReturnVoucherListComponent implements OnInit {

  rf?: FormGroup;
  dataSource = new MatTableDataSource<ReturnVoucher>();
  length?: number;
  displayedColumns: string[] = ['postingDate', 'voucherCode', 'description', 'totalAmount', 'customerName', 'createdBy', 'action'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  decryptedRole: string;

  constructor(private warehouseService: WarehouseService,
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
    this.warehouseService.getReturnVouchers(this.rf.controls.year.value, this.rf.controls.month.value).toPromise().then(
      data => {
        this.dataSource.data = data;
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

  detail(voucher: ReturnVoucher) {
    const dialogRef = this.dialog.open(PrintReturnVoucherComponent, {
      data: voucher,
      width: '21cm', // Độ rộng tương đương với khổ giấy A4
      minWidth: '21cm', // Độ rộng tương đương với khổ giấy A4
      disableClose: false,
    });
  }

  getRole() {
    if (this.tokenStorageService.getRole()) {
      this.decryptedRole = this.tokenStorageService.getDecryptedRole();
    }
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
      try {
        await this.warehouseService.deleteReturnVoucher(voucherCode).toPromise();
        await Swal.fire({text: `Đã xóa`, icon: 'success', timer: 1000, showConfirmButton: false});
        await this.ngOnInit();
      } catch (e) {
        e.status === 405 ?
          await Swal.fire({
            html: `Không cho phép xóa phiếu nhập kho đối với lô hàng đã có lịch sử xuất kho`,
            icon: 'error', showConfirmButton: false
          }) :
          await Swal.fire({text: `Lỗi ${e.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
      }
    }
  }
}

export interface ReturnVoucher {
  returnVoucherId?: number;
  voucherCode: string;
  customerId: number;
  customerName: string;
  description: string;
  createdBy: string;
  totalAmount: number;
  postingDate: Date;
}
