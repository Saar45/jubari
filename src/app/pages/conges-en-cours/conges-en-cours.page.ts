import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { VibraniumService } from '../../services/vibranium.service';
import { Conge } from '../../models/conge.model';
import { AppHeaderComponent } from "../../components/app-header/app-header.component";

@Component({
  selector: 'app-conges-en-cours',
  templateUrl: './conges-en-cours.page.html',
  styleUrls: ['./conges-en-cours.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, AppHeaderComponent]
})
export class CongesEnCoursPage implements OnInit {
  conges: Conge[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private vibraniumService: VibraniumService) {}

  ngOnInit() {
    this.loadConges();
  }

  public loadConges() {
    this.isLoading = true;
    this.vibraniumService.getCurrentConges().subscribe({
      next: (conges) => {
        this.conges = conges;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Impossible de charger les congés en cours';
        this.isLoading = false;
      }
    });
  }

  doRefresh(event: any) {
    this.loadConges();
    event.target.complete();
  }
}
