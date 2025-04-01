import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, Subscription, fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginResponse {
  token: string;
  user_id: number;
  // Add other response fields if any
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  adresse: string;
  cp: string; // Note: API expects 'cp' not 'code_postal'
  ville: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8000';
  private readonly INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
  private activityCheckTimer?: Subscription;
  private lastActivity: number = Date.now();
  private activityEvents: string[] = ['mousedown', 'keydown', 'scroll', 'touchstart'];

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.setupActivityMonitoring();
  }

  private setupActivityMonitoring(): void {
    // Set up activity listeners
    this.activityEvents.forEach(eventName => {
      fromEvent(window, eventName).subscribe(() => this.updateLastActivity());
    });

    // Start the inactivity checker
    this.ngZone.runOutsideAngular(() => {
      this.activityCheckTimer = timer(30000, 30000).subscribe(() => {
        this.checkInactivity();
      });
    });
  }

  private updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  private checkInactivity(): void {
    const now = Date.now();
    if (now - this.lastActivity >= this.INACTIVITY_TIMEOUT) {
      this.ngZone.run(() => {
        this.logout();
        this.router.navigate(['/login']);
      });
    }
  }

  private clearUserData(): void {
    // Clear absolutely everything in localStorage
    window.localStorage.clear();
    sessionStorage.clear();
    this.lastActivity = Date.now();
    if (this.activityCheckTimer) {
      this.activityCheckTimer.unsubscribe();
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const userId = this.getUserId();
    return !!(token && userId);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    this.clearUserData(); // Clear any existing data before login
    this.updateLastActivity();
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap(
          response => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user_id', response.user_id.toString());
          },
          error => {
            this.clearUserData(); // Clear data if login fails
            throw error;
          }
        )
      );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data)
      .pipe(
        tap(
          response => {
            console.log('Registration successful:', response);
            
            // Optional: Auto-login after registration
            this.login(data.email, data.password).subscribe();

            console.log('Auto-login successful:', response);
            
            return response;
          },
          error => {
            console.error('Registration failed:', error);
            throw error;
          }
        )
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId, 10) : 0;
  }

  logout(): void {
    this.clearUserData();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.activityCheckTimer) {
      this.activityCheckTimer.unsubscribe();
    }
  }
}
