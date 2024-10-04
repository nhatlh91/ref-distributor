import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {TokenStorageService} from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _API_URL = environment.apiUrl + '/auth';

  constructor(private httpClient: HttpClient,
              private tokenStorageService: TokenStorageService) {
  }

  login(obj) {
    return this.httpClient.post<any>(this._API_URL + '/authenticate', {
      phone: obj.phone,
      password: obj.password
    });
  }

  signOut(): Observable<any> {
    window.localStorage.clear();
    window.sessionStorage.clear();
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.post(this._API_URL + '/logout', {headers});
  }

}
