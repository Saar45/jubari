import { Component, LOCALE_ID } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { SubmitMessageComponent } from '../submit-message/submit-message.component';
import { EditProfileComponent } from '../modals/edit-profile/edit-profile.component';
import { AuthService } from '../services/auth.service';
import { AdamantiumService } from '../services/adamantium.service';
import { VibraniumService } from '../services/vibranium.service';
import { User } from '../models/user.model';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
})
export class HomePage {
  today: Date = new Date();
  userName: string = 'John Doe';
  stats = {
    pendingLeaves: 0,
    approvedLeaves: 0,
    totalEmployees: 48,
    upcomingEvents: 3
  };

  quickActions = [
    { title: 'Demander un congé', icon: 'calendar-number-outline', color: '#4CAF50', path: '/demander-conge' },
    { title: 'Voir planning', icon: 'time-outline', color: '#2196F3', path: '/planning', adminTitle: 'Voir congé(s) en cours', adminPath: '/conges-en-cours' },
    { title: 'Soumettre une alerte', icon: 'warning-outline', color: '#FF9800', path: null },
    { title: 'Chat d\'équipe', icon: 'chatbubbles-outline', color: '#9C27B0', path: '/chat' }
  ];

  userProfile?: User;
  isAccountIncomplete: boolean = false;
  countdownSeconds: number = 10;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private adamantiumService: AdamantiumService,
    private vibraniumService: VibraniumService
  ) {
    // Check authentication status before loading anything
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.initializeData();
  }

  private initializeData() {
    this.userName = ''; // Reset name
    this.stats = {
      pendingLeaves: 0,
      approvedLeaves: 0,
      totalEmployees: 0,
      upcomingEvents: 0
    };
    this.userProfile = undefined;
    this.loadUserProfile();
  }

  private loadUserProfile() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.adamantiumService.getCurrentUser(userId).subscribe({
        next: (user) => {
          console.log('User profile loaded:', user);
          
          if (!user.role && !user.service) {
            this.isAccountIncomplete = true;
            this.startLogoutCountdown();
            return;
          }
          
          this.userProfile = user;
          this.userName = `${user.prenom} ${user.nom}`;
          
          // Update quick actions for admin
          if (user.role === 'Administrateur' || user.service?.nom === 'Ressources Humaines') {
            this.quickActions[1].title = this.quickActions[1].adminTitle as string;
            this.quickActions[1].path = this.quickActions[1].adminPath as string;
          }
          
          this.loadCongeStats(userId);
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
        }
      });
    }
  }

  private startLogoutCountdown() {
    const countdownInterval = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        clearInterval(countdownInterval);
        this.logout();
      }
    }, 1000);
  }

  private loadCongeStats(userId: number) {
    this.vibraniumService.getEmployeCongeStats(userId).subscribe({
      next: (stats) => {
        console.log('Stats loaded:', stats);
        this.stats.pendingLeaves = stats.en_attente;
        this.stats.approvedLeaves = stats.accepte;
        
        // Load employees on leave count if user is administrator
        if (this.userProfile?.role === 'Administrateur' || this.userProfile?.service?.nom === 'Ressources Humaines') {
          this.vibraniumService.getCurrentEmployesOnLeaveCount().subscribe({
            next: (response) => {
              this.stats.totalEmployees = response.count;
            },
            error: (error) => {
              console.error('Error loading employees on leave count:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading conge stats:', error);
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    // Clear component data first
    this.userName = '';
    this.userProfile = undefined;
    this.stats = {
      pendingLeaves: 0,
      approvedLeaves: 0,
      totalEmployees: 0,
      upcomingEvents: 0
    };
    // Then logout
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  async openSubmitMessage() {
    const modal = await this.modalCtrl.create({
      component: SubmitMessageComponent
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log('Message submitted:', data);
      // Implement submission logic
    }
  }

  async openEditProfile() {
    const modal = await this.modalCtrl.create({
      component: EditProfileComponent,
      componentProps: {
        user: this.userProfile
      }
    });
  
    await modal.present();
  
    const { data } = await modal.onWillDismiss();
    if (data?.updated) {
      this.loadUserProfile();
    }
  }

  async contactAdmin() {
    // Open mail app with admin email
    const adminEmail = 'admin@example.com'; // Replace with actual admin email
    window.location.href = `mailto:${adminEmail}?subject=Contact%20Administration`;
  }
}