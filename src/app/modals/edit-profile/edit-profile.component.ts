import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { AdamantiumService } from '../../services/adamantium.service';

@Component({
  selector: 'app-edit-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Modifier mon profil</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()" color="medium">
            <ion-icon name="close-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="profileForm">
        <ion-item>
          <ion-label position="floating">Prénom</ion-label>
          <ion-input formControlName="prenom" type="text"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Nom</ion-label>
          <ion-input formControlName="nom" type="text"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input formControlName="email" type="email"></ion-input>
        </ion-item>

        <ion-button expand="block" 
                    (click)="onSubmitProfile()" 
                    [disabled]="!isProfileValid()"
                    class="ion-margin-top">
          Enregistrer les modifications
        </ion-button>

        <div class="password-section">
          <ion-text color="medium">
            <h6>Modification du mot de passe</h6>
          </ion-text>
          <ion-item>
            <ion-label position="floating">Ancien mot de passe</ion-label>
            <ion-input formControlName="oldPassword" [type]="oldPasswordType"></ion-input>
            <ion-icon [name]="oldPasswordType === 'password' ? 'eye-outline' : 'eye-off-outline'"
                    (click)="toggleOldPasswordVisibility()"
                    class="password-toggle">
            </ion-icon>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Nouveau mot de passe</ion-label>
            <ion-input formControlName="newPassword" [type]="newPasswordType"></ion-input>
            <ion-icon [name]="newPasswordType === 'password' ? 'eye-outline' : 'eye-off-outline'"
                    (click)="toggleNewPasswordVisibility()"
                    class="password-toggle">
            </ion-icon>
          </ion-item>
          <div class="error-messages" *ngIf="profileForm.get('newPassword')?.touched && profileForm.get('newPassword')?.errors">
            <ion-text color="danger" *ngIf="profileForm.get('newPassword')?.errors?.['pattern']">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial
            </ion-text>
          </div>

          <ion-button expand="block" 
                    (click)="onSubmitPassword()" 
                    [disabled]="!isPasswordValid()"
                    class="ion-margin-top">
            Modifier le mot de passe
          </ion-button>
        </div>
      </form>
    </ion-content>

    <style>
      .password-section {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--ion-color-light);
      }
      .password-section h6 {
        margin: 0 0 16px;
        font-weight: 500;
      }
      .password-toggle {
        font-size: 1.2rem;
        color: #666;
        cursor: pointer;
        padding: 8px;
        position: absolute;
        right: 8px;
        bottom: 8px;
      }
      
      .error-messages {
        margin-top: 4px;
        font-size: 12px;
      }
    </style>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditProfileComponent implements OnInit {
  @Input() user!: User;
  profileForm: FormGroup;
  oldPasswordType: string = 'password';
  newPasswordType: string = 'password';

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private adamantiumService: AdamantiumService,
    private toastCtrl: ToastController
  ) {
    this.profileForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      oldPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*=])[a-zA-Z0-9!@#$%^&*=]{8,}$/)
      ]]
    });
  }

  ngOnInit() {
    this.profileForm.patchValue({
      prenom: this.user.prenom,
      nom: this.user.nom,
      email: this.user.email
    });
  }

  isProfileValid(): boolean {
    const { prenom, nom, email } = this.profileForm.controls;
    return prenom.valid && nom.valid && email.valid;
  }

  toggleOldPasswordVisibility() {
    this.oldPasswordType = this.oldPasswordType === 'password' ? 'text' : 'password';
  }

  toggleNewPasswordVisibility() {
    this.newPasswordType = this.newPasswordType === 'password' ? 'text' : 'password';
  }

  isPasswordValid(): boolean {
    const { oldPassword, newPassword } = this.profileForm.controls;
    return oldPassword.valid && newPassword.valid;
  }

  async onSubmitProfile() {
    if (this.isProfileValid()) {
      const userData = {
        ...this.user,
        prenom: this.profileForm.value.prenom,
        nom: this.profileForm.value.nom,
        email: this.profileForm.value.email,
      };

      try {
        await this.adamantiumService.updateUser(this.user.id, userData).toPromise();
        await this.showToast('Mis à jour réussie', 'success');
        this.dismiss(true);
      } catch (error: any) {
        console.error('Error updating profile:', error);
        await this.showToast(error?.error?.messages?.error || 'Erreur lors de la mise à jour', 'danger');
      }
    }
  }

  async onSubmitPassword() {
    if (this.isPasswordValid()) {
      try {
        await this.adamantiumService.updatePassword(
          this.user.id,
          this.profileForm.value.oldPassword,
          this.profileForm.value.newPassword
        ).toPromise();
        await this.showToast('Mis à jour réussie', 'success');
        this.dismiss(true);
      } catch (error: any) {
        console.error('Error updating password:', error);
        await this.showToast(error?.error?.messages?.error || 'Erreur lors de la mise à jour', 'danger');
      }
    }
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 5000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  dismiss(updated = false) {
    this.modalCtrl.dismiss({
      updated
    });
  }
}
