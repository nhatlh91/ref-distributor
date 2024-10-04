import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {CustomerService} from '../../services/customer.service';
import {Customer} from '../../models/customer';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-update-receivables',
  templateUrl: './dialog-update-receivables.component.html'
})
export class DialogUpdateReceivablesComponent implements OnInit {
  customer?: Customer;
  rf?: FormGroup;
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public id: number,
              private customerService: CustomerService) {
  }

  ngOnInit(): void {
    this.customerService.getCustomerById(this.id).toPromise().then(data => {
        this.customer = data;
        this.rf = new FormGroup({
          customerId: new FormControl(data.customerId),
          amount: new FormControl('', [Validators.required, Validators.pattern('[0-9]*'), Validators.max(Number(data.accountsReceivable))]),
          typeOfTransaction: new FormControl('payment'),
        });
      }, () => alert('Có lỗi phát sinh trong quá trình truy vấn dữ liệu, xin thử lại')
    );
  }

  async save() {
    this.isLoading = true;
    try {
      await this.customerService.saveReceipt(this.rf.value).toPromise();
      await Swal.fire({title: `Đã lưu`, icon: 'success', timer: 1000, showConfirmButton: false});
      this.customerService.fetchData();
    } catch (error) {
      console.log(error);
      this.isLoading = false;
      await Swal.fire({title: `Lỗi ${error.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
    }
  }
}
