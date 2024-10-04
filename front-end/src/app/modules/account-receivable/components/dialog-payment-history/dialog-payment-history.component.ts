import {Component, Inject, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {CustomerService} from '../../services/customer.service';
import {Customer} from '../../models/customer';
import {MatTableDataSource} from '@angular/material/table';
import {Receipt} from '../../models/receipt';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {TokenStorageService} from '../../../login/service/token-storage.service';

@Component({
  selector: 'app-dialog-payment-history',
  templateUrl: './dialog-payment-history.component.html',
  styleUrls: ['../account-receivable/account-receivable.component.css']
})
export class DialogPaymentHistoryComponent implements OnInit, OnDestroy {
  customer?: Customer;
  dataSource = new MatTableDataSource<Receipt>();
  length?: number;
  displayedColumns: string[] = ['postingDate', 'amount', 'action'];
  decryptedRole: string;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(@Inject(MAT_DIALOG_DATA) public id: number,
              private customerService: CustomerService,
              private tokenStorageService: TokenStorageService) {
  }

  ngOnInit(): void {
    this.getRole();
    this.loadData();
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  getRole() {
    if (this.tokenStorageService.getRole()) {
      this.decryptedRole = this.tokenStorageService.getDecryptedRole();
    }
  }

  ngOnDestroy() {
    this.customerService.fetchData();
  }

  loadData() {
    this.customerService.getCustomerById(this.id).toPromise().then(data => this.customer = data);
    this.customerService.getReceiptsByCustomerId(this.id).toPromise().then(data => {
      this.dataSource.data = data;
      this.length = data.length;
    }, e => {
      if (e.status === 404) {
        this.length = undefined;
      }
    });
  }

  delete(receiptId: number) {
    this.customerService.deleteReceiptsById(receiptId).toPromise().then(() => {
        this.loadData();
      }
    );
  }
}
