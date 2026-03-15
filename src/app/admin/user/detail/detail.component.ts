import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Constants } from '../../../config/constant';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../service/user';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detail',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  isEditing = false;
  user: any = {};
  isAdmin: boolean = false;
  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    const ID = history.state.userID || '';
    this.getUser(ID);
    this.checkAdmin();
  }
    checkAdmin() {
    const type = this.authService.getUser().type;
    if (type == 0) {
      this.isAdmin = true;
    }
  }
  getUser(userID: string) {
    this.http.get<any>(`${this.constants.API}/admin/get-user/${userID}`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.user = {
              ...res.data,
              profile: res.data.profile && res.data.profile.startsWith('http') ? res.data.profile : `${this.constants.API}/images/${res.data.profile}`,
              role: res.data.type === 1 ? 'User' : 'Admin'
            };
          }
        }
      });
  }

  tempUser: any = {};

  toggleEdit() {
    this.isEditing = true;
    this.tempUser = { ...this.user };
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveEdit() {
    if(this.isAdmin == false){
      this.showError('ขออภัยมีแค่ผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขได้');
      return;
    }
    if (this.user.role === this.tempUser.role) {
      this.showError('ไม่มีการเปลี่ยนแปลงข้อมูล');
      return;
    }
    this.http.put<any>(`${this.constants.API}/admin/update-role/${this.user.uid}`, {
      role: this.tempUser.role 
    }).subscribe({
      next: (res) => {
        if (res.status) {
          this.user.role = this.tempUser.role;
          this.showSuccess(res.message || 'อัปเดตข้อมูลสำเร็จ')
        } else {
          this.showError(res.message || 'อัปเดตข้อมูลไม่สำเร็จโปรดลองอีกครั้ง');
          return;
        }
      }
    });
    this.isEditing = false; 
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