import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PaginatedResponse,
  EquipmentSearchParams,
  ReservationSearchParams,
  CalendarEvent
} from '../models/search.model';
import { Equipment } from '../models/reservation.model';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  searchEquipment(params: EquipmentSearchParams): Observable<PaginatedResponse<Equipment>> {
    let httpParams = new HttpParams();

    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.available !== undefined && params.available !== null) {
      httpParams = httpParams.set('available', String(params.available));
    }
    if (params.minQuantity) httpParams = httpParams.set('minQuantity', String(params.minQuantity));
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<PaginatedResponse<Equipment>>(`${this.apiUrl}/equipment`, { params: httpParams });
  }

  searchReservations(params: ReservationSearchParams): Observable<PaginatedResponse<Reservation>> {
    let httpParams = new HttpParams();

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.equipmentId) httpParams = httpParams.set('equipmentId', String(params.equipmentId));
    if (params.userId) httpParams = httpParams.set('userId', String(params.userId));
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<PaginatedResponse<Reservation>>(`${this.apiUrl}/reservations`, { params: httpParams });
  }

  getCalendarEvents(month: number, year: number, equipmentId?: number): Observable<CalendarEvent[]> {
    let httpParams = new HttpParams()
      .set('month', String(month))
      .set('year', String(year));

    if (equipmentId) {
      httpParams = httpParams.set('equipmentId', String(equipmentId));
    }

    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/calendar`, { params: httpParams });
  }
}
