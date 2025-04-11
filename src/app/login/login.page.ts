import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { RegisterModal } from '../modals/register/register.modal';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class LoginPage {
  loginForm: FormGroup;
  passwordType: string = 'password';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Toggle password visibility between text and password
  togglePasswordVisibility(): void {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  /**
   * Handles user login attempt
   * Validates input, processes authentication, and handles errors
   */
  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      if (this.loginForm.get('email')?.errors) {
        await this.showAlert('Erreur', 'Veuillez entrer une adresse email valide');
        return;
      }
      if (this.loginForm.get('password')?.errors?.['required']) {
        await this.showAlert('Erreur', 'Le mot de passe est requis');
        return;
      }
      if (this.loginForm.get('password')?.errors?.['minlength']) {
        await this.showAlert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      return;
    }
    
    this.isLoading = true;
    try {
      const { email, password } = this.loginForm.value;
      await this.authService.login(email, password).toPromise();
      this.loginForm.reset();
      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (error) {
      await this.showAlert('Erreur', 'Identifiants invalides');
      this.loginForm.get('password')?.reset();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Opens the registration modal
   */
  async openRegisterModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: RegisterModal
    });
    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      await this.showAlert('Succès', 'Inscription réussie. Vous pouvez maintenant vous connecter.');
    }
  }

  /**
   * Helper method to show alert messages
   */
  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  /**
   * Maps error objects to user-friendly messages
   */
  private getErrorMessage(error: any): string {
    if (error?.code === 'auth/wrong-password') {
      return 'Mot de passe incorrect';
    }
    if (error?.code === 'auth/user-not-found') {
      return 'Aucun compte trouvé avec cette adresse email';
    }
    if (error?.code === 'auth/invalid-email') {
      return 'Adresse email invalide';
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  /**
   * Resets form fields
   */
  /*private resetForm(): void {
    this.email = '';
    this.password = '';
  }*/
}