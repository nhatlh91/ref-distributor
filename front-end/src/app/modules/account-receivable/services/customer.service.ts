import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TokenStorageService} from '../../login/service/token-storage.service';
import {Customer} from '../models/customer';
import {CustomerType} from '../models/customer-type';
import {BehaviorSubject} from 'rxjs';
import {Receipt} from '../models/receipt';
import {CustomerDto} from '../models/customer-dto';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  API_URL = `${environment.apiUrl}/customer`;
  private dataSubject = new BehaviorSubject<any[]>([]);
  public data$ = this.dataSubject.asObservable();

  constructor(private httpClient: HttpClient,
              private tokenStorageService: TokenStorageService) {
  }

  getCustomers() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<Customer[]>(`${this.API_URL}`, {headers});
  }

  getCustomerDTOs() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<CustomerDto[]>(`${this.API_URL}/customer-dto`, {headers});
  }

  getCustomerById(customerId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<Customer>(`${this.API_URL}/${customerId}`, {headers});
  }

  getReceiptsByCustomerId(customerId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<Receipt[]>(`${this.API_URL}/receipt/${customerId}`, {headers});
  }

  deleteReceiptsById(receiptId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.delete<any>(`${this.API_URL}/receipt/${receiptId}`, {headers});
  }

  getCustomerTypes() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<CustomerType[]>(`${this.API_URL}/type`, {headers});
  }

  saveCustomerType(customerType: CustomerType) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.post<any>(`${this.API_URL}/type`, customerType, {headers});
  }

  deleteCustomer(customerId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.delete<any>(`${this.API_URL}/${customerId}`, {headers});
  }

  saveCustomer(customer: Customer) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.post<any>(`${this.API_URL}`, customer, {headers});
  }

  saveReceipt(receiptForm: any) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.post<any>(`${this.API_URL}/receipt`, receiptForm, {headers});
  }

  fetchData() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.httpClient.get<Customer[]>(`${this.API_URL}`, {headers}).subscribe(data => {
      this.dataSubject.next(data);
    });
  }
}

