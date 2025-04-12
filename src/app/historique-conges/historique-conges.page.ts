import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VibraniumService } from '../services/vibranium.service';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EditLeaveModalComponent } from './components/edit-leave-modal/edit-leave-modal.component';
import { AppHeaderComponent } from "../components/app-header/app-header.component";

interface LeaveRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Accepte' | 'Rejete' | 'En attente' | 'En attente RH';
  reason: string;
  responseDate?: string;
  responseComment?: string;
  duration: number;
}

@Component({
  selector: 'app-historique-conges',
  templateUrl: './historique-conges.page.html',
  styleUrls: ['./historique-conges.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule, AppHeaderComponent],
})
export class HistoriqueCongesPage implements OnInit {
  // Array to store all leave requests
  leaveRequests: LeaveRequest[] = [];
  // Array to store filtered leave requests based on user selection
  filteredRequests: LeaveRequest[] = [];
  // Default segment selection for filtering
  selectedSegment = 'all';
  // Date fields for filtering by date range
  searchStartDate: string = '';
  searchEndDate: string = '';

  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private vibraniumService: VibraniumService,
    private authService: AuthService,
    private router: Router,
    private modalController: ModalController,
    private toastController: ToastController
  ) {}


  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadHistorique(userId);
    } else {
      this.handleLoadingError('Impossible de récupérer l\'identifiant utilisateur.');
    }
  }

  private loadHistorique(userId: number) {
    this.isLoading = true;
    this.error = null;
    this.vibraniumService.getAllEmployeConges(userId).subscribe({
      next: (conges) => {
        // Transform API data into our LeaveRequest interface format
        this.leaveRequests = conges.map((conge) => ({
          id: conge.id,
          type: conge.paye === 1 ? 'Congé payé' : 'Congé sans solde',
          startDate: conge.dateDebut,
          endDate: conge.dateFin,
          status: (conge.historiqueConge.etat === 'Refuse' ? 'Rejete' : conge.historiqueConge.etat) as 'Accepte' | 'Rejete' | 'En attente' | 'En attente RH',
          reason: conge.description,
          responseDate: conge.historiqueConge.dateDecision,
          responseComment: conge.motif_refus,
          duration: this.calculateDuration(conge.dateDebut, conge.dateFin),
        })).sort((a, b) => moment(b.startDate).diff(moment(a.startDate))); // Sort by date, most recent first
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading leave history:', error);
        this.handleLoadingError('Erreur lors du chargement de l\'historique.');
      }
    });
  }


  private handleLoadingError(message: string, error?: any) {
    console.error(message, error);
    this.error = message;
    this.isLoading = false;
  }

  /**
   * Retry loading data after an error occurs
   */
  retryLoadData() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadHistorique(userId);
    } else {
      this.handleLoadingError('Impossible de réessayer: Identifiant utilisateur manquant.');
    }
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
    this.applyFilters();
  }

 //Filters by selected segment et date
  private applyFilters() {
    let tempFiltered = [...this.leaveRequests];

    switch (this.selectedSegment) {
      case 'approved':
        tempFiltered = tempFiltered.filter(req => req.status === 'Accepte');
        break;
      case 'waiting':
        tempFiltered = tempFiltered.filter(req => 
          req.status === 'En attente' || req.status === 'En attente RH'
        );
        break;
    }

    // Filter by date range if provided
    const start = this.searchStartDate ? moment(this.searchStartDate) : null;
    const end = this.searchEndDate ? moment(this.searchEndDate) : null;

    if (start || end) {
      tempFiltered = tempFiltered.filter(req => {
        const leaveStart = moment(req.startDate);
        const leaveEnd = moment(req.endDate);

        let match = true;
        if (start && !leaveStart.isSameOrAfter(start)) {
          match = false;
        }
        if (end && !leaveEnd.isSameOrBefore(end)) {
          match = false;
        }

        return match;
      });
    }

    this.filteredRequests = tempFiltered;
  }

  
  filterByDate() {
    this.applyFilters();
  }


  hasRequestsWithStatus(status: string): boolean {
    switch (status) {
      case 'approved':
        return this.leaveRequests.some(req => req.status === 'Accepte');
      case 'waiting':
        return this.leaveRequests.some(req => 
          req.status === 'En attente' || req.status === 'En attente RH'
        );
      default:
        return this.leaveRequests.length > 0;
    }
  }

//calcul duration of conge
  private calculateDuration(startDate: string, endDate: string): number {
    const start = moment(startDate, 'YYYY-MM-DD');
    const end = moment(endDate, 'YYYY-MM-DD');
    return end.diff(start, 'days') + 1;
  }

  getStatusColor(status: 'Accepte' | 'Rejete' | 'En attente' | 'En attente RH'): string {
    const colors = {
      'Accepte': 'success',
      'Rejete': 'danger',
      'En attente': 'warning',
      'En attente RH': 'warning'
    };
    return colors[status] || 'medium';
  }

  getStatusLabel(status: 'Accepte' | 'Rejete' | 'En attente' | 'En attente RH'): string {
    return status;
  }

 //Cannot edit conge if it start in less than 7 jours
  canEditLeave(leave: LeaveRequest): boolean {
    const startDate = moment(leave.startDate);
    const today = moment();
    const daysUntilStart = startDate.diff(today, 'days');
    
    return leave.status === 'En attente' && daysUntilStart >= 7;
  }


  async editLeave(leave: LeaveRequest) {
    const modal = await this.modalController.create({
      component: EditLeaveModalComponent,
      componentProps: {
        leave: { ...leave }
      },
      cssClass: 'leave-edit-modal'
    });

    // Reload data if the leave was updated
    modal.onDidDismiss().then((result) => {
      if (result.data?.updated) {
        const userId = this.authService.getUserId();
        if (userId) {
          this.loadHistorique(userId);
        }
      }
    });

    return await modal.present();
  }

 // Refresh the page
  doRefresh(event: any) {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadHistorique(userId);
    }
    event.target.complete();
  }
}
