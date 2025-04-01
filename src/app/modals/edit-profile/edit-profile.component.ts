import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
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
            <ion-input formControlName="oldPassword" type="password"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Nouveau mot de passe</ion-label>
            <ion-input formControlName="newPassword" type="password"></ion-input>
          </ion-item>

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
    </style>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditProfileComponent implements OnInit {
  @Input() user!: User;
  profileForm: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private adamantiumService: AdamantiumService
  ) {
    this.profileForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      oldPassword: [''],
      newPassword: ['']
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

  isPasswordValid(): boolean {
    const { oldPassword, newPassword } = this.profileForm.controls;
    return oldPassword.value && newPassword.value;
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
        this.dismiss(true);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  }

  async onSubmitPassword() {
    if (this.isPasswordValid()) {
      const userData = {
        ...this.user,
        oldPassword: this.profileForm.value.oldPassword,
        password: this.profileForm.value.newPassword
      };

      try {
        await this.adamantiumService.updateUser(this.user.id, userData).toPromise();
        this.dismiss(true);
      } catch (error) {
        console.error('Error updating password:', error);
      }
    }
  }

  dismiss(updated = false) {
    this.modalCtrl.dismiss({
      updated
    });
  }
}
