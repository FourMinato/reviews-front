import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../../service/user';
import { Constants } from '../../../config/constant';
@Component({
  selector: 'app-question-all-posts',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionAllPostsComponent {

  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  userID: number = 0;
  questionList: any[] = [];
  isOwner: boolean = false;
  isDropdownOpen: boolean = false;
  selectedSortOption: string = 'โพสต์ล่าสุด';
  activeReportId: number | null = null;
  constructor(private http: HttpClient, private router: Router, private authService: AuthService, private constants: Constants) { }


  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    const user = this.authService.getUser();
    this.userID = user.uid;

    this.getData();
    this.checkAdmin();
  }
  checkAdmin() {
    const user = this.authService.getUser();
    if (user.type === 0) {
      this.isAdmin = true;
    }
  }
  getData() {
    this.http.get<any>(`${this.constants.API}/review/question/date/` + this.userID)
      .subscribe(res => {
        if (res.status === true) {
          this.questionList = res.result.map((question: any) => ({
            ...question,
                       profile: question.profile && question.profile.startsWith('http') ? question.profile : `${this.constants.API}/images/${question.profile}`,
            is_saved: (question.is_saved === 1 || question.is_saved === true)
          }));
        }
      }

      );
  }
  saveToFavorites(questionID: number) {
    if (this.isLoggedIn === false) {
      this.showError('กรุณาเข้าสู่ระบบก่อน');
      return;
    } else {
      const question = this.questionList.find(q => q.id === questionID);
      if (!question) return;
      const previousState = question.is_saved;
      question.is_saved = !question.is_saved;
      const data = { uid: this.userID, questionID: questionID };

      this.http.post<any>(`${this.constants.API}/favorite/question`, data)
        .subscribe({
          next: (response) => {
            if (response.status == true) {
              if (response.action === 'added') {
                Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">บันทึกโพสต์สำเร็จ</div>',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false
                });
              }
            } else {
              question.is_saved = previousState;
            }
          },
          error: (error) => {
            question.is_saved = previousState;
             this.showError(error.error?.message  ||'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
          }
        });
    }
  }
  linkToQuestionDetail(questionID: any) {
    this.router.navigate(['post/question/details'], {
      state: { questionID: questionID }
    });
  }
  toggleSave(btn: any) {

    btn.classList.toggle("saved");
    if (btn.classList.contains("saved")) {
      btn.innerText = "บันทึกแล้ว";
    } else {
      btn.innerText = "บันทึกโพสต์";
    }
  }
  reportQuestion(questionID: number) {
    if (this.isLoggedIn === false) {
       this.showError('กรุณาเข้าสู่ระบบก่อน');
      return;
    } else {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการรายงานโพสต์นี้?</div>',
        icon: 'warning',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#ff4d4d',
        color: '#000000',
        showCancelButton: true,
        cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
        cancelButtonColor: '#000000',
      }).then((result) => {
        if (result.isConfirmed) {
          const data = { uid: this.userID, questionID: questionID };
          this.http.post<any>(`${this.constants.API}/report/question`, data)
            .subscribe({
              next: (response) => {
                if (response.status == true) {
                  Swal.fire({
                    html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">รายงานโพสต์สำเร็จ</div>',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                  });
                } else {
                   this.showError( response.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');               
                }
              },
              error: (error) => {
                 this.showError(error.error?.message || 'กรุณาลองใหม่อีกครั้ง');    
              }
            });
        }
      });
    }
  }

  adminDeleteThisQuestion(questionID: number) {
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการลบโพสต์นี้?</div>',
      icon: 'warning',
      confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
      confirmButtonColor: '#ff4d4d',
      color: '#000000',
      showCancelButton: true,
      cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
      cancelButtonColor: '#000000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete<any>(`${this.constants.API}/delete/admin/delete/question/${questionID}`)
          .subscribe({
            next: (response) => {
              if (response.status == true) {
                Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ลบโพสต์สำเร็จ</div>',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false
                }).then(() => {
                  window.location.reload();
                });
              }else{
                 this.showError( response.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'); 
              }
            }
          });
      }
    });

  }

  closeThisQuestion(questionID: number) {
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการปิดการมองเห็นโพสต์นี้?</div>',
      icon: 'warning',
      confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
      confirmButtonColor: '#ff4d4d',
      color: '#000000',
      showCancelButton: true,
      cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
      cancelButtonColor: '#000000',
    }).then((result) => {
      if (result.isConfirmed) {
        const data = { questionID: questionID };
        this.http.put<any>(`${this.constants.API}/close/question/visibility`, data)
          .subscribe({
            next: (response) => {
              if (response.status == true) {
                Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ปิดการมองเห็นโพสต์สำเร็จ</div>',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false
                }).then(() => {
                  window.location.reload();
                });
              }
              else {
                   this.showError( response.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'); 
              }
            }
          });
      }
    });

  }

  create() {
    if (this.isLoggedIn === false) {
         this.showError('กรุณาเข้าสู่ระบบก่อน'); 
      return;
    }
    else {
      this.router.navigate(['/create/question']);
    }

  }

  toggleReportMenu(id: number, event: Event) {
    event.stopPropagation(); 
    if (this.activeReportId === id) {
      this.activeReportId = null
    } else {
      this.activeReportId = id;
    }
  }


  selectReportReason(id: number, reason: string) {
    alert(`รายงานโพสต์เรียบร้อย: ${reason}`);
    this.activeReportId = null; 
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    event.stopPropagation();
    this.activeReportId = null;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectOption(option: string) {
    this.selectedSortOption = option;
    this.isDropdownOpen = false; 
  }
  editQuestion(questionID: number) {
    this.router.navigate(['/edit/question'], {
      state: { questionID: questionID }
    });
  }



  deleteThisQuestion(questionID: number) {
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการลบโพสต์นี้?</div>',
      icon: 'warning',
      confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
      confirmButtonColor: '#ff4d4d',
      color: '#000000',
      showCancelButton: true,
      cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
      cancelButtonColor: '#000000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete<any>(`${this.constants.API}/delete/question/${questionID}`)
          .subscribe({
            next: (response) => {
              if (response.status == true) {
                Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ลบโพสต์สำเร็จ</div>',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false
                }).then(() => {
                  window.location.reload();
                });
              }else{
                  this.showError( response.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'); 
              }
            }
          });
      }
    });

  }


  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
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