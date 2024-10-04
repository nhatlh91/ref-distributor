import { Component, OnInit } from '@angular/core';
import {DialogCustomerCreateComponent} from '../dialog-customer-create/dialog-customer-create.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-account-receivable',
  templateUrl: './account-receivable.component.html',
  styleUrls: ['./account-receivable.component.css']
})
export class AccountReceivableComponent implements OnInit {
  isHidden = false;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  toggleSidebar() {
    this.isHidden = !this.isHidden;
  }

  customerCreate() {
    this.dialog.open(DialogCustomerCreateComponent, {
      width: '60%'
      // disableClose: true
    });
  }
}
