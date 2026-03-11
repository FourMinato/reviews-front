import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/user';
import { Constants } from '../../config/constant';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-watch-details',
    imports: [CommonModule, HttpClientModule],
    templateUrl: './watch-details.component.html',
    styleUrl: './watch-details.component.scss'
})
export class WatchDetailsComponent {
    currentTab: 'review' | 'qa' = 'review';
    reviewsList: any[] = [];
    questionsList: any[] = [];
    activeMenuId: number | null = null;
    constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

    ngOnInit() {
        this.getQuestions();
        this.getReviews();
    }
    getQuestions() {
        this.http.get<any>(`${this.constants.API}/admin/get-questions`)
            .subscribe({
                next: (res) => {
                    if (res.status) {
                        this.questionsList = res.data;
                        console.log(this.questionsList);

                    }
                }
            });
    }
    getReviews() {
        this.http.get<any>(`${this.constants.API}/admin/get-review`)
            .subscribe({
                next: (res) => {
                    if (res.status) {
                        this.reviewsList = res.data;
                        console.log(this.reviewsList);

                    }
                }
            });
    }

    openQuestion(id: number) {
        Swal.fire({
            html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการเปิดการมองเห็นโพสต์นี้?</div>',
            icon: 'warning',
            confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
            confirmButtonColor: '#ff4d4d',
            color: '#000000',
            showCancelButton: true,
            cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
            cancelButtonColor: '#000000',
        }).then((result) => {
            if (result.isConfirmed) {
                this.http.put<any>(`${this.constants.API}/admin/open-question/${id}`, {})
                    .subscribe({
                        next: (res) => {
                            if (res.status) {
                                Swal.fire({
                                    html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">' + res.message + '</div>',
                                    icon: 'success',
                                    timer: 2000,
                                    showConfirmButton: false
                                }).then(() => {
                                    this.getQuestions();
                                    window.location.reload();
                                });

                            } else {
                                this.showError(res.message || 'เกิดข้อผิดพลาด');
                            }
                        }
                    });
            }
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
                            }
                        }
                    });
            }
        });

    }
    openReview(id: number) {
        Swal.fire({
            html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยืนยันการเปิดการมองเห็นโพสต์นี้?</div>',
            icon: 'warning',
            confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
            confirmButtonColor: '#ff4d4d',
            color: '#000000',
            showCancelButton: true,
            cancelButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ยกเลิก</div>',
            cancelButtonColor: '#000000',
        }).then((result) => {
            if (result.isConfirmed) {
                this.http.put<any>(`${this.constants.API}/admin/open-review/${id}`, {})
                    .subscribe({
                        next: (res) => {
                            if (res.status) {
                                Swal.fire({
                                    html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">' + res.message + '</div>',
                                    icon: 'success',
                                    timer: 2000,
                                    showConfirmButton: false
                                }).then(() => {
                                    this.getQuestions();
                                    window.location.reload();
                                });

                            } else {
                                this.showError(res.message || 'เกิดข้อผิดพลาด');
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
                this.http.delete<any>(`${this.constants.API}/delete//review/${reviewID}`)
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
    setTab(tab: 'review' | 'qa') {
        this.currentTab = tab;
    }
    questions = [
        {
            id: 1,
            type: 'review', // ระบุว่าเป็นรีวิว หรือ ถามตอบ
            authorName: 'testing1',
            profileImage: 'https://i.pravatar.cc/150?img=11', // ใช้รูปโปรไฟล์จำลอง
            savedDate: '2026-03-11T10:00:00Z',
            rating: 5, // จำนวนดาว
            content: 'อาจารย์สอนดีมากครับ เนื้อหาเข้าใจง่าย มีตัวอย่างประกอบเยอะ แนะนำให้ลงเรียนเลยครับ เก็บ A ไม่ยากถ้าตั้งใจส่งงานครบ',
            likes: 12,
            comments: 3
        },
        {
            id: 2,
            type: 'qa',
            authorName: 'Student_Inquirer',
            profileImage: 'https://i.pravatar.cc/150?img=12',
            savedDate: '2026-03-10T14:30:00Z',
            rating: null, // ถามตอบไม่มีดาว
            content: 'มีใครพอมีแนวข้อสอบกลางภาควิชา Database ไหมครับ? อยากรู้ว่าอาจารย์จะออกเน้นวาด ER Diagram หรือเขียน SQL มากกว่ากันครับ?',
            likes: 5,
            comments: 8
        },
        {
            id: 3,
            type: 'review',
            authorName: 'เรียนไปวันๆ',
            profileImage: 'https://i.pravatar.cc/150?img=13',
            savedDate: '2026-03-09T09:15:00Z',
            rating: 4,
            content: 'วิชานี้งานกลุ่มค่อนข้างเยอะครับ ต้องหาเพื่อนที่ช่วยกันทำงานดีๆ เนื้อหามีประโยชน์มากเอาไปใช้ตอนฝึกงานได้จริง หัก 1 ดาวเพราะสั่งงานกระชั้นชิดไปนิด',
            likes: 24,
            comments: 5
        },
        {
            id: 4,
            type: 'qa',
            authorName: 'เด็กหลังห้อง',
            profileImage: 'https://i.pravatar.cc/150?img=14',
            savedDate: '2026-03-08T16:45:00Z',
            rating: null,
            content: 'วิชานี้เช็คชื่อทุกคาบไหมครับ พอดีผมมีธุระต้องลากลับบ้านบ่อย ขาดได้กี่ครั้งครับ?',
            likes: 2,
            comments: 1
        }
    ];
    // ฟังก์ชันสลับการเปิด/ปิดเมนู
    toggleMenu(id: number, event: Event) {
        event.stopPropagation(); // ป้องกันไม่ให้คลิกทะลุไปโดนส่วนอื่น
        if (this.activeMenuId === id) {
            this.activeMenuId = null; // ถ้ากดซ้ำที่เดิม ให้ปิดเมนู
        } else {
            this.activeMenuId = id; // เปิดเมนูของโพสต์ที่กด
        }
    }

    // ฟังก์ชันตัวอย่างเมื่อกดเลือกเมนูต่างๆ
    goToPost(id: number) {
        console.log('ไปยังโพสต์ ID:', id);
        this.activeMenuId = null; // ปิดเมนูหลังกด
    }

    deletePost(id: number) {
        console.log('ลบโพสต์ ID:', id);
        this.activeMenuId = null;
    }

    toggleVisibility(id: number) {
        console.log('เปิด/ปิดการมองเห็นโพสต์ ID:', id);
        this.activeMenuId = null;
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