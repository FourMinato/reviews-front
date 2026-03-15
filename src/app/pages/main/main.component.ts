import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, QueryList, ViewChildren, } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';
@Component({
  selector: 'app-main',
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  subcode: string = '';
  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
  hasUnreadMessages: boolean = false;
  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    const uid = this.authService.getUser().uid;

    this.checkAdmin();
    this.getDotNotifications(uid);
  }
  checkAdmin() {
    const user = this.authService.getUser();
    if (user.type === 0) {
      this.isAdmin = true;
    }
  }
  getDotNotifications(userID: string) {
    this.http.get<any>(`${this.constants.API}/message/notifications/${userID}/has-unread`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.hasUnreadMessages = res.has_unread;
          }
        },
      });
  }
    login() {
    this.router.navigate(['/login']);
  }
  contact() {
    this.router.navigate(['/contact']);
  }
  profile() {
    this.router.navigate(['/profile']);
  }
  admin() {
    this.router.navigate(['/admin/dashboard']);
  }
  question() {
    this.router.navigate(['/post/question']);
  }
  favorite() {
    this.router.navigate(['/favorite']);
  }
  message() {
    this.router.navigate(['/message']);
  }

  @ViewChildren('dataSelect') checkboxes!: QueryList<ElementRef>;
  select() {

    const selectedCate: string[] = [];
    this.checkboxes.forEach((checkbox: ElementRef) => {
      if (checkbox.nativeElement.checked) {
        selectedCate.push(checkbox.nativeElement.value);
      }
    });
    if (selectedCate.length === 0) {
      this.showError('เลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่');
      return;
    }
    this.router.navigate(['/subjects'], {
      queryParams: {
        categories: selectedCate.join(',')
      }
    });
  }
  search(subcode: string) {
    if (!subcode || subcode.trim() === '') {
       this.showError('กรุณากรอกรหัสวิชาหรือชื่อวิชา');
      return;
    } else {
      this.router.navigate(['/search'], {
        state: { subcode: subcode.trim() }
      });
    }
  }

  isMenuOpen: boolean = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
    logout() {
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการออกจากระบบ?</div>',
      icon: 'warning',
      confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
      confirmButtonColor: '#ff4d4d',
      color: '#000000',
      showCancelButton: true,
      cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
      cancelButtonColor: '#000000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        window.location.reload();
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
}
