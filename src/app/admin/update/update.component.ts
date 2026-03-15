import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';
import { checkProfanity } from '../../../words/wordValidator';

@Component({
  selector: 'app-update',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent {

  subjectsList: any[] = [];
  OriginalSubjectName: string = '';
  OriginalSubjectCategory: string = '';
  OriginalSubjecCode: string = '';
  isAdmin: boolean = false;
  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    const subjectID = history.state.subjectID || '';

    this.getSubject(subjectID);
    this.checkAdmin();
  }
  checkAdmin() {
    const type = this.authService.getUser().type;
    if (type == 0) {
      this.isAdmin = true;
    }
  }
    back() {
    history.back();
  }

  categories = [1, 2, 3, 4, 5];
  visibility = [0, 1];

  subjectData = {
    subid: '',
    category: '',
    subcode: '',
    name: '',
    open: ''
  };
  getSubject(subcode: string) {
    this.http.get<any>(`${this.constants.API}/category/subid/subject-to-edit/${subcode}`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.subjectsList = res.data;
            this.subjectData = {
              subid: this.subjectsList[0].subid,
              category: this.subjectsList[0].cateid,
              subcode: this.subjectsList[0].subcode,
              name: this.subjectsList[0].name,
              open: this.subjectsList[0].open
            };
          }
        }
      });
  }
  onSave() {
    this.updateSubject();
  }


  updateSubject() {
    if(this.isAdmin == false){
      this.showError('ขออภัยมีแค่ผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขรายวิชาได้');
      return;
    }
    if (this.subjectData.category === '' || this.subjectData.subcode.trim() === '' || this.subjectData.name.trim() === '') {
      this.showError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    const subcodeCheck = /^\d{7}$/.test(this.subjectData.subcode);
    if (!subcodeCheck) {
      this.showError('รหัสวิชาต้องประกอบด้วยตัวเลข 7 หลัก');
      return;
    }
    const textCheck = checkProfanity(this.subjectData.name);
    if (textCheck.isBad) {
      this.showError('ชื่อวิชามีคำที่ไม่เหมาะสม');
      return;
    }
    this.http.put<any>(
      `${this.constants.API}/subject/update/subject/${this.subjectData.subid}`,
      {
        category: this.subjectData.category,
        subcode: this.subjectData.subcode,
        subname: this.subjectData.name,
        open: this.subjectData.open
      }
    ).subscribe({
      next: (res) => {
        if (res.status) {
          this.showSuccess(res.message || 'แก้ไขข้อมูลสำเร็จ').then(() => {
            history.back();
          });
        }
        else {
          this.showError(res.message || 'แก้ไขข้อมูลไม่สำเร็จโปรดลองอีกครั้ง');
          return;
        }
      },
      error: (err) => {
        const message = err.error?.message || 'แก้ไขข้อมูลไม่สำเร็จโปรดลองอีกครั้ง';
        this.showError(message);
      }
    });
  }
  deleteSubject(subjectID: string) {
    if(this.isAdmin == false){
      this.showError('ขออภัยมีแค่ผู้ดูแลระบบเท่านั้นที่สามารถลบรายวิชาได้');
      return;
    }
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการลบวิชานี้?</div>',
      icon: 'warning',
      confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
      confirmButtonColor: '#ff4d4d',
      color: '#000000',
      showCancelButton: true,
      cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
      cancelButtonColor: '#000000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete<any>(`${this.constants.API}/delete/subject/${subjectID}`)
          .subscribe({
            next: (response) => {
              if (response.status == true) {
                Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ลบโพสต์สำเร็จ</div>',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false
                }).then(() => {
                  history.back();
                });
              }
            }
          });
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
