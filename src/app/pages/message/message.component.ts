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
  uid: any;
  selectedMessageIds: Set<string> = new Set<string>();
  isAllSelected: boolean = false;

  constructor(private router: Router, private http: HttpClient, private constants: Constants, private authService: AuthService,) { }
  
  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.uid = user.uid;
      this.getMessage(this.uid);
    }
  }

  getMessage(userID: string) {
    this.http.get<any>(`${this.constants.API}/message/notifications/${userID}`)
      .subscribe({
        next: (res) => {
          if (res.status === true) {
            this.messages = res.notifications.map((message: any) => ({
              ...message,
              is_read: (message.is_read === 1 || message.is_read === true),
              selected: false
            }));
            this.updateAllSelectedStatus();
          }
        },
      });
  }

  toggleSelection(message: any) {
    message.selected = !message.selected;
    if (message.selected) {
      this.selectedMessageIds.add(message.id);
    } else {
      this.selectedMessageIds.delete(message.id);
    }
    this.updateAllSelectedStatus();
  }

  toggleAllSelection() {
    this.isAllSelected = !this.isAllSelected;
    this.messages.forEach(m => {
      m.selected = this.isAllSelected;
      if (this.isAllSelected) {
        this.selectedMessageIds.add(m.id);
      } else {
        this.selectedMessageIds.delete(m.id);
      }
    });
  }

  updateAllSelectedStatus() {
    this.isAllSelected = this.messages.length > 0 && this.messages.every(m => m.selected);
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
      }
    });
  }

  markAllAsRead() {
    this.http.patch<any>(`${this.constants.API}/message/notifications/all/${this.uid}/read`, {})
      .subscribe({
        next: (res) => {
          if (res.status === true) {
            this.messages.forEach(m => m.is_read = true);
          }
        }
      });
  }

  deleteMessage(messageID: string) {
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">คุณต้องการลบข้อความนี้ใช่หรือไม่?</div>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#000000'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete<any>(`${this.constants.API}/message/notifications/${messageID}/${this.uid}`)
          .subscribe({
            next: (response) => {
              if (response.status == true) {
                this.messages = this.messages.filter(m => m.id !== messageID);
                this.selectedMessageIds.delete(messageID);
                this.updateAllSelectedStatus();
              }
            },
            error: (error) => {
              this.showError(error.error?.message || 'เกิดข้อผิดพลาด');
            }
          });
      }
    });
  }

  deleteSelected() {
    const selectedIds = Array.from(this.selectedMessageIds);
    if (selectedIds.length === 0) return;

    Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit', 'Prompt', 'Mitr', 'Noto Sans Thai', sans-serif;">คุณต้องการล้างข้อความที่เลือก ${selectedIds.length} รายการใช่หรือไม่?</div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#000000'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.request<any>('DELETE', `${this.constants.API}/message/notifications/batch/${this.uid}`, {
          body: { messageIds: selectedIds }
        }).subscribe({
          next: (res) => {
            if (res.status === true) {
              this.messages = this.messages.filter(m => !this.selectedMessageIds.has(m.id));
              this.selectedMessageIds.clear();
              this.updateAllSelectedStatus();
              Swal.fire({
                html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ลบข้อความที่เลือกสำเร็จ</div>',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
            }
          }
        });
      }
    });
  }

  deleteAll() {
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">คุณต้องการลบข้อความทั้งหมดใช่หรือไม่?</div>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบทั้งหมด',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#000000'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete<any>(`${this.constants.API}/message/notifications/all/${this.uid}`)
          .subscribe({
            next: (res) => {
              if (res.status === true) {
                this.messages = [];
                this.selectedMessageIds.clear();
                this.isAllSelected = false;
                Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ลบข้อความทั้งหมดสำเร็จ</div>',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false
                });
              }
            }
          });
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
