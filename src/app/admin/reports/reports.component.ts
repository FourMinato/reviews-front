import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatExpansionModule} from '@angular/material/expansion';
@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule, MatExpansionModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  selected: string = 'all';
  reports: any[] = [];
 testData = [
  {
    title: 'user012 รายงานโพสต์รีวิวสินค้าไม่ตรงปก',
    date: '25-01-2025',
    isRead: false, // อันนี้จะเป็นจุดแดง + ตัวหนา
    isExpanded: false
  },
  {
    title: 'user999 แจ้งความคิดเห็นไม่เหมาะสม',
    date: '24-01-2025',
    isRead: false,  // อันนี้จะไม่มีจุด + ตัวหนังสือปกติ
    isExpanded: false
  }
];
  back() {
    history.back();
  }
  selectBy() {
    console.log('ค่าที่เลือก:', this.selected);

    // เช็คว่าเลือกอะไร
    switch (this.selected) {
      case 'all':
        this.allReports();
        break;
      case 'review':
        this.reviewReports();
        break;
      case 'question':
        this.questionReports();
        break;
      case 'comment':
        this.commentReports();
        break;
      case 'profile':
        this.profileReports();
        break;
    }
  }
  allReports() {
    console.log("allReports");
  }
  reviewReports() {
    console.log("reviewReports");
  }
  questionReports() {
    console.log("questionReports");
  }
  commentReports() {
    console.log("commentReports");
  }
  profileReports() {
    console.log("profileReports");
  }
}
