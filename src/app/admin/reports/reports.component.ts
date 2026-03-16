import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';
@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule, MatExpansionModule, HttpClientModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  selected: string = 'review';
  reports: any[] = [];
  reportsReviews: any[] = [];
  reportsQuestions: any[] = [];
  reportsComments: any[] = []
  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    this.getReportsReview();
  }
  // ตัวอย่าง Mockup Data สำหรับ reportsQuestion
  // 1. Mockup Data: โพสต์รีวิว
  reportsReview = [
    {
      pid: 'REV001',
      reporter_name: 'สมชาย ใจดี',
      reporter_avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
      reported_name: 'ShopA_Official',
      description: 'รีวิวนี้บอกว่าสินค้าแท้ 100% แต่พอซื้อมากลายเป็นของปลอมครับ อยากให้แอดมินลบรีวิวนี้ทิ้ง',
      date: '2026-03-15T08:30:00Z',
      isExpanded: false
    },
    {
      pid: 'REV002',
      reporter_name: 'JaneDoe',
      reporter_avatar: '', // ลองปล่อยว่างเพื่อให้ระบบใช้ ui-avatars สร้างรูปให้
      reported_name: 'BKK_Reviewer',
      description: 'มีการใช้คำพูดรุนแรงและหยาบคายในรีวิวนี้ค่ะ',
      date: '2026-03-14T15:20:00Z',
      isExpanded: false
    }
  ];

  // 2. Mockup Data: โพสต์ถามตอบ
  reportsQuestion = [
    {
      pid: 'Q001',
      reporter_name: 'Dev_Ninja',
      reporter_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      reported_name: 'SpamBot99',
      description: 'โพสต์ตั้งคำถามแต่จริงๆ แปะลิงก์เว็บพนันรัวๆ เลยครับ',
      date: '2026-03-16T10:00:00Z',
      isExpanded: false
    },
    {
      pid: 'Q002',
      reporter_name: 'Somsak',
      reporter_avatar: '',
      reported_name: 'Manee_123',
      reason: 'ผิดหมวดหมู่',
      description: '', // กรณีไม่มีรายละเอียดเพิ่มเติม
      date: '2026-03-12T09:45:00Z',

      isExpanded: false
    }
  ];

  // 3. Mockup Data: คอมเมนต์
  reportsComment = [
    {
      ref_id: 'COM001',
      type: 'comment',
      reporter_name: 'Lisa_Black',
      reporter_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      reported_name: 'Hater_X',
      reason: 'คุกคาม / กลั่นแกล้ง (Cyberbullying)',
      description: 'คอมเมนต์นี้เข้ามาด่าทอเจ้าของโพสต์ด้วยถ้อยคำรุนแรงและคุกคามความเป็นส่วนตัวค่ะ',
      date: '2026-03-16T12:30:00Z',
      isExpanded: false
    },
    {
      ref_id: 'COM002',
      type: 'comment',
      reporter_name: 'Admin_Helper',
      reporter_avatar: '',
      reported_name: 'Sale_Shoe',
      reason: 'สแปม / ขายของผิดที่',
      description: 'ฝากร้านใต้คอมเมนต์คนอื่นแบบไม่เกี่ยวข้องกันเลย',
      date: '2026-03-15T18:15:00Z',
      isExpanded: false
    }
  ];
  getReportsReview() {
    this.http.get<any>(`${this.constants.API}/admin/get-report-review`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.reportsReviews = res.data.map((review: any) => ({
              ...review,
              reporter_profile
                : review.reporter_profile
                  ? (review.reporter_profile
                    .startsWith('http') ? review.reporter_profile
                    : `${this.constants.API}/images/${review.reporter_profile
                    }`) : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
            }));

          }
        },
        error: () => { }
      });
  }
  getReportsQuestion() {
    this.http.get<any>(`${this.constants.API}/admin/get-report-question`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.reportsQuestions = res.data.map((question: any) => ({
              ...question,
              reporter_profile
                : question.reporter_profile
                  ? (question.reporter_profile
                    .startsWith('http') ? question.reporter_profile
                    : `${this.constants.API}/images/${question.reporter_profile
                    }`) : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
            }));
            
          }
        },
        error: () => { }
      });
  }
  getReportsComment() {
    this.http.get<any>(`${this.constants.API}/admin/get-report-comments`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.reportsComments = res.data.map((comment: any) => ({
              ...comment,
              reporter_profile
                : comment.reporter_profile
                  ? (comment.reporter_profile
                    .startsWith('http') ? comment.reporter_profile
                    : `${this.constants.API}/images/${comment.reporter_profile
                    }`) : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
            }));
            
          }
        },
        error: () => { }
      });
  }
  linkToReviewDetails(reviewID: string) {
    this.router.navigate(['/post/review/details'], { state: { reviewID } });
  }
  linkToQuestionDetails(questionID: string) {
    this.router.navigate(['/post/question/details'], { state: { questionID: questionID } });
  }
  linkToPost(type: string, ref_id: string) {
    if (type === 'review') {
      this.router.navigate(['/post/review/details'], { state: { reviewID: ref_id } });
    }
    else if (type === 'question') {
      this.router.navigate(['/post/question/details'], { state: { questionID: ref_id } });
    }
  }
  back() {
    history.back();
  }
  selectBy() {
    switch (this.selected) {
      case 'review':
        this.reviewReports();
        break;
      case 'question':
        this.questionReports();
        break;
      case 'comment':
        this.commentReports();
        break;
    }
  }
  reviewReports() {
    this.getReportsReview();
  }
  questionReports() {
    this.getReportsQuestion();
  }
  commentReports() {
    this.getReportsComment();
  }
}