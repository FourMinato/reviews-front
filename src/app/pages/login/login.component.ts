import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/user';
import { Router } from '@angular/router';
import { Constants } from '../../config/constant';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
interface ApiResponse<T> {
  status: boolean;
  result: T;
  message: string;
}

declare const google: any;
declare var grecaptcha: any;

@Component({
  selector: 'app-login',
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  captchaToken: string = '';
  isForgotPasswordOpen: boolean = false;
  forgotPasswordStep: number = 1;

  resetEmail: string = '';
  otpCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  resetToken: string = '';
  isOtpLoading: boolean = false;
  constructor(private http: HttpClient,
    private authService: AuthService, private router: Router, private constants: Constants) { }

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
  ngOnInit() {

  }

  login() {
    if (!this.email.trim() || !this.password.trim()) {
      this.showError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (!this.captchaToken) {
      this.showRequireCaptcha();
      return;
    }
    const userData = {
      email: this.email,
      password: this.password,
      captcha: this.captchaToken
    };

    this.http.post<ApiResponse<any>>(`${this.constants.API}/user/login`, userData)
      .subscribe({
        next: (response) => {
          if (!response.status) {
            this.showError(response.message || 'เข้าสู่ระบบไม่สำเร็จ');
            return;
          }
          this.authService.setUser(response);
          this.showSuccess(response.message || 'เข้าสู่ระบบสำเร็จ')
            .then(() => {
              grecaptcha.reset();
              this.loadRecaptcha();
              this.router.navigateByUrl('/');
            });
        },

        error: (err) => {
          this.showError(err.error?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
        }
      });
  }
  googleLogin() {
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

        this.http.post(`${this.constants.API}/google/login/google`, {
          token: res.access_token,
          captcha: this.captchaToken
        })
          .subscribe({
            next: (response: any) => {

              if (!response.success) {
                this.showError(response.error || 'เข้าสู่ระบบไม่สำเร็จ');
                return;
              }

              this.authService.setUser(response.user);

              this.showSuccess(response.message || 'เข้าสู่ระบบสำเร็จ')
                .then(() => {
                  grecaptcha.reset();
                  this.loadRecaptcha();
                  this.router.navigateByUrl('/');
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
        // Clear previous instances safely if needed, but grecaptcha.render handles this 
        // better if we don't manually mess with innerHTML unless necessary.
        // If we must clear: container.innerHTML = '';
        
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
        // If already rendered, we might need to reset instead
        console.warn('reCAPTCHA render failed or already rendered:', e);
      }
    }
  }
  back() {
    history.back();
  }
  // เปิด-ปิด Popup
  openForgotPasswordPopup() {
    this.isForgotPasswordOpen = true;
    this.forgotPasswordStep = 1; // รีเซ็ตกลับไปหน้าแรกเสมอเมื่อเปิดใหม่
    this.clearForgotPasswordForm();
  }

  closeForgotPasswordPopup() {
    this.isForgotPasswordOpen = false;
  }

  clearForgotPasswordForm() {
    this.resetEmail = '';
    this.otpCode = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  // ลอจิกการกดปุ่มต่างๆ ในแต่ละ Step
  requestOtp() {
    if (!this.resetEmail) {
      this.showError('กรุณากรอกอีเมลของคุณ');
      return;
    }
    this.isOtpLoading = true;
    this.http.get<any>(`${this.constants.API}/user/checkemail`, {
      params: { email: this.resetEmail }
    })
      .subscribe({
        next: (res) => {
          if (res.status === true) {
            // ยิง API ขอ OTP
            this.http.post(`${this.constants.API}/user/request-otp`, {
              email: this.resetEmail
            }).subscribe({
              next: () => {
                this.isOtpLoading = false;
                this.forgotPasswordStep = 2; // ไปหน้ากรอก OTP
              },
              error: (err) => {
                this.isOtpLoading = false;
                if (err.status === 429) {
                  this.showError('ส่ง OTP ถี่เกินไป กรุณารอสักครู่แล้วลองใหม่');
                } else {
                  this.showError(err.error?.message || 'ไม่สามารถส่ง OTP ได้');
                }
              }
            });
          } else {
            this.isOtpLoading = false;
            this.showError('อีเมล์นี้ไม่มีในระบบ');
            return;
          }
        },
        error: (err) => {
          this.isOtpLoading = false;
          this.showError(err.error?.message || 'เกิดข้อผิดพลาดในการตรวจสอบอีเมล');
        }
      });

  }

  verifyOtp() {
    if (!this.otpCode) {
      this.showError('กรุณากรอก OTP');
      return;
    }
    if (this.otpCode.length !== 6) {
      this.showError('กรุณากรอก OTP 6 หลักให้ครบถ้วน');
      return;
    }
    this.http.post<any>(`${this.constants.API}/user/verify-otp`, {
      email: this.resetEmail,
      otp: this.otpCode
    }).subscribe({
      next: (res) => {
        if (res.status === true) {
          this.resetToken = res.resetToken; // เก็บ token ไว้ใช้ step ถัดไป
          this.forgotPasswordStep = 3;
        } else {
          this.showError(res.message);
        }
      },
      error: (err) => {
        this.showError(err.error.message);
      }
    });
  }

resetPassword() {
  if (!this.newPassword || !this.confirmPassword) {
    this.showError('กรุณากรอกรหัสผ่านให้ครบ');
    return;
  }
  if (this.newPassword !== this.confirmPassword) {
    this.showError('รหัสผ่านไม่ตรงกัน');
    return;
  }
  if (this.newPassword.length < 6) {
    this.showError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    return;
  }

  this.http.post<any>(`${this.constants.API}/user/reset-password`, {
    resetToken: this.resetToken,
    newPassword: this.newPassword
  }).subscribe({
    next: (res) => {
      if (res.status === true) {
        this.showSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
        this.closeForgotPasswordPopup();
      } else {
        this.showError(res.message);
      }
    },
    error: (err) => {
      this.showError(err.error.message);
    }
  });
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
