import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>S'inscrire</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-prompt">
        <span>Vous avez un compte ?</span>
        <ion-button fill="clear" (click)="dismiss()">Se connecter</ion-button>
      </div>

      <div class="required-notice">
        <ion-text color="medium">* Tous les champs sont requis</ion-text>
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="register()" class="register-form">
        <ion-item class="form-item" [class.is-valid]="isFieldValid('nom')" [class.is-invalid]="isFieldInvalid('nom')">
          <ion-label position="stacked">Nom</ion-label>
          <ion-input formControlName="nom" required></ion-input>
          <ion-icon *ngIf="isFieldValid('nom')" name="checkmark-circle" slot="end" class="valid-icon"></ion-icon>
        </ion-item>

        <ion-item class="form-item" [class.is-valid]="isFieldValid('prenom')" [class.is-invalid]="isFieldInvalid('prenom')">
          <ion-label position="stacked">Prénom</ion-label>
          <ion-input formControlName="prenom" required></ion-input>
          <ion-icon *ngIf="isFieldValid('prenom')" name="checkmark-circle" slot="end" class="valid-icon"></ion-icon>
        </ion-item>

        <ion-item class="form-item" [class.is-valid]="isFieldValid('email')" [class.is-invalid]="isFieldInvalid('email')">
          <ion-label position="stacked">Adresse e-mail</ion-label>
          <ion-input formControlName="email" 
                     type="email" 
                     placeholder="exemple@domaine.com"
                     required>
          </ion-input>
          <ion-icon *ngIf="isFieldValid('email')" name="checkmark-circle" slot="end" class="valid-icon"></ion-icon>
          <ion-text class="error-message" *ngIf="isFieldInvalid('email')">
            Format d'email invalide
          </ion-text>
        </ion-item>

        <ion-item class="form-item" [class.is-valid]="isFieldValid('adresse')" [class.is-invalid]="isFieldInvalid('adresse')">
          <ion-label position="stacked">Adresse</ion-label>
          <ion-input formControlName="adresse" 
                     placeholder="123 rue de la République"
                     required>
          </ion-input>
          <ion-icon *ngIf="isFieldValid('adresse')" name="checkmark-circle" slot="end" class="valid-icon"></ion-icon>
        </ion-item>

        <ion-item class="form-item" [class.is-valid]="isFieldValid('codePostal')" [class.is-invalid]="isFieldInvalid('codePostal')">
          <ion-label position="stacked">Code Postal</ion-label>
          <ion-input formControlName="codePostal" 
                     placeholder="75000"
                     maxlength="5"
                     required>
          </ion-input>
          <ion-icon *ngIf="isFieldValid('codePostal')" name="checkmark-circle" slot="end" class="valid-icon"></ion-icon>
          <ion-text class="error-message" *ngIf="isFieldInvalid('codePostal')">
            Code postal invalide (5 chiffres)
          </ion-text>
        </ion-item>

        <ion-item class="form-item">
          <ion-label position="stacked">Ville</ion-label>
          <ion-input formControlName="ville" 
                     placeholder="Paris"
                     required>
          </ion-input>
        </ion-item>

        <ion-item class="form-item">
          <ion-label position="stacked">Mot de passe</ion-label>
          <ion-input formControlName="password" 
                     [type]="passwordType"
                     placeholder="8 caractères minimum"
                     required>
          </ion-input>
          <ion-icon [name]="passwordType === 'password' ? 'eye-outline' : 'eye-off-outline'"
                    (click)="togglePasswordVisibility()"
                    class="password-toggle">
          </ion-icon>
          <div class="error-messages" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.errors">
            <ion-text color="danger" *ngIf="registerForm.get('password')?.errors?.['required']">
              Le mot de passe est requis
            </ion-text>
            <ion-text color="danger" *ngIf="registerForm.get('password')?.errors?.['pattern']">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial
            </ion-text>
          </div>
        </ion-item>

        <ion-item class="form-item">
          <ion-label position="stacked">Confirmer le mot de passe</ion-label>
          <ion-input formControlName="passwordConfirm" 
                     [type]="passwordType"
                     placeholder="Confirmez votre mot de passe"
                     required>
          </ion-input>
          <ion-icon [name]="passwordType === 'password' ? 'eye-outline' : 'eye-off-outline'"
                    (click)="togglePasswordVisibility()"
                    class="password-toggle">
          </ion-icon>
          <ion-text color="danger" *ngIf="registerForm.get('passwordConfirm')?.touched && registerForm.errors?.['passwordMismatch']">
            Les mots de passe ne correspondent pas
          </ion-text>
        </ion-item>

        <ion-button expand="block" 
                    type="submit" 
                    class="ion-margin-top submit-button"
                    [disabled]="!registerForm.valid">
          S'inscrire
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: [`
    ion-modal {
      --height: 90%;
      --width: 90%;
      --max-width: 600px;
    }

    .required-notice {
      margin: 0 0 20px;
      text-align: center;
      font-size: 14px;
    }

    .register-form {
      .form-item {
        margin-bottom: 16px;
        --border-color: var(--ion-color-medium);
        --border-width: 1px;
        --border-style: solid;
        --border-radius: 4px;

        &.is-valid {
          --border-color: var(--ion-color-success);
          --highlight-background: var(--ion-color-success);
        }

        &.is-invalid {
          --border-color: var(--ion-color-danger);
          --highlight-background: var(--ion-color-danger);
        }

        .valid-icon {
          color: var(--ion-color-success);
          font-size: 1.2rem;
          position: absolute;
          right: 12px;
          bottom: 50%;
          transform: translateY(50%);
        }

        .error-message {
          color: var(--ion-color-danger);
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        ion-label {
          margin-bottom: 8px;
          font-weight: 500;
        }

        ion-input {
          --padding-top: 8px;
          --padding-bottom: 8px;
          --padding-start: 8px;
          margin-top: 4px;
        }
      }
    }

    .login-prompt {
      text-align: center;
      margin-bottom: 20px;
      
      span {
        color: var(--jubari-dark);
        font-size: 14px;
      }

      ion-button {
        --color: var(--jubari-primary);
        font-weight: 500;
        text-transform: none;
        font-size: 14px;
      }
    }

    .submit-button {
      margin-top: 24px !important;
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
      
      ion-text {
        display: block;
        font-size: 12px;
        margin-bottom: 4px;
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class RegisterModal {
  registerForm: FormGroup;
  passwordType: string = 'password';

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private authService: AuthService
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

  isFieldValid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.valid && field.touched : false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  async register() {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      try {
        const registerData = {
          nom: formValue.nom,
          prenom: formValue.prenom,
          email: formValue.email,
          adresse: formValue.adresse,
          cp: formValue.codePostal, // Map codePostal to cp for API
          ville: formValue.ville,
          password: formValue.password
        };

        await this.authService.register(registerData).toPromise();
        this.modalCtrl.dismiss({ registered: true });
      } catch (error) {
        console.error('Registration error:', error);
        // Handle registration error (show toast or alert)
      }
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
