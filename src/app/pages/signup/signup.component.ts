import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSignup() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.http.post<any>('http://localhost:7071/api/Signup', {
      fullName: this.fullName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Signup failed. Try again.';
      }
    });
  }
}