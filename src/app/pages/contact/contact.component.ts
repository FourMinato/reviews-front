import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Constants } from '../../config/constant';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  showEmailForm = false;
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  isLoading = false;

  constructor(private http: HttpClient, private constants: Constants) { }

  toggleEmailForm() {
    this.showEmailForm = !this.showEmailForm;
  }

  sendEmail() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.subject || !this.contactForm.message) {
      this.showError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    this.isLoading = true;
    this.http.post<any>(`${this.constants.API}/user/contact-email`, this.contactForm)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.status) {
            this.showSuccess('แจ้งปัญหาสำเร็จ');
            this.showEmailForm = false;
            this.contactForm = { name: '', email: '', subject: '', message: '' };
          } else {
            this.showError(res.message);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showError('เกิดข้อผิดพลาดในการส่งข้อมูล โปรดลองอีกครั้งภายหลัง');
        }
      });
  }

  back() {
    history.back();
  }

  private showError(message: string) {
    Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit', sans-serif;">${message}</div>`,
      icon: 'error',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#000'
    });
  }

  private showSuccess(message: string) {
    Swal.fire({
      html: `<div style="font-size: 1.5rem; font-family: 'Kanit', sans-serif;">${message}</div>`,
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#28D16F'
    });
  }
}
