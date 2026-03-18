import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

  allUsersList: any[] = [];
  usersList: any[] = [];
  userName: string = '';
  isAdmin: boolean = false;
  currentTab: string = 'all';

  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    this.getAllUsers();
    this.checkAdmin();
  }
  checkAdmin() {
    const type = this.authService.getUser().type;
    if (type == 1) {
      this.isAdmin = true;
    }
  }

getAllUsers() {
  this.http.get<any>(`${this.constants.API}/admin/get-users`)
    .subscribe({
      next: (res) => {
        if (res.status) {
          this.allUsersList = res.data.map((user: any) => ({
            ...user,
            profile: user.profile ? (user.profile.startsWith('http') ? user.profile : `${this.constants.API}/images/${user.profile}`) : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            role: user.type == 1 ? 'Admin' : user.type == 2 ? 'Suspended' : 'User'
          }));
          this.applyFilter();
        }
      },
      error: () => {}
    });
}
  editUser(userID: number) {
    this.router.navigate(['/admin/user/detail'], {
      state: { userID: userID }
    });
  }
  selectTab(tab: string) {
    this.currentTab = tab;
    this.applyFilter();
  }

  applyFilter() {
    let filtered = [...this.allUsersList];

    // Filter by Tab
    if (this.currentTab === 'admin') {
      filtered = filtered.filter(u => u.type == 1);
    } else if (this.currentTab === 'user') {
      filtered = filtered.filter(u => u.type == 0);
    } else if (this.currentTab === 'suspended') {
      filtered = filtered.filter(u => u.type == 2);
    }

    // Filter by Search Keyword
    if (this.userName.trim()) {
      const keyword = this.userName.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      );
    }

    this.usersList = filtered;
  }

  searchUsers(keyword: string) {
    this.userName = keyword;
    this.applyFilter();
  }
  deleteUser(userID: string) {
    if (this.isAdmin == false) {
      this.showError('ขออภัยมีแค่ผู้ดูแลระบบเท่านั้นที่สามารถลบผู้ใช้งานได้');
      return;
    }
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการลบผู้ใช้นี้?</div>',
      icon: 'warning',
      confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
      confirmButtonColor: '#ff4d4d',
      color: '#000000',
      showCancelButton: true,
      cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
      cancelButtonColor: '#000000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete<any>(`${this.constants.API}/admin/delete-user/${userID}`)
          .subscribe({
            next: (res) => {
              if (res.status) {
                this.showSuccess(res.message || 'ลบผู้ใช้สำเร็จ');
                this.getAllUsers();
              } else {
                this.showError(res.message || 'ลบผู้ใช้ไม่สำเร็จโปรดลองอีกครั้ง');
                return;
              }
            }
          });
      }
    });
  }
  suspendUser(userID: string, role: string) {
  if (this.isAdmin == false) {
    this.showError('ขออภัยมีแค่ผู้ดูแลระบบเท่านั้นที่สามารถระงับบัญชีผู้ใช้งานได้');
    return;
  }

  const isSuspended = role === 'Suspended';
  const targetType = isSuspended ? 0 : 2; // 0 = เปิดใช้งานกลับเป็น User, 2 = ระงับบัญชี (Soft delete)
  const confirmText = isSuspended ? 'ยืนยันการเปิดใช้งานบัญชีนี้?' : 'ยืนยันการระงับบัญชีผู้ใช้นี้?';
  const confirmColor = isSuspended ? '#28D16F' : '#ff4d4d';

  Swal.fire({
    html: `<div style="font-size: 1.5rem; font-family: 'Kanit', 'Prompt', 'Mitr', 'Noto Sans Thai', sans-serif;">${confirmText}</div>`,
    icon: 'warning',
    confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
    confirmButtonColor: confirmColor,
    color: '#000000',
    showCancelButton: true,
    cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
    cancelButtonColor: '#000000',
  }).then((result) => {
    if (result.isConfirmed) {
      this.http.patch<any>(`${this.constants.API}/admin/toggle-suspend-user/${userID}`, { type: targetType })
        .subscribe({
          next: (res) => {
            if (res.status) {
              this.showSuccess(res.message);
              this.getAllUsers();
            } else {
              this.showError(res.message || 'เกิดข้อผิดพลาดโปรดลองอีกครั้ง');
            }
          }
        });
    }
  });
}

  back() {
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

}