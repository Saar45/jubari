import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VibraniumService } from '../services/vibranium.service';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EditLeaveModalComponent } from './components/edit-leave-modal/edit-leave-modal.component';

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
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
})
export class HistoriqueCongesPage implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  filteredRequests: LeaveRequest[] = [];
  selectedSegment = 'all';
  searchStartDate: string = '';
  searchEndDate: string = '';

  constructor(
    private vibraniumService: VibraniumService,
    private authService: AuthService,
    private router: Router,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadConges();
  }

  private loadConges() {
    const userId = this.authService.getUserId();
    this.vibraniumService.getAllEmployeConges(userId).subscribe((conges) => {
      this.leaveRequests = conges.map((conge) => ({
        id: conge.id,
        type: conge.paye === 1 ? 'Congé payé' : 'Congé sans solde',
        startDate: conge.dateDebut,
        endDate: conge.dateFin,
        status: conge.historiqueConge.etat === 'Refuse' ? 'Rejete' : conge.historiqueConge.etat,
        reason: conge.description,
        responseDate: conge.historiqueConge.dateDecision,
        responseComment: conge.motif_refus,
        duration: this.calculateDuration(conge.dateDebut, conge.dateFin),
      }));
      this.filterRequests(this.selectedSegment);
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
    this.filterRequests(this.selectedSegment);
  }

  private filterRequests(segment: string) {
    this.filteredRequests = this.getSegmentFilteredRequests(segment);
    this.filterByDate();
  }

  private getSegmentFilteredRequests(segment: string): LeaveRequest[] {
    switch (segment) {
      case 'approved':
        return this.leaveRequests.filter(req => req.status === 'Accepte');
      case 'waiting':
        return this.leaveRequests.filter(req => 
          req.status === 'En attente' || req.status === 'En attente RH'
        );
      default:
        return [...this.leaveRequests];
    }
  }

  filterByDate() {
    if (!this.searchStartDate && !this.searchEndDate) {
      this.filterRequests(this.selectedSegment);
      return;
    }

    const start = this.searchStartDate ? moment(this.searchStartDate) : null;
    const end = this.searchEndDate ? moment(this.searchEndDate) : null;

    const filteredBySegment = this.getSegmentFilteredRequests(this.selectedSegment);
    this.filteredRequests = filteredBySegment.filter(req => {
      const leaveStart = moment(req.startDate);
      const leaveEnd = moment(req.endDate);
      
      if (start && end) {
        return leaveStart.isSameOrAfter(start) && leaveEnd.isSameOrBefore(end);
      } else if (start) {
        return leaveStart.isSameOrAfter(start);
      } else if (end) {
        return leaveEnd.isSameOrBefore(end);
      }
      return true;
    });
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

    modal.onDidDismiss().then((result) => {
      if (result.data?.updated) {
        this.loadConges();
      }
    });

    return await modal.present();
  }
}
