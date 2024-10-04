import {Component, OnInit} from '@angular/core';
import {DashboardService} from '../../service/dashboard.service';
import {TokenStorageService} from '../../../login/service/token-storage.service';
import {AuthService} from '../../../login/service/auth.service';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  monthlyRevenueBackground: string[] = [];
  dailyRevenueBackground: string[] = [];
  isHidden = false;
  monthlyRevenue: number[] = [];

  inventory = 0;
  receivables = 0;
  revenueOfYear = 0;
  moneyOfYear = 0;

  dailyMoney = 0;
  dailyRevenues: any[] = [];
  dailyRevenue = 0;

  importValues: any[] = [];
  totalValues: number;
  monthlyCash: number[] = [];

  randomInt = () => Math.floor(Math.random() * 256);

  constructor(private dashboardService: DashboardService,
              private tokenStorageService: TokenStorageService,
              private authService: AuthService,
  ) {
  }

  async ngOnInit() {
    await this.checkToken();

    const data = await this.dashboardService.getIndicator().toPromise();
    this.inventory = data[0];
    this.receivables = data[1];
    this.dailyMoney = data[2];
    // this.revenues = data[3];

    await this.getMonthlyRevenue();
    await this.getMonthlyCash();
    this.monthlyRevenueChart();
    await this.getImportValue();
    await this.getDailyRevenue();
    this.dailyReceiveChart();



  }

  toggleSidebar() {
    this.isHidden = !this.isHidden;
  }

  checkToken() {
    const today = new Date().getTime();
    const cre = this.tokenStorageService.getCreateDate();
    const parsedDateString = cre.replace(/"/g, '').trim();
    const expDate = new Date(parsedDateString).getTime();
    if (today > expDate) {
      alert('Phiên đăng nhập kết thúc, vui lòng đăng nhập lại !');
      this.authService.signOut();
    }
  }

  async getMonthlyRevenue() {
    this.monthlyRevenue = await this.dashboardService.getMonthlyRevenue().toPromise();
    for (let i = 0; i < this.monthlyRevenue.length; i++) {
      this.monthlyRevenueBackground[i] = `rgb(${this.randomInt()}, ${this.randomInt()}, ${this.randomInt()})`;
    }
    this.monthlyRevenueChart();
    this.revenueOfYear = this.monthlyRevenue.reduce((total, item) => total + item, 0);
  }

  async getDailyRevenue() {
    const data = await this.dashboardService.getDailyRevenue().toPromise();
    // this.labelDaily = data.map(value => value.product_Type);
    this.dailyRevenue = data.reduce((total, item) => total + item.revenue, 0);
    this.dailyRevenues = data;

    for (let i = 0; i < data.length; i++) {
      this.dailyRevenueBackground[i] = `rgb(${this.randomInt()}, ${this.randomInt()}, ${this.randomInt()})`;
    }
    this.dailyReceiveChart();
  }

  async getImportValue() {
    this.importValues = await this.dashboardService.getImportValue().toPromise();
    this.totalValues = this.importValues.reduce((total, item) => total + item.amount, 0);
  }

  async getMonthlyCash() {
    this.monthlyCash = await this.dashboardService.getMonthlyCash().toPromise();
    this.moneyOfYear = this.monthlyCash.reduce((total, item) => total + item, 0);
  }

  monthlyRevenueChart() {
    const ctx = document.getElementById('incomeChart');
    // tslint:disable-next-line:no-unused-expression
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9',
          'Tháng 10', 'Tháng 11', 'Tháng 12'],
        datasets: [{
          label: 'Doanh thu hàng tháng',
          data: this.monthlyRevenue,
          backgroundColor: [
            'rgb(26, 188, 156)',
            'rgb(22, 160, 133)',
            'rgb(46, 204, 113)',
            'rgb(39, 174, 96)',
            'rgb(211, 84, 0)',
            'rgb(231, 76, 60)',
            'rgb(192, 57, 43)',
            'rgb(230, 126, 34)',
            'rgb(243, 156, 18)',
            'rgb(241, 196, 15)',
            'rgb(52, 152, 219)',
            'rgb(41, 128, 185)',
          ]
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              callback(value: number) {
                return value.toLocaleString();
              }
            }
          }]
        },
      }
    });
  }

  dailyReceiveChart() {
    const lineCtx = document.getElementById('lineChart');
    // tslint:disable-next-line:no-unused-expression
    new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9',
          'Tháng 10', 'Tháng 11', 'Tháng 12'],
        datasets: [{
          label: ['Tiền đã thu hàng tháng'],
          data: this.monthlyCash,
          backgroundColor: 'rgb(26, 188, 156)',
          borderColor: 'rgb(26, 188, 156)',
          fill: false
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              callback(value: number) {
                return value.toLocaleString();
              }
            }
          }]
        }
      }
    });
  }

}
