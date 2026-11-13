import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/reservation.model';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  activeFilter: 'all' | 'active' | 'pending' | 'approved' | 'past' = 'all';

  currentUser: User | null = null;
  users: User[] = [];
  isLoadingUsers = false;
  usersError = '';

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadReservations();
    if (this.currentUser?.role === 'admin') {
      this.loadUsers();
    }
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        this.reservations = data || [];
        this.applyFilter(this.activeFilter);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load reservations';
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.usersError = '';

    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users || [];
        this.isLoadingUsers = false;
      },
      error: (err) => {
        this.usersError = err.error?.message || 'Failed to load users.';
        this.isLoadingUsers = false;
      }
    });
  }

  applyFilter(filter: 'all' | 'active' | 'pending' | 'approved' | 'past'): void {
    this.activeFilter = filter;
    if (filter === 'all') {
      this.filteredReservations = [...this.reservations];
    } else if (filter === 'active') {
      this.filteredReservations = this.reservations.filter(
        r => r.status === 'pending' || r.status === 'approved'
      );
    } else if (filter === 'pending') {
      this.filteredReservations = this.reservations.filter(r => r.status === 'pending');
    } else if (filter === 'approved') {
      this.filteredReservations = this.reservations.filter(r => r.status === 'approved');
    } else if (filter === 'past') {
      this.filteredReservations = this.reservations.filter(
        r => r.status === 'returned' || r.status === 'rejected' || r.status === 'cancelled'
      );
    }
  }

  canCancel(status: string): boolean {
    return status === 'pending' || status === 'approved';
  }

  cancelReservation(id?: number): void {
    if (!id) return;
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    this.reservationService.cancelReservation(id).subscribe({
      next: () => {
        this.successMessage = 'Reservation cancelled successfully';
        this.loadReservations();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to cancel reservation';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'badge-approved';
      case 'pending': return 'badge-pending';
      case 'rejected': return 'badge-rejected';
      case 'returned': return 'badge-returned';
      case 'cancelled': return 'badge-cancelled';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to delete user.');
        }
      });
    }
  }

  getImageUrl(url?: string | null): string {
    if (!url) return 'https://via.placeholder.com/300x200?text=Equipment';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
