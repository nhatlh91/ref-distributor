import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {TokenStorageService} from './modules/login/service/token-storage.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../environments/environment';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = environment.secretKey;

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router,
              private snackBar: MatSnackBar,
              private tokenStorageService: TokenStorageService) {
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const requiredRoles: string[] = next.data.roles;

    const userRole: string = this.tokenStorageService.getRole();
    const decryptedBytes = CryptoJS.AES.decrypt(userRole, SECRET_KEY);
    const decryptedRole = decryptedBytes.toString(CryptoJS.enc.Utf8);

    const hasRequiredRole = requiredRoles.some(role => decryptedRole.includes(role));

    if (hasRequiredRole) {
      return true;
    } else {
      this.snackBar.open('Tài khoản của bạn không thực hiện được thao tác này!', 'x', {
        duration: 5000, // (ms)
        horizontalPosition: 'center', // (start, center, end)
        verticalPosition: 'top', // (top, bottom)
      });
      this.router.navigate(['/dashboard']);
      return false;
    }
  }

}
