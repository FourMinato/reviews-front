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
    const isNumeric = /^\d+$/.test(subcode);
    if (subcode.length !== 7) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">รหัสวิชาต้องมี 7 หลัก</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    if (!isNumeric) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">รหัสวิชาประกอบด้วยตัวเลขเท่านั้น</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
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
