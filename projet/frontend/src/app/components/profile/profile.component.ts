import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  editMode = false;
  loading = false;
  passwordLoading = false;

  successMessage = '';
  errorMessage = '';
  passwordSuccess = '';
  passwordError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.initProfileForm();
      },
      error: () => {
        // Fallback to locally stored user
        this.user = this.authService.getCurrentUser();
        if (this.user) {
          this.initProfileForm();
        }
      }
    });
  }

  private initProfileForm(): void {
    this.profileForm = this.fb.group({
      firstName: [this.user?.firstName || '', Validators.required],
      lastName: [this.user?.lastName || '', Validators.required],
      phone: [this.user?.phone || ''],
      department: [this.user?.department || '']
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    this.successMessage = '';
    this.errorMessage = '';
    if (!this.editMode) {
      this.initProfileForm(); // Reset form on cancel
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.editMode = false;
        this.loading = false;
        this.successMessage = 'Profile updated successfully!';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to update profile.';
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;

    if (newPassword !== confirmNewPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }

    this.passwordLoading = true;
    this.passwordSuccess = '';
    this.passwordError = '';

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password changed successfully!';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordLoading = false;
        this.passwordError = err.error?.message || 'Failed to change password.';
      }
    });
  }
}
