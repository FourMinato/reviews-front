import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule, MatExpansionModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  selected: string = 'review';
  reportsReviews: any[] = [];
  reportsQuestions: any[] = [];
  reportsComments: any[] = [];
  reportersList: any[] = [];
  showReportersModal: boolean = false;
  selectedItemId: string = '';
  selectedType: string = '';

  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    this.getReportsReview();
  }
  getReportsReview() {
    this.http.get<any>(`${this.constants.API}/admin/get-report-review`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.reportsReviews = res.data.map((review: any) => ({
              ...review,
              last_reporter_profile: review.last_reporter_profile
                ? (review.last_reporter_profile.startsWith('http') ? review.last_reporter_profile
                  : `${this.constants.API}/images/${review.last_reporter_profile}`)
                : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
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
              last_reporter_profile: question.last_reporter_profile
                ? (question.last_reporter_profile.startsWith('http') ? question.last_reporter_profile
                  : `${this.constants.API}/images/${question.last_reporter_profile}`)
                : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
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
              last_reporter_profile: comment.last_reporter_profile
                ? (comment.last_reporter_profile.startsWith('http') ? comment.last_reporter_profile
                  : `${this.constants.API}/images/${comment.last_reporter_profile}`)
                : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
            }));
          }
        },
        error: () => { }
      });
  }

  getReporters(type: string, id: string) {
    this.selectedItemId = id;
    this.selectedType = type;
    this.http.get<any>(`${this.constants.API}/admin/get-reporters/${type}/${id}`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.reportersList = res.data.map((reporter: any) => ({
              ...reporter,
              profile: reporter.profile
                ? (reporter.profile.startsWith('http') ? reporter.profile
                  : `${this.constants.API}/images/${reporter.profile}`)
                : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
            }));
            this.showReportersModal = true;
          }
        },
        error: () => { }
      });
  }

  closeModal() {
    this.showReportersModal = false;
    this.reportersList = [];
  }

  linkToReviewDetails(reviewID: string) {
    this.router.navigate(['/post/review/details'], { state: { reviewID: reviewID } });
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

  toggleVisibility(type: 'review' | 'question', id: string, action: 'hide' | 'show') {
    const confirmText = action === 'hide' ? 'คุณต้องการปิดการมองเห็นโพสต์นี้หรือไม่?' : 'คุณต้องการเปิดการมองเห็นโพสต์นี้หรือไม่?';
    Swal.fire({
      title: 'ยืนยันการดำเนินการ',
      text: confirmText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'hide' ? '#ff4d4d' : '#28D16F',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        let endpoint = '';
        let method: 'put' | 'post' = 'put';
        let body = {};
        
        if (action === 'hide') {
          if (type === 'review') {
            endpoint = `${this.constants.API}/close/review/visibility`;
            body = { reviewID: id };
          } else {
            endpoint = `${this.constants.API}/close/question/visibility`;
            body = { questionID: id };
          }
        } else {
          if (type === 'review') {
            endpoint = `${this.constants.API}/admin/open-review/${id}`;
          } else {
            endpoint = `${this.constants.API}/admin/open-question/${id}`;
          }
        }

        this.http.put(endpoint, body).subscribe({
          next: (res: any) => {
            if (res.status) {
              Swal.fire('สำเร็จ', res.message, 'success');
              this.selectBy(); // Refresh lists
            } else {
              Swal.fire('ผิดพลาด', res.message, 'error');
            }
          },
          error: (err) => {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
          }
        });
      }
    });
  }

  deleteReportedItem(type: 'review' | 'question' | 'comment', id: string) {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณต้องการลบรายการนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4d4d',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        let endpoint = '';
        if (type === 'review') {
          endpoint = `${this.constants.API}/delete/admin/delete/review/${id}`;
        } else if (type === 'question') {
          endpoint = `${this.constants.API}/delete/admin/delete/question/${id}`;
        } else if (type === 'comment') {
          endpoint = `${this.constants.API}/delete/comment/${id}`;
        }

        this.http.delete(endpoint).subscribe({
          next: (res: any) => {
            if (res.status) {
              Swal.fire('ลบสำเร็จ', res.message, 'success');
              this.selectBy(); // Refresh list
            } else {
              Swal.fire('ผิดพลาด', res.message, 'error');
            }
          },
          error: (err) => {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
          }
        });
      }
    });
  }
}