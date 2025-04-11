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

@Component({
  selector: 'app-gestion-conges',
  templateUrl: './gestion-conges.page.html',
  styleUrls: ['./gestion-conges.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class GestionCongesPage implements OnInit {
  selectedFilter = 'pending';
  leaveRequests: Conge[] = [];
  currentUser?: Employe;
  searchTerm: string = '';
  sortOrder: 'none' | 'asc' | 'desc' = 'none';
  filteredLeaveRequests: any[] = [];

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
    this.filteredLeaveRequests = this.leaveRequests;
    if (!this.currentUser) {
      return;
    }

    if (!this.currentUser.serviceDirige && !this.isHR(this.currentUser)) {
      const toast = await this.toastController.create({
        message: 'Veuillez contacter votre chef de service pour toutes questions sur vos congés',
        duration: 5000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
      this.router.navigate(['/home']);
    }
  }

  async loadCurrentUser() {
    const userId = this.authService.getUserId();
    this.adamantiumService.getUserById(userId).subscribe(
       (user: Employe) => {
         this.currentUser = user;
         console.log('Current user:', user);
         
         if (!user.serviceDirige && !this.isHR(user)) {
           this.router.navigate(['/home']);
         } else {
           if (this.isHR(user)) {
            console.log('User is HR');
            
             // For HR, load all leave requests
                this.loadAllConges();
           } else {
             // For service managers, load only their service's requests
             this.loadServiceConges(user.serviceDirige?.id || 0);
           }
         }
       }
     );
  }

   isHR(user: Employe): boolean {
    return user.service?.nom === 'Ressources Humaines';
  }

  loadServiceConges(serviceId: number) {
    this.vibraniumService.getCongesByService(serviceId).subscribe(
      (conges: Conge[]) => {
        console.log('Conges:', conges);
        
        this.leaveRequests = conges.filter(conge => 
          conge.historiqueConge?.etat === 'En attente' && 
          conge.employe.id !== this.currentUser?.id
        );
        this.filterLeaveRequests();
      }
    );
  }

  loadAllConges() {
    this.vibraniumService.getAllConges().subscribe(
      (conges: Conge[]) => {
        this.leaveRequests = conges.filter(conge => 
          // Show conges with "En attente RH" status
          conge.historiqueConge?.etat === 'En attente RH' ||
          // AND show conges with "En attente" status only if the owner of the conge has a serviceDirige
          (conge.historiqueConge?.etat === 'En attente')          
        );

        console.log('Filtered Conges:', this.leaveRequests);
        this.filterLeaveRequests();
      }
    );
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
    if (!this.searchTerm.trim()) {
      this.filteredLeaveRequests = this.leaveRequests;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredLeaveRequests = this.leaveRequests.filter(leave => {
        const fullName = `${leave.employe.nom} ${leave.employe.prenom}`.toLowerCase();
        return fullName.includes(searchTermLower);
      });
    }
    this.sortLeaveRequests();
  }

  sortLeaveRequests() {
    if (this.sortOrder === 'none') {
      this.filteredLeaveRequests = [...this.filteredLeaveRequests];
    } else {
      this.filteredLeaveRequests.sort((a, b) => {
        const daysA = this.getDaysUntilStart(a.dateDebut);
        const daysB = this.getDaysUntilStart(b.dateDebut);
        return this.sortOrder === 'asc' ? daysA - daysB : daysB - daysA;
      });
    }
  }
}
