import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/user';
import { Router } from '@angular/router';
import { Constants } from '../../config/constant';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { checkProfanity } from '../../../words/wordValidator';


declare const google: any;
declare var grecaptcha: any;

@Component({
  selector: 'app-register',
  imports: [HttpClientModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  name: string = '';
  email: string = ''
  password: string = '';
  confirmPassword: string = '';
  captchaToken: string = '';
      constructor(private http: HttpClient,
    private authService: AuthService, private router: Router,  private constants: Constants) { }


  ngOnInit() {

  }
  register() {
  const textCheck = checkProfanity(this.name);
  if (textCheck.isBad) {
    this.showError('ชื่อผู้ใช้มีคำที่ไม่เหมาะสม');
    return;
  }
    if (this.name.length > 25) {
    this.showError('ชื่อผู้ใช้ต้องไม่เกิน 25 ตัวอักษร');
    return;
  }
  if (!this.name.trim() || !this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
    this.showError('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  if (this.password !== this.confirmPassword) {
    this.showError('รหัสผ่านไม่ตรงกัน');
    return;
  }
  if (!this.captchaToken) {
    this.showRequireCaptcha();
    return;
  }
    let anonymousName = this.name;
    if (this.name.length > 2) {
      anonymousName = this.name[0] + '*'.repeat(this.name.length - 2) + this.name[this.name.length - 1];
    } else if (this.name.length === 2) {
      anonymousName = this.name[0] + '*';
    }

    const userData = {
      name: this.name,
      email: this.email,
      password: this.password,
      anonymous_name: anonymousName,
      profile: null,
      type: 1
    };

  this.http.post(`${this.constants.API}/user/register`, userData)
    .subscribe({
      next: (response: any) => {
        if (response.status === false) {
          this.showError(response.message || 'สมัครสมาชิกไม่สำเร็จ');
          return;
        }
        this.showSuccess(response.message || 'สมัครสมาชิกสำเร็จ')
          .then(() => {
            grecaptcha.reset();
            this.loadRecaptcha();
            this.router.navigate(['/login']);
          });
      },
      error: (err) => {
        this.showError(err.error?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }
    });
}
  ngAfterViewInit() {
    this.waitForGrecaptcha();
  }

  private waitForGrecaptcha(attempts = 0) {
    if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
      grecaptcha.ready(() => {
        this.loadRecaptcha();
      });
    } else if (attempts < 10) {
      setTimeout(() => this.waitForGrecaptcha(attempts + 1), 500);
    }
  }
  googleRegister() {

  if (!this.captchaToken) {
    this.showRequireCaptcha();
    return;
  }

  const client = google.accounts.oauth2.initTokenClient({
    client_id: environment.googleClientId,
    scope: 'openid email profile',

    callback: (res: any) => {

      if (!res?.access_token) {
        this.showError('ไม่สามารถรับ Access Token ได้');
        return;
      }

      this.http.post(`${this.constants.API}/google/register/google`, {
        token: res.access_token,
        captcha: this.captchaToken
      })
      .subscribe({

        next: (response: any) => {

          if (response.status === false) {
            this.showError(response.message || 'สมัครสมาชิกไม่สำเร็จ');
            return;
          }

          this.showSuccess(response.message || 'สมัครสมาชิกสำเร็จ')
            .then(() => {
              grecaptcha.reset();
              this.loadRecaptcha();
              this.router.navigate(['/login']);
            });
        },

        error: (err) => {
          this.showError(err.error?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
        }

      });
    }
  });

  client.requestAccessToken();
}
  loadRecaptcha() {
    const container = document.getElementById('recaptcha-container');
    if (container && typeof grecaptcha !== 'undefined') {
      try {
        grecaptcha.render('recaptcha-container', {
          'sitekey': environment.reCaptchaSitekey,
          'callback': (token: any) => {
            this.captchaToken = token;
          },
          'expired-callback': () => {
            this.captchaToken = '';
          },
          'error-callback': () => {
             console.error('reCAPTCHA error occurred');
          }
        });
      } catch (e) {
        console.warn('reCAPTCHA render failed or already rendered:', e);
      }
    }
  }
    back(){
     history.back();
  }
    private showError(message: string) {
    Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">${message}</div>`,
      icon: 'error',
      confirmButtonText: `<div style="font-size:1.2rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">ตกลง</div>`,
      confirmButtonColor: '#000000',
      color: '#000000'
    });
  }
  
  private showSuccess(message: string) {
    return Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">${message}</div>`,
      icon: 'success',
      confirmButtonText: `<div style="font-size:1.2rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">ตกลง</div>`,
      confirmButtonColor: '#28D16F',
      color: '#000000'
    });
  }
  
  private showRequireCaptcha() {
    this.showError('กรุณาทำ reCAPTCHA ก่อน');
  }
}
