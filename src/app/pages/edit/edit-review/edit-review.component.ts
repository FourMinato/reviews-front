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
    console.log("reviewID id is " + this.reviewID);
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
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ไม่มีการเปลี่ยนแปลงข้อมูล</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    if (this.reviewText.length > 45) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ขนาดของข้อความเกิน 45 ตัวอักษร</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    const textCheck = checkProfanity(this.reviewText);
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
      const newData = {
        descriptions: this.reviewText,
        rate: this.rate,
        pid: this.reviewID
      }
      this.http.put<any>(`${this.constants.API}/update/review`, newData)
        .subscribe(res => {
          if (res.status === true) {
            Swal.fire({
              html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">แก้ไขรีวิวสำเร็จ</div>',
              icon: 'success',
              confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
              confirmButtonColor: '#000000',
              color: '#000000'
            }).then(() => {
              history.back();
            });
            
          }});
      
    }





  }
}
