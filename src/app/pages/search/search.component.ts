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
    this.http.get(`${this.constants.API}/routes/subject/search/${subcode}`).subscribe({
      next: (res: any) => {
        if (res.status === true) {
          this.subject = res.result;
          this.notFound = false;
        } else {
          this.subject = [];
          this.notFound = true;
        }
      },
      error: (error) => {
        if (error.status === 404) {
          this.subject = [];
          this.notFound = true;
        }
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
