import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {ItemTransHistory, ReportService} from '../../service/report.service';
import {map, startWith} from 'rxjs/operators';
import {saveAs} from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import {Product} from '../../../warehouse/models/product';
import {ProductService} from '../../../warehouse/service/product.service';

@Component({
  selector: 'app-item-ledger-entry',
  templateUrl: './item-ledger-entry.component.html',
  styleUrls: ['./item-ledger-entry.component.css']
})
export class ItemLedgerEntryComponent implements OnInit {
  product = new FormControl();
  products: Product[] = [];
  filteredProduct: Observable<Product[]>;
  rf?: FormGroup;
  dataSource = new MatTableDataSource<ItemTransHistory>();
  length?: number;
  displayedColumns: string[] = ['postingDate', 'voucherCode', 'typeOfTransaction', 'partner', 'quantity', 'totalAmount'];
  isLoading = false;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private reportService: ReportService,
              private productService: ProductService,
              private fb: FormBuilder) {
    // this.customerService.getCustomers().subscribe({
    //   next: value => this.customers = value,
    //   error: err => Swal.fire({text: `Lỗi ${err.status}, xin thử lại`, icon: 'error', showConfirmButton: false})
    // });
  }

  async ngOnInit() {

    this.rf = this.fb.group({
      product: this.product,
      productId: [],
      begin: this.firstDayOfMonth(),
      end: this.lastDayOfMonth(),
    });

    await this.getProducts();

    this.filteredProduct = this.product.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.productName),
        map(name => name ? this._filterProduct(name) : this.products.slice())
      );

  }

  loadData() {
    this.isLoading = true;
    const begin = (this.rf.get('begin').value);
    const end = (this.rf.get('end').value);
    const productId = this.rf.get('productId').value;
    this.reportService.getItemHistory(productId, begin, end).toPromise().then(
      data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.length = data.length;
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
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

  firstDayOfMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Thêm '0' phía trước nếu cần
    return `${year}-${month}-01`; // Ngày đầu tháng luôn là 01
  }

  lastDayOfMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // Lấy tháng hiện tại (0-11)

    const lastDate = new Date(year, month + 1, 0);
    const day = String(lastDate.getDate()).padStart(2, '0'); // Thêm '0' phía trước nếu cần
    const formattedMonth = String(month + 1).padStart(2, '0'); // Thêm '0' phía trước nếu cần

    return `${year}-${formattedMonth}-${day}`; // Định dạng YYYY-MM-DD
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
    const headerRow = worksheet.addRow([
      'NGÀY CHỨNG TỪ',
      'MÃ CHỨNG TỪ',
      'LOẠI GIAO DỊCH',
      'ĐỐI TÁC',
      'SỐ LƯỢNG',
      'SỐ TIỀN'
    ]);

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
        item.voucherCode,
        item.typeOfTransaction,
        item.partner,
        item.quantity,
        item.totalAmount,
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
      saveAs(blob, `Lịch_sử_giao_dịch_hàng_hóa_từ_` + this.rf.get('begin').value + '_đến_' + this.rf.get('end').value + '.xlsx');
    });
  }

  changeItem() {
    this.product.valueChanges.subscribe(product => {
      this.rf.get('productId').setValue(product.productId);
    });
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

  async getProducts() {
    try {
      this.products = await this.productService.getProducts().toPromise();
    } catch (e) {
    }
  }

  changeDate() {
    const begin = this.rf.get('begin').value;
    if (typeof begin !== 'string') {
      this.rf.get('begin').setValue(this.formatDate(begin));
    }
    const end = this.rf.get('end').value;
    if (typeof end !== 'string') {
      this.rf.get('end').setValue(this.formatDate(end));
    }
  }

  formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0, cần cộng thêm 1 và chèn số 0 nếu cần
    const day = String(date.getDate()).padStart(2, '0'); // Chèn số 0 nếu cần
    return `${year}-${month}-${day}`;
  }
}
