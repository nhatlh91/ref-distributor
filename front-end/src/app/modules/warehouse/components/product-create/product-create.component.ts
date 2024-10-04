import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ProductType} from '../../models/product-type';
import {ProductService} from '../../service/product.service';
import {Router} from '@angular/router';
import {CustomerService} from '../../../account-receivable/services/customer.service';
import {CustomerType} from '../../../account-receivable/models/customer-type';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css']
})
export class ProductCreateComponent implements OnInit {
  rf: FormGroup;
  productTypes?: ProductType[];
  customerTypes?: CustomerType[];
  codes?: string[];
  isLoading: boolean;

  constructor(private fb: FormBuilder,
              private productService: ProductService,
              private customerService: CustomerService) {
  }

  ngOnInit(): void {
    this.isLoading = false;
    this.productService.getProductTypes().toPromise().then(data => {
      this.productTypes = data;
    }, (error) => {
      error.status === 404 ?
        Swal.fire({text: `Không tìm thấy dữ liệu ngành hàng`, icon: 'info', showConfirmButton: false}) :
        Swal.fire({text: `Lỗi ${error.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
    });

    this.getCustomerTypes();

    this.rf = new FormGroup({
      quotations: this.fb.array([]),
      productName: new FormControl('', [Validators.required, Validators.maxLength(250)]),
      productTypeId: new FormControl(''),
      productType: new FormControl(''),
      unit: new FormControl('', [Validators.required, Validators.maxLength(250)]),
      barcode: new FormControl('', [Validators.pattern('[0-9]*')]),
      packingSpecifications: new FormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
    });
  }

  get quotations() {
    return (this.rf.get('quotations') as FormArray).controls;
  }

  addQuotation(item) {
    const newItem = this.fb.group({
      customerTypeId: [item.customerTypeId],
      customerTypeName: [item.customerType],
      unitPrice: [0, [Validators.min(0)]],
    });

    (this.rf.get('quotations') as FormArray).push(newItem);
  }

  async getCustomerTypes() {
    await this.customerService.getCustomerTypes().toPromise().then(value => {
      this.customerTypes = value;
    });

    if (this.customerTypes) {
      this.customerTypes.forEach((item: any) => {
        const itemFormGroup = this.addQuotation(item);
        // @ts-ignore
        if (itemFormGroup) {
          // @ts-ignore
          itemsFormArray.push(itemFormGroup);
        }
      });
    }
  }

  async save() {
    this.isLoading = true;
    for (const type of this.productTypes) {
      if (type.productTypeId === this.rf.controls.productTypeId.value) {
        this.rf.controls.productType.setValue(type.productType);
        break;
      }
    }
    try {
      await this.productService.saveProduct(this.rf.value).toPromise();
      await Swal.fire({text: `Lưu thành công`, icon: 'success', timer: 1000, showConfirmButton: false});
      this.ngOnInit();
    } catch (error) {
      console.log(error);
      this.isLoading = false;
      await Swal.fire({text: `Đã xảy ra lỗi ${error.status}`, icon: 'warning', showConfirmButton: false});
    }
  }
}
