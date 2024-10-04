import {Component, OnInit} from '@angular/core';
import {ProductType} from '../../models/product-type';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ProductService} from '../../service/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-type',
  templateUrl: './product-type.component.html',
  styleUrls: ['./product-type.component.css']
})
export class ProductTypeComponent implements OnInit {
  dataSource = new MatTableDataSource<ProductType>();
  displayedColumns: string[] = ['productType'];
  rf?: FormGroup;
  showRf = false;

  constructor(private productService: ProductService) {
  }

  ngOnInit(): void {
    this.productService.getProductTypes().toPromise().then(data => {
      this.dataSource.data = data;
    }, error => {
      error.status === 404 ?
        this.dataSource.data = [] :
        Swal.fire({text: `Lỗi ${error.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
    });
    this.rf = new FormGroup({
      productType: new FormControl('', [Validators.required, Validators.maxLength(250)])
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async save() {
    try {
      await this.productService.saveProductType(this.rf.value).toPromise();
      await Swal.fire({text: `Đã lưu`, icon: 'success', timer: 1000, showConfirmButton: false});
      this.ngOnInit();
      this.showRf = false;
    } catch (e) {
      await Swal.fire({text: `Lỗi ${e.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
    }
  }

}
