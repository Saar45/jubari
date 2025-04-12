import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Service } from '../models/service.model';
import { PromethiumService } from '../services/promethium.service';
import { AddServiceModalComponent } from './components/add-service-modal/add-service-modal.component';
import { AppHeaderComponent } from "../components/app-header/app-header.component";

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, AppHeaderComponent]
})
export class ServicesPage implements OnInit {
  services: Service[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private promethiumService: PromethiumService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.isLoading = true;
    this.error = null; 
    this.promethiumService.getServices().subscribe({
      next: (services) => {
        this.services = services;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.error = 'Impossible de charger les services.';
        this.isLoading = false;
      }
    });
  }

  // Add retry method
  retryLoadServices() {
    this.loadServices();
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
    if (role === 'confirm' || (data && data.refresh)) { 
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

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' || (data && data.refresh)) {
      this.loadServices();
    }
  }
}
