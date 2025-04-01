import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Service } from '../models/service.model';
import { PromethiumService } from '../services/promethium.service';
import { AddServiceModalComponent } from './components/add-service-modal/add-service-modal.component';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class ServicesPage implements OnInit {
  services: Service[] = [];
  isLoading = true;

  constructor(
    private promethiumService: PromethiumService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.isLoading = true;
    this.promethiumService.getServices().subscribe({
      next: (services) => {
        this.services = services;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.isLoading = false;
      }
    });
  }

  async addService() {
    const modal = await this.modalCtrl.create({
      component: AddServiceModalComponent,
      componentProps: {
        isEdit: false
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role !== 'annuler') {
      this.loadServices();
    }
  }

  async editService(service: Service) {
    const modal = await this.modalCtrl.create({
      component: AddServiceModalComponent,
      componentProps: {
        service: service,
        isEdit: true
      }
    });

    await modal.present();

    const { role } = await modal.onWillDismiss();
    if (role !== 'annuler') {
      this.loadServices();
    }
  }
}
