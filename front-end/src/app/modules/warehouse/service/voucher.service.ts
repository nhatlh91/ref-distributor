import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {BehaviorSubject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TokenStorageService} from '../../login/service/token-storage.service';
import {ImportVoucher} from '../models/import-voucher';
import {ExportVoucher} from '../models/export-voucher';
import {ReturnVoucher} from '../components/return-voucher-list/return-voucher-list.component';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private _API_URL = environment.apiUrl + '/warehouse';
  private dataSubject = new BehaviorSubject<any[]>([]);
  public data$ = this.dataSubject.asObservable();

  constructor(private httpClient: HttpClient,
              private tokenStorageService: TokenStorageService) {
  }

  saveImport(importVoucher: ImportVoucher) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.post<ImportVoucher>(this._API_URL + '/import-voucher', importVoucher, {headers});
  }

  saveReturn(returnVoucher: ReturnVoucher) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.post<ImportVoucher>(this._API_URL + '/return-voucher', returnVoucher, {headers});
  }

  saveExport(exportVoucher: ExportVoucher) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.post<any>(this._API_URL + '/export-voucher', exportVoucher, {headers});
  }

  updateExport(exportVoucher: ExportVoucher) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.put<any>(this._API_URL + '/export-voucher', exportVoucher, {headers});
  }

  updateImport(importVoucher: ImportVoucher) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.put<any>(this._API_URL + '/import-voucher', importVoucher, {headers});
  }

  getImportVoucherById(code: string) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<ImportVoucher>(this._API_URL + '/import-voucher/' + code, {headers});
  }


  getExportVoucherById(code: string) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<ExportVoucher>(this._API_URL + '/export-voucher/' + code, {headers});
  }

  getVoucherDetails(code: string) {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<any>(this._API_URL + '/voucher-detail/' + code, {headers});
  }
}

export interface VoucherDetail {
  productId: number;
  quantity: number;
  unitPrice: number;
  voucherCode: string;
  voucherDetailId?: number;
  voucherType: string;
}
