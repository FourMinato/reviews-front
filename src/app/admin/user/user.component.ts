import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

  allUsersList: any[] = [];
  usersList: any[] = [];
  userName: string = '';

  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers() {
    this.http.get<any>(`${this.constants.API}/admin/get-users`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.allUsersList = res.data.map((user: any) => ({
              ...user,
              profile: `${this.constants.API}/images/${user.profile}`,
              role: user.type === 1 ? 'User' : 'Admin'
            }));
            this.usersList = [...this.allUsersList];
          }
        }
      });
  }
  editUser(userID: number) {
    this.router.navigate(['/admin/user/detail'], {
      state: { userID: userID }
    });
  }
  searchUsers(keyword: string) {
    if (!keyword.trim()) {
      this.usersList = [...this.allUsersList]; // reset ถ้าช่องว่าง
      return;
    }

    this.usersList = this.allUsersList.filter(user =>
      user.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  deleteUser(userID: string) {
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