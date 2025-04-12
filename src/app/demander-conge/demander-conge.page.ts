import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VibraniumService } from '../services/vibranium.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import localeFr from '@angular/common/locales/fr';
import * as moment from 'moment';
import { AppHeaderComponent } from "../components/app-header/app-header.component";

interface LeaveType {
  id: string;
  name: string;
  maxDays: number;
  icon: string;
}

@Component({
  selector: 'app-demander-conge',
  templateUrl: './demander-conge.page.html',
  styleUrls: ['./demander-conge.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, RouterModule, AppHeaderComponent],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
})
export class DemanderCongePage implements OnInit {
  leaveForm: FormGroup;
  minDate: string;  // Remove the direct initialization
  maxDate = new Date(new Date().getFullYear() + 1, 11, 31).toISOString();

  leaveTypes: LeaveType[] = [
    { id: '1', name: 'Congé payé', maxDays: 30, icon: 'calendar-number-outline' }
  ];

  leaveBalance = {
    remainingDays: 0
  };

  constructor(
    private fb: FormBuilder,
    private vibraniumService: VibraniumService,
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {
    registerLocaleData(localeFr);
    
    const defaultStartDate = this.calculateDefaultStartDate();
    const defaultEndDate = this.calculateDefaultEndDate(defaultStartDate);
    this.minDate = defaultStartDate; // Set minDate to default start date

    this.leaveForm = this.fb.group({
      type: ['1', Validators.required], // Set default to paid leave
      startDate: [defaultStartDate, Validators.required],
      endDate: [defaultEndDate, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(275)]]
    });

    // Update endDate when startDate changes
    this.leaveForm.get('startDate')?.valueChanges.subscribe(date => {
      if (date) {
        this.leaveForm.patchValue({
          endDate: this.calculateDefaultEndDate(date)
        });
      }
    });
  }

  ngOnInit() {
    this.loadLeaveBalance();
  }

  loadLeaveBalance() {
    const userId = this.authService.getUserId();
    this.vibraniumService.getEmployeCongeStats(userId).subscribe({
      next: (stats) => {
        this.leaveBalance.remainingDays = stats.joursRestants; 
      },
      error: (error) => {
        console.error('Error loading leave balance:', error);
      }
    });
  }

  calculateDefaultStartDate(): string {
    let date = moment().add(7, 'days'); // Demande de congé 7 jours à l'avance
    // Skip to next working day if it's a weekend
    while (this.isWeekend(date)) {
      date = date.add(1, 'day');
    }
    return date.toISOString();
  }

  calculateDefaultEndDate(startDate: string): string {
    let date = moment(startDate).add(1, 'day');
    // Skip to next working day if it's a weekend
    while (this.isWeekend(date)) {
      date = date.add(1, 'day');
    }
    return date.toISOString();
  }

  isWeekend(date: moment.Moment): boolean {
    const day = date.day();
    return day === 0 || day === 6; // 0 is Dimanche, 6 is Samedi
  }

  isWorkingDay = (dateString: string) => {
    const date = moment(dateString);
    return !this.isWeekend(date);
  }

  isDateEnabled = (dateString: string) => {
    const date = moment(dateString);
    const defaultStart = moment(this.minDate);
    return !this.isWeekend(date) && date.isSameOrAfter(defaultStart, 'day');
  }

  calculateDuration() {
    const start = this.leaveForm.get('startDate')?.value;
    const end = this.leaveForm.get('endDate')?.value;
    if (start && end) {
      const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24));
      return days + 1;
    }
    return 0;
  }

  counterFormatter(currentLength: number, maxLength: number): string {
    return `${currentLength}/${maxLength}`;
  }

  async submitLeaveRequest() {
    if (this.leaveForm.valid) {
      const userId = this.authService.getUserId();
      const formValues = this.leaveForm.value;
      
      const congeData = {
        dateDebut: moment(formValues.startDate).format('YYYY-MM-DD'),
        dateFin: moment(formValues.endDate).format('YYYY-MM-DD'),
        description: formValues.reason,
        paye: parseInt(formValues.type),
      };

      this.vibraniumService.createConge(userId, congeData).subscribe({
        next: async (response) => {
          
          // Reset form to initial state
          const defaultStartDate = this.calculateDefaultStartDate();
          const defaultEndDate = this.calculateDefaultEndDate(defaultStartDate);
          this.leaveForm.reset({
            type: '0',
            startDate: defaultStartDate,
            endDate: defaultEndDate,
            reason: ''
          });

          const toast = await this.toastController.create({
            message: 'Demande soumise avec succès',
            duration: 2000,
            position: 'bottom',
            color: 'success',
            buttons: [
              {
                icon: 'checkmark-circle',
                text: 'OK',
                role: 'cancel',
                handler: () => {
                  this.router.navigate(['/home']);
                }
              }
            ]
          });
          await toast.present();
          toast.onDidDismiss().then(() => {
            this.router.navigate(['/home']);
          });
        },
        error: (error) => {
          console.error('Error submitting leave request:', error);
          console.error('Error details:', error.error);
        }
      });
    }
  }

  /// Getters for form controls

  get endDateControl(): FormControl {
    return this.leaveForm.controls['endDate'] as FormControl;
  }

  get startDateControl(): FormControl {
    return this.leaveForm.controls['startDate'] as FormControl;
  }
}
