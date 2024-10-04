import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  isHidden = false;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  toggleSidebar() {
    this.isHidden = !this.isHidden;
  }
}
