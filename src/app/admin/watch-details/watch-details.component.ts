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
    isAdmin: boolean = false;
    constructor(private router: Router, private http: HttpClient, private authService: AuthService, private constants: Constants) { }

    ngOnInit() {
        this.checkAdmin();
        this.getQuestions();
        this.getReviews();
    }
    checkAdmin() {
        const type = this.authService.getUser().type;
        if (type == 0) {
            this.isAdmin = true;
        }
    }
    getQuestions() {
        this.http.get<any>(`${this.constants.API}/admin/get-questions`)
            .subscribe({
                next: (res) => {
                    if (res.status) {
                        this.questionsList = res.data;
                    }
                },
                error: () => { }
            });
    }
    getReviews() {
        this.http.get<any>(`${this.constants.API}/admin/get-review`)
            .subscribe({
                next: (res) => {
                    if (res.status) {
                        this.reviewsList = res.data;
                    }
                },
                error: () => { }
            });
    }

    openQuestion(id: number) {
        if (this.isAdmin == false) {
            this.showError('ขออภัยมีแค่ผู้ดูแลระบบเท่านั้นที่สามารถทำได้');
            return;
        }
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
        if (this.isAdmin == false) {
            this.showError('ขออภัยมีแค่ผู้ดูแลระบบเท่านั้นที่สามารถทำได้');
            return;
        }
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
        if (this.isAdmin == false) {
            this.showError('ขออภัยมีแค่ผู้ดูแลระบบเท่านั้นที่สามารถทำได้');
            return;
        }
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
        if (this.isAdmin == false) {
            this.showError('ขออภัยมีแค่ผู้ดูแลระบบเท่านั้นที่สามารถทำได้');
            return;
        }
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

    toggleMenu(id: number, event: Event) {
        event.stopPropagation();
        if (this.activeMenuId === id) {
            this.activeMenuId = null;
        } else {
            this.activeMenuId = id;
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