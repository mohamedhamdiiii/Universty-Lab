import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { ReservationService } from '../../services/reservation.service';
import { Equipment } from '../../models/reservation.model';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  currentStep = 1;
  equipmentList: Equipment[] = [];
  selectedEquipment: Equipment | null = null;
  bookingForm: FormGroup;
  loading = false;
  loadingEquipment = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private equipmentService: EquipmentService,
    private reservationService: ReservationService,
    private router: Router
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.bookingForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadEquipment();
  }

  loadEquipment(): void {
    this.loadingEquipment = true;
    this.equipmentService.getAllEquipment().subscribe({
      next: (data) => {
        this.equipmentList = data.filter(e => e.available);
        this.loadingEquipment = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load equipment. Please try again.';
        this.loadingEquipment = false;
      }
    });
  }

  selectEquipment(equipment: Equipment): void {
    this.selectedEquipment = equipment;
    this.bookingForm.patchValue({ quantity: 1 });
    this.bookingForm.get('quantity')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(equipment.quantity)
    ]);
    this.bookingForm.get('quantity')?.updateValueAndValidity();
    this.errorMessage = '';
    this.currentStep = 2;
  }

  goToStep(step: number): void {
    if (step < this.currentStep) {
      this.currentStep = step;
      this.errorMessage = '';
    }
  }

  nextStep(): void {
    if (this.currentStep === 2) {
      const { startDate, endDate } = this.bookingForm.value;
      if (!startDate || !endDate) {
        this.errorMessage = 'Please select both start and end dates';
        return;
      }
      if (startDate >= endDate) {
        this.errorMessage = 'Start date must be before end date';
        return;
      }
      this.errorMessage = '';
      this.currentStep = 3;
    }
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  submitBooking(): void {
    if (!this.selectedEquipment || this.bookingForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const data = {
      equipmentId: this.selectedEquipment.id!,
      startDate: this.bookingForm.value.startDate,
      endDate: this.bookingForm.value.endDate,
      quantity: this.bookingForm.value.quantity,
      notes: this.bookingForm.value.notes || undefined
    };

    this.reservationService.createReservation(data).subscribe({
      next: () => {
        this.successMessage = 'Reservation created successfully! Redirecting to dashboard...';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create reservation. Please try again.';
        this.loading = false;
      }
    });
  }
}
