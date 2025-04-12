import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { VibraniumService } from '../../../services/vibranium.service';
import * as moment from 'moment';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-leave-modal',
  templateUrl: './edit-leave-modal.component.html',
  styleUrls: ['./edit-leave-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class EditLeaveModalComponent implements OnInit {
  @Input() leave: any;
  editForm!: FormGroup;
  minDate = new Date().toISOString();
  maxDate = new Date(new Date().getFullYear() + 1, 11, 31).toISOString();

  isDateEnabled = (dateString: string) => {
    const date = moment(dateString);
    const defaultStart = moment(this.minDate);
    return !this.isWeekend(date) && date.isSameOrAfter(defaultStart, 'day');
  }

  isWeekend(date: moment.Moment): boolean {
    const day = date.day();
    return day === 0 || day === 6;
  }

  get endDateControl(): FormControl {
    return this.editForm.controls['endDate'] as FormControl;
  }

  get startDateControl(): FormControl {
    return this.editForm.controls['startDate'] as FormControl;
  }

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private vibraniumService: VibraniumService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.editForm = this.fb.group({
      type: [this.leave.type === 'Congé payé' ? '1' : '0', Validators.required],
      startDate: [this.leave.startDate, Validators.required],
      endDate: [this.leave.endDate, Validators.required],
      reason: [this.leave.reason, [Validators.required, Validators.minLength(10)]]
    });
  }

  dismiss(data?: any) {
    this.modalController.dismiss(data);
  }

  async submitEdit() {
    if (this.editForm.valid) {
      const formValues = this.editForm.value;
      
      const updatedData = {
        id: this.leave.id,
        dateDebut: moment(formValues.startDate).format('YYYY-MM-DD'),
        dateFin: moment(formValues.endDate).format('YYYY-MM-DD'),
        description: formValues.reason,
        paye: parseInt(formValues.type)
      };

      try {
        await this.vibraniumService.updateConge(this.leave.id, updatedData).toPromise();
        
        const toast = await this.toastController.create({
          message: 'Congé modifié avec succès',
          duration: 3000,
          position: 'bottom',
          color: 'success',
          buttons: [
            {
              icon: 'checkmark-circle',
              text: 'OK',
              role: 'cancel'
            }
          ]
        });
        await toast.present();
        
        this.dismiss({ updated: true });
      } catch (error) {
        
        const errorToast = await this.toastController.create({
          message: 'Erreur lors de la modification du congé. Veuillez réessayer.',
          duration: 4000,
          position: 'bottom',
          color: 'danger',
          buttons: [
            {
              icon: 'close-circle',
              text: 'Fermer',
              role: 'cancel'
            }
          ]
        });
        await errorToast.present();
      }
    }
  }
}
