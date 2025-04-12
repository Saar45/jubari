import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Message, MessagePayload } from '../models/message.model';
import { environment } from '../../environments/environment';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class PromethiumService {
  private readonly API_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

   private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

  newMessage(messageData: Partial<Message>): Observable<Message> {
    const payload: MessagePayload = {
      date: messageData.date_reclamation!,
      description: messageData.description!,
      idE: messageData.employe_id!
    };

    return this.http.post<Message>(
      `${this.API_URL}/message`, 
      payload, 
      { headers: this.getHeaders() }
    );
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API_URL}/messages`, { headers: this.getHeaders() });
  }

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.API_URL}/services`, { headers: this.getHeaders() });
  }

  getEmployesByService(serviceId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API_URL}/employesbyservice/${serviceId}`, 
      { headers: this.getHeaders() }
    );
  }

  createService(serviceData: { description: string }): Observable<Service> {
    return this.http.post<Service>(
      `${this.API_URL}/service`,
      serviceData,
      { headers: this.getHeaders() }
    );
  }

  updateService(serviceId: number, serviceData: { description: string, chef_id: number | null }): Observable<Service> {
    const payload = {
      id: serviceId,
      description: serviceData.description,
      chef_id: serviceData.chef_id ? serviceData.chef_id : null // Pass the value directly without any conversion
    };
        

    return this.http.put<Service>(
      `${this.API_URL}/service`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  clearPreviousServiceChief(serviceId: number, excludeEmployeId?: number): Observable<any> {
    const payload = {
      service_id: serviceId,
      exclude_employe_id: excludeEmployeId
    };
    
    return this.http.put(
      `${this.API_URL}/clearservicechief`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  updateEmployeServiceDirige(employeId: number, serviceId: number): Observable<any> {
    // First clear serviceId of the previous chief / trigger wouldn't work on sql
    return this.clearPreviousServiceChief(serviceId, employeId).pipe(
      // Then update the new chief
      switchMap(() => {
        const payload = {
          employe_id: employeId,
          service_id: serviceId
        };
        
        return this.http.put(
          `${this.API_URL}/employeservicedirige`,
          payload,
          { headers: this.getHeaders() }
        );
      })
    );
  }
}
