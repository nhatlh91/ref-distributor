import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomerType} from '../../models/customer-type';
import {CustomerService} from '../../services/customer.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-customer-create',
  templateUrl: './dialog-customer-create.component.html',
})
export class DialogCustomerCreateComponent implements OnInit {
  rf: FormGroup;
  customerTypes?: CustomerType[];
  codes?: string[];
  isLoading = false;

  constructor(private customerService: CustomerService) {
  }

  ngOnInit(): void {
    this.customerService.getCustomerTypes().toPromise().then(data => {
      this.customerTypes = data;
    }, () => {
      alert('Có lỗi trong quá trình truy vấn dữ liệu. Xin thử lại');
    });
    this.rf = new FormGroup({
      customerName: new FormControl('', [Validators.required, Validators.maxLength(250)]),
      customerTypeId: new FormControl(''),
      customerType: new FormControl(''),
      address: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^0[0-9]*')]),
    });
  }

  async save() {
    this.isLoading = true;
    for (const type of this.customerTypes) {
      if (type.customerTypeId === this.rf.controls.customerTypeId.value) {
        this.rf.controls.customerType.setValue(type.customerType);
        break;
      }
    }
    try {
      await this.customerService.saveCustomer(this.rf.value).toPromise();
      await Swal.fire({title: `Đã lưu`, icon: 'success', timer: 1000, showConfirmButton: false});
      this.customerService.fetchData();
    } catch (error) {
      this.isLoading = false;
      console.log(error);
      await Swal.fire({title: `Lỗi ${error.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
    }
  }
}
