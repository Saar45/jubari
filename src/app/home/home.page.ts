import { Component, LOCALE_ID, OnInit } from '@angular/core';
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
import { AppHeaderComponent } from '../components/app-header/app-header.component';

registerLocaleData(localeFr);

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    RouterModule, 
    AppHeaderComponent
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
})
export class HomePage implements OnInit {
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
  isLoading: boolean = true; // Add isLoading state
  error: string | null = null; // Add error state

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
    }
  }

  ngOnInit(): void {
    // Load data only if authenticated
    if (this.authService.isAuthenticated()) {
      this.loadInitialData();
    } else {
      this.isLoading = false;
      this.error = "Utilisateur non authentifié.";
    }
  }

 //initial data
  private loadInitialData() {
    this.isLoading = true;
    this.error = null;
    this.userName = '';
    this.stats = { pendingLeaves: 0, approvedLeaves: 0, totalEmployees: 0, upcomingEvents: 0 };
    this.userProfile = undefined;
    this.loadUserProfile();
  }

  /**
   * Load current user profile 
   */
  private loadUserProfile() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.handleLoadingError('Erreur de chargement de l\'utilisateur');
      return;
    }

    this.adamantiumService.getCurrentUser(userId).subscribe({
      next: (user) => {
        if (!user.role && !user.service) {
          this.handleIncompleteAccount();
          return;
        }
        
        this.updateUserInterface(user);
        this.loadCongeStats(userId);
      },
      error: (error) => {
        this.handleLoadingError('Erreur lors de chargement du profile de l\'utilisateur', error);
      }
    });
  }

  /**
   * Handle incomplete user account scenario
   */
  private handleIncompleteAccount() {
    this.isAccountIncomplete = true;
    this.isLoading = false;
    this.error = null;
    this.startLogoutCountdown();
  }

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
   * Load conge statistics for the current user
   */
  private loadCongeStats(userId: number) {
    this.vibraniumService.getEmployeCongeStats(userId).subscribe({
      next: (stats) => {
        this.updateStats(stats);
        
        if (this.isAdminUser()) {
          this.loadEmployeesOnLeave();
        } else {
          this.isLoading = false;
          this.error = null;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }


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


  private loadEmployeesOnLeave() {
    this.vibraniumService.getCurrentEmployesOnLeaveCount().subscribe({
      next: (response) => {
        this.stats.totalEmployees = response.count;
        this.isLoading = false;
        this.error = null;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Generic error handler for loading state
   */
  private handleLoadingError(message: string, error?: any) {
    this.error = message;
    this.isLoading = false;
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

  private logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  async openSubmitMessage() {
    const modal = await this.modalCtrl.create({
      component: SubmitMessageComponent
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log('Success');
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
    const adminEmail = 'admin@example.com';
    window.location.href = `mailto:${adminEmail}?subject=Contact%20Administration`;
  }

  retryLoadData() {
    this.loadInitialData();
  }
}