import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {InventoryDto} from '../../models/inventory-dto';
import {WarehouseService} from '../../service/warehouse.service';
import {ProductService} from '../../service/product.service';
import {FormControl, FormGroup} from '@angular/forms';
import {ProductType} from '../../models/product-type';
import {saveAs} from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import {AuthService} from '../../../login/service/auth.service';
import {TokenStorageService} from '../../../login/service/token-storage.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['../warehouse/warehouse.component.css']
})
export class InventoryComponent implements OnInit {
  rf?: FormGroup;
  productTypes?: ProductType[];
  inventory?: InventoryDto[] = [];
  dataSource = new MatTableDataSource<InventoryDto>();
  displayedColumns: string[] = ['product_Name', 'product_Type', 'unit', 'packing_Specifications', 'unit_Price', 'import_Quantity',
    'remaining_Quantity', 'amount', 'voucher_Code', 'import_Date'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  total: number;

  constructor(private warehouseService: WarehouseService,
              private tokenStorageService: TokenStorageService,
              private authService: AuthService,
              private productService: ProductService) {
  }

  async ngOnInit() {
    await this.checkToken();

    this.productService.getProductTypes().toPromise().then(data => this.productTypes = data);
    this.rf = new FormGroup({
      productTypeId: new FormControl('')
    });
    this.loadInventory();
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadInventory() {
    this.warehouseService.getInventory(this.rf.controls.productTypeId.value).toPromise().then(
      data => {
        this.inventory = data;
        this.dataSource.data = data;
      }, error => {
        error.status === 404 ?
          this.inventory = [] :
          alert('Có lỗi phát sinh trong quá trình truy vấn dữ liệu - ' + error.status);
      }
    );
  }

  listProcess() {
    const productTypeId = parseInt(this.rf.controls.productTypeId.value, 10);
    this.dataSource.data = isNaN(productTypeId) ?
      this.inventory : this.inventory.filter(item => item.product_Type_Id === productTypeId);
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

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
    const headerRow = worksheet.addRow(['Tên sản phẩm', 'Ngành hàng', 'Đơn vị tính', 'Quy cách', 'Đơn giá', 'Số lượng nhập',
      'Tồn khả dụng', 'Thành tiền', 'Mã chứng từ', 'Ngày nhập']);

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

    // Thêm dòng total
    this.total = this.dataSource.data.reduce((acc, item) => {
      return acc + (item.remaining_Quantity * item.unit_Price);
    }, 0);

    const total = worksheet.addRow(['Tổng cộng', '', '', '', '', '', '', this.total, '', '']);

    // Định dạng dòng total
    total.eachCell((cell) => {
      cell.font = {
        // color: {argb: 'f5f6fa'}, // Màu chữ trắng
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
        item.unit,
        item.packing_Specifications,
        item.unit_Price,
        item.import_Quantity,
        item.remaining_Quantity,
        item.remaining_Quantity * item.unit_Price,
        item.voucher_Code,
        item.import_Date,
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
      saveAs(blob, 'Tồn_kho_hàng_hóa_' + this.today() + '.xlsx');
    });
  }
}
