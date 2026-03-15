import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-details',
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {
  subjectsList: any[] = [];
  searchTerm: string = '';

  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    this.getAllSubjects();
  }
  getAllSubjects() {
    this.http.get<any>(`${this.constants.API}/category/all/subject-to-edit`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.subjectsList = res.data;
          }
        },
      });
  }

  getSubjectsBySearch(subcode: string) {
    if (subcode === '') {
      this.getAllSubjects();
      return;
    }
    
    // 1. Try search by subcode first (if it looks like a subcode)
    const isNumeric = /^\d+$/.test(subcode);
    if (subcode.length === 7 && isNumeric) {
      this.http.get<any>(`${this.constants.API}/category/all/subject-to-edit/${subcode}`)
        .subscribe({
          next: (res) => {
            if (res.status && res.data && res.data.length > 0) {
              this.subjectsList = res.data;
            } else {
              this.searchByKeyword(subcode);
            }
          },
          error: () => this.searchByKeyword(subcode)
        });
    } else {
      this.searchByKeyword(subcode);
    }
  }

  searchByKeyword(keyword: string) {
    this.http.get<any>(`${this.constants.API}/category/all/subject-to-edit`).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const lowerKeyword = keyword.toLowerCase();
          this.subjectsList = res.data.filter((item: any) => 
            (item.subcode && item.subcode.toLowerCase().includes(lowerKeyword)) ||
            (item.name && item.name.toLowerCase().includes(lowerKeyword))
          );
        }
      }
    });
  }

  back() {
    history.back();
  }
  details(subjectID: string) {
    this.router.navigate(['/admin/edit'], {
      state: { subjectID: subjectID }
    });
  }
}
