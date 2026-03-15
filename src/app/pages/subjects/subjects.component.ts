import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Constants } from '../../config/constant';
interface ApiResponse<T> {
  status: boolean;
  result: T;
}
@Component({
  selector: 'app-subjects',
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.scss'
})

export class SubjectsComponent {

  selectedOrder: string = 'sort-code';
  subjects: any[] = [];
  categories: string[] = [];
  API = environment.apiUrl;
  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, private constants: Constants) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const categories = params['categories']
        ? params['categories'].split(',')
        : [];
      this.categories = categories
    });
    this.sortSubjects();
  }

  back() {
    history.back();
  }
  sortSubjects() {
    switch (this.selectedOrder) {
      case 'sort-code':
        this.orderBySubcode();
        break;
      case 'sort-review':
        this.orderByReviewCount();
        break;
      case 'sort-rate':
        this.orderByRate();
        break;
    }
  }
  orderBySubcode() {
    this.http.post<ApiResponse<any[]>>(`${this.constants.API}/category/subject/select`, {
      cateids: this.categories,
    }).subscribe(res => {
      if (res.status === true) {
        this.subjects = res.result; 
      }
    });
  }
  orderByReviewCount() {
    this.http.post<ApiResponse<any[]>>(`${this.constants.API}/category/subject/select/review`, {
      cateids: this.categories,
    }).subscribe(res => {
      if (res.status === true) {
        this.subjects = res.result;
      }
    });
  }
  orderByRate() {
    this.http.post<ApiResponse<any[]>>(`${this.constants.API}/category/subject/select/rate`, {
      cateids: this.categories,
    }).subscribe(res => {
      if (res.status === true) {
        this.subjects = res.result;
      }
    });
  }
  linkToSubject(subjectID: string) {
    this.router.navigate(['/post/review'], {
        state: { subjectID: subjectID }
      });
  }
}
