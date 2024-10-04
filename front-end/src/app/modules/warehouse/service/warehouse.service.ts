import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {TokenStorageService} from '../../login/service/token-storage.service';
import {InventoryDto} from '../models/inventory-dto';
import {ImportVoucher} from '../models/import-voucher';
import {ExportVoucherDto} from '../models/export-voucher-dto';
import {BehaviorSubject} from 'rxjs';
import {ReturnVoucher} from '../components/return-voucher-list/return-voucher-list.component';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  API_URL = `${environment.apiUrl}/warehouse`;
  private dataSubject = new BehaviorSubject<any[]>([]);
  public data$ = this.dataSubject.asObservable();

  constructor(private httpClient: HttpClient,
              private tokenStorageService: TokenStorageService) {
  }

  getInventory(productTypeId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    if (productTypeId != null) {
      params = params.append('productTypeId', String(productTypeId));
    }
    return this.httpClient.get<InventoryDto[]>(`${this.API_URL}/inventory`, {headers, params});
  }

  getInventoryByProductId(productId: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<number>(`${this.API_URL}/inventory/productId/${productId}`, {headers});
  }

  getImportVouchers(year: number, month: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    if (year != null) {
      params = params.append('year', String(year));
    }
    if (month != null) {
      params = params.append('month', String(month));
    }
    return this.httpClient.get<ImportVoucher[]>(`${this.API_URL}/import-voucher`, {headers, params});
  }

  getExportVouchers(year: number, month: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    if (year != null) {
      params = params.append('year', String(year));
    }
    if (month != null) {
      params = params.append('month', String(month));
    }
    return this.httpClient.get<ExportVoucherDto[]>(`${this.API_URL}/export-voucher`, {headers, params});
  }

  getReturnVouchers(year: number, month: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    if (year != null) {
      params = params.append('year', String(year));
    }
    if (month != null) {
      params = params.append('month', String(month));
    }
    return this.httpClient.get<ReturnVoucher[]>(`${this.API_URL}/return-voucher`, {headers, params});
  }

  deleteImportVoucher(voucherCode: string) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.delete<any>(`${this.API_URL}/import-voucher/${voucherCode}`, {headers});
  }

  deleteExportVoucher(voucherCode: string) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.delete<any>(`${this.API_URL}/export-voucher/${voucherCode}`, {headers});
  }

  deleteReturnVoucher(voucherCode: string) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.delete<any>(`${this.API_URL}/return-voucher/${voucherCode}`, {headers});
  }

  getLastImportCode() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<string>(this.API_URL + '/import-voucher/last-code', {headers});
  }

  getLastExportCode() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<string>(this.API_URL + '/export-voucher/last-code', {headers});
  }

  getLastReturnCode() {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<string>(this.API_URL + '/return-voucher/last-code', {headers});
  }

  fetchDataImport(year: number, month: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    if (year != null) {
      params = params.append('year', String(year));
    }
    if (month != null) {
      params = params.append('month', String(month));
    }
    return this.httpClient.get<ImportVoucher[]>(`${this.API_URL}/import-voucher`, {headers, params}).subscribe(data => {
      this.dataSubject.next(data);
    });
  }

  fetchDataExport(year: number, month: number) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    if (year != null) {
      params = params.append('year', String(year));
    }
    if (month != null) {
      params = params.append('month', String(month));
    }
    return this.httpClient.get<ImportVoucher[]>(`${this.API_URL}/export-voucher`, {headers, params}).subscribe(data => {
      this.dataSubject.next(data);
    });
  }
}
