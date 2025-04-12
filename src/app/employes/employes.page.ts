import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Keep RouterModule if needed for routing within the page
import { AdamantiumService } from '../services/adamantium.service';
import { Employe } from '../models/employe.model';
import { EmployeeModalComponent } from './employee-modal/employee-modal.component';
import { AppHeaderComponent } from '../components/app-header/app-header.component'; // Import AppHeaderComponent

@Component({
  selector: 'app-employes',
  templateUrl: './employes.page.html',
  styleUrls: ['./employes.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    RouterModule, 
    AppHeaderComponent // Add AppHeaderComponent
  ]
})
export class EmployesPage implements OnInit {
  employees: Employe[] = [];
  filteredEmployees: Employe[] = [];
  searchText: string = '';
  isLoading: boolean = true; // Add isLoading state
  error: string | null = null; // Add error state

  constructor(
    private adamantiumService: AdamantiumService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  filterEmployees() {
    if (!this.searchText) {
      this.filteredEmployees = [...this.employees];
    } else {
      const lowerSearchText = this.searchText.toLowerCase();
      this.filteredEmployees = this.employees.filter(emp => 
        emp.nom?.toLowerCase().includes(lowerSearchText) ||
        emp.prenom?.toLowerCase().includes(lowerSearchText) ||
        emp.email?.toLowerCase().includes(lowerSearchText)
      );
    }
  }

  private loadEmployees() {
    this.isLoading = true;
    this.error = null;
    this.adamantiumService.getUsers().subscribe({
      next: (employees) => {
        console.log('Employees loaded:', employees);
        this.employees = employees;
        this.filterEmployees(); // Initialize filtered list
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.error = 'Erreur lors du chargement des employés.';
        this.isLoading = false;
        this.presentToast('Erreur lors du chargement des employés.', 'danger');
      }
    });
  }

  async modifyEmployee(employee: Employe) {
    const modal = await this.modalCtrl.create({
      component: EmployeeModalComponent,
      componentProps: {
        employeeToEdit: { ...employee }  // Changed from 'employee' to 'employeeToEdit'
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
    // Add confirmation dialog here before deleting
    console.log('Delete employee:', employee);
    // Implement delete logic using adamantiumService
    // Example:
    // this.adamantiumService.deleteUser(employee.id).subscribe(...)
    this.presentToast(`Suppression de ${employee.prenom} ${employee.nom} (non implémenté)`, 'warning');
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  retryLoadData() {
    this.loadEmployees();
  }
}
