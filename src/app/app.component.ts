import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from './service/user';
import { Constants } from './config/constant';
import Swal from 'sweetalert2';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'final-project';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private constants: Constants
  ) {}

  ngOnInit() {
    // Check user status on every route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkUserStatus();
      });
      
    // Also check once when the app loads
    this.checkUserStatus();
  }

  private checkUserStatus() {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUser();
      if (user && user.uid) {
        // Fetch latest user data from backend using a public endpoint
        this.http.get<any>(`${this.constants.API}/user/check-status/${user.uid}`).subscribe({
          next: (res) => {
            if (res.status) {
              // The check-status API returns type directly in the response
              if (res.type === 2) {
                this.forceLogoutSuspendedUser();
              }
            }
          },
          error: (err) => {
            // Optional: Handle error if user not found, etc.
          }
        });
      }
    }
  }

  private forceLogoutSuspendedUser() {
    this.authService.logout();
    Swal.fire({
      html: '<div style="font-size: 1.5rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">บัญชีของคุณถูกระงับการใช้งาน โปรดติดต่อผู้ดูแลระบบ</div>',
      icon: 'error',
      confirmButtonText: '<div style="font-size:1.2rem; font-family: \'Kanit\', \'Prompt\', \'Mitr\', \'Noto Sans Thai\', sans-serif;">ตกลง</div>',
      confirmButtonColor: '#000000',
      color: '#000000',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      // Force hard reload to main page
      window.location.href = '/';
    });
  }
}
