import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { Equipment } from '../../models/equipment.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.css'
})
export class EquipmentComponent implements OnInit {
  // --- Form ---
  equipmentForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // --- Grid ---
  equipments: Equipment[] = [];
  isLoading = false;
  loadError = '';

  // --- Edit mode ---
  isEditing = false;
  editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private equipmentService: EquipmentService,
    private cdr: ChangeDetectorRef
  ) {
    // Create the form with validation
    this.equipmentForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      category: [''],
      quantity: [1, [Validators.required, Validators.min(0)]],
      status: ['available', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadEquipments();
  }

  // Convenience getter for form controls (used in template)
  get f() { return this.equipmentForm.controls; }

  // --- Image selection ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Show preview of the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // --- Submit the form ---
  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.equipmentForm.markAllAsTouched();

    if (this.equipmentForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Build FormData to send both text fields and the image file
    const formData = new FormData();
    formData.append('name', this.equipmentForm.value.name);
    formData.append('description', this.equipmentForm.value.description || '');
    formData.append('category', this.equipmentForm.value.category || '');
    formData.append('quantity', this.equipmentForm.value.quantity.toString());
    formData.append('status', this.equipmentForm.value.status);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.isEditing && this.editingId !== null) {
      // Update existing equipment
      this.equipmentService.updateEquipment(this.editingId, formData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.isSubmitting = false;
          this.resetForm();
          this.loadEquipments();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error updating equipment.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create new equipment
      this.equipmentService.createEquipment(formData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.isSubmitting = false;
          this.resetForm();
          this.loadEquipments();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error creating equipment.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // --- Load all equipment from backend ---
  loadEquipments(): void {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.detectChanges();

    this.equipmentService.getAllEquipment().subscribe({
      next: (data) => {
        this.equipments = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadError = err.error?.message || 'Failed to load equipment.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- Get full image URL ---
  getImageUrl(imagePath: string | null): string {
    if (!imagePath) {
      return '';
    }
    return `${environment.apiUrl}${imagePath}`;
  }

  // --- Edit equipment ---
  editEquipment(equipment: Equipment): void {
    this.isEditing = true;
    this.editingId = equipment.id;

    this.equipmentForm.patchValue({
      name: equipment.name,
      description: equipment.description || '',
      category: equipment.category || '',
      quantity: equipment.quantity,
      status: equipment.status
    });

    // Show existing image as preview
    if (equipment.image) {
      this.imagePreview = this.getImageUrl(equipment.image);
    }

    this.cdr.detectChanges();
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Delete equipment ---
  deleteEquipment(id: number): void {
    if (confirm('Are you sure you want to delete this equipment?')) {
      this.equipmentService.deleteEquipment(id).subscribe({
        next: () => {
          this.equipments = this.equipments.filter(e => e.id !== id);
          this.successMessage = 'Equipment deleted successfully!';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error deleting equipment.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  // --- Cancel editing ---
  cancelEdit(): void {
    this.resetForm();
    this.cdr.detectChanges();
  }

  // --- Reset the form ---
  resetForm(): void {
    this.equipmentForm.reset({
      name: '',
      description: '',
      category: '',
      quantity: 1,
      status: 'available'
    });
    this.selectedFile = null;
    this.imagePreview = null;
    this.isEditing = false;
    this.editingId = null;
    this.cdr.detectChanges();
  }
}
