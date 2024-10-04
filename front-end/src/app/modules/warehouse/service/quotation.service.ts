import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TokenStorageService} from '../../login/service/token-storage.service';
import {QuotationDto} from '../models/quotation-dto';
import {QuotationDetail} from '../models/quotation-detail';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private API_URL = environment.apiUrl + '/quotation';
  private dataSubject = new BehaviorSubject<any[]>([]);
  public data$ = this.dataSubject.asObservable();

  constructor(private httpClient: HttpClient,
              private tokenStorageService: TokenStorageService) {
  }

  getQuotations() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<QuotationDto[]>(`${this.API_URL}`, {headers});
  }

  getQuotationsByCustomerTypeId(id: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<QuotationDto[]>(`${this.API_URL}/customerType/` + id, {headers});
  }

  getAllProductWithPriceAndInventoryByCustomerId(customerId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<ProductWithInventoryAndPrice[]>(`${this.API_URL}/product-with-price-inventory/` + customerId, {headers});
  }

  getAllProductWithPriceAndInventoryByCustomerTypeId(customerTypeId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // tslint:disable-next-line:max-line-length
    return this.httpClient.get<ProductWithInventoryAndPrice[]>(`${this.API_URL}/product-with-price-inventory/customerType/` + customerTypeId, {headers});
  }
  deleteById(id: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.delete<any>(`${this.API_URL}/${id}`, {headers});
  }

  getQuotationsByProductId(productId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<QuotationDetail[]>(`${this.API_URL}/product/${productId}`, {headers});
  }

  fetchData() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.httpClient.get<QuotationDto[]>(`${this.API_URL}`, {headers}).subscribe(data => {
      this.dataSubject.next(data);
    });
  }
}

export interface ProductWithInventoryAndPrice {
  productId: number;
  productName: string;
  packingSpecifications: number;
  barcode: string;
  unit: string;
  totalRemainingQuantity: number;
  unitPrice: number;
}
