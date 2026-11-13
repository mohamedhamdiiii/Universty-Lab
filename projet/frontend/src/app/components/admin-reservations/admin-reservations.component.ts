import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-admin-reservations',
  templateUrl: './admin-reservations.component.html',
  styleUrls: ['./admin-reservations.component.css']
})
export class AdminReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  statusFilter = 'all';
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadAllReservations();
  }

  loadAllReservations(): void {
    this.loading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.filterReservations();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load reservations';
        this.loading = false;
      }
    });
  }

  filterReservations(): void {
    if (this.statusFilter === 'all') {
      this.filteredReservations = [...this.reservations];
    } else {
      this.filteredReservations = this.reservations.filter(r => r.status === this.statusFilter);
    }
  }

  updateStatus(id: number | undefined, newStatus: string): void {
    if (!id) return;
    this.reservationService.updateStatus(id, newStatus).subscribe({
      next: () => {
        this.successMessage = `Reservation #${id} updated to ${newStatus}`;
        this.loadAllReservations();
        setTimeout(() => this.successMessage = '', 3500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update reservation status';
        setTimeout(() => this.errorMessage = '', 3500);
      }
    });
  }

  deleteReservation(id: number | undefined): void {
    if (!id) return;
    if (!confirm(`Are you sure you want to permanently delete reservation #${id}?`)) return;

    this.reservationService.deleteReservation(id).subscribe({
      next: () => {
        this.successMessage = `Reservation #${id} deleted`;
        this.loadAllReservations();
        setTimeout(() => this.successMessage = '', 3500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete reservation';
        setTimeout(() => this.errorMessage = '', 3500);
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
