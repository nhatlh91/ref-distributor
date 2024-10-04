import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {TokenStorageService} from '../../login/service/token-storage.service';
import {TransactionDto} from '../model/transaction-dto';
import {SalesDto} from '../model/sales-dto';
import {SalesHistoryByCustomer} from '../components/sales-details-by-customer/sales-details-by-customer.component';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  API_URL = `${environment.apiUrl}/report`;

  constructor(private httpClient: HttpClient,
              private tokenStorageService: TokenStorageService) {
  }

  getTransactionDTO(customerId: number, year: number, month: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    params = params.append('customerId', String(customerId));
    if (year != null) {
      params = params.append('year', String(year));
    }
    if (month != null) {
      params = params.append('month', String(month));
    }
    return this.httpClient.get<TransactionDto[]>(`${this.API_URL}/transaction-history`, {headers, params});
  }

  getSalesDTO(year: number, month: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    if (year != null) {
      params = params.append('year', String(year));
    }
    if (month != null) {
      params = params.append('month', String(month));
    }
    return this.httpClient.get<SalesDto[]>(`${this.API_URL}/sales-record`, {headers, params});
  }

  getSalesHistoryByCustomer(year: number, month: number, customerId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    if (year != null) {
      params = params.append('year', String(year));
    }
    if (month != null) {
      params = params.append('month', String(month));
    }
    if (customerId != null) {
      params = params.append('customerId', String(customerId));
    }
    return this.httpClient.get<SalesHistoryByCustomer[]>(`${this.API_URL}/sales-history-by-customer`, {headers, params});
  }

  getItemHistory(productId: number, begin: string, end: string) {
    if (!productId || !begin || !end) {
      return;
    }
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    params = params.append('begin', begin);
    params = params.append('end', end);
    params = params.append('productId', String(productId));
    return this.httpClient.get<ItemTransHistory[]>(`${this.API_URL}/item-history`, {headers, params});
  }

}

export interface ItemTransHistory {
  postingDate: Date;
  voucherCode: string;
  typeOfTransaction: string;
  partner: string;
  quantity: number;
  totalAmount: number;
}
