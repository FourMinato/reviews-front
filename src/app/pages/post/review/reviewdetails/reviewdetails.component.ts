import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Constants } from '../../../../config/constant';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../service/user';
import { checkProfanity } from '../../../../../words/wordValidator';
import { Router } from '@angular/router';

interface ApiResponse<T> {
  status: boolean;
  result: T;
}

interface Comment {
  id: string;
  username: string;
  avatarUrl: string; // ใช้ URL หรือ path ของรูป
  content: string;
  isReportable: boolean;
  replies: Comment[]; // ต้องเป็น Type Comment[]
  showReplies: boolean; // ต้องมีตัวนี้
}

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  date: string;
  content: string;
  comments: Comment[];
}
@Component({
  selector: 'app-reviewdetails',
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './reviewdetails.component.html',
  styleUrl: './reviewdetails.component.scss'
})
export class ReviewdetailsComponent {


  // 1. ตัวแปรควบคุม Popup
  showPopup: boolean = false; // ถ้า true คือเปิด, false คือปิด
  reviewID: string = '';
  reviews: any[] = [];
  comments: any[] = [];
  commentText: string = '';
  isLoggedIn: boolean = false;
  userID: string = '';
  isOwner: boolean = false;
  repliesText: string = '';
  isAnonymous: boolean = false;
  replyToID: string = '';
  isAdmin: boolean = false;
  constructor(private router: Router, private http: HttpClient, private constants: Constants, private authService: AuthService) { }
  ngOnInit() {
    const ID = history.state.reviewID || '';
    this.reviewID = ID;
    console.log("reviewID id is " + this.reviewID);

    this.checkLogin();
    this.checkUser();
    this.checkAdmin();
    this.getDetailReview();
    this.getComments('review', this.reviewID);

  }
  checkLogin() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }
  checkUser() {
    const uid = this.authService.getUser().uid;
    this.userID = uid;
    console.log(this.userID);

  }
  checkAdmin() {
    const type = this.authService.getUser().type;
    if (type == 0) {
      this.isAdmin = true;
      console.log("admin type = " + this.isAdmin);

    }
  }
  getDetailReview() {
    this.http.get<any>(`${this.constants.API}/detail/review/${this.reviewID}`)
      .subscribe({
        next: (response) => {
          if (response.status === true) {
            this.reviews = response.result.map((review: any) => ({
              ...review,
              profile: `${this.constants.API}/images/${review.profile}`
            }));
            if (this.reviews[0].uid === this.userID) {
              this.isOwner = true;
            }
            if (this.reviews[0].is_anonymous === true) {
              this.isAnonymous = true;
            }
          }
        },
        error: (error) => {
          if (error.status === 404) {
            this.showDeletedPostMessage();
          }
        }
      }
      );
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
                  history.back();
                });
              }
            }
          });
      }
    });

  }
  getComments(type: 'review' | 'question', refId: string) {
    this.http.get<any>(`${this.constants.API}/comment/review/${type}/${refId}`)
      .subscribe({
        next: (response) => {
          if (response.status === true) {

            // เรียกใช้ฟังก์ชัน mapRecursive ที่เราสร้างขึ้น
            this.comments = response.data.map((comment: any) => this.mapCommentData(comment));

            console.log('Comments:', this.comments);
          }
        },
        error: (error) => {
          if (error.status === 404) {
            this.showDeletedPostMessage();
          }
        }
      });
  }
  showDeletedPostMessage() {
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">โพสต์ดังกล่าวถูกลบไปแล้ว</div>',
      icon: 'error',
      confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
      confirmButtonColor: '#000000',
      color: '#000000'
    }).then((result) => {
      if (result.isConfirmed) {
        history.back();
      }
    });
    return;
  }
  // --- สร้างฟังก์ชันนี้เพิ่มครับ ---
  // ฟังก์ชันนี้จะจัดการเติม URL ให้รูป และวนลูปเข้าไปจัดการ replies ย่อยๆ ด้วย
  mapCommentData(node: any): any {
    // 1. จัดการรูปภาพของ Node ปัจจุบัน
    if (node.avatarUrl && !node.avatarUrl.startsWith('http')) {
      node.avatarUrl = `${this.constants.API}/images/${node.avatarUrl}`;
    }

    // 2. ถ้ามี replies ให้เรียกฟังก์ชันนี้ซ้ำ (Recursive) กับลูกๆ ทุกตัว
    if (node.replies && node.replies.length > 0) {
      node.replies = node.replies.map((reply: any) => this.mapCommentData(reply));
    }

    return node;
  }

  createComment() {
    if (!this.isLoggedIn) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    if (this.commentText.trim() === '') {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณากรอกข้อความคอมเมนต์</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    if (this.commentText.length > 45) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ข้อความมีขนาดยาวเกิน 45 ตัวอักษร</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }

    const textCheck = checkProfanity(this.commentText);
    if (textCheck.isBad) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ข้อความของคุณมีคำที่ไม่เหมาะสม</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    } else {
      const payload = {
        uid: this.userID,
        type: 'review',
        descriptions: this.commentText,
        reviewID: this.reviewID,
      };
      this.http.post<any>(`${this.constants.API}/create/comment/review`, payload)
        .subscribe({
          next: (response) => {
            if (response.status === true) {
              Swal.fire({
                html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ส่งคอมเมนต์สำเร็จ</div>',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
              this.getComments('review', this.reviewID);
              this.commentText = '';
            } else {
              Swal.fire({
                html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ส่งคอมเมนต์ไม่สำเร็จ</div>',
                icon: 'error',
                confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
                confirmButtonColor: '#000000',
                color: '#000000'
              });
            }
          },
          error: (error) => {
            console.error('Error creating comment:', error);
            Swal.fire({
              html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">เกิดข้อผิดพลาดในการส่งคอมเมนต์</div>',
              icon: 'error',
              confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
              confirmButtonColor: '#000000',
              color: '#000000'
            });
          }
        });
    }

  }

  createReplies(commentID: string) {
    if (!this.isLoggedIn) {
      this.isLoggedInFalse();
      return;
    }
    if (this.repliesText.trim() === '') {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณากรอกข้อความคอมเมนต์</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }
    if (this.repliesText.length > 45) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ข้อความมีขนาดยาวเกิน 45 ตัวอักษร</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    }

    const textCheck = checkProfanity(this.repliesText);
    if (textCheck.isBad) {
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ข้อความของคุณมีคำที่ไม่เหมาะสม</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
      return;
    } else {
      const payload = {
        uid: this.userID,
        type: 'review',
        descriptions: this.repliesText,
        reviewID: this.reviewID,
        replies_to_id: commentID
      };
      this.http.post<any>(`${this.constants.API}/create/comment/reply/review`, payload)
        .subscribe({
          next: (response) => {
            if (response.status === true) {
              Swal.fire({
                html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ส่งการตอบกลับสำเร็จ</div>',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });

              this.getComments('review', this.reviewID);
            } else {
              Swal.fire({
                html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ส่งการตอบกลับไม่สำเร็จ</div>',
                icon: 'error',
                confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
                confirmButtonColor: '#000000',
                color: '#000000'
              });
            }
          },
          error: (error) => {
            console.error('Error creating comment:', error);
            Swal.fire({
              html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">เกิดข้อผิดพลาดในการส่งการตอบกลับ</div>',
              icon: 'error',
              confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
              confirmButtonColor: '#000000',
              color: '#000000'
            });
          }
        });
    }

  }
  edtitReview() {
    this.router.navigate(['/edit/review'], {
      state: { reviewID: this.reviewID }
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
          const data = { uid: this.userID, reviewID: reviewID };
          console.log(data);

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


  toggleReplies(comment: Comment) {
    comment.showReplies = !comment.showReplies;
  }

  // 2. ฟังก์ชันเปิด Popup (เรียกเมื่อกดปุ่มตอบกลับ)
  openPopup(commentOrReplyID: string) {
    this.replyToID = commentOrReplyID;
    console.log('Opening popup for ID:', this.replyToID);

    this.showPopup = true;
  }
  sendReply() {
    console.log(this.repliesText);
    this.createReplies(this.replyToID);
    this.repliesText = '';
    this.showPopup = false;
  }
  openPopupForReply(targetCommentOrReply: any) {
    this.currentReplyTarget = targetCommentOrReply;
    this.showPopup = true;
    // อาจจะ log ดูว่าตอบใคร: console.log('Replying to ID:', targetCommentOrReply.id);
  }
  // 3. ฟังก์ชันปิด Popup (เรียกเมื่อกดปุ่มยกเลิก หรือกดพื้นหลัง)
  closePopup() {
    this.showPopup = false;      // สั่งปิด Popup
  }
  linkToProfile(userID: string) {
    this.router.navigate(['profile/others'], {
      state: { userID: userID }
    });

  }


  toggleMenu(reply: any, event: Event) {
    event.stopPropagation(); // ป้องกันไม่ให้ไปกระทบ event คลิกอื่นๆ

    // ถ้ากดตัวเดิมให้ปิด (Toggle)
    if (reply.showMenu) {
      reply.showMenu = false;
    } else {
      // (Optional) ปิดเมนูของคนอื่นก่อนเปิดอันใหม่ (ต้องเขียน loop วนปิด)
      // this.closeAllMenus(); 

      reply.showMenu = true;
    }
  }

  // ฟังก์ชันเปิด/ปิด เมนู
  toggleReplyMenu(reply: any, event: Event) {
    event.stopPropagation(); // ป้องกันไม่ให้ไปกระทบ event คลิกอื่นๆ

    // ถ้ากดตัวเดิมให้ปิด (Toggle)
    if (reply.showMenu) {
      reply.showMenu = false;
    } else {
      // (Optional) ปิดเมนูของคนอื่นก่อนเปิดอันใหม่ (ต้องเขียน loop วนปิด)
      // this.closeAllMenus(); 

      reply.showMenu = true;
    }
  }

  // ฟังก์ชันกดปุ่มรายงาน
  reportComment(commentID: any, event: Event) {
    event.stopPropagation();
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
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการรายงานความคิดเห็นนี้?</div>',
        icon: 'warning',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#ff4d4d',
        color: '#000000',
        showCancelButton: true,
        cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
        cancelButtonColor: '#000000',
      }).then((result) => {
        if (result.isConfirmed) {
          const data = { commentID: commentID, uid: this.userID };
          this.http.post<any>(`${this.constants.API}/report/comment`, data)
            .subscribe({
              next: (response) => {
                if (response.status == true) {
                  Swal.fire({
                    html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">รายงานความคิดเห็นสำเร็จ</div>',
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

  deleteComment(commentID: any) {

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
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการลบความคิดเห็นนี้?</div>',
        icon: 'warning',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#ff4d4d',
        color: '#000000',
        showCancelButton: true,
        cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
        cancelButtonColor: '#000000',
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete<any>(`${this.constants.API}/delete/comment/` + commentID)
            .subscribe({
              next: (response) => {
                if (response.status == true) {
                  Swal.fire({
                    html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ลบความคิดเห็นสำเร็จ</div>',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                  }).then(() => {
                    window.location.reload();
                  });;
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

  // (แนะนำ) เพิ่ม HostListener เพื่อให้คลิกที่ว่างแล้วเมนูปิดเอง
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // วนลูปปิดเมนูทั้งหมด (คุณอาจต้องเก็บ list comments ไว้ในตัวแปรเพื่อวน loop ปิด showMenu = false)
    // หรือใช้วิธีง่ายๆ คือ set currentMenuId = null
  }
  // 4. ฟังก์ชันส่งข้อความ

  // ใน .ts file
  currentReplyTarget: any = null; // เก็บว่ากำลังจะตอบใคร

  // แก้ไขฟังก์ชันเปิด Popup


  isLoggedInFalse() {
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
      icon: 'error',
      confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
      confirmButtonColor: '#000000',
      color: '#000000'
    });
  }
}