import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Constants } from '../../config/constant';
import { AuthService } from '../../service/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorite',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss'
})
export class FavoriteComponent {
  currentTab: 'review' | 'qa' = 'review';
  sortBy: string = 'date';
  myFavoriteReviews: any[] = [];
  myFavoriteQuestions: any[] = [];

  userID: string = '';


  constructor(private http: HttpClient, private constants: Constants, private router: Router, private authService: AuthService) { }


  ngOnInit(): void {
    // โหลดครั้งแรกให้เรียงข้อมูลตามค่า default
    this.checkUser();
    this.sortReviews('date');
    this.getMyFavoriteQuestions();
  }
  checkUser() {
    const uid = this.authService.getUser().uid;
    this.userID = uid;
  }
  getMyFavoriteReviewsByDate() {
    this.http.get<any>(`${this.constants.API}/favorite/review/date/${this.userID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.myFavoriteReviews = res.data;
        }
      });
  }
  getMyFavoriteReviewsBySubcode() {
    this.http.get<any>(`${this.constants.API}/favorite/review/subcode/${this.userID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.myFavoriteReviews = res.data;
        }
      });
  }
  getMyFavoriteQuestions() {
    this.http.get<any>(`${this.constants.API}/favorite/question/${this.userID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.myFavoriteQuestions = res.data;
        }
      });
  }

  setTab(tab: 'review' | 'qa') {
    this.currentTab = tab;
  }

  sortReviews(sortBy: string) {
    this.sortBy = sortBy;
    switch (this.sortBy) {
      case 'date':
        this.getMyFavoriteReviewsByDate();
        break;
      case 'subject-code':
        this.getMyFavoriteReviewsBySubcode();
        break;
    }

  }
  linkToDetails(reviewID: string) {
    this.router.navigate(['post/review/details'], {
      state: { reviewID: reviewID }
    });
  }
  linkToQuestionDetail(questionID: any) {
    this.router.navigate(['post/question/details'], {
      state: { questionID: questionID }
    });
  }
  
}
