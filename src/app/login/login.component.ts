import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../services/auth.service'; 
import { EncryptService } from '../services/encrypt.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private encryptService: EncryptService,
    private router: Router,
    private toastr: ToastrService,
) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const loginData = {
      email: this.loginForm.value.email,
      password: this.encryptService.encryptPassword(this.loginForm.value.password),
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.toastr.success("Login successful", "Success")
          this.router.navigate(['/users']);
        }
      },
      error: ({ error }) => {
        this.toastr.error(error.message, "Login Failed")
      },
    });
  }

  redirectToRegister(): void {
    this.router.navigate(['/register']);
  }
}
