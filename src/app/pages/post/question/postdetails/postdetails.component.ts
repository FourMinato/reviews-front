import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Constants } from '../../../../config/constant';
import { AuthService } from '../../../../service/user';
import Swal from 'sweetalert2';
import { checkProfanity } from '../../../../../words/wordValidator';
import { Router } from '@angular/router';

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
  selector: 'app-postdetails',
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './postdetails.component.html',
  styleUrl: './postdetails.component.scss'
})
export class PostdetailsComponent {

  newCommentText: string = '';
  // 1. ตัวแปรควบคุม Popup
  showPopup: boolean = false; // ถ้า true คือเปิด, false คือปิด
  replyToUser: string = '';   // เก็บชื่อคนที่จะตอบ
  replyMessage: string = '';  // เก็บข้อความที่พิมพ์

  questionID: string = '';
  questions: any[] = [];
  comments: any[] = [];
  commentText: string = '';
  isOwner: boolean = false; // ตัวแปรนี้จะใช้เช็คว่าโพสต์นี้เป็นของเราไหม
  isLoggedIn: boolean = false;
  userID: string = '';
  replyToID: string = '';
  repliesText: string = '';
  isAdmin: boolean = false;
  isHidden:boolean = false;
  constructor(private router: Router, private http: HttpClient, private constants: Constants, private authService: AuthService) { }
  ngOnInit() {
    const ID = history.state.questionID || '';
    this.questionID = ID;

    this.checkLogin();
    this.checkUser();
    this.checkAdmin();
    this.getDetailQuestion();
    this.getComments('question', this.questionID);
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
  editQuestion() {
    this.router.navigate(['/edit/question'], {
      state: { questionID: this.questionID }
    });
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
                this.showError(error.error?.message || 'กรุณาลองใหม่อีกครั้ง');
              }
            });
        }
      });
    }


  }

  getDetailQuestion() {
    if (this.isAdmin) {
      this.getDetailQuestionAdmin();
      return;
    }

    this.http.get<any>(`${this.constants.API}/detail/question/${this.questionID}`)
      .subscribe({
        next: (res) => {
          if (res.status === true) {
            this.questions = res.result.map((question: any) => ({
              ...question,
              profile: question.profile && question.profile.startsWith('http') ? question.profile : `${this.constants.API}/images/${question.profile}`
            }));
            if (this.questions[0].uid === this.userID) {
              this.isOwner = true;
            }
          }
        },
        error: (error) => {
          if (error.status === 404) {
            if (error.error?.reason === 'hidden' && this.isAdmin === true) {
              this.getDetailQuestionAdmin();
            } else {
              this.showDeletedPostMessage();
            }
          }
        }
      });
  }

  getDetailQuestionAdmin() {
    this.http.get<any>(`${this.constants.API}/detail/admin/question/${this.questionID}`)
      .subscribe({
        next: (res) => {
          if (res.status === true) {
            this.questions = res.result.map((question: any) => ({
              ...question,
              profile: question.profile && question.profile.startsWith('http') ? question.profile : `${this.constants.API}/images/${question.profile}`
            }));

            if(this.questions[0].open === 0){
              this.isHidden = true;
            }
            
          }
        }
      });
  }

  getComments(type: 'review' | 'question', refId: string) {
    this.http.get<any>(`${this.constants.API}/comment/${type}/${refId}`)
      .subscribe({
        next: (response) => {
          if (response.status === true) {
            this.comments = response.data.map((comment: any) => this.mapCommentData(comment));
          }
        },
        error: () => {

        }
      });
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

  linkToProfile(userID: string) {
    this.router.navigate(['profile/others'], {
      state: { userID: userID }
    });

  }

  createComment(questionID: string) {
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
        type: 'question',
        descriptions: this.commentText,
        questionID: questionID,
      };
      this.http.post<any>(`${this.constants.API}/create/comment/question`, payload)
        .subscribe({
          next: (response) => {
            if (response.status === true) {
              Swal.fire({
                html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ส่งคอมเมนต์สำเร็จ</div>',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
              this.getComments('question', questionID);
              this.commentText = '';
            } else {
              this.showError('ส่งคอมเมนต์ไม่สำเร็จ');
            }
          },
          error: (error) => {
            this.showError(error.error?.message || 'ส่งคอมเมนต์ไม่สำเร็จ');
          }
        });
    }

  }
  createReplies(commentID: string) {
    if (!this.isLoggedIn) {
      this.showError('กรุณาเข้าสู่ระบบก่อน');
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
        type: 'question',
        descriptions: this.repliesText,
        questionID: this.questionID,
        replies_to_id: commentID
      };
      this.http.post<any>(`${this.constants.API}/create/comment/reply/question`, payload)
        .subscribe({
          next: (response) => {
            if (response.status === true) {
              Swal.fire({
                html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ส่งการตอบกลับสำเร็จ</div>',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });

              this.getComments('question', this.questionID);
            } else {
              this.showError('ส่งการตอบกลับไม่สำเร็จ');
              return;
            }
          },
          error: (error) => {
            this.showError('เกิดข้อผิดพลาดในการส่งการตอบกลับ');
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
                  history.back()
                  window.location.reload();
                });
              } else {
                this.showError(response.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
              }
            }
          });
      }
    });

  }

  openPopup(commentOrReplyID: string) {
    this.replyToID = commentOrReplyID;
    this.showPopup = true;
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
  sendReply() {
    this.createReplies(this.replyToID);
    this.repliesText = '';
    this.showPopup = false;
  }

  toggleReplies(comment: Comment) {
    comment.showReplies = !comment.showReplies;
  }


  closePopup() {
    this.showPopup = false;
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
