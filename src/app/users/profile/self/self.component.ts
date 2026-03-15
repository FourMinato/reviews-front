import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Constants } from '../../../config/constant';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/user';
import Swal from 'sweetalert2';
import { checkProfanity } from '../../../../words/wordValidator';
@Component({
  selector: 'app-self',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './self.component.html',
  styleUrl: './self.component.scss'
})
export class SelfComponent {
  userID: string = '';
  myReviews: any[] = [];
  myQuestions: any[] = []
myProfile: any = {};
  name: string = '';

email: string = '';
anonymousName: string = '';
oldPassword: string = ''; 
newPassword: string = '';   
confirmPassword: string = '';

showOldPassword = false;
showNewPassword = false;
showConfirmPassword = false;

profileUrl: string = '';  

selectedFile: File | null = null;
previewImage: string = '';

currentTab: string = 'reviews';
    constructor(private http: HttpClient, private constants: Constants, private router: Router, private authService: AuthService) { }
 
  ngOnInit() {
    this.checkUser();
    this.getMyProfile();
    this.getMyReviews();
    this.getMyQuestions();
  }
    checkUser() {
    const uid = this.authService.getUser().uid;
    this.userID = uid;
  }


getMyProfile() {
  this.http.get<any>(`${this.constants.API}/user/myprofile/${this.userID}`)
    .subscribe(res => {
      if (res.status === true) {
        this.myProfile = res.data;

        this.name = this.myProfile.name;
        this.email = this.myProfile.email;
        this.profileUrl = this.myProfile.profile && this.myProfile.profile.startsWith('http') 
          ? this.myProfile.profile 
          : `${this.constants.API}/images/${this.myProfile.profile}`;
      }
    });
}
getMyReviews() {
    this.http.get<any>(`${this.constants.API}/user/getmyreview/${this.userID}`)
      .subscribe(res => {
        if (res.status === true) {
            this.myReviews = res.data;
        }
   
      });
  }

  getMyQuestions() {
    this.http.get<any>(`${this.constants.API}/user/getmyquestion/${this.userID}`)
      .subscribe(res => {
          if (res.status === true) {
             this.myQuestions = res.data;
          }
       
      });
  }
  linkToDetails(reviewID: string) {
    this.router.navigate(['post/review/details'], {
      state: { reviewID: reviewID }
    });
  }
    linkToQuestionDetail(questionID:any){
          this.router.navigate(['post/question/details'], {
        state: { questionID: questionID }
      });
  }
updateUser() {
  if (this.selectedFile) {
    const formData = new FormData();
    formData.append('profileImage', this.selectedFile); // ชื่อต้องตรงกับ upload.single('profileImage')

    this.http.post<any>(`${this.constants.API}/upload/profile/${this.userID}`, formData)
      .subscribe({
        next: (res) => {
          if (res.status === true) {
            this.sendUpdateUser(this.userID); // รูปอัปโหลดสำเร็จ ค่อย update ข้อมูลอื่น
          }
        },
        error: (err) => {}
      });
  } else {
    this.sendUpdateUser(this.userID);
  }
}

sendUpdateUser(uid: string) {
  // validate email
  if(!this.name.trim()){
    this.showError('กรุณากรอกชื่อผู้ใช้');
    return;
  }
  const textCheck = checkProfanity(this.name);
  if (textCheck.isBad) {
    this.showError('ชื่อผู้ใช้มีคำที่ไม่เหมาะสม');
    return;
  }
if (this.newPassword) {
  if (this.newPassword.length < 6) {
    this.showError('รหัสผ่านห้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    return;
  }
  if (!this.oldPassword) {
    this.showError('กรุณากรอกรหัสผ่านเดิมเพื่อยืนยันการเปลี่ยนรหัสผ่าน');
    return;
  }
  if (this.newPassword !== this.confirmPassword) {
    this.showError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
    return;
  }
}

  let anonymousName = this.name;
  if (this.name.length > 2) {
    anonymousName = this.name[0] + '*'.repeat(this.name.length - 2) + this.name[this.name.length - 1];
  } else if (this.name.length === 2) {
    anonymousName = this.name[0] + '*';
  }

  const body: any = {
    name: this.name,
    email: this.email,  // ส่งไปอยู่แล้ว
    anonymous_name: anonymousName,
  };


  if (this.newPassword) {
    body.password = this.newPassword;
    body.oldPassword = this.oldPassword;
  }

  this.http.put(`${this.constants.API}/user/update-user/${uid}`, body)
    .subscribe({
      next: (res: any) => {
        if (res.status === true) {
         this.showSuccess(res.message || 'อัปเดตข้อมูลสำเร็จ').then(() => {
            this.oldPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
            this.getMyProfile(); // ดึงข้อมูลใหม่มาแสดง
          });
        } else {
          this.showError(res.message || 'อัปเดตข้อมูลไม่สำเร็จ');
        }
      },
      error: (err) => this.showError(err.error?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์')
    });
}
// ฟังก์ชันเปลี่ยน Tab
tab(tabName: string) {
  this.currentTab = tabName;
}

onFileSelected(event: any) {
  const file = event.target.files[0];

  if (file) {
    if (!file.type.match('image.*')) {
      this.showError('โปรดเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    this.selectedFile = file; // เก็บไฟล์จริงไว้
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewImage = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

back() {
  history.back();
}

  private showError(message: string) {
    Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">${message}</div>`,
      icon: 'error',
      confirmButtonText: `<div style="font-size:1.2rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">ตกลง</div>`,
      confirmButtonColor: '#000000',
      color: '#000000'
    });
  }

  private showSuccess(message: string) {
    return Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">${message}</div>`,
      icon: 'success',
      confirmButtonText: `<div style="font-size:1.2rem; font-family: 'Kanit','Prompt','Mitr','Noto Sans Thai',sans-serif;">ตกลง</div>`,
      confirmButtonColor: '#28D16F',
      color: '#000000'
    });
  }
}
