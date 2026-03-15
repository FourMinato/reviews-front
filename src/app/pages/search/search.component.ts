import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Constants } from '../../config/constant';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [HttpClientModule, CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {

  subcode: string = '';
  subject: any[] = [];
  notFound: boolean = false;

  constructor(private http: HttpClient, private constants: Constants, private router: Router) { }
  ngOnInit() {
    const subcode = history.state.subcode || '';
    this.subcode = subcode;
    this.getSubject(subcode)
  }
  getSubject(subcode: string) {
    if (!subcode) return;

    // 1. Try search by subcode first
    this.http.get(`${this.constants.API}/subject/subject/search/${subcode}`).subscribe({
      next: (res: any) => {
        if (res.status === true && res.result && res.result.length > 0) {
          this.subject = res.result;
          this.notFound = false;
        } else {
          // 2. If no result, try keyword search (client-side filter as fallback)
          this.searchByKeyword(subcode);
        }
      },
      error: (error) => {
        // If 404, also try keyword search
        this.searchByKeyword(subcode);
      }
    });
  }

  searchByKeyword(keyword: string) {
    this.http.get<any>(`${this.constants.API}/category/all/subject-to-edit`).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const lowerKeyword = keyword.toLowerCase();
          const filtered = res.data.filter((item: any) => 
            (item.subcode && item.subcode.toLowerCase().includes(lowerKeyword)) ||
            (item.name && item.name.toLowerCase().includes(lowerKeyword))
          );

          if (filtered.length > 0) {
            this.subject = filtered;
            this.notFound = false;
          } else {
            this.subject = [];
            this.notFound = true;
          }
        } else {
          this.subject = [];
          this.notFound = true;
        }
      },
      error: () => {
        this.subject = [];
        this.notFound = true;
      }
    });
  }
  back(){
    history.back();
  }
    linkToSubject(subjectID: string) {
    this.router.navigate(['/post/review'], {
        state: { subjectID: subjectID }
      });
  }
}
