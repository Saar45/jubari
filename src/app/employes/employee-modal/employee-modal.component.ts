import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Employe } from '../../models/employe.model';
import { Service } from '../../models/service.model';
import { PromethiumService } from 'src/app/services/promethium.service';

@Component({
  selector: 'app-employee-modal',
  templateUrl: './employee-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EmployeeModalComponent implements OnInit {
  @Input() employeeToEdit!: Employe;
  
  employee: Employe = {
    id: 0,
    nom: '',
    prenom: '',
    email: '',
    adresse: '',
    code_postal: '',
    ville: '',
    nb_conges_payes: 0,
    role: '',
    service: undefined,
    serviceDirige: undefined
  };
  
  services: Service[] = [];
  roles: string[] = ['ADMIN', 'RH', 'CHEF_SERVICE', 'EMPLOYE'];

  constructor(
    private modalCtrl: ModalController,
    private promethiumService: PromethiumService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadServices();
    
    // Create a deep copy to avoid modifying the original object
    this.employee = {...this.employeeToEdit};
    if (this.employeeToEdit.service) {
      this.employee.service = {...this.employeeToEdit.service};
    }
  }

  private loadServices() {
    this.promethiumService.getServices().subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (error) => {
        console.error('Error loading services:', error);
      }
    });
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  isValidPostalCode(code: string): boolean {
    return /^\d{5}$/.test(code);
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }

  async confirm(form: NgForm) {
    // Custom validation only for fields that have values
    let hasErrors = false;
    
    // Only validate email if present
    if (this.employee.email && this.employee.email.length > 0) {
      if (!this.isValidEmail(this.employee.email)) {
        await this.presentToast('Format d\'email invalide');
        hasErrors = true;
        return;
      }
    }
    
    // Only validate postal code if present
    if (this.employee.code_postal && this.employee.code_postal.length > 0) {
      if (!this.isValidPostalCode(this.employee.code_postal)) {
        await this.presentToast('Code postal invalide (5 chiffres requis)');
        hasErrors = true;
        return;
      }
    }
    
    if (hasErrors) {
      return;
    }

    // Continue with confirmation dialog
    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Voulez-vous vraiment modifier les informations de cet employé ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          role: 'confirm',
          handler: () => {
            this.modalCtrl.dismiss(this.employee, 'confirm');
          }
        }
      ]
    });

    await alert.present();
  }

  // Ensure the selected service updates the employee's service name
  onServiceChange(service: Service) {
    this.employee.service = service;
  }

  compareWith(service1: Service, service2: Service) {
    return service1 && service2 ? service1.id === service2.id : service1 === service2;
  }
}

