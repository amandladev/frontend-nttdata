import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { EncryptService } from '../services/encrypt.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let encryptServiceSpy: jasmine.SpyObj<EncryptService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    // Create spies for all the services
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    encryptServiceSpy = jasmine.createSpyObj('EncryptService', ['encryptPassword']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    localStorage.removeItem('token');

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: EncryptService, useValue: encryptServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty fields', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should mark form as invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email');
    
    // Empty email
    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.hasError('required')).toBeTruthy();
    
    // Invalid email format
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.hasError('email')).toBeTruthy();
    
    // Valid email
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password');
    
    // Empty password
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.hasError('required')).toBeTruthy();
    
    // Password too short
    passwordControl?.setValue('12345');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
    
    // Valid password
    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should not call login service if form is invalid', () => {
    // Form is invalid by default
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call login service with encrypted password on valid form submission', () => {
    // Set up form with valid values
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Set up encrypt service to return a specific value
    const encryptedPassword = 'encrypted_password';
    encryptServiceSpy.encryptPassword.and.returnValue(encryptedPassword);
    
    // Set up auth service to return a successful response
    authServiceSpy.login.and.returnValue(of({ token: 'fake-token' }));
    
    // Call the submit method
    component.onSubmit();
    
    // Verify encrypt service was called
    expect(encryptServiceSpy.encryptPassword).toHaveBeenCalledWith('password123');
    
    // Verify auth service was called with correct data
    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: encryptedPassword
    });
  });

  it('should handle successful login', () => {
    // Set up form with valid values
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Mock the encrypt service
    encryptServiceSpy.encryptPassword.and.returnValue('encrypted_password');
    
    // Mock successful login response
    const mockResponse = { token: 'fake-token' };
    authServiceSpy.login.and.returnValue(of(mockResponse));
    
    // Create spy for localStorage
    spyOn(localStorage, 'setItem');
    
    // Call the submit method
    component.onSubmit();
    
    // Verify token was stored in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
    
    // Verify success toast was shown
    expect(toastrServiceSpy.success).toHaveBeenCalledWith('Login successful', 'Success');
    
    // Verify navigation to users page
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('should handle login error', () => {
    // Set up form with valid values
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Mock the encrypt service
    encryptServiceSpy.encryptPassword.and.returnValue('encrypted_password');
    
    // Mock error response
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));
    
    // Call the submit method
    component.onSubmit();
    
    // Verify error toast was shown
    expect(toastrServiceSpy.error).toHaveBeenCalledWith('Invalid credentials', 'Login Failed');
    
    // Verify we did not navigate or set token
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeFalsy();
  });

  it('should navigate to register page when redirectToRegister is called', () => {
    component.redirectToRegister();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/register']);
  });
});