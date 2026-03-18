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
  isHidden:boolean = false;
  constructor(private router: Router, private http: HttpClient, private constants: Constants, private authService: AuthService) { }
  ngOnInit() {
    const ID = history.state.reviewID || '';
    this.reviewID = ID;

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
  }
  checkAdmin() {
    const type = this.authService.getUser().type;
    if (type == 1) {
      this.isAdmin = true;
    }
  }
getDetailReview() {
  if (this.isAdmin) {
    this.getDetailReviewAdmin();
    return;
  }
  this.http.get<any>(`${this.constants.API}/detail/review/${this.reviewID}`)
    .subscribe({
      next: (response) => {
        if (response.status === true) {
          this.reviews = response.result.map((review: any) => ({
            ...review,
            profile: review.profile && review.profile.startsWith('http') ? review.profile : `${this.constants.API}/images/${review.profile}`
          }));
          if (this.reviews[0].uid === this.userID) this.isOwner = true;
          if (this.reviews[0].is_anonymous === true) this.isAnonymous = true;
        }
      },
      error: (error) => {
        if (error.status === 404) {
          if (error.error?.reason === 'hidden' && this.isAdmin === true) {
            this.getDetailReviewAdmin();
          } else {
            this.showDeletedPostMessage();
          }
        }
      }
    });
}

getDetailReviewAdmin() {
  this.http.get<any>(`${this.constants.API}/detail/admin/review/${this.reviewID}`)
    .subscribe({
      next: (response) => {
        if (response.status === true) {
          this.reviews = response.result.map((review: any) => ({
            ...review,
            profile: review.profile && review.profile.startsWith('http') ? review.profile : `${this.constants.API}/images/${review.profile}`
          }));
          if (this.reviews[0].uid === this.userID) this.isOwner = true;
          if (this.reviews[0].is_anonymous === true) this.isAnonymous = true;
          if (response.is_hidden) this.isHidden = true;
        }
      }
    });
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
              } else {
                this.showError(response.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
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
            this.comments = response.data.map((comment: any) => this.mapCommentData(comment));
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
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">โพสต์ดังกล่าวถูกลบหรือปิดการมองเห็นไปแล้ว</div>',
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

  mapCommentData(node: any): any {
    if (node.avatarUrl && !node.avatarUrl.startsWith('http')) {
      node.avatarUrl = `${this.constants.API}/images/${node.avatarUrl}`;
    }

    if (node.replies && node.replies.length > 0) {
      node.replies = node.replies.map((reply: any) => this.mapCommentData(reply));
    }

    return node;
  }

  createComment() {
    if (!this.isLoggedIn) {
      this.showError('กรุณาเข้าสู่ระบบก่อน');
      return;
    }
    if (this.commentText.trim() === '') {
      this.showError('กรุณากรอกข้อความคอมเมนต์');
      return;
    }
    if (this.commentText.length > 45) {
      this.showError('ข้อความมีขนาดยาวเกิน 45 ตัวอักษร');
      return;
    }

    const textCheck = checkProfanity(this.commentText);
    if (textCheck.isBad) {
      this.showError('ข้อความของคุณมีคำที่ไม่เหมาะสม');
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
              this.showError(response.message || 'เกิดข้อผิดพลาด');
            }
          },
          error: (error) => {
            this.showError(error.error?.message || 'เกิดข้อผิดพลาด');
            return;
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
      this.showError('กรุณากรอกข้อความคอมเมนต์');
      return;
    }
    if (this.repliesText.length > 45) {
      this.showError('ข้อความมีขนาดยาวเกิน 45 ตัวอักษร');
      return;
    }

    const textCheck = checkProfanity(this.repliesText);
    if (textCheck.isBad) {
      this.showError('ข้อความของคุณมีคำที่ไม่เหมาะสม');
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
              this.showError(response.message || 'เกิดข้อผิดพลาด');

            }
          },
          error: (error) => {
            this.showError(error.error?.message || 'เกิดข้อผิดพลาด');
            return;
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
                  this.showError(response.message || 'เกิดข้อผิดพลาด');
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


  toggleReplies(comment: Comment) {
    comment.showReplies = !comment.showReplies;
  }
  openPopup(commentOrReplyID: string) {
    this.replyToID = commentOrReplyID;
    this.showPopup = true;
  }
  sendReply() {
    this.createReplies(this.replyToID);
    this.repliesText = '';
    this.showPopup = false;
  }
  openPopupForReply(targetCommentOrReply: any) {
    this.currentReplyTarget = targetCommentOrReply;
    this.showPopup = true;

  }

  closePopup() {
    this.showPopup = false;
  }
  linkToProfile(userID: string) {
    this.router.navigate(['profile/others'], {
      state: { userID: userID }
    });

  }


  toggleMenu(reply: any, event: Event) {
    event.stopPropagation();

    if (reply.showMenu) {
      reply.showMenu = false;
    } else {
      reply.showMenu = true;
    }
  }


  toggleReplyMenu(reply: any, event: Event) {
    event.stopPropagation();
    if (reply.showMenu) {
      reply.showMenu = false;
    } else {
      reply.showMenu = true;
    }
  }

  reportComment(commentID: any, event: Event) {
    event.stopPropagation();
    if (this.isLoggedIn === false) {
      this.showError('กรุณาเข้าสู่ระบบก่อน');
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
                  this.showError(response.message || 'เกิดข้อผิดพลาด');
                }
              },
              error: (error) => {
                this.showError(error.error?.message || 'เกิดข้อผิดพลาด');
              }
            });
        }
      });
    }


  }

  deleteComment(commentID: any) {

    if (this.isLoggedIn === false) {
      this.showError('กรุณาเข้าสู่ระบบก่อน');
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
                  this.showError(response.message || 'เกิดข้อผิดพลาด');

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
  }
  currentReplyTarget: any = null;
  isLoggedInFalse() {
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
      icon: 'error',
      confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
      confirmButtonColor: '#000000',
      color: '#000000'
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