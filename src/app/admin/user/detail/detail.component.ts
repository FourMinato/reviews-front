import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  isEditing = false;

// ข้อมูลจำลอง 
  user = {
    id: 1,
    name: 'Somchai Jaidee',
    email: 'somchai@example.com',
    role: 'Admin',
    image: 'https://i.pravatar.cc/300?img=11'
  };
tempUser: any = {};

  toggleEdit() {
    this.isEditing = true;
    this.tempUser = { ...this.user }; 
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveEdit() {
    this.user = { ...this.tempUser };
    
    // 2. (Optional) ยิง API ไปอัปเดตที่ Database ตรงนี้
    // this.userService.updateUser(this.user).subscribe(...)

    this.isEditing = false; // ปิดโหมดแก้ไข
  }

  back() {
     history.back();
  }
}
