import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-message',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  messages: any[] = [];
  uid:any;
  constructor(private router: Router, private http: HttpClient, private constants: Constants, private authService: AuthService,) { }
  ngOnInit() {
    const uid = this.authService.getUser().uid;
    this.uid = uid;
    this.getMessage(uid);
  }
  getMessage(userID: string) {
    this.http.get<any>(`${this.constants.API}/message/notifications/${userID}`)
      .subscribe({
        next: (res) => {
          if (res.status === true) {
            this.messages = res.notifications.map((message: any) => ({
              ...message,
              is_read: (message.is_read === 1 || message.is_read === true)
            }));
          }
        },
      });
  }
  updateMessageStatus(messageID: string) {
    this.http.patch<any>(
      `${this.constants.API}/message/notifications/${messageID}/read`,
      {}
    ).subscribe({
      next: (res) => {
        if (res.status === true) {
          const message = this.messages.find(m => m.id === messageID);
          if (message) {
            message.is_read = true;
          }
        }
      },
      error: (err) => {
      }
    });
  }
  linkToPost(type: string, ref_id: string) {
    if (type === 'review') {
      this.router.navigate(['/post/review/details'], { state: { reviewID: ref_id } });
    }
    else if (type === 'question') {
      this.router.navigate(['/post/question/details'], { state: { questionID: ref_id } });
    }
  }
  deleteMessage(messageID: string) {
    this.http.delete<any>(`${this.constants.API}/message/notifications/${messageID}/${this.uid}`)
      .subscribe({
        next: (response) => {
          if (response.status == true) {
            Swal.fire({
              html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ลบข้อความสำเร็จ</div>',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              window.location.reload();
            });
          }
        },
        error: (error) => {
          this.showError(error.error?.message || 'เกิดข้อผิดพลาด');
          return;
        }
      });
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
}
