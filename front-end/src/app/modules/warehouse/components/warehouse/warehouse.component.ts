import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit {
  isHidden = false;

  constructor() { }

  ngOnInit(): void {
  }

  toggleSidebar() {
    this.isHidden = !this.isHidden;
  }
}
