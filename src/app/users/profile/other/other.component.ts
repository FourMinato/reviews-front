import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/user';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Constants } from '../../../config/constant';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-other',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './other.component.html',
  styleUrl: './other.component.scss'
})
export class OtherComponent {
  currentTab: string = 'reviews';
  reviews: any[] = [];
  questions: any[] = [];
  userID: string = '';
  userData: any = [];
  userName: string = '';
  userImage: string = '';
  isLoggedIn: boolean = false;
  myUID: string = '';
  isOwnProfile: boolean = false;
  constructor(public router: Router, private http: HttpClient, public constants: Constants, private authService: AuthService) { }
  ngOnInit() {
    const ID = history.state.userID || '';
    this.userID = ID;
    this.checkLogin();
    this.checkUser();
    this.getUser();
    this.getReview();
    this.getQuestion();
  }
  checkLogin() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }
  checkUser() {
    const uid = this.authService.getUser().uid;
    this.myUID = uid;
  }
  getUser() {
    this.http.get<any>(`${this.constants.API}/user/getuser/${this.userID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.userData = res.data;
          this.userName = this.userData[0].name;
          this.userImage = this.userData[0].profile && this.userData[0].profile.startsWith('http')
            ? this.userData[0].profile
            : `${this.constants.API}/images/${this.userData[0].profile}`;
          if (res.data[0].uid === this.myUID) {
            this.isOwnProfile = true;
          }
        }
      });
  }
  getReview() {
    this.http.get<any>(`${this.constants.API}/user/getuser/review/${this.userID}/${this.myUID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.reviews = res.data
        }
      });
  }
  getQuestion() {
    this.http.get<any>(`${this.constants.API}/user/getuser/question/${this.userID}/${this.myUID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.questions = res.data
        }
      });
  }
  linkToReviewDetails(reviewID: string) {
    this.router.navigate(['post/review/details'], {
      state: { reviewID: reviewID }
    });
  }
  linkToQuestionDetails(questionID: string) {
    this.router.navigate(['post/question/details'], {
      state: { questionID: questionID }
    });
  }
  linkToProfile() {
    this.router.navigate(['profile'], {
    });
  }

  tab(tabName: string) {
    this.currentTab = tabName;
  }
  back() {
    history.back();
  }
}
