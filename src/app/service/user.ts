import { Injectable } from '@angular/core';
// สำคัญ: อย่าลืมแก้ path ของ environment ให้ตรงกับโปรเจกต์ของคุณนะครับ
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userKey = 'auth_user';

  // ==========================================
  // เพิ่มฟังก์ชันจัดการ URL รูปโปรไฟล์ที่นี่
  // ==========================================
  // ใน AuthService
  // ใน class AuthService
  getProfileImageUrl(profile: string | null, isAnonymous: boolean): string {
    // 1. ถ้าผู้ใช้เลือกไม่ระบุตัวตน (is_anonymous เป็น true หรือ 1)
    if (isAnonymous) {
      return `${environment.apiUrl}/uploads/private-profile.png`;
    }

    // 2. ถ้าไม่มีข้อมูลรูป หรือเป็นค่า default-profile.png (รูปเริ่มต้นตอนสมัคร)
    if (!profile || profile === 'default-profile.png') {
      return `${environment.apiUrl}/uploads/default-profile.png`;
    }

    // 3. ถ้าเป็น URL จาก Firebase (ตรวจสอบว่าขึ้นต้นด้วย http หรือ https)
    if (profile.startsWith('http')) {
      return profile;
    }

    // 4. กรณีไฟล์เก่าที่เคยเก็บแบบ Disk Storage (ถ้ายังมีค้างใน DB)
    return `${environment.apiUrl}/uploads/user-profile/${profile}`;
  }
  // ==========================================

  setUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser() {
    const data = localStorage.getItem(this.userKey);

    try {
      if (!data) {
        // ไม่มี user → ให้ default
        return {
          uid: null,
          type: 1
        };
      }

      const parsed = JSON.parse(data);

      return {
        uid: parsed?.uid ?? null,
        type: parsed?.type ?? 1
      };

    } catch {
      // ถ้า parse error → ส่ง default
      return {
        uid: null,
        type: 1
      };
    }
  }

  isLoggedIn(): boolean {
    const user = this.getUser();
    return !!(user && user.uid);
  }

  logout() {
    localStorage.removeItem(this.userKey);
  }
}