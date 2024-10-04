import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ReportService} from '../../service/report.service';
import {TransactionDto} from '../../model/transaction-dto';
import Swal from 'sweetalert2';
import {CustomerService} from '../../../account-receivable/services/customer.service';
import {CustomerDto} from '../../../account-receivable/models/customer-dto';
import {saveAs} from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Customer} from '../../../account-receivable/models/customer';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['../report/report.component.css']
})
export class TransactionHistoryComponent implements OnInit {
  rf?: FormGroup;
  customer = new FormControl();
  dataSource = new MatTableDataSource<TransactionDto>();
  length?: number;
  displayedColumns: string[] = ['postingDate', 'typeOfTransaction', 'amount'];
  filteredCustomer: Observable<Customer[]>;
  customers?: Customer[] = [];

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private reportService: ReportService,
              private customerService: CustomerService) {
  }

  ngOnInit(): void {
    this.customerService.getCustomers().toPromise().then(data => this.customers = data);
    this.rf = new FormGroup({
      customer: this.customer,
      customerId: new FormControl('', [Validators.required]),
      month: new FormControl(new Date().getMonth() + 1, [Validators.min(1), Validators.max(12)]),
      year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(2024)])
    });
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.filteredCustomer = this.customer.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.customerName),
        map(name => name ? this._filterCustomer(name) : this.customers.slice())
      );

  }

  loadData() {
    this.reportService.getTransactionDTO(
      this.rf.controls.customerId.value,
      this.rf.controls.year.value,
      this.rf.controls.month.value).toPromise().then(
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

  changeCustomer() {
    this.customer.valueChanges.subscribe(cus => {
      if (this.customers.includes(cus)) {
        this.rf.get('customerId').setValue(cus.customerId);
      }
    });
  }

  today() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Thêm '0' phía trước nếu cần
    const day = String(today.getDate()).padStart(2, '0'); // Thêm '0' phía trước nếu cần

    return `${year}-${month}-${day}`;
  }

  displayCustomer(customer: Customer): string {
    return customer && customer.customerName ? customer.customerName : '';
  }

  private _filterCustomer(name: string): Customer[] {
    const filterValue = name.toLowerCase();

    return this.customers.filter(option => option.customerName.toLowerCase().includes(filterValue));
  }

  onExportExcelClicked() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    const customer = this.rf.get('customer').value;

    const cus = worksheet.addRow([customer.customerName.toUpperCase(), 'SỐ DƯ CÔNG NỢ:', customer.accountsReceivable]);

    cus.eachCell((cell) => {
      cell.font = {
        color: {argb: 'ff0000'}, // Màu chữ trắng
        bold: true // Chữ in đậm
      };
    });

    // Thêm dòng header
    const headerRow = worksheet.addRow(['NGÀY GIAO DỊCH', 'LOẠI GIAO DỊCH', 'SỐ TIỀN']);

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
        item.typeOfTransaction === 'debt' ? 'Bán hàng' : 'Thanh toán/ Trả hàng',
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
      saveAs(blob, 'Lịch_sử_giao_dịch_' + customer.customerName.toUpperCase() +  '.xlsx');
    });
  }

}
