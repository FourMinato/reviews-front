import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Constants } from '../../../config/constant';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/user';
import Swal from 'sweetalert2';
import { checkProfanity } from '../../../../words/wordValidator';

@Component({
  selector: 'app-edit-question',
  imports: [FormsModule, HttpClientModule],
  templateUrl: './edit-question.component.html',
  styleUrl: './edit-question.component.scss'
})
export class EditQuestionComponent {

  questionText: string = '';
  questionID: string = '';


  question: any[] = [];
  originalText: string = '';
userID:any;
  constructor(private http: HttpClient, private constants: Constants, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    const ID = history.state.questionID || '';
    this.questionID = ID;

    this.getDetailQuestion();
    this.checkUser();
  }
    checkUser() {
    const uid = this.authService.getUser().uid;
    this.userID = uid;
  }
  getDetailQuestion() {
    this.http.get<any>(`${this.constants.API}/review/data/question/${this.questionID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.question = res.data;
          this.questionText = this.question[0].descriptions;
          this.originalText = this.question[0].descriptions;
          console.log(this.question);

        }
      });
  }
  editQuestion() {
    if (this.questionText === this.originalText) {
      this.showError('ไม่มีการเปลี่ยนแปลงข้อมูล');
      return;
    }
    if (this.questionText.trim() === '') {
      this.showError('กรุณากรอกคำถาม');
      return;
    }
    if (this.questionText.length > 45) {
      this.showError('ขนาดของคำถามเกิน 45 ตัวอักษร');
      return;
    }
    const textCheck = checkProfanity(this.questionText);
    if (textCheck.isBad) {
      this.showError('คำถามของคุณมีคำที่ไม่เหมาะสม');
      return;
    }
    const newData = {
      uid: this.userID,
      questionID: this.questionID,
      descriptions: this.questionText
    };
    console.log(newData);
    
this.http.put<any>(`${this.constants.API}/update/question`, newData)
  .subscribe({
    next: (res) => {
      if (res.status === true) {
        this.showSuccess(res.message || 'แก้ไขคำถามสำเร็จ').then(() => {
          history.back();
        });
      } else {
        this.showError(res.message || 'แก้ไขคำถามไม่สำเร็จโปรดลองอีกครั้ง');
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