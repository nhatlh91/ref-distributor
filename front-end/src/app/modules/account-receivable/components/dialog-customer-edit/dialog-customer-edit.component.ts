import {Component, Inject, OnInit, OnDestroy} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomerType} from '../../models/customer-type';
import {CustomerService} from '../../services/customer.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-customer-edit',
  templateUrl: './dialog-customer-edit.component.html'
})
export class DialogCustomerEditComponent implements OnInit, OnDestroy {
  rf: FormGroup;
  customerTypes?: CustomerType[];
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public id: number,
              private customerService: CustomerService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    try {
      this.customerService.getCustomerTypes().toPromise().then(data => this.customerTypes = data);
      this.customerService.getCustomerById(this.id).toPromise().then(data => {
        this.rf = new FormGroup({
          customerId: new FormControl(this.id),
          accountsReceivable: new FormControl(data.accountsReceivable),
          customerName: new FormControl(data.customerName, [Validators.required, Validators.maxLength(250)]),
          customerTypeId: new FormControl(data.customerTypeId),
          customerType: new FormControl(data.customerType),
          address: new FormControl(data.address, [Validators.required, Validators.maxLength(1000)]),
          phone: new FormControl(data.phone, [Validators.required, Validators.pattern('^0[0-9]*')]),
        });
      });
    } catch (e) {
      console.log(e);
      alert('Có lỗi trong quá trình truy vấn dữ liệu. Xin thử lại');
    }
  }

  ngOnDestroy() {
    this.customerService.fetchData();
  }

  save() {
    this.isLoading = true;
    for (const type of this.customerTypes) {
      if (type.customerTypeId === this.rf.controls.customerTypeId.value) {
        this.rf.controls.customerType.setValue(type.customerType);
        break;
      }
    }
    this.customerService.saveCustomer(this.rf.value).toPromise().then(() => {
      this.dialog.closeAll();
    }, error => () => {
      console.log(error);
      this.isLoading = false;
      alert('Đã có lỗi xảy ra trong quá trình lưu dữ liệu. Xin thử lại');
    });
  }

}
