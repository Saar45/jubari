import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Employe } from '../models/employe.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdamantiumService {
  private readonly API_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // or however you store your token
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Get current user's profile
  getCurrentUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/employe/${id}`, { headers: this.getHeaders() });
  }

  // Get all users (for admin/manager)
  getUsers(): Observable<Employe[]> {
    return this.http.get<Employe[]>(`${this.API_URL}/employes`, { headers: this.getHeaders() });
  }

  //Get specific user by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/employe/${id}`, { headers: this.getHeaders() });
  }

  // Update employee profile
  updateUser(userId: number, employeeData: Partial<Employe>): Observable<Employe> {
    const updateData = {
      id: userId,
      nom: employeeData.nom,
      prenom: employeeData.prenom,
      service_id: employeeData.service?.id,
      email: employeeData.email,
      adresse: employeeData.adresse,
      role: employeeData.role,
      cp: employeeData.code_postal,
      ville: employeeData.ville,
      dirige_service_id: employeeData.serviceDirige?.id
    };

    return this.http.put<Employe>(`${this.API_URL}/employe`, updateData, { 
      headers: this.getHeaders() 
    });
  }

  updatePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.API_URL}/employepassword`, {
      id: userId,
      old_password: oldPassword,
      password: newPassword
    }, { headers: this.getHeaders() });
  }

  // Get user's leave balance
  getUserLeaveBalance(userId: number): Observable<{ remaining: number, taken: number }> {
    return this.http.get<{ remaining: number, taken: number }>(`${this.API_URL}/users/${userId}/leave-balance`, { headers: this.getHeaders() });
  }

  // Update user's profile picture
  updateProfilePicture(userId: number, file: File): Observable<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ avatar: string }>(`${this.API_URL}/users/${userId}/avatar`, formData, { headers: this.getHeaders() });
  }

  // Create new employee
  createEmployee(employeeData: Partial<Employe>): Observable<Employe> {
    const createData = {
      nom: employeeData.nom,
      prenom: employeeData.prenom,
      service_id: employeeData.service?.id,
      email: employeeData.email,
      adresse: employeeData.adresse,
      role: employeeData.role,
      cp: employeeData.code_postal,
      ville: employeeData.ville
    };

    return this.http.post<Employe>(`${this.API_URL}/employe`, createData, { 
      headers: this.getHeaders() 
    });
  }
}
