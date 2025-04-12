import { Component, OnInit } from '@angular/core';
import { VibraniumService } from '../services/vibranium.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Conge } from '../models/conge.model';
import { Employe } from '../models/employe.model';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdamantiumService } from '../services/adamantium.service';
import * as moment from 'moment';
import { AppHeaderComponent } from "../components/app-header/app-header.component";

@Component({
  selector: 'app-gestion-conges',
  templateUrl: './gestion-conges.page.html',
  styleUrls: ['./gestion-conges.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, AppHeaderComponent],
})
export class GestionCongesPage implements OnInit {
  selectedFilter = 'pending';
  leaveRequests: Conge[] = [];
  currentUser?: Employe;
  searchTerm: string = '';
  sortOrder: 'priority' | 'asc' | 'desc' = 'priority';
  filteredLeaveRequests: Conge[] = [];
  isLoading: boolean = true; // Add isLoading state
  error: string | null = null; // Add error state

  constructor(
    private vibraniumService: VibraniumService,
    private adamantiumService: AdamantiumService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.loadCurrentUser();
  }

  async loadCurrentUser() {
    this.isLoading = true; // Start loading
    this.error = null;
    const userId = this.authService.getUserId();
    if (!userId) {
      this.handleLoadingError('User ID not found in auth service.');
      this.router.navigate(['/login']);
      return;
    }
    this.adamantiumService.getUserById(userId).subscribe({
      next: (user: Employe) => {
        this.currentUser = user;
        console.log('Current user:', user);

        if (!user.serviceDirige && !this.isHR(user)) {
          this.presentAccessDeniedToast();
          this.isLoading = false; // Stop loading as access is denied
          this.router.navigate(['/home']);
        } else {
          if (this.isHR(user)) {
            console.log('User is HR or Admin, loading relevant conges.');
            this.loadAllConges(); // This will handle isLoading = false on completion/error
          } else if (user.serviceDirige) {
            console.log(`User is manager of service ${user.serviceDirige.id}, loading service conges.`);
            this.loadServiceConges(user.serviceDirige.id); // This will handle isLoading = false on completion/error
          } else {
            this.handleLoadingError('Configuration utilisateur invalide.');
          }
        }
      },
      error: (err) => {
        this.handleLoadingError('Erreur lors du chargement des informations utilisateur.', err);
      }
    });
  }

  async presentAccessDeniedToast() {
    const toast = await this.toastController.create({
      message: 'Veuillez contacter votre chef de service pour toutes questions sur vos congés',
      duration: 5000,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }

  isHR(user: Employe): boolean {
    return user.role === 'Administrateur' || user.service?.nom === 'Ressources Humaines';
  }

  loadServiceConges(serviceId: number) {
    this.vibraniumService.getCongesByService(serviceId).subscribe({
      next: (conges: Conge[]) => {
        console.log('Conges for service:', serviceId, conges);

        this.leaveRequests = conges.filter(conge =>
          conge.historiqueConge?.etat === 'En attente' &&
          conge.employe.id !== this.currentUser?.id
        );
        console.log('Filtered Conges for Manager:', this.leaveRequests);
        this.filterLeaveRequests();
        this.isLoading = false; // Loading complete
        this.error = null;
      },
      error: (err) => {
        this.handleLoadingError(`Erreur lors du chargement des demandes pour le service.`, err);
      }
    });
  }

  loadAllConges() {
    if (!this.currentUser) {
      this.handleLoadingError('Utilisateur courant non défini.');
      return;
    }

    const isAdmin = this.currentUser.role === 'Administrateur';
    const isHRManager = this.currentUser.serviceDirige?.nom === 'Ressources Humaines';
    const relevantStatuses = ['En attente', 'En attente RH'];

    this.vibraniumService.getAllConges().subscribe({
      next: (conges: Conge[]) => {
        if (isAdmin || isHRManager) {
          this.leaveRequests = conges.filter(conge =>
            relevantStatuses.includes(conge.historiqueConge?.etat)
          );
          console.log('Filtered Conges for Admin/HR Manager:', this.leaveRequests);
        } else {
          this.leaveRequests = conges.filter(conge =>
            conge.employe.id !== this.currentUser?.id &&
            relevantStatuses.includes(conge.historiqueConge?.etat)
          );
          console.log('Filtered Conges for regular HR:', this.leaveRequests);
        }

        this.filterLeaveRequests();
        this.isLoading = false; // Loading complete
        this.error = null;
      },
      error: (err) => {
        this.handleLoadingError('Erreur lors du chargement des demandes de congé.', err);
      }
    });
  }

  private handleLoadingError(message: string, error?: any) {
    console.error(message, error);
    this.error = message;
    this.isLoading = false;
  }

  retryLoadData() {
    this.loadCurrentUser();
  }

  async approveLeave(leaveId: number, leaveHistoId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Voulez-vous approuver cette demande de congé ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Approuver',
          handler: () => this.processApproval(leaveId, leaveHistoId)
        }
      ]
    });

    await alert.present();
  }

  private async processApproval(leaveId: number, leaveHistoId: number) {
    try {
      const decisionData = {
        avis_chef_direct: 1,
        prenom_chef_direct: this.currentUser?.prenom || '',
        nom_chef_direct: this.currentUser?.nom || '',
        date_decision_chef_direct: moment().format('YYYY-MM-DD'),
        motif_refus: null
      };

      await this.vibraniumService.priseDecision(leaveId, decisionData).toPromise();
      await this.vibraniumService.statutConge(leaveHistoId, 'En attente RH').toPromise();

      const toast = await this.toastController.create({
        message: 'Demande approuvée et transmise aux RH',
        duration: 4000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();

      this.loadServiceConges(this.currentUser?.serviceDirige?.id || 0);
    } catch (error) {
      console.error('Error approving leave:', error);
      const toast = await this.toastController.create({
        message: 'Erreur lors de l\'approbation',
        duration: 4000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  async openDenyDialog(leave: Conge) {
    const alert = await this.alertController.create({
      header: 'Refuser la demande',
      inputs: [
        {
          name: 'motif',
          type: 'textarea',
          placeholder: 'Motif du refus (max 190 caractères)',
          attributes: {
            maxlength: 190
          }
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Refuser',
          handler: async (data) => {
            if (data.motif) {
              try {
                const decisionData = {
                  avis_chef_direct: 0,
                  prenom_chef_direct: this.currentUser?.prenom || '',
                  nom_chef_direct: this.currentUser?.nom || '',
                  date_decision_chef_direct: moment().format('YYYY-MM-DD'),
                  motif_refus: data.motif
                };

                await this.vibraniumService.priseDecision(leave.id, decisionData).toPromise();
                await this.vibraniumService.statutConge(leave.historiqueConge.id, 'Refuse', data.motif).toPromise();

                const toast = await this.toastController.create({
                  message: 'Demande refusée',
                  duration: 4000,
                  color: 'success',
                  position: 'bottom'
                });
                await toast.present();

                this.loadServiceConges(this.currentUser?.serviceDirige?.id || 0);
              } catch (error) {
                console.error('Error denying leave:', error);
                const toast = await this.toastController.create({
                  message: 'Erreur lors du refus',
                  duration: 4000,
                  color: 'danger',
                  position: 'bottom'
                });
                await toast.present();
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async hrApproveLeave(leaveId: number, leaveHistoId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmation RH',
      message: 'Voulez-vous approuver cette demande de congé ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Approuver',
          handler: () => this.processHRApproval(leaveId, leaveHistoId)
        }
      ]
    });

    await alert.present();
  }

  private async processHRApproval(leaveId: number, leaveHistoId: number) {
    try {
      const decisionData = {
        avis_rh: 1,
        prenom_rh: this.currentUser?.prenom || '',
        nom_rh: this.currentUser?.nom || '',
        date_decision_rh: moment().format('YYYY-MM-DD'),
        motif_refus: null
      };

      await this.vibraniumService.priseDecisionRH(leaveId, decisionData).toPromise();
      await this.vibraniumService.statutConge(leaveHistoId, 'Accepte').toPromise();

      const toast = await this.toastController.create({
        message: 'Demande approuvée',
        duration: 4000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();

      this.loadAllConges();
    } catch (error) {
      console.error('Error approving leave:', error);
      const toast = await this.toastController.create({
        message: 'Erreur lors de l\'approbation',
        duration: 4000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  async hrDenyLeave(leave: Conge) {
    const alert = await this.alertController.create({
      header: 'Refuser la demande',
      inputs: [
        {
          name: 'motif',
          type: 'textarea',
          placeholder: 'Motif du refus (max 190 caractères)',
          attributes: {
            maxlength: 190
          }
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Refuser',
          handler: async (data) => {
            if (data.motif) {
              try {
                const decisionData = {
                  avis_rh: 0,
                  prenom_rh: this.currentUser?.prenom || '',
                  nom_rh: this.currentUser?.nom || '',
                  date_decision_rh: moment().format('YYYY-MM-DD'),
                  motif_refus: data.motif
                };

                await this.vibraniumService.priseDecisionRH(leave.id, decisionData).toPromise();
                await this.vibraniumService.statutConge(
                  leave.historiqueConge.id,
                  'Refuse',
                  data.motif
                ).toPromise();

                const toast = await this.toastController.create({
                  message: 'Demande refusée',
                  duration: 4000,
                  color: 'success',
                  position: 'bottom'
                });
                await toast.present();

                this.loadAllConges();
              } catch (error) {
                console.error('Error denying leave:', error);
                const toast = await this.toastController.create({
                  message: 'Erreur lors du refus',
                  duration: 4000,
                  color: 'danger',
                  position: 'bottom'
                });
                await toast.present();
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getDaysUntilStart(startDate: string): number {
    return moment(startDate).startOf('day').diff(moment().startOf('day'), 'days');
  }

  filterLeaveRequests() {
    let tempFiltered: Conge[] = [];
    if (!this.searchTerm.trim()) {
      tempFiltered = [...this.leaveRequests];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      tempFiltered = this.leaveRequests.filter(leave => {
        const fullName = `${leave.employe.nom} ${leave.employe.prenom}`.toLowerCase();
        return fullName.includes(searchTermLower);
      });
    }
    this.filteredLeaveRequests = tempFiltered;
    this.sortLeaveRequests();
  }

  sortLeaveRequests() {
    let sortedRequests = [...this.filteredLeaveRequests];

    if (this.sortOrder === 'priority') {
      sortedRequests.sort((a, b) => {
        const isAPriority = a.historiqueConge?.etat === 'En attente RH';
        const isBPriority = b.historiqueConge?.etat === 'En attente RH';

        if (isAPriority && !isBPriority) {
          return -1;
        }
        if (!isAPriority && isBPriority) {
          return 1;
        }
        const daysA = this.getDaysUntilStart(a.dateDebut);
        const daysB = this.getDaysUntilStart(b.dateDebut);
        return daysA - daysB;
      });
    } else if (this.sortOrder === 'asc' || this.sortOrder === 'desc') {
      sortedRequests.sort((a, b) => {
        const daysA = this.getDaysUntilStart(a.dateDebut);
        const daysB = this.getDaysUntilStart(b.dateDebut);
        return this.sortOrder === 'asc' ? daysA - daysB : daysB - daysA;
      });
    }

    this.filteredLeaveRequests = sortedRequests;
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
