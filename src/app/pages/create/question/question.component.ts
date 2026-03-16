import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/user';
import { Constants } from '../../../config/constant';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { checkProfanity } from '../../../../words/wordValidator';
interface ApiResponse<T> {
  status: boolean;
  message: string;
}
@Component({
  selector: 'app-question',
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionComponent {

  isLoggedIn: boolean = false;
  userID: string = '';
  questionText: string = '';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.getUser();
    this.userID = user.uid;

    if (this.isLoggedIn === false) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      }).then((result) => {
        if (result.isConfirmed) {
          history.back();
        }
      });
      return;
    }

  }
  createQuestion() {
    if (this.questionText === '') {
      this.showError('กรุณากรอกคำถาม');
      return;
    }
    if (this.questionText.length > 45) {
      this.showError('ขนาดของข้อความเกิน 45 ตัวอักษร');
      return;
    }
    const textCheck = checkProfanity(this.questionText);
    if (textCheck.isBad) {
      this.showError('ข้อความของคุณมีคำที่ไม่เหมาะสม');
      return;
    }
    const senderData = {
      uid: this.userID,
      descriptions: this.questionText,
    }

this.http.post<ApiResponse<any[]>>(`${this.constants.API}/create/question`, senderData)
  .subscribe({
    next: (res) => {
      if (res.status === true) {
        Swal.fire({
          html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">โพสต์ตั้งคำถามสำเร็จ</div>',
          icon: 'success',
          confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
          confirmButtonColor: '#28D16F',
          color: '#000000'
        }).then(result => {
          if (result.isConfirmed) {
            history.back();
          }
        });
      } else {
        this.showError(res.message || 'เกิดข้อผิดพลาดโปรดลองอีกครั้ง');
      }
    },
    error: (err) => {
      this.showError(err.error?.message || 'เกิดข้อผิดพลาดโปรดลองอีกครั้ง');
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
