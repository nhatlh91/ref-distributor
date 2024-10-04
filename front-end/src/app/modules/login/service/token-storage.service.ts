import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import {environment} from '../../../../environments/environment';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'name';
const ROLE_KEY = 'role';
const CRE_KEY = 'cre';
const SECRET_KEY = environment.secretKey;

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() {
  }

  public getToken(): string {
    if (localStorage.getItem(ACCESS_TOKEN_KEY) !== null) {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } else {
      return sessionStorage.getItem(ACCESS_TOKEN_KEY);
    }
  }

  getRole() {
    if (localStorage.getItem(ROLE_KEY) !== null) {
      return JSON.parse(localStorage.getItem(ROLE_KEY));
    } else {
      return JSON.parse(sessionStorage.getItem(ROLE_KEY));
    }
  }

  public saveAccessTokenLocal(token: string) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  public saveRefreshTokenLocal(token: string) {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  public saveUserLocal(user) {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public saveRoleLocal(role) {
    window.localStorage.removeItem(ROLE_KEY);
    window.localStorage.setItem(ROLE_KEY, JSON.stringify(role));
  }

  public saveCreLocal(cre) {
    window.localStorage.removeItem(CRE_KEY);
    window.localStorage.setItem(CRE_KEY, JSON.stringify(cre));
  }

  public getCreateDate(): string {
    const name = JSON.parse(localStorage.getItem(CRE_KEY));
    if (name == null) {
      return 'Unauthorized';
    }
    const decryptedBytes = CryptoJS.AES.decrypt(name, SECRET_KEY);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  }

  getDecryptedName() {
    const name = JSON.parse(localStorage.getItem(USER_KEY));
    if (name == null) {
      return 'Unauthorized';
    }
    const decryptedBytes = CryptoJS.AES.decrypt(name, SECRET_KEY);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  }

  getDecryptedRole() {
    const role = JSON.parse(localStorage.getItem(ROLE_KEY));
    if (role == null) {
      return 'Unauthorized';
    }
    const decryptedBytes = CryptoJS.AES.decrypt(role, SECRET_KEY);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  }


}
