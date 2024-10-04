import {Component, OnInit, ViewChild} from '@angular/core';
import {ProductService} from '../../service/product.service';
import {Product} from '../../models/product';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ProductType} from '../../models/product-type';
import {FormControl, FormGroup} from '@angular/forms';
import {saveAs} from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import {WarehouseService} from '../../service/warehouse.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogProductEditComponent} from '../dialog-product-edit/dialog-product-edit.component';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import {AuthService} from '../../../login/service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  rf?: FormGroup;
  productTypes?: ProductType[];
  products?: Product[];
  dataSource = new MatTableDataSource<Product>();
  length?: number;
  displayedColumns: string[] = ['productName', 'productType', 'unit', 'packingSpecifications', 'barcode', 'action'];
  decryptedRole: string;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private productService: ProductService,
              private warehouseService: WarehouseService,
              private tokenStorageService: TokenStorageService,
              private authService: AuthService,
              private dialog: MatDialog) {
  }

  async ngOnInit() {
    await this.checkToken();
    this.getRole();
    this.productService.getProducts().toPromise().then(data => {
      this.products = data;
      this.listProcess();
    });
    this.productService.getProductTypes().toPromise().then(data => this.productTypes = data);
    this.rf = new FormGroup({
      productTypeId: new FormControl('')
    });
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  listProcess() {
    const productTypeId = parseInt(this.rf.controls.productTypeId.value, 10);
    this.dataSource.data = isNaN(productTypeId) ?
      this.products : this.products.filter(item => item.productTypeId === productTypeId);
    this.length = this.dataSource.data.length;
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

  update(productId: number) {
    const dialogRef = this.dialog.open(DialogProductEditComponent, {
      data: productId,
      width: '60%',
      // disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.ngOnInit();
    });
  }

  async delete(productId: number) {
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
      const data = await this.warehouseService.getInventoryByProductId(productId).toPromise();
      if (!data) {
        await this.productService.deleteProduct(productId).toPromise();
        await Swal.fire({title: `Đã xóa`, icon: 'success', timer: 1000, showConfirmButton: false});
        await this.ngOnInit();
      } else {
        await Swal.fire({
          html: `Sản phẩm này hiện có số lượng tồn kho là <strong>${data}</strong>, không được phép xóa`,
          icon: 'warning'
        });
      }
    } else {
      await Swal.fire({title: `Đã hủy thao tác`, icon: 'info', timer: 1000, showConfirmButton: false});
    }
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
    const headerRow = worksheet.addRow(['Mã vạch', 'Tên sản phẩm', 'Đơn vị tính', 'Quy cách', 'Loại hàng hóa']);

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
        item.barcode,
        item.productName,
        item.unit,
        +item.packingSpecifications,
        item.productType]);
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
      saveAs(blob, 'Danh_mục_hàng_hóa_' + this.today() + '.xlsx');
    });
  }
}
