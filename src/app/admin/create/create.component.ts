import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Constants } from '../../config/constant';
import { checkProfanity } from '../../../words/wordValidator';
import { AuthService } from '../../service/user';

@Component({
  selector: 'app-create',
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {

  cateID: any = 0;
  subcode: string = '';
  name: string = '';
  isAdmin: boolean = false;
  categories = [1, 2, 3, 4, 5];

  constructor(private http: HttpClient, private router: Router, private constants: Constants, private authService: AuthService) { }
  ngOnInit() {
    this.checkAdmin();
  }
  checkAdmin() {
    const type = this.authService.getUser().type;
    if (type == 0) {
      this.isAdmin = true;
    }
  }

  create() {
    const subjectData = { cateID: this.cateID, subcode: this.subcode, name: this.name };
    if(this.isAdmin == false){
      this.showError('ขออภัยมีแค่ผู้ดูแลระบบเท่านั้นที่สามารถเพิ่มรายวิชาได้');
      return;
    }
    if (!this.cateID || !this.subcode || !this.name) {
      this.showError('กรุณาใส่ข้อมูลให้ครบถ้วน');
      return;
    }
    if (this.cateID == 0) {
      this.showError('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (this.subcode.length < 7 || this.subcode.length > 7) {
      this.showError('รหัสวิชาต้องมี 7 ตัวอักษร');
      return;
    }
    const subcodeCheck = /^\d{7}$/.test(this.subcode);
    if (!subcodeCheck) {
      this.showError('รหัสวิชาต้องประกอบด้วยตัวเลข 7 หลัก');
      return;
    }
    const textCheck = checkProfanity(this.name);
    if (textCheck.isBad) {
      this.showError('ชื่อวิชามีคำที่ไม่เหมาะสม');
      return;
    }
    this.http.post<any>(`${this.constants.API}/subject/create/subject`, subjectData)
      .subscribe({
        next: (response) => {
          if (response.status == true) {
            this.showSuccess('สร้างวิชาใหม่สำเร็จ');
          } else {
            this.showError(response.message || 'สร้างวิชาใหม่ไม่สำเร็จ โปรดลองอีกครั้ง');
          }
        },
        error: (err) => {
          const message = err.error?.message || 'สร้างวิชาใหม่ไม่สำเร็จโปรดลองอีกครั้ง';
          this.showSuccess(message);
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
