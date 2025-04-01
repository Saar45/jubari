import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Service } from '../../../models/service.model';
import { PromethiumService } from '../../../services/promethium.service';

@Component({
  selector: 'app-add-service-modal',
  templateUrl: './add-service-modal.component.html',
  styleUrls: ['./add-service-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class AddServiceModalComponent implements OnInit {
  @Input() service?: Service;
  @Input() isEdit: boolean = false;
  serviceForm: FormGroup;
  employees: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private promethiumService: PromethiumService
  ) {
    this.serviceForm = this.fb.group({
      description: ['', Validators.required],
      chef_id: [null]
    });
  }

  ngOnInit() {
    if (this.service) {
      this.loadEmployees();
      console.log('Service received:', this.service); // Debug line
      this.serviceForm.patchValue({
        description: this.service.nom || this.service.description, // Try both properties
        chef_id: this.service.chef?.id
      });
    }
  }

  loadEmployees() {
    if (this.service?.id) {
      this.promethiumService.getEmployesByService(this.service.id).subscribe({
        next: (employees) => {
          this.employees = employees;
        },
        error: (error) => console.error('Error loading employees:', error)
      });
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'annuler');
  }

  submit() {
    if (this.serviceForm.valid) {
      const serviceData = this.serviceForm.value;
      
      if (this.isEdit && this.service?.id) {
        // First update the service
        this.promethiumService.updateService(this.service.id, serviceData).subscribe({
          next: (response) => {
            // Then update the employee's serviceDirige if chef_id changed
            if (serviceData.chef_id) {
              this.promethiumService.updateEmployeServiceDirige(serviceData.chef_id, this.service!.id).subscribe({
                next: () => this.modalCtrl.dismiss(response, 'confirm'),
                error: (error) => console.error('Error updating employee service:', error)
              });
            } else {
              this.modalCtrl.dismiss(response, 'confirm');
            }
          },
          error: (error) => {
            console.error('Error updating service:', error);
          }
        });
      } else {
        // Handle create service case
        this.promethiumService.createService(serviceData).subscribe({
          next: (response) => {
            this.modalCtrl.dismiss(response, 'confirm');
          },
          error: (error) => {
            console.error('Error creating service:', error);
          }
        });
      }
    }
    return null;
  }
}
