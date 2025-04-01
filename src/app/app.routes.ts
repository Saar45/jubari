import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'employes',
    loadComponent: () => import('./employes/employes.page').then(m => m.EmployesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'demander-conge',
    loadComponent: () => import('./demander-conge/demander-conge.page').then(m => m.DemanderCongePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'historique-conges',
    loadComponent: () => import('./historique-conges/historique-conges.page').then(m => m.HistoriqueCongesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestion-conges',
    loadComponent: () => import('./gestion-conges/gestion-conges.page').then(m => m.GestionCongesPage),
    canActivate: [AuthGuard]
  },
  { path: 'services', 
    loadComponent: () => import('./departements/services.page').then(m => m.ServicesPage),
    canActivate: [AuthGuard]},
  {
    path: 'conges-en-cours',
    loadComponent: () => import('./pages/conges-en-cours/conges-en-cours.page').then(m => m.CongesEnCoursPage)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];