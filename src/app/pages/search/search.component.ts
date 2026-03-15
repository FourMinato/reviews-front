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

    const isNumeric = /^\d+$/.test(subcode);
    
    // 1. Try search by subcode first ONLY if it's exactly 7 digits
    if (subcode.length === 7 && isNumeric) {
      this.http.get(`${this.constants.API}/subject/subject/search/${subcode}`).subscribe({
        next: (res: any) => {
          if (res.status === true && res.result && res.result.length > 0) {
            this.subject = res.result;
            this.notFound = false;
          } else {
            // If API returns success but no results, try keyword search
            this.searchByKeyword(subcode);
          }
        },
        error: (error) => {
          // Fallback to keyword search on error
          this.searchByKeyword(subcode);
        }
      });
    } else {
      // 2. If it's a name or keyword, go straight to client-side filter
      this.searchByKeyword(subcode);
    }
  }

  searchByKeyword(keyword: string) {
    this.http.post<any>(`${this.constants.API}/category/subject/select`, {
      cateids: ['1', '2', '3', '4', '5'],
    }).subscribe({
      next: (res) => {
        if (res.status && res.result) {
          const lowerKeyword = keyword.toLowerCase();
          const filtered = res.result.filter((item: any) => 
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
