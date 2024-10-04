import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TokenStorageService} from '../../service/token-storage.service';
import {HealthCheckService} from '../../service/health-check.service';
import * as CryptoJS from 'crypto-js';
import {AuthService} from '../../service/auth.service';
import {environment} from '../../../../../environments/environment';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';

const SECRET_KEY = environment.secretKey;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  rf?: FormGroup;
  isLoading = false;

  constructor(private authService: AuthService,
              private tokenStorageService: TokenStorageService,
              private healthCheckService: HealthCheckService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.healthCheckService.healthCheck().toPromise().catch(() => {
      Swal.fire({
        icon: 'error',
        html: `<p>Kết nối đến máy chủ hiện đang gặp sự cố.</p><p>Vui lòng kiểm tra lại</p>`,
        showConfirmButton: false,
        // timer: 1500
      });
    });
    this.rf = new FormGroup({
        phone: new FormControl('', [
          Validators.required
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.maxLength(32)
        ]),
      }
    );
  }

  createDate() {
    const today = new Date();
    today.setHours(today.getHours() + 24); // Thêm 24 giờ vào ngày hiện tại

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  onSubmit() {
    this.isLoading = true;
    this.authService.login(this.rf.value).subscribe(value => {
      const encryptedRole = CryptoJS.AES.encrypt(value.role, SECRET_KEY).toString();      // Mã hóa role
      const encryptedName = CryptoJS.AES.encrypt(value.name, SECRET_KEY).toString();      // Mã hóa name
      const encryptedDate = CryptoJS.AES.encrypt(this.createDate(), SECRET_KEY).toString();      // Mã hóa name

      sessionStorage.clear();
      this.tokenStorageService.saveAccessTokenLocal(value.access_token);
      this.tokenStorageService.saveRefreshTokenLocal(value.refresh_token);
      this.tokenStorageService.saveRoleLocal(encryptedRole);
      this.tokenStorageService.saveUserLocal(encryptedName);
      this.tokenStorageService.saveCreLocal(encryptedDate);

      this.router.navigateByUrl('/dashboard');
    }, error => {
      if (error.status === 401) {
        // Handle Unauthorized (401) error here
        this.rf.reset();
        this.isLoading = false;
        Swal.fire({text: `Thông tin đăng nhập chưa chính xác`, icon: 'warning', showConfirmButton: false});
      }
    });
  }

}
