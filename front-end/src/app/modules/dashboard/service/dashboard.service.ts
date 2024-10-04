import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TokenStorageService} from '../../login/service/token-storage.service';
import {Customer} from '../../account-receivable/models/customer';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  API_URL = `${environment.apiUrl}/dashboard`;

  constructor(private httpClient: HttpClient,
              private tokenStorageService: TokenStorageService) {
  }

  getIndicator() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<number[]>(`${this.API_URL}/indicators`, {headers});
  }

  getMonthlyRevenue() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<number[]>(`${this.API_URL}/monthly-revenue`, {headers});
  }

  getMonthlyCash() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<number[]>(`${this.API_URL}/monthly-cash`, {headers});
  }

  getDailyRevenue() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<any[]>(`${this.API_URL}/daily-revenue`, {headers});
  }

  getImportValue() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<any[]>(`${this.API_URL}/import-value`, {headers});
  }
}
