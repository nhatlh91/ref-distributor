import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {ReportService} from '../../service/report.service';
import Swal from 'sweetalert2';
import {saveAs} from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import {CustomerService} from '../../../account-receivable/services/customer.service';
import {Observable} from 'rxjs';
import {Customer} from '../../../account-receivable/models/customer';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-sales-details-by-customer',
  templateUrl: './sales-details-by-customer.component.html',
  styleUrls: ['../report/report.component.css']
})
export class SalesDetailsByCustomerComponent implements OnInit {
  filteredCustomer: Observable<Customer[]>;
  customers?: Customer[] = [];
  customer = new FormControl();
  rf?: FormGroup;
  dataSource = new MatTableDataSource<SalesHistoryByCustomer>();
  length?: number;
  displayedColumns: string[] = ['postingDate', 'productName', 'quantity', 'amount'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private reportService: ReportService,
              private customerService: CustomerService) {
    this.customerService.getCustomers().subscribe({
      next: value => this.customers = value,
      error: err => Swal.fire({text: `Lỗi ${err.status}, xin thử lại`, icon: 'error', showConfirmButton: false})
    });
  }

  ngOnInit(): void {
    this.rf = new FormGroup({
      customer: this.customer,
      customerId: new FormControl([Validators.required]),
      month: new FormControl(new Date().getMonth() + 1, [Validators.min(1), Validators.max(12)]),
      year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(2024)])
    });
    this.loadData();
    this.dataSource.paginator = this.paginator;

    this.filteredCustomer = this.customer.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.customerName),
        map(name => name ? this._filterCustomer(name) : this.customers.slice())
      );

  }

  loadData() {
    this.reportService.getSalesHistoryByCustomer(this.rf.controls.year.value, this.rf.controls.month.value, this.rf.controls.customerId.value).toPromise().then(
      data => {
        this.dataSource.data = data;
        this.length = data.length;
      }, error => {
        if (error.status === 404) {
          this.dataSource.data = [];
          this.length = undefined;
        } else {
          // Swal.fire({text: `Lỗi ${error.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
        }
      }
    );
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  today() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Thêm '0' phía trước nếu cần
    const day = String(today.getDate()).padStart(2, '0'); // Thêm '0' phía trước nếu cần
    return `${year}-${month}-${day}`;
  }

  onExportExcelClicked() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Thêm dòng header
    const headerRow = worksheet.addRow(['NGÀY XUẤT', 'SẢN PHẦM', 'SỐ LƯỢNG', 'DOANH THU']);

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
        item.postingDate,
        item.productName,
        item.quantity,
        item.amount]);
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
      saveAs(blob, `Chi_tiết_xuất_hàng_theo_khách` + '.xlsx');
    });
  }

  changeCustomer() {
    this.customer.valueChanges.subscribe(cus => {
      if (this.customers.includes(cus)) {
        this.rf.get('customerId').setValue(cus.customerId);
      }
    });
  }


  displayCustomer(customer: Customer): string {
    return customer && customer.customerName ? customer.customerName : '';
  }

  private _filterCustomer(name: string): Customer[] {
    const filterValue = name.toLowerCase();

    return this.customers.filter(option => option.customerName.toLowerCase().includes(filterValue));
  }
}

export interface SalesHistoryByCustomer {
  postingDate: string;
  productName: string;
  quantity: number;
  amount: number;
}
