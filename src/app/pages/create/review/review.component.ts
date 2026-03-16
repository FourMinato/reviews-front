import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../service/user';
import { FormsModule } from '@angular/forms';
import { checkProfanity } from '../../../../words/wordValidator';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Constants } from '../../../config/constant';
import { CommonModule } from '@angular/common';
interface ApiResponse<T> {
  status: boolean;
  message: string;
}
@Component({
  selector: 'app-review',
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewComponent {

  isLoggedIn: boolean = false;
  rate: number = 0;
  reviewText: string = '';
  isAnonymous: boolean = false;
  subjectID: string = '';
  subjectData: any[] = [];
  userID: string = '';
  constructor(private http: HttpClient, private router: Router, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    const ID = history.state.subjectID || '';
    this.subjectID = ID;
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

    this.getSubjectData();
  }
  getSubjectData() {
    this.http.get<any>(`${this.constants.API}/subject/data/${this.subjectID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.subjectData = res.result;
        }
      });
  }
  cretaeReview() {

    if (this.rate === 0) {
      this.showError('กรุณาเลือกคะแนน');
      return;
    }
    if (this.reviewText === '') {
      this.showError('กรุณากรอกข้อความรีวิว');
      return;
    }
    if (this.reviewText.length > 45) {
      this.showError('ขนาดของข้อความเกิน 45 ตัวอักษร');
      return;
    }
    let anonymosusValue = 0;
    if (this.isAnonymous === true) {
      anonymosusValue = 1;
    }
    const textCheck = checkProfanity(this.reviewText);
    if (textCheck.isBad) {
      this.showError('ข้อความของคุณมีคำที่ไม่เหมาะสม');
      return;
    }
    const senderData = {
      sid: this.subjectID,
      uid: this.userID,
      rate: this.rate,
      descriptions: this.reviewText,
      anonymous_type: anonymosusValue,
      showpost: 1
    }
this.http.post<ApiResponse<any[]>>(`${this.constants.API}/create/review`, senderData)
  .subscribe({
    next: (res) => {
      if (res.status === true) {
        Swal.fire({
          html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">รีวิวสำเร็จ</div>',
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