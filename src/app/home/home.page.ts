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
    { title: 'Demander un congé', icon: 'calendar-number-outline', color: '#4CAF50', path: '/demander-conge', disabled: false },
    { 
      title: 'Mes Absences', 
      icon: 'calendar-clear-outline', 
      color: '#2196F3', 
      path: '/mes-absences',
      adminTitle: 'Voir congé(s) en cours', 
      adminPath: '/conges-en-cours',
      disabled: false,
      tooltip: 'Fonctionnalité bientôt disponible'
    },
    { title: 'Soumettre une alerte', icon: 'warning-outline', color: '#FF9800', path: null, disabled: false },
    { title: 'Chat d\'équipe', icon: 'chatbubbles-outline', color: '#9C27B0', path: '/chat', disabled: true, tooltip: 'Fonctionnalité bientôt disponible' }
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

  /**
   * Initialize component data with default values
   */
  private initializeData() {
    // Reset all data to initial state
    this.userName = '';
    this.stats = {
      pendingLeaves: 0,
      approvedLeaves: 0,
      totalEmployees: 0,
      upcomingEvents: 0
    };
    this.userProfile = undefined;
    this.loadUserProfile();
  }

  /**
   * Load current user profile and update UI accordingly
   */
  private loadUserProfile() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.handleError('User ID not found');
      return;
    }

    this.adamantiumService.getCurrentUser(userId).subscribe({
      next: (user) => {
        // Check if user account is complete
        if (!user.role && !user.service) {
          this.handleIncompleteAccount();
          return;
        }
        
        this.updateUserInterface(user);
        this.loadCongeStats(userId);
      },
      error: (error) => {
        this.handleError('Failed to load user profile', error);
      }
    });
  }

  /**
   * Handle incomplete user account scenario
   */
  private handleIncompleteAccount() {
    this.isAccountIncomplete = true;
    this.startLogoutCountdown();
  }

  /**
   * Update UI elements with user data
   */
  private updateUserInterface(user: User) {
    this.userProfile = user;
    this.userName = `${user.prenom} ${user.nom}`;
    
    this.updateQuickActions(user);
  }

  /**
   * Update quick actions based on user role
   */
  private updateQuickActions(user: User) {
    const isAdmin = user.role === 'Administrateur' || user.service?.nom === 'Ressources Humaines';
    
    if (isAdmin) {
      this.quickActions[1].title = this.quickActions[1].adminTitle as string;
      this.quickActions[1].path = this.quickActions[1].adminPath as string;
      this.quickActions[1].disabled = false;
      delete this.quickActions[1].tooltip;
    } else {
      this.quickActions[1].title = 'Mes Absences';
      this.quickActions[1].path = '/mes-absences';
      this.quickActions[1].disabled = true;
    }
  }

  /**
   * Load leave statistics for the current user
   */
  private loadCongeStats(userId: number) {
    this.vibraniumService.getEmployeCongeStats(userId).subscribe({
      next: (stats) => {
        this.updateStats(stats);
        
        if (this.isAdminUser()) {
          this.loadEmployeesOnLeave();
        }
      },
      error: (error) => {
        this.handleError('Failed to load leave statistics', error);
      }
    });
  }

  /**
   * Update statistics with received data
   */
  private updateStats(stats: any) {
    this.stats.pendingLeaves = stats.en_attente;
    this.stats.approvedLeaves = stats.accepte;
  }

  /**
   * Check if current user is admin or HR
   */
  private isAdminUser(): boolean {
    return this.userProfile?.role === 'Administrateur' || 
           this.userProfile?.service?.nom === 'Ressources Humaines';
  }

  /**
   * Load count of employees currently on leave
   */
  private loadEmployeesOnLeave() {
    this.vibraniumService.getCurrentEmployesOnLeaveCount().subscribe({
      next: (response) => {
        this.stats.totalEmployees = response.count;
      },
      error: (error) => {
        this.handleError('Failed to load employees on leave count', error);
      }
    });
  }

  /**
   * Generic error handler
   */
  private handleError(message: string, error?: any) {
    console.error(message, error);
    // TODO: Implement proper error handling (e.g., show toast message)
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