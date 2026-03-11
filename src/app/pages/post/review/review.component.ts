import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Constants } from '../../../config/constant';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../service/user';

interface ApiResponse<T> {
  status: boolean;
  result: T;
}
@Component({
  selector: 'app-review-all-posts',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewAllPostsComponent {


  isDropdownOpen: boolean = false;
  selectedSortOption: string = 'โพสต์ล่าสุด'; // ค่าเริ่มต้น
  activeReportId: number | null = null; // เก็บ ID ของการ์ดที่กำลังเปิดเมนู (ถ้าไม่มีให้เป็น null)

  subjectID: string = '';
  reviews: any[] = [];
  selectedOrder: string = 'sort-date';
  subjectData: any[] = [];
  isLoggedIn: boolean = false;
  userID: string = '';
  isAdmin: boolean = false;
  isOwner: boolean = false;
  constructor(private http: HttpClient, private constants: Constants, private router: Router, private authService: AuthService) { }
  ngOnInit() {
    const ID = history.state.subjectID || '';
    this.subjectID = ID;

    this.checkLogin();
    this.checkUser();
    this.checkAdmin();
    this.getSubjectData();
    this.checkBox();
  }
  checkLogin() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }
  checkUser() {
    const uid = this.authService.getUser().uid;
    this.userID = uid;
  }
  checkAdmin() {
    const type = this.authService.getUser().type;
    if (type == 0) {
      this.isAdmin = true;
    }
  }
  getSubjectData() {
    this.http.get<any>(`${this.constants.API}/subject/data/${this.subjectID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.subjectData = res.result;
        }
      });
  }
  checkBox() {
    switch (this.selectedOrder) {
      case 'sort-date':
        this.getReviewByDate()
        break;
      case 'sort-like':
        this.getReviewByLike();
        break;
    }
  }
  getReviewByDate() {
    this.http.get<any>(`${this.constants.API}/review/review/date/${this.subjectID}/${this.userID}`)
      .subscribe(res => {
        if (res.status === true) {
          // แปลง path รูปภาพให้เป็น URL เต็ม
          this.reviews = res.result.map((review: any) => ({
            ...review,
            profile: review.profile && review.profile.startsWith('http') ? review.profile : `${this.constants.API}/images/${review.profile}`,
            is_saved: (review.is_saved === 1 || review.is_saved === true)
          }));
        }
      });
  }

  getReviewByLike() {
    this.http.get<any>(`${this.constants.API}/review/review/like/${this.subjectID}/${this.userID}`)
      .subscribe(res => {
        if (res.status === true) {
          this.reviews = res.result.map((review: any) => ({
            ...review,
            profile: review.profile && review.profile.startsWith('http') ? review.profile : `${this.constants.API}/images/${review.profile}`,
            is_saved: (review.is_saved === 1 || review.is_saved === true)
          }));
        }
      });
  }
  edtitReview(reviewID: number) {
    this.router.navigate(['/edit/review'], {
      state: { reviewID: reviewID }
    });
  }
  reportReview(reviewID: number) {
    if (this.isLoggedIn === false) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    } else {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการรายงานรีวิวนี้?</div>',
        icon: 'warning',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#ff4d4d',
        color: '#000000',
        showCancelButton: true,
        cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
        cancelButtonColor: '#000000',
      }).then((result) => {
        if (result.isConfirmed) {
          const data = { uid: this.userID, reviewID: reviewID };
          this.http.post<any>(`${this.constants.API}/report/review`, data)
            .subscribe({
              next: (response) => {
                if (response.status == true) {
                  Swal.fire({
                    html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">รายงานรีวิวสำเร็จ</div>',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                  });
                } else {
                  Swal.fire({
                    html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">' + response.message + '</div>',
                    icon: 'error',
                    confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
                    confirmButtonColor: '#000000',
                    color: '#000000'
                  });
                }
              },
              error: (error) => {
                Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">' + (error.error?.message || 'กรุณาลองใหม่อีกครั้ง') + '</div>',
                  icon: 'error',
                  confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
                  confirmButtonColor: '#000000',
                  color: '#000000'
                });
              }
            });
        }
      });
    }
  }
  closeThisReview(reviewID: number) {
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
        const data = { reviewID: reviewID };
        this.http.put<any>(`${this.constants.API}/close/review/visibility`, data)
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
                Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">' + response.message + '</div>',
                  icon: 'error',
                  confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
                  confirmButtonColor: '#000000',
                  color: '#000000'
                });
              }
            }
          });
      }
      });

  }
  deleteThisReview(reviewID: number) {
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
        this.http.delete<any>(`${this.constants.API}/delete/review/${reviewID}`)
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
              }
            }
          });
      }
    });

  }
  saveReviewToFavorites(reviewID: number) {
    if (this.isLoggedIn === false) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    } else {
      const review = this.reviews.find((r: any) => r.pid === reviewID);
      if (!review) return;

      const previousState = review.is_saved;

      review.is_saved = !review.is_saved;

      const data = { uid: this.userID, reviewID: reviewID };

      this.http.post<any>(`${this.constants.API}/favorite/review`, data)
        .subscribe({
          next: (response) => {
            if (response.status == true) {
              if (response.action === 'added') {
                Swal.fire({
                  html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">บันทึกรีวิวสำเร็จ</div>',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false
                });
              }
            } else {
              review.is_saved = previousState;
            }
          },
          error: (error) => {
            review.is_saved = previousState;
            Swal.fire({
              html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</div>',
              icon: 'error',
              confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
              confirmButtonColor: '#000000',
              color: '#000000'
            });
          }
        });
    }
  }
  toggleLike(reviewID: number) {
    if (this.isLoggedIn === false) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    const review = this.reviews.find((r: any) => r.pid === reviewID);
    if (!review) return;
    const previousLikedState = review.is_liked;
    const previousLikeCount = review.like_count;

    review.is_liked = !review.is_liked;
    review.like_count = review.is_liked ? previousLikeCount + 1 : previousLikeCount - 1;

    const data = { uid: this.userID, reviewID: reviewID };

    this.http.post<any>(`${this.constants.API}/update/like`, data)
      .subscribe({
        next: (response) => {
          if (response.status == true) {
            review.like_count = response.like_count;
          } else {
            review.is_liked = previousLikedState;
            review.like_count = previousLikeCount;
          }
        },
        error: (error) => {
          review.is_liked = previousLikedState;
          review.like_count = previousLikeCount;
          Swal.fire({
            html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</div>',
            icon: 'error',
            confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
            confirmButtonColor: '#000000',
            color: '#000000'
          });
        }
      });
  }

  createReview() {
    const subjectID = this.subjectID;
    if (this.isLoggedIn === false) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    else {
      this.router.navigate(['/create/review'], {
        state: { subjectID: subjectID }
      });
    }

  }
  adminDeleteThisReview(reviewID: number) {
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
        this.http.delete<any>(`${this.constants.API}/delete/admin/delete/review/${reviewID}`)
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
              }
            }
          });
      }
    });

  }
  linkToDetails(reviewID: string) {
    this.router.navigate(['post/review/details'], {
      state: { reviewID: reviewID }
    });
  }

  toggleReportMenu(id: number, event: Event) {
    event.stopPropagation();
    if (this.activeReportId === id) {
      this.activeReportId = null;
    } else {
      this.activeReportId = id;
    }
  }

  // ฟังก์ชันเมื่อกดเลือกหัวข้อ
  selectReportReason(id: number, reason: string) {
    alert(`รายงานโพสต์เรียบร้อย: ${reason}`);
    this.activeReportId = null; // ปิดเมนูหลังเลือกเสร็จ
  }

  // (Optional) คลิกที่ว่างๆ แล้วให้เมนูปิด
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    event.stopPropagation();
    this.activeReportId = null;
  }

  // toggleDropdown() {
  //   this.isDropdownOpen = !this.isDropdownOpen;
  // }

  selectOption(option: string) {
    this.selectedSortOption = option;
    this.isDropdownOpen = false; // ปิด dropdown หลังเลือก
    // TODO: เรียกฟังก์ชัน sort ข้อมูลจริงที่นี่
  }


  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }
  back() {
    history.back();
  }
}
