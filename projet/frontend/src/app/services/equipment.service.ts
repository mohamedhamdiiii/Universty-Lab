import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Equipment } from '../models/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;

  constructor(private http: HttpClient) {}

  // Get all equipment
  getAllEquipment(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(this.apiUrl);
  }

  // Get one equipment by ID
  getEquipmentById(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/${id}`);
  }

  // Create new equipment (using FormData because we upload an image)
  createEquipment(formData: FormData): Observable<{ message: string; equipment: Equipment }> {
    return this.http.post<{ message: string; equipment: Equipment }>(this.apiUrl, formData);
  }

  // Update equipment
  updateEquipment(id: number, formData: FormData): Observable<{ message: string; equipment: Equipment }> {
    return this.http.put<{ message: string; equipment: Equipment }>(`${this.apiUrl}/${id}`, formData);
  }

  // Delete equipment
  deleteEquipment(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Helper: get the full image URL from the backend
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${environment.apiUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }
}
