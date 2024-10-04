import {Component, OnInit} from '@angular/core';
import {CustomerService} from '../../services/customer.service';
import {CustomerType} from '../../models/customer-type';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {AuthService} from '../../../login/service/auth.service';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customer-type',
  templateUrl: './customer-type.component.html',
  styleUrls: ['./customer-type.component.css']
})
export class CustomerTypeComponent implements OnInit {
  dataSource = new MatTableDataSource<CustomerType>();
  displayedColumns: string[] = ['customerType'];
  rf?: FormGroup;
  showRf = false;

  constructor(private customerService: CustomerService,
              private authService: AuthService,
              private tokenStorageService: TokenStorageService,
  ) {
  }

  async ngOnInit() {
    this.checkToken();
    this.customerService.getCustomerTypes().toPromise().then(data => {
      this.dataSource.data = data;
    }, error => {
      error.status === 404 ?
        this.dataSource.data = [] :
        Swal.fire({text: `Lỗi ${error.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
    });
    this.rf = new FormGroup({
      customerType: new FormControl('', [Validators.required, Validators.maxLength(250)])
    });
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

  async save() {
    try {
      await this.customerService.saveCustomerType(this.rf.value).toPromise();
      await Swal.fire({text: `Đã lưu`, icon: 'success', timer: 1000, showConfirmButton: false});
      await this.ngOnInit();
      this.showRf = false;
    } catch (e) {
      await Swal.fire({text: `Lỗi ${e.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
    }
  }

}
