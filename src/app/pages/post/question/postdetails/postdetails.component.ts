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
  imports: [ HttpClientModule, CommonModule, FormsModule],
  templateUrl: './postdetails.component.html',
  styleUrl: './postdetails.component.scss'
})
export class PostdetailsComponent {

  newCommentText: string = '';
// 1. ตัวแปรควบคุม Popup
showPopup: boolean = false; // ถ้า true คือเปิด, false คือปิด
replyToUser: string = '';   // เก็บชื่อคนที่จะตอบ
replyMessage: string = '';  // เก็บข้อความที่พิมพ์

questionID:string = '';
questions: any[] = [];
comments: any[] = [];
commentText: string = '';
isOwner: boolean = false; // ตัวแปรนี้จะใช้เช็คว่าโพสต์นี้เป็นของเราไหม
isLoggedIn: boolean = false;
userID: string = '';
  replyToID: string = '';
  repliesText: string = '';
  isAdmin: boolean = false;
  constructor(private router: Router, private http: HttpClient, private constants: Constants, private authService: AuthService) { }
ngOnInit() {
    const ID = history.state.questionID || '';
    this.questionID = ID;
    console.log("questionID id is " +this.questionID);
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
    console.log(this.userID);
    
  }
    checkAdmin() {
    const type = this.authService.getUser().type;
    if (type == 0) {
      this.isAdmin = true;
      console.log("admin type = " + this.isAdmin);

    }
  }
    editQuestion() {
    this.router.navigate(['/edit/question'], {
      state: { questionID: this.questionID }
    });
  }
deleteComment(commentID: any) {
  console.log("comment id is : " + commentID);
  

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
    getDetailQuestion() {
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
            this.showDeletedPostMessage();
          }
        }
      }
      );
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

  getComments(type: 'review' | 'question', refId: string) {
  this.http.get<any>(`${this.constants.API}/comment/${type}/${refId}`)
    .subscribe({
      next: (response) => {
        if (response.status === true) {
          
          // เรียกใช้ฟังก์ชัน mapRecursive ที่เราสร้างขึ้น
          this.comments = response.data.map((comment: any) => this.mapCommentData(comment));
          
          console.log('Comments:', this.comments);
        }
      },
      error: (error) => {
        console.error('Error loading comments:', error);
      }
    });
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
reportQuestion(questionID: number) {
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
          const data = { uid: this.userID, questionID: questionID };
          console.log(data);

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

  linkToProfile(userID: string) {
    this.router.navigate(['profile/others'], {
      state: { userID: userID }
    });

  }

  createComment(questionID: string) {
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
      Swal.fire({
        html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">กรุณาเข้าสู่ระบบก่อน</div>',
        icon: 'error',
        confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
        confirmButtonColor: '#000000',
        color: '#000000'
      });
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
// reportComment(reply: any) {
//     console.log('Report logic here for ID:', reply.id);
//     reply.showMenu = false; // กดแล้วปิดเมนู
//     // ใส่โค้ดแจ้งเตือนหรือเรียก API ตรงนี้
// }
  openPopup(commentOrReplyID: string) {
    this.replyToID = commentOrReplyID;
    console.log('Opening popup for ID:', this.replyToID);
    
    this.showPopup = true;
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
  sendReply() {
    console.log(this.repliesText);
    this.createReplies(this.replyToID);
    this.repliesText = '';
    this.showPopup = false;
  }
  postData: Post = {
    id: 'p001',
    author: 'someone015',
    authorAvatar: 'assets/default-avatar.png',
    date: '02-02-2025',
    content: 'Text Test001',
    comments: [
      { 
        id: 'c001',
        username: 'user012',
        avatarUrl: '',
        content: 'เรียนกับอาจารย์ท่านไหนครับ?',
        replies: [],
        showReplies: false,
        isReportable: true
      },
      {
        id: 'c002',
        username: 'user015',
        avatarUrl: '',
        content: 'Sec ไหนดีครับ?',
        showReplies: false, // เริ่มต้นซ่อนไว้
        isReportable: true,
        replies: [
          {
            id: 'r001',
            username: 'someone015',
            avatarUrl: '',
            content: 'user015 Sec1 ครับ?',
            replies: [],
            showReplies: false,
            isReportable: true
          },
          {
            id: 'r002',
            username: 'user015',
            avatarUrl: '',
            content: 'someone015 ขอบคุณครับ',
            replies: [],
            showReplies: false,
            isReportable: true
          }
        ]
      },
      {
        id: 'c003',
        username: 'user019',
        avatarUrl: '',
        content: '***(คำหยาบที่หลุดมาได้)**** อย่าไปเรียน',
        replies: [],
        showReplies: false,
        isReportable: true
      },
      {
        id: 'c004',
        username: 'user055',
        avatarUrl: '',
        content: 'thx kub',
        replies: [],
        showReplies: false,
        isReportable: true
      }
    ]
  };

  // ฟังก์ชันจำลองการส่งคอมเม้นท์
  submitComment() {
    if (this.newCommentText.trim()) {
      const newComment: Comment = {
        id: `c${this.postData.comments.length + 1}`,
        username: 'currentUser', // จำลอง User ปัจจุบัน
        avatarUrl: 'assets/default-avatar.png',
        content: this.newCommentText,
        isReportable: true,
        replies: [],
        showReplies: false
      };
      
      // เพิ่มคอมเม้นท์ใหม่ลงใน Array
      this.postData.comments.push(newComment);
      this.newCommentText = ''; // ล้างช่องข้อความ
    }
  }
  toggleReplies(comment: Comment) {
    comment.showReplies = !comment.showReplies;
  }

  // 2. ฟังก์ชันเปิด Popup (เรียกเมื่อกดปุ่มตอบกลับ)

  // 3. ฟังก์ชันปิด Popup (เรียกเมื่อกดปุ่มยกเลิก หรือกดพื้นหลัง)
  closePopup() {
    this.showPopup = false;      // สั่งปิด Popup
  }

  // 4. ฟังก์ชันส่งข้อความ
}
