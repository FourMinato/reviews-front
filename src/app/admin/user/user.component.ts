import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';

@Component({
  selector: 'app-user',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

  usersList: any[] = [];

  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

  ngOnInit() {
    this.getAllUsers();
  }
  users = [
    { 
      name: 'Somchai Jaidee', 
      email: 'somchai@example.com', 
      role: 'Admin', 
      isActive: true,
      image: 'https://i.pravatar.cc/150?img=11' // รูปผู้ชาย
    },
    { 
      name: 'Mana Rakdee', 
      email: 'mana@example.com', 
      role: 'User', 
      isActive: true,
      image: 'https://i.pravatar.cc/150?img=12' // รูปผู้ชาย
    },
    { 
      name: 'Manee Meeta', 
      email: 'manee@example.com', 
      role: 'User', 
      isActive: false,
      image: 'https://i.pravatar.cc/150?img=5' // รูปผู้หญิง
    },
    { 
      name: 'Piti Chujai', 
      email: 'piti@example.com', 
      role: 'User', 
      isActive: true,
      image: 'https://i.pravatar.cc/150?img=68' // รูปผู้ชาย
    },
    { 
      name: 'Chujai Rakrian', 
      email: 'chujai@example.com', 
      role: 'Admin', 
      isActive: true,
      image: 'https://i.pravatar.cc/150?img=44' // รูปผู้หญิง
    }
  ];
    getAllUsers() {
    this.http.get<any>(`${this.constants.API}/admin/get-users`)
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.usersList = res.data;
           
            this.usersList = res.data.map((user: any) => ({
  ...user,
  profile: user.profile && user.profile.startsWith('http') ? user.profile : `${this.constants.API}/images/${user.profile}`,
  role: user.type === 1 ? 'User' : 'Admin'  // เพิ่มตรงนี้
}));
             console.log(this.usersList);
          }
        },
      });
  }
  userDetail(){
    this.router.navigate(['/admin/user/detail'])
  }
    back() {
     history.back();
  }

}
