import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/reservation.model';

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

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.applyFilter(this.activeFilter);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load reservations';
        this.loading = false;
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
}
