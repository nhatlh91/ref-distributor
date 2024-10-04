import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {SalesDto} from '../../model/sales-dto';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ReportService} from '../../service/report.service';
import Swal from 'sweetalert2';
import {saveAs} from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';

@Component({
  selector: 'app-purchase-history',
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.css']
})
export class PurchaseHistoryComponent implements OnInit {
  rf?: FormGroup;
  dataSource = new MatTableDataSource<SalesDto>();
  length?: number;
  displayedColumns: string[] = ['product_Name', 'product_Type', 'packing_Specifications', 'quantity', 'amount'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private reportService: ReportService) {
  }

  ngOnInit(): void {
    this.rf = new FormGroup({
      month: new FormControl(new Date().getMonth() + 1, [Validators.min(1), Validators.max(12)]),
      year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(2024)])
    });
    this.loadData();
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    this.reportService.getSalesDTO(this.rf.controls.year.value, this.rf.controls.month.value).toPromise().then(
      data => {
        this.dataSource.data = data;
        this.length = data.length;
      }, error => {
        if (error.status === 404) {
          this.dataSource.data = [];
          this.length = undefined;
        } else {
          Swal.fire({text: `Lỗi ${error.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
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
    const headerRow = worksheet.addRow(['SẢN PHẦM', 'NGÀNH HÀNG', 'QUY CÁCH', 'ĐƠN VỊ TÍNH', 'TỔNG SỐ LƯỢNG', 'SỐ TIỀN']);

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
        item.product_Name,
        item.product_Type,
        item.packing_Specifications,
        item.quantity,  // unit
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
      saveAs(blob, 'Chi_tiết_nhập_kho_' + this.today() + '.xlsx');
    });
  }
}
