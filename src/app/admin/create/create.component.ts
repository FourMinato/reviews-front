import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Constants } from '../../config/constant';

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

  categories = [1, 2, 3, 4, 5];

  constructor(private http: HttpClient, private router: Router, private constants: Constants) { }
  ngOnInit() {

  }

  create() {
    const subjectData = { cateID: this.cateID, subcode: this.subcode, name: this.name };
    if (!this.cateID || !this.subcode || !this.name) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาใส่ข้อมูลให้ครบถ้วน</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    if (this.subcode.length < 7 || this.subcode.length > 7) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">รหัสวิชาต้องมี 7 ตัวอักษร</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
        if (this.cateID == 0) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเลือกหมวดหมู่</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    this.http.post<any>(`${this.constants.API}/subject/create/subject`, subjectData)
  .subscribe({
    next: (response) => {
      if (response.status == true) {
        Swal.fire({
          html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">สร้างวิชาใหม่สำเร็จ</div>',
          icon: 'success',
          confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
          confirmButtonColor: '#000000',
          color: '#000000'
        });
      } else {
        Swal.fire({
          html: `
            <div style="font-family: 'Kanit', 'Prompt', 'Mitr', 'Noto Sans Thai', sans-serif;">
              <div style="font-size: 1.5rem; font-weight: bold;">สร้างวิชาไม่สำเร็จ</div>
              <div style="font-size: 1.1rem; color: #d33;">
                ${response.message}
              </div>
            </div>
          `,
          icon: 'error',
          confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
          confirmButtonColor: '#000000',
          color: '#000000'
        });
      }
    },
    error: (err) => {
      // แนะนำให้เพิ่มส่วนนี้เผื่อกรณี Server Error (500) หรือเน็ตหลุด
      Swal.fire({
         html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', sans-serif;">เกิดข้อผิดพลาดในการเชื่อมต่อ</div>',
         icon: 'error',
         confirmButtonText: 'ตกลง'
      });
    }
  });
  }

  back() {
    history.back();
  }

}
