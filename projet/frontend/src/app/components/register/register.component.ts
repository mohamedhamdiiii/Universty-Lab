import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  // Convenience getters for template validation
  get f() { return this.registerForm.controls; }

  get passwordMismatch(): boolean {
    return this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    // Mark all fields as touched to show validation messages
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      return;
    }

    if (this.passwordMismatch) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    const { confirmPassword, ...registerData } = this.registerForm.value;

    // Remove email if empty
    if (!registerData.email) {
      delete registerData.email;
    }

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
