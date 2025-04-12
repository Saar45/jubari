import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AppHeaderComponent {
  @Input() title: string = 'Jubari'; // Default title
  @Input() showBackButton: boolean = false;
  @Input() defaultHref: string = '/home';
  @Input() showLogoutButton: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogoutClick() {
    // Call the logout method directly
    this.logout();
  }

  // Add the logout logic here
  logout() {
    // Note: We don't clear component-specific data here as it's handled by page navigation/reinitialization
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
