import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-details',
  imports: [CommonModule, FormsModule],
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
    this.http.get<any>(`${this.constants.API}/category/all/subject-to-edit/${subcode}`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.subjectsList = res.data;
          }
        },
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
