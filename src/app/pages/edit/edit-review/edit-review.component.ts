import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/user';
import { Constants } from '../../../config/constant';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { checkProfanity } from '../../../../words/wordValidator';

@Component({
  selector: 'app-edit-review',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './edit-review.component.html',
  styleUrl: './edit-review.component.scss'
})
export class EditReviewComponent {
  isLoggedIn: boolean = false;
  rate: number = 0;
  reviewText: string = '';
  isAnonymous: boolean = false;
  subjectID: string = '';
  subjectData: any[] = [];
  userID: string = '';

  reviewID: string = '';
  reviews: any[] = [];
  originalRate: number = 0;
  originalReviewText: string = '';
  constructor(private http: HttpClient, private constants: Constants, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    const ID = history.state.reviewID || '';
    this.reviewID = ID;
    this.getDetailReview();

  }
  getDetailReview() {
    this.http.get<any>(`${this.constants.API}/review/data/${this.reviewID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.reviews = res.data;
          this.rate = this.reviews[0].rate;
          this.reviewText = this.reviews[0].descriptions;
          this.originalRate = this.reviews[0].rate;
          this.originalReviewText = this.reviews[0].descriptions;
        }
      });
  }


  confirmEdit() {

    if (this.rate === this.originalRate && this.reviewText === this.originalReviewText) {
      this.showError('ไม่มีการเปลี่ยนแปลงข้อมูล');
      return;
    }
    if (this.reviewText.trim() === '') {
      this.showError('กรุณากรอกข้อความรีวิว');
      return;
    }
    if (this.reviewText.length > 45) {
      this.showError('ขนาดของข้อความเกิน 45 ตัวอักษร');
      return;
    }
    const textCheck = checkProfanity(this.reviewText);
    if (textCheck.isBad) {
      this.showError('ข้อความของคุณมีคำที่ไม่เหมาะสม');
      return;
    } else {
      const newData = {
        descriptions: this.reviewText,
        rate: this.rate,
        pid: this.reviewID
      }
      this.http.put<any>(`${this.constants.API}/update/review`, newData)
        .subscribe(res => {
          if (res.status === true) {
            this.showSuccess(res.message || 'แก้ไขรีวิวสำเร็จ').then(() => {
              history.back();
            });
          } else {
            this.showError(res.message || 'แก้ไขไม่สำเร็จโปรดลองอีกครั้ง');
            return;
          }
        });

    }
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