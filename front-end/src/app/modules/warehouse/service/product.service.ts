import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ProductType} from '../models/product-type';
import {TokenStorageService} from '../../login/service/token-storage.service';
import {Product} from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  API_URL = `${environment.apiUrl}/product`;

  constructor(private httpClient: HttpClient,
              private tokenStorageService: TokenStorageService) {
  }

  getProducts() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<Product[]>(`${this.API_URL}`, {headers});
  }

  getProductById(productId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<Product>(`${this.API_URL}/${productId}`, {headers});
  }

  getProductTypes() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<ProductType[]>(`${this.API_URL}/type`, {headers});
  }

  saveProductType(productType: ProductType) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.post<any>(`${this.API_URL}/type`, productType, {headers});
  }

  deleteProduct(productId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.delete<any>(`${this.API_URL}/${productId}`, {headers});
  }

  saveProduct(product: Product) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.post<any>(`${this.API_URL}`, product, {headers});
  }

  updateProduct(product: Product) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.put<any>(`${this.API_URL}`, product, {headers});
  }
}
