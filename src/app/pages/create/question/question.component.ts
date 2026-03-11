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
    console.log("this is desc : " + this.questionText);
    if (this.questionText === '') {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณากรอกคำถาม</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    if (this.questionText.length > 45) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ขนาดของข้อความเกิน 45 ตัวอักษร</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    const textCheck = checkProfanity(this.questionText);
        if (textCheck.isBad) {
          Swal.fire({
            html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ข้อความของคุณมีคำที่ไม่เหมาะสม</div>',
            icon: 'error',
            confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
            confirmButtonColor: '#000000',
            color: '#000000'
          });
          return;
        } else {

      const senderData = {
        uid: this.userID,
        descriptions: this.questionText,
      }

      this.http.post<ApiResponse<any[]>>(`${this.constants.API}/create/question`, senderData)
        .subscribe(res => {
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
            Swal.fire({
              html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">' + res.message + '</div>',
              icon: 'error',
              confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
              confirmButtonColor: '#000000',
              color: '#000000'
            });

          }

        });
        }
  }
}
