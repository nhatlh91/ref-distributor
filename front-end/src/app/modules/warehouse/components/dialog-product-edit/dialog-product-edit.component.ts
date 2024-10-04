import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {ProductService} from '../../service/product.service';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ProductType} from '../../models/product-type';
import {CustomerService} from '../../../account-receivable/services/customer.service';
import {CustomerType} from '../../../account-receivable/models/customer-type';
import {QuotationService} from '../../service/quotation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-product-edit',
  templateUrl: './dialog-product-edit.component.html'
})
export class DialogProductEditComponent implements OnInit {
  rf?: FormGroup;
  productTypes?: ProductType[];
  customerTypes?: CustomerType[];
  typePriceMap?: Map<number, number> = new Map<number, number>();
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public id: number,
              private productService: ProductService,
              private customerService: CustomerService,
              private quotationService: QuotationService,
              private dialog: MatDialog,
              private fb: FormBuilder) {
  }

  async ngOnInit() {
    const quotationDetails = await this.quotationService.getQuotationsByProductId(this.id).toPromise();
    quotationDetails.forEach(item => {
      this.typePriceMap.set(item.customerTypeId, item.unitPrice);
    });
    this.productTypes = await this.productService.getProductTypes().toPromise();
    const product = await this.productService.getProductById(this.id).toPromise();
    this.rf = new FormGroup({
      quotations: this.fb.array([]),
      productId: new FormControl(product.productId),
      productName: new FormControl(product.productName, [Validators.required, Validators.maxLength(250)]),
      productTypeId: new FormControl(product.productTypeId),
      productType: new FormControl(product.productType),
      unit: new FormControl(product.unit, [Validators.required, Validators.maxLength(250)]),
      barcode: new FormControl(product.barcode, [Validators.pattern('[0-9]*')]),
      packingSpecifications: new FormControl(product.packingSpecifications, [Validators.required, Validators.pattern('[0-9]*')]),
    });
    this.getCustomerTypes();
  }

  get quotations() {
    return (this.rf.get('quotations') as FormArray).controls;
  }

  addQuotation(item) {
    const newItem = this.fb.group({
      customerTypeId: [item.customerTypeId],
      customerTypeName: [item.customerType],
      unitPrice: [this.typePriceMap.get(item.customerTypeId), [Validators.min(0)]],
    });
    (this.rf.get('quotations') as FormArray).push(newItem);
  }

  getCustomerTypes() {
    this.customerService.getCustomerTypes().toPromise().then(value => {
      this.customerTypes = value;
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
    });
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
      await this.productService.updateProduct(this.rf.value).toPromise();
      await Swal.fire({text: `Đã lưu`, icon: 'success', timer: 1000, showConfirmButton: false});
      this.dialog.closeAll();
      this.quotationService.fetchData();
    } catch (e) {
      console.log(e);
      this.isLoading = false;
      await Swal.fire({text: `Lỗi ${e.status}, xin thử lại`, icon: 'error', showConfirmButton: false});
    }
  }

}
