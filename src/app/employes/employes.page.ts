import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdamantiumService } from '../services/adamantium.service';
import { Employe } from '../models/employe.model';
import { EmployeeModalComponent } from './employee-modal/employee-modal.component';

@Component({
  selector: 'app-employes',
  templateUrl: './employes.page.html',
  styleUrls: ['./employes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class EmployesPage implements OnInit {
  employees: Employe[] = [];
  searchText: string = '';

  get filteredEmployees(): Employe[] {
    if (!this.searchText) return this.employees;
    
    const searchLower = this.searchText.toLowerCase();
    return this.employees.filter(employee => {
      const fullName = `${employee.prenom} ${employee.nom}`.toLowerCase();
      const email = employee.email.toLowerCase();
      return fullName.includes(searchLower) || email.includes(searchLower);
    });
  }

  constructor(
    private adamantiumService: AdamantiumService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  private loadEmployees() {
    this.adamantiumService.getUsers().subscribe({
      next: (employees) => {
        console.log('Employees loaded:', employees);
        
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        // You might want to add error handling here (e.g., showing a toast)
      }
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  async modifyEmployee(employee: Employe) {
    const modal = await this.modalCtrl.create({
      component: EmployeeModalComponent,
      componentProps: {
        employee: { ...employee }
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.adamantiumService.updateUser(data.id, data).subscribe({
        next: () => {
          // Reload the entire employee list to get fresh data
          this.loadEmployees();
          this.presentToast('Les informations de l\'employé ont été modifiées avec succès');
        },
        error: (error) => {
          console.error('Error updating employee:', error);
        }
      });
    }
  }

  async deleteEmployee(employee: Employe) {
    // Note: You'll need to add a delete endpoint to your AdamantiumService
    // For now, we'll just remove it from the local array
    const index = this.employees.findIndex(e => e.id === employee.id);
    if (index !== -1) {
      this.employees.splice(index, 1);
    }
  }

  async addEmployee() {
    const modal = await this.modalCtrl.create({
      component: EmployeeModalComponent,
      componentProps: {
        isNewEmployee: true,
        employee: {
          nom: '',
          prenom: '',
          email: '',
          role: 'EMPLOYE',
          nb_conges_payes: 25
        }
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.adamantiumService.createEmployee(data).subscribe({
        next: () => {
          this.loadEmployees();
          this.presentToast('Nouvel employé ajouté avec succès');
        },
        error: (error) => {
          console.error('Error creating employee:', error);
        }
      });
    }
  }
}
