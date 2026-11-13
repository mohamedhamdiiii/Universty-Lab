import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse, RegisterResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/user`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  /**
   * Login with username and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
      withCredentials: true  // Allow cookies to be set
    }).pipe(
      tap(response => {
        // Store token and user info
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Logout: clear stored auth data and redirect to login
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired by decoding the payload
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Get the stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Update the stored token (used when a refreshed token is received)
   */
  updateToken(newToken: string): void {
    localStorage.setItem('token', newToken);
  }

  /**
   * Get the current user from localStorage
   */
  private getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Get current user value
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Fetch all users (protected endpoint)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/findall`);
  }

  /**
   * Fetch a single user by ID (protected endpoint)
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete a user by ID (protected endpoint)
   */
  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
