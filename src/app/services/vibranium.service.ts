import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conge, CongeStats } from '../models/conge.model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class VibraniumService {
  private readonly API_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllConges(): Observable<Conge[]> {
    return this.http.get<Conge[]>(`${this.API_URL}/allconges`, { headers: this.getHeaders() });
  }

  getEmployeCongeStats(employe_id: number): Observable<CongeStats> {
    return this.http.get<CongeStats>(`${this.API_URL}/employecongestats/${employe_id}`, 
      { 
        headers: this.getHeaders(),
      }
    );
  }

  /*getConges(employeId: number): Observable<Conge[]> {
    return this.http.post<Conge[]>(`${this.API_URL}/employe/conges`, 
      { employeId },
      { headers: this.getHeaders() }
    );
  }*/

  getAllEmployeConges(employe_id: number): Observable<Conge[]> {
    return this.http.get<Conge[]>(`${this.API_URL}/employeconges/${employe_id}`, { headers: this.getHeaders() });
  }

  createConge(employeId: number, congeData: Partial<Conge>): Observable<Conge> {
    const formData = new FormData();
    formData.append('dateD', congeData.dateDebut as string);
    formData.append('dateF', congeData.dateFin as string);
    formData.append('description', congeData.description as string);
    formData.append('paye', congeData.paye?.toString() ?? '0'); // Ensure paye is sent as string
    formData.append('idE', employeId.toString());

    console.log('Sending form data:', {
      dateD: congeData.dateDebut,
      dateF: congeData.dateFin,
      description: congeData.description,
      paye: congeData.paye?.toString() ?? '0',
      idE: employeId
    });

    return this.http.post<Conge>(`${this.API_URL}/conge`, 
      formData,
      { headers: this.getHeaders() }
    );
  }

  updateConge(congeId: number, congeData: Partial<Conge>): Observable<Conge> {
    const payload = {
      id: congeId,
      dateD: congeData.dateDebut,
      dateF: congeData.dateFin,
      description: congeData.description,
      paye: congeData.paye
    };

    console.log('Updating leave with payload:', payload);

    return this.http.put<Conge>(`${this.API_URL}/conge`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  getCongesByService(serviceId: number): Observable<Conge[]> {
    return this.http.get<Conge[]>(`${this.API_URL}/congesbyservice/${serviceId}`, 
      { headers: this.getHeaders() }
    );
  }

  priseDecision(congeId: number, decisionData: any): Observable<any> {
    const payload = {
      id: congeId,
      avisChefDirect: decisionData.avis_chef_direct,
      prenomChefDirect: decisionData.prenom_chef_direct,
      nomChefDirect: decisionData.nom_chef_direct,
      datePriseDecisionChefDirect: decisionData.date_decision_chef_direct,
      motifRefus: decisionData.motif_refus || null
    };

    console.log('Sending decision payload:', payload);
    
    return this.http.put<any>(`${this.API_URL}/prisedecisionchef`, payload, 
      { headers: this.getHeaders() }
    );
  }

  priseDecisionRH(congeId: number, decisionData: any): Observable<any> {
    const payload = {
      id: congeId,
      avisRH: decisionData.avis_rh,
      prenomRH: decisionData.prenom_rh,
      nomRH: decisionData.nom_rh,
      datePriseDecisionRH: decisionData.date_decision_rh,
      motifRefus: decisionData.motif_refus || null
    };

    console.log('Sending HR decision payload:', payload);
    
    return this.http.put<any>(`${this.API_URL}/prisedecisionrh`, payload, 
      { headers: this.getHeaders() }
    );
  }

  statutConge(historique_congeId: number, etat: string, motif?: string): Observable<any> {
    const payload = {
      id: historique_congeId,
      etat: etat,
      dateDecision: moment().format('YYYY-MM-DD'),
      motif: motif
    };

    console.log('Sending statut payload:', payload);
    
    return this.http.put(`${this.API_URL}/statutconge`, payload, { headers: this.getHeaders() });
  }

  getCurrentEmployesOnLeaveCount(): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.API_URL}/CurrentEmployesOnLeaveCount`, 
      { headers: this.getHeaders() }
    );
  }

  getCurrentConges(): Observable<Conge[]> {
    return this.http.get<Conge[]>(`${this.API_URL}/currentconges`, 
      { headers: this.getHeaders() }
    );
  }
}
