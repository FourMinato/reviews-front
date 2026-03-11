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
  reportsReview: any[] = [];
  reportsQuestion: any[] = [];
  reportsComment: any[] = []
  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    this.getReportsReview();
    this.getReportsQuestion();
    this.getReportsComment();
  }

  getReportsReview() {
    this.http.get<any>(`${this.constants.API}/admin/get-report-review`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.reportsReview = res.data;
            console.log(this.reportsReview);

          }
        }
      });
  }
  getReportsQuestion() {
    this.http.get<any>(`${this.constants.API}/admin/get-report-question`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.reportsQuestion = res.data;
            console.log(this.reportsQuestion);

          }
        }
      });
  }
  getReportsComment() {
    this.http.get<any>(`${this.constants.API}/admin/get-report-comments`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.reportsComment = res.data;
            console.log(this.reportsComment);

          }
        }
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
    console.log('ค่าที่เลือก:', this.selected);

    // เช็คว่าเลือกอะไร
    switch (this.selected) {
      case 'all':
        this.allReports();
        break;
      case 'review':
        this.reviewReports();
        break;
      case 'question':
        this.questionReports();
        break;
      case 'comment':
        this.commentReports();
        break;
      case 'profile':
        this.profileReports();
        break;
    }
  }
  allReports() {
    console.log("allReports");
  }
  reviewReports() {
    console.log("reviewReports");
  }
  questionReports() {
    console.log("questionReports");
  }
  commentReports() {
    console.log("commentReports");
  }
  profileReports() {
    console.log("profileReports");
  }
}