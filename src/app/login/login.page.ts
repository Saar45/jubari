import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { RegisterModal } from '../modals/register/register.modal';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  passwordType: string = 'password';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalCtrl: ModalController
  ) {}

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  async login() {
    if (!this.email || !this.password) return;
    
    this.isLoading = true;
    try {
      await this.authService.login(this.email, this.password).toPromise();
      this.email = '';
      this.password = '';
      // Replace URL to prevent back navigation to login
      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (error) {
      console.error('Login failed:', error);
      this.password = ''; // Clear password on failed attempt
      // Handle login error (show toast or alert)
    } finally {
      this.isLoading = false;
    }
  }

  async openRegisterModal() {
    const modal = await this.modalCtrl.create({
      component: RegisterModal
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // Handle registration data if needed
      console.log('Registration data:', data);
    }
  }
}