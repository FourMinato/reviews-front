import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

    constructor(private router: Router, private http: HttpClient) { }

  createNew(){
    this.router.navigate(['/admin/create'])
  }
    detailSubjects(){
    this.router.navigate(['/admin/details'])
  }
    userPage(){
    this.router.navigate(['/admin/users'])
  }
    reportsPage(){
    this.router.navigate(['/admin/reports'])
  }
}
