import { Component } from '@angular/core';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Créer un compte</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
             <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="registerForm" (ngSubmit)="register()" class="register-form" novalidate>
        
        <div class="input-group">
          <ion-item lines="none" 
                    [class.ion-invalid]="isFieldInvalid('nom')"
                    [class.item-has-focus]="isNomFocused"
                    (ionFocus)="isNomFocused = true" (ionBlur)="isNomFocused = false">
            <ion-icon name="person-outline" class="input-icon" aria-hidden="true"></ion-icon>
            <ion-label position="floating">Nom *</ion-label>
            <ion-input formControlName="nom" type="text" required></ion-input>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('nom') && registerForm.get('nom')?.errors?.['required']">
            Le nom est requis.
          </div>
        </div>

        <div class="input-group">
          <ion-item lines="none" 
                    [class.ion-invalid]="isFieldInvalid('prenom')"
                    [class.item-has-focus]="isPrenomFocused"
                    (ionFocus)="isPrenomFocused = true" (ionBlur)="isPrenomFocused = false">
            <ion-icon name="person-outline" class="input-icon" aria-hidden="true"></ion-icon>
            <ion-label position="floating">Prénom *</ion-label>
            <ion-input formControlName="prenom" type="text" required></ion-input>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('prenom') && registerForm.get('prenom')?.errors?.['required']">
            Le prénom est requis.
          </div>
        </div>

        <div class="input-group">
          <ion-item lines="none" 
                    [class.ion-invalid]="isFieldInvalid('email')"
                    [class.item-has-focus]="isEmailFocused"
                    (ionFocus)="isEmailFocused = true" (ionBlur)="isEmailFocused = false">
            <ion-icon name="mail-outline" class="input-icon" aria-hidden="true"></ion-icon>
            <ion-label position="floating">Adresse e-mail *</ion-label>
            <ion-input formControlName="email" type="email" inputmode="email" required></ion-input>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('email') && registerForm.get('email')?.errors?.['required']">
            L'adresse e-mail est requise.
          </div>
          <div class="error-message" *ngIf="isFieldInvalid('email') && registerForm.get('email')?.errors?.['email']">
            Format d'e-mail invalide.
          </div>
        </div>
        
        <div class="input-group">
          <ion-item lines="none" 
                    [class.ion-invalid]="isFieldInvalid('adresse')"
                    [class.item-has-focus]="isAdresseFocused"
                    (ionFocus)="isAdresseFocused = true" (ionBlur)="isAdresseFocused = false">
            <ion-icon name="location-outline" class="input-icon" aria-hidden="true"></ion-icon>
            <ion-label position="floating">Adresse *</ion-label>
            <ion-input formControlName="adresse" type="text" required></ion-input>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('adresse') && registerForm.get('adresse')?.errors?.['required']">
            L'adresse est requise.
          </div>
        </div>

        <div class="input-group">
          <ion-item lines="none" 
                    [class.ion-invalid]="isFieldInvalid('codePostal')"
                    [class.item-has-focus]="isCodePostalFocused"
                    (ionFocus)="isCodePostalFocused = true" (ionBlur)="isCodePostalFocused = false">
            <ion-icon name="map-outline" class="input-icon" aria-hidden="true"></ion-icon>
            <ion-label position="floating">Code Postal *</ion-label>
            <ion-input formControlName="codePostal" type="text" inputmode="numeric" maxlength="5" required></ion-input>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('codePostal') && registerForm.get('codePostal')?.errors?.['required']">
            Le code postal est requis.
          </div>
           <div class="error-message" *ngIf="isFieldInvalid('codePostal') && registerForm.get('codePostal')?.errors?.['pattern']">
            Code postal invalide (5 chiffres).
          </div>
        </div>

        <div class="input-group">
          <ion-item lines="none" 
                    [class.ion-invalid]="isFieldInvalid('ville')"
                    [class.item-has-focus]="isVilleFocused"
                    (ionFocus)="isVilleFocused = true" (ionBlur)="isVilleFocused = false">
             <ion-icon name="business-outline" class="input-icon" aria-hidden="true"></ion-icon>
            <ion-label position="floating">Ville *</ion-label>
            <ion-input formControlName="ville" type="text" required></ion-input>
          </ion-item>
           <div class="error-message" *ngIf="isFieldInvalid('ville') && registerForm.get('ville')?.errors?.['required']">
            La ville est requise.
          </div>
        </div>

        <div class="input-group">
          <ion-item lines="none" 
                    [class.ion-invalid]="isFieldInvalid('password')"
                    [class.item-has-focus]="isPasswordFocused"
                    (ionFocus)="isPasswordFocused = true" (ionBlur)="isPasswordFocused = false">
            <ion-icon name="lock-closed-outline" class="input-icon" aria-hidden="true"></ion-icon>
            <ion-label position="floating">Mot de passe *</ion-label>
            <ion-input formControlName="password" [type]="passwordType" required></ion-input>
            <ion-icon [name]="passwordType === 'password' ? 'eye-outline' : 'eye-off-outline'"
                      (click)="togglePasswordVisibility()" 
                      class="password-toggle"
                      aria-label="Afficher/Masquer le mot de passe"
                      role="button">
            </ion-icon>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('password') && registerForm.get('password')?.errors?.['required']">
            Le mot de passe est requis.
          </div>
          <div class="error-message" *ngIf="isFieldInvalid('password') && registerForm.get('password')?.errors?.['pattern']">
            Min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial.
          </div>
        </div>

        <div class="input-group">
          <ion-item lines="none" 
                    [class.ion-invalid]="isFieldInvalid('passwordConfirm') || (registerForm.touched && registerForm.errors?.['passwordMismatch'])"
                    [class.item-has-focus]="isPasswordConfirmFocused"
                    (ionFocus)="isPasswordConfirmFocused = true" (ionBlur)="isPasswordConfirmFocused = false">
            <ion-icon name="lock-closed-outline" class="input-icon" aria-hidden="true"></ion-icon>
            <ion-label position="floating">Confirmer le mot de passe *</ion-label>
            <ion-input formControlName="passwordConfirm" [type]="passwordType" required></ion-input>
          </ion-item>
           <div class="error-message" *ngIf="isFieldInvalid('passwordConfirm') && registerForm.get('passwordConfirm')?.errors?.['required']">
            La confirmation est requise.
          </div>
          <div class="error-message" *ngIf="registerForm.get('passwordConfirm')?.touched && registerForm.errors?.['passwordMismatch']">
            Les mots de passe ne correspondent pas.
          </div>
        </div>

        <ion-button expand="block" 
                    type="submit" 
                    class="submit-button"
                    [disabled]="registerForm.invalid || isLoading">
           <ion-spinner *ngIf="isLoading" name="crescent" color="light"></ion-spinner>
           <span *ngIf="!isLoading">Créer mon compte</span>
        </ion-button>

         <div class="login-prompt">
          <span>Déjà un compte ?</span> 
          <br>
          <ion-button fill="clear" (click)="dismiss()">
            Se connecter
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    :host {
       --height: auto;
       --max-height: 95vh;
       --width: 90%;
       --max-width: 550px;
       --border-radius: 10px;
    }

    ion-header {
      box-shadow: none;
      border-bottom: 1px solid var(--jubari-light);
    }
    ion-toolbar {
      --background: var(--jubari-white);
      --color: var(--jubari-dark);
      font-family: 'Montserrat', sans-serif;
    }
    ion-title {
      font-weight: 600;
      font-size: 1.2rem;
    }
    ion-content {
      --background: var(--jubari-dark); 
      --padding-top: 20px;
      --padding-bottom: 20px;
      --padding-start: 24px;
      --padding-end: 24px;
      font-family: 'Montserrat', sans-serif;
    }

    form.register-form {
      display: flex;
      flex-direction: column;
    }

    .input-group {
      margin-bottom: 1.2rem;
      position: relative;

      ion-item {
        --background: transparent;
        --border-width: 0 0 1px 0; 
        --border-color: var(--jubari-light);
        --highlight-color-focused: var(--jubari-dark); 
        --padding-start: 38px;
        --inner-padding-end: 2px; 
        --border-radius: 0; 
        --min-height: 50px;
        margin-bottom: 0.1rem; 
        position: relative; 
        transition: border-color 0.3s ease, border-width 0.3s ease; 

        .input-icon {
          position: absolute;
          left: 10px; 
          top: calc(50% + 6px); 
          transform: translateY(-50%);
          color: var(--jubari-medium); 
          font-size: 1.1rem;
          transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s ease; 
          z-index: 1; 
        }

        ion-label {
          --color: var(--jubari-medium); 
          font-weight: 400; 
          font-size: 0.95rem;
          margin-left: 38px;
          transform-origin: left top;
          transition: transform .3s cubic-bezier(0.4, 0, 0.2, 1), color .3s cubic-bezier(0.4, 0, 0.2, 1); 
        }

        ion-input {
          --padding-start: 0; 
          --padding-end: 40px;
          font-size: 0.95rem;
          color: var(--jubari-medium); 
          margin-top: 10px; 
        }

        &.item-has-focus .input-icon,
        &.item-has-value .input-icon {
          top: 20px; 
        }

        &.item-has-focus {
          --border-color: var(--jubari-primary);
          --border-width: 0 0 2px 0; 

          .input-icon {
            color: var(--jubari-primary); 
          }
          ion-label {
            --color: var(--jubari-primary);
          }
        }

        &.ion-invalid.ion-touched {
          --border-color: var(--ion-color-danger);
          --border-width: 0 0 2px 0; 

          .input-icon {
            color: var(--ion-color-danger); 
            top: 32px; 
          }
          ion-label {
            --color: var(--ion-color-danger);
          }
        }
      }
      .error-message {
        color: var(--ion-color-danger);
        font-size: 0.75rem;
        padding-left: 2px;
        min-height: 1.2em;
        padding-top: 2px;
      }
    }

    .password-toggle {
      position: absolute;
      right: 8px;
      top: calc(50% + 4px);
      transform: translateY(-50%);
      font-size: 1.2rem;
      color: var(--jubari-medium);
      cursor: pointer;
      padding: 6px;
      z-index: 2;
    }

    .submit-button {
      --background: var(--jubari-primary);
      --color: var(--jubari-white);
      --border-radius: 25px; 
      --box-shadow: 0 4px 10px rgba(var(--jubari-primary-rgb), 0.2); 
      margin-top: 1.8rem;
      height: 48px;
      font-weight: 600;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;

      &:hover {
        --background: var(--jubari-primary-shade); 
        --box-shadow: 0 6px 12px rgba(var(--jubari-primary-rgb), 0.3); 
        transform: translateY(-2px);
      }
      &:active {
        transform: translateY(0);
        --box-shadow: 0 2px 5px rgba(var(--jubari-primary-rgb), 0.2); 
      }
       ion-spinner {
         width: 18px;
         height: 18px;
       }
    }

    .login-prompt {
      margin-top: 1.5rem;
      text-align: center;
      border-top: 1px solid var(--jubari-light); 
      padding-top: 1rem; 
      
      span {
        color: var(--jubari-medium); 
        font-size: 0.9rem;
        display: inline;
        margin-right: 4px;
      }

      ion-button {
        --color: var(--jubari-primary); 
        font-weight: 600;
        text-transform: none;
        font-size: 0.9rem;
        vertical-align: baseline;
        
        &:hover {
          --color: var(--jubari-medium); 
        }
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class RegisterModal {
  registerForm: FormGroup;
  passwordType: string = 'password';
  isLoading: boolean = false;
  isNomFocused: boolean = false;
  isPrenomFocused: boolean = false;
  isEmailFocused: boolean = false;
  isAdresseFocused: boolean = false;
  isCodePostalFocused: boolean = false;
  isVilleFocused: boolean = false;
  isPasswordFocused: boolean = false;
  isPasswordConfirmFocused: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', [Validators.required]],
      codePostal: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      ville: ['', [Validators.required]],
      password: ['', [
        Validators.required, 
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*=])[a-zA-Z0-9!@#$%^&*=]{8,}$/) 
      ]],
      passwordConfirm: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('passwordConfirm')?.value
      ? null 
      : { passwordMismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  async register() {
     this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid || this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    const formValue = this.registerForm.value;
    try {
      const registerData = {
        nom: formValue.nom,
        prenom: formValue.prenom,
        email: formValue.email,
        adresse: formValue.adresse,
        cp: formValue.codePostal, 
        ville: formValue.ville,
        password: formValue.password
      };

      await this.authService.register(registerData).toPromise();
      this.isLoading = false;
      await this.showAlert('Inscription réussie', 'Votre compte a été créé. Vous pouvez maintenant vous connecter.');
      this.modalCtrl.dismiss({ registered: true });
    } catch (error) {
      this.isLoading = false;
      const message = this.getErrorMessage(error);
      await this.showAlert('Erreur d\'inscription', message);
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
  
  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message?.includes('Duplicate entry') && error?.error?.message?.includes('for key \'employes.email\'')) {
      return 'Cette adresse e-mail est déjà utilisée.';
    }
    if (error?.code === 'auth/email-already-in-use') {
      return 'Cette adresse e-mail est déjà utilisée.';
    }
    if (error?.code === 'auth/invalid-email') {
      return 'Format d\'e-mail invalide.';
    }
    return 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
  }
}
