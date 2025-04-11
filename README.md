# Documentation Technique - Projet Jubari

## Table des matières
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Architecture](#architecture)
4. [Composants](#composants)
5. [Services](#services)
6. [Modèles de données](#modèles-de-données)
7. [Sécurité](#sécurité)
8. [Workflow](#workflow)

## Introduction

Jubari est une application web de gestion administrative développée pour Jubari Consortium, une entreprise d'ingénierie mécanique. L'application permet principalement la gestion des congés avec un workflow de validation à plusieurs niveaux.

## Installation

### Prérequis
- Node.js (v16+)
- Angular CLI (v16+)
- Ionic CLI (v7+)
- MySQL (v8+)

### Configuration

1. Cloner le projet :
```bash
git clone https://github.com/[username]/jubari.git
cd jubari
```

2. Installer les dépendances :
```bash
npm install
```

### Démarrage

1. Application :
```bash
# Mode développement avec live reload
ionic serve
```

2. Accès :
- URL : http://localhost

## Architecture

### Structure du Projet
```
jubari/
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── models/
│   │   ├── pages/
│   │   └── services/
│   ├── environments/
│   └── theme/
└── docs/
```

## Composants

### 1. LoginPage
Gère l'authentification des utilisateurs.

```typescript
@Component({
  selector: 'app-login',
  template: `
    <ion-content>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <!-- Champs de connexion -->
      </form>
    </ion-content>
  `
})
export class LoginPage {
  // ...
}
```

### 2. GestionCongesPage
Interface principale de gestion des congés.

Fonctionnalités :
- Affichage des demandes en attente
- Validation/refus des demandes
- Filtrage par statut
- Export des données

### 3. EmployeesPage
Gestion des employés et des services.

## Services

### 1. AuthService
Gère l'authentification et les sessions.

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  login(credentials: {email: string, password: string}) {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials);
  }
  
  // Autres méthodes...
}
```

### 2. VibraniumService
Gère les appels API liés aux congés :
- Création de demandes
- Modification des statuts
- Récupération des historiques

### 3. AdamantiumService
Gère les utilisateurs et les services :
- CRUD des employés
- Gestion des services
- Attribution des rôles

## Modèles de données

### Conge
```typescript
interface Conge {
  id: number;
  employe: Employe;
  dateDebut: string;
  dateFin: string;
  description: string;
  historiqueConge: Historique;
  paye: number;
  motif_refus?: string;
}
```

### Employe
```typescript
interface Employe {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  service?: Service;
  serviceDirige?: Service;
  nb_conges_payes?: number;
}
```

## Sécurité

### JWT Authentication
L'application utilise JSON Web Tokens pour l'authentification :
- Tokens stockés dans localStorage
- Intercepteur HTTP pour ajouter le token
- Refresh token automatique

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request);
  }
}
```

## Workflow

### Processus de Validation des Congés

1. **Soumission** :
   - L'employé crée une demande
   - Statut initial : "En attente"

2. **Validation Chef de Service** :
   - Le chef reçoit la notification
   - Peut approuver ou refuser
   - Si approuvé : "En attente RH"
   - Si refusé : "Refusé" + motif

3. **Validation RH** :
   - Les RH examinent la demande
   - Décision finale
   - Si approuvé : "Accepté"
   - Si refusé : "Refusé" + motif

### Règles Métier
- Délai minimum : 7 jours avant la date de début
- Solde de congés vérifié automatiquement
- Weekends exclus du calcul
- Historique complet conservé

## Déploiement

### Production
1. Construire l'application :
```bash
ionic build --prod
```

2. Configuration serveur :
```nginx
server {
    listen 80;
    server_name jubari.example.com;
    root /var/www/jubari/www;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Support et Maintenance

### Logs et Monitoring
- Utilisation de Console Logger
- Tracking des erreurs
- Métriques de performance

### Mises à jour
- Vérification des dépendances
- Tests de régression
- Documentation des changements

## Conclusion

Cette application offre une solution complète pour la gestion des congés avec :
- Interface utilisateur intuitive
- Workflow de validation robuste
- Architecture évolutive
- Sécurité renforcée

Pour toute question ou support :
- Email : support@jubari.com
- Documentation API : https://api.jubari.com/docs
- Wiki : https://wiki.jubari.com
