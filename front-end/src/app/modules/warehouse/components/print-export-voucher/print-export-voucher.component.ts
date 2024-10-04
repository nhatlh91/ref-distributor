import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormBuilder} from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {ProductService} from '../../service/product.service';
import {CustomerService} from '../../../account-receivable/services/customer.service';
import {VoucherDetail, VoucherService} from '../../service/voucher.service';
import {Customer} from '../../../account-receivable/models/customer';
import {Product} from '../../models/product';

@Component({
  selector: 'app-print-export-voucher',
  templateUrl: './print-export-voucher.component.html',
  styleUrls: ['./print-export-voucher.component.css']
})
export class PrintExportVoucherComponent implements OnInit {
  day: string;
  month: string;
  year: number;
  createBy: string;
  voucherCode: string;
  postingDate: string;
  description: string;
  totalAmount: number;
  customerId: number;
  next: any;
  details: VoucherDetail[];
  customer: Customer;
  products: Product[];
  private mapProductName: Map<number, string>;
  private mapBarcode: Map<number, string>;
  private mapUnit: Map<number, string>;
  private mapPackingSpecifications: Map<number, number>;

  @ViewChild('htmlContent') htmlContent!: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public code: string,
              private fb: FormBuilder,
              private productService: ProductService,
              private customerService: CustomerService,
              private voucherService: VoucherService,
  ) {
    console.log('Received data:', code);
  }

  async ngOnInit(): Promise<void> {
    await this.getProducts();

    const next = await this.voucherService.getExportVoucherById(this.code).toPromise();
    this.createBy = next.createdBy;
    this.voucherCode = next.voucherCode;
    this.postingDate = next.postingDate;
    this.totalAmount = next.totalAmount;
    this.description = next.description;
    this.next = next;

    this.customer = await this.customerService.getCustomerById(next.customerId).toPromise();
    this.details = await this.voucherService.getVoucherDetails(this.code).toPromise();
    this.total();
    this.getDate();
  }

  total() {
    return this.details.reduce((acc, item) => {
      return acc + (item.quantity * item.unitPrice);
    }, 0);
  }

  getDate() {
    const [day, month, year] = this.postingDate.split('-');
    this.year = parseInt(year, 10);
    this.month = String(parseInt(month, 10)).padStart(2, '0');
    this.day = String(parseInt(day, 10)).padStart(2, '0');
  }

  async getProducts() {
    try {
      this.products = await this.productService.getProducts().toPromise();
      this.mapProductName = new Map(
        this.products.map(item => [item.productId, item.productName])
      );
      this.mapPackingSpecifications = new Map(
        this.products.map(item => [item.productId, item.packingSpecifications])
      );
      this.mapUnit = new Map(
        this.products.map(item => [item.productId, item.unit])
      );
    } catch (e) {
    }
  }

  getProductName(productId: number): string {
    return this.mapProductName.get(productId);
  }

  getPackingSpecifications(productId: number): number {
    return this.mapPackingSpecifications.get(productId);
  }

  get totalQuantityPerPack(): number {
    return this.details.reduce((acc, item) =>
      acc + parseInt((item.quantity / this.getPackingSpecifications(item.productId)).toString(), 0), 0);
  }

  getUnit(productId: number): string {
    return this.mapUnit.get(productId);
  }

  parseIntCW(num: number) {
    return parseInt(num.toString(), 0);
  }

  onPrintClicked() {
    // const element = document.getElementById('content') as HTMLElement;
    html2canvas(this.htmlContent.nativeElement, {
      scale: 5,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const width = pdfWidth;
      const height = width / ratio;

      const margin = 5;
      const marginLeft = margin;
      const marginRight = pdfWidth - margin;
      const marginTop = margin;
      const marginBottom = pdfHeight - margin;

      // pdf.setLineWidth(0.1);
      pdf.setDrawColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.rect(marginLeft, marginTop, pdfWidth - 2 * margin, pdfHeight - 2 * margin);
      pdf.addImage(imgData, 'PNG', marginLeft, marginTop, width - 2 * margin, height - 2 * margin);

      const pdfOutput = pdf.output('bloburl');
      // pdf.save('my-document.pdf');
      const newWindow = window.open();
      if (newWindow) {
        // @ts-ignore
        newWindow.location.href = pdfOutput;
      } else {
        alert('Please allow popups for this website');
      }
    });
  }
}
