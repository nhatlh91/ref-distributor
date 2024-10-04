import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {Product} from '../../models/product';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ProductService} from '../../service/product.service';
import {VoucherDetail, VoucherService} from '../../service/voucher.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {ReturnVoucher} from '../return-voucher-list/return-voucher-list.component';

@Component({
  selector: 'app-print-return-voucher',
  templateUrl: './print-return-voucher.component.html',
  styleUrls: ['./print-return-voucher.component.css']
})
export class PrintReturnVoucherComponent implements OnInit {
  day: string;
  month: string;
  year: number;
  next: any;
  details: VoucherDetail[];
  products: Product[];
  private mapProductName: Map<number, string>;
  private mapPackingSpecifications: Map<number, number>;
  private mapUnit: Map<number, string>;

  @ViewChild('htmlContent') htmlContent!: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public voucher: ReturnVoucher,
              private productService: ProductService,
              private voucherService: VoucherService,
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.getProducts();
    this.details = await this.voucherService.getVoucherDetails(this.voucher.voucherCode).toPromise();
    this.getDate();
  }

  getDate() {
    const [day, month, year] = this.voucher.postingDate.toString().split('-');
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

  getUnit(productId: number): string {
    return this.mapUnit.get(productId);
  }

  getPackingSpecifications(productId: number): number {
    return this.mapPackingSpecifications.get(productId);
  }

  get totalQuantityPerPack(): number {
    return this.details.reduce((acc, item) => acc + (item.quantity / this.getPackingSpecifications(item.productId)), 0);
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
