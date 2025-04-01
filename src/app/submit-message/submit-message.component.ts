import { Component } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PromethiumService } from '../services/promethium.service';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'app-submit-message',
  templateUrl: './submit-message.component.html',
  styleUrls: ['./submit-message.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class SubmitMessageComponent {
  messageForm: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private promethiumService: PromethiumService,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {
    this.messageForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 4000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  submit() {
    if (this.messageForm.valid) {
      const userId = this.authService.getUserId();
      const messageData = {
        date_reclamation: moment().format('YYYY-MM-DD'),
        description: this.messageForm.value.description,
        employe_id: userId
      };

      this.promethiumService.newMessage(messageData).subscribe({
        next: async (response) => {
          console.log('Message sent successfully:', response);
          await this.presentToast('Message envoyé');
          this.modalCtrl.dismiss(response, 'confirm');
        },
        error: (error) => {
          console.error('Error sending message:', error);
        }
      });
    }
    return null;
  }
}
