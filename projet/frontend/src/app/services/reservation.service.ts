import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  createReservation(data: {
    equipmentId: number;
    startDate: string;
    endDate: string;
    quantity?: number;
    notes?: string;
  }): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, data);
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/my`);
  }

  getAllReservations(params?: {
    status?: string;
    userId?: number;
    equipmentId?: number;
  }): Observable<Reservation[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.userId) httpParams = httpParams.set('userId', params.userId.toString());
    if (params?.equipmentId) httpParams = httpParams.set('equipmentId', params.equipmentId.toString());

    return this.http.get<Reservation[]>(this.apiUrl, { params: httpParams });
  }

  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}/status`, { status });
  }

  cancelReservation(id: number): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}/cancel`, {});
  }

  deleteReservation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
