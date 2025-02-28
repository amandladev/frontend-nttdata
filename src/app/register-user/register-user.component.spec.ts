import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterUserComponent } from './register-user.component';
import { UserService } from './../services/user.service';
import { EncryptService } from './../services/encrypt.service';

describe('RegisterUserComponent', () => {
  let component: RegisterUserComponent;
  let fixture: ComponentFixture<RegisterUserComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let encryptServiceSpy: jasmine.SpyObj<EncryptService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spies for all the services
    userServiceSpy = jasmine.createSpyObj('UserService', ['register']);
    encryptServiceSpy = jasmine.createSpyObj('EncryptService', ['encryptPassword']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RegisterUserComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: EncryptService, useValue: encryptServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty fields', () => {
    expect(component.registrationForm.get('fullName')?.value).toBe('');
    expect(component.registrationForm.get('email')?.value).toBe('');
    expect(component.registrationForm.get('password')?.value).toBe('');
    expect(component.registrationForm.get('confirmPassword')?.value).toBe('');
    expect(component.registrationForm.get('phone')?.value).toBe('');
    expect(component.submitted).toBeFalse();
  });

  it('should mark form as invalid when empty', () => {
    expect(component.registrationForm.valid).toBeFalsy();
  });

  describe('Form Field Validation', () => {
    it('should validate fullName field', () => {
      const fullNameControl = component.registrationForm.get('fullName');
      
      // Empty fullName
      fullNameControl?.setValue('');
      expect(fullNameControl?.valid).toBeFalsy();
      expect(fullNameControl?.hasError('required')).toBeTruthy();
      
      // Too short
      fullNameControl?.setValue('A');
      expect(fullNameControl?.valid).toBeFalsy();
      expect(fullNameControl?.hasError('minlength')).toBeTruthy();
      
      // Too long
      const longName = 'A'.repeat(51);
      fullNameControl?.setValue(longName);
      expect(fullNameControl?.valid).toBeFalsy();
      expect(fullNameControl?.hasError('maxlength')).toBeTruthy();
      
      // Valid fullName
      fullNameControl?.setValue('John Doe');
      expect(fullNameControl?.valid).toBeTruthy();
    });

    it('should validate email field', () => {
      const emailControl = component.registrationForm.get('email');
      
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
      const passwordControl = component.registrationForm.get('password');
      
      // Empty password
      passwordControl?.setValue('');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('required')).toBeTruthy();
      
      // Too short
      passwordControl?.setValue('Aa1$');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('minlength')).toBeTruthy();
      
      // Missing uppercase
      passwordControl?.setValue('password1$');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('pattern')).toBeTruthy();
      
      // Missing lowercase
      passwordControl?.setValue('PASSWORD1$');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('pattern')).toBeTruthy();
      
      // Missing digit
      passwordControl?.setValue('Password$');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('pattern')).toBeTruthy();
      
      // Missing special character
      passwordControl?.setValue('Password1');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('pattern')).toBeTruthy();
      
      // Valid password
      passwordControl?.setValue('Password1$');
      expect(passwordControl?.valid).toBeTruthy();
    });

    it('should validate phone field', () => {
      const phoneControl = component.registrationForm.get('phone');
      
      // Empty phone
      phoneControl?.setValue('');
      expect(phoneControl?.valid).toBeFalsy();
      expect(phoneControl?.hasError('required')).toBeTruthy();
      
      // Too short
      phoneControl?.setValue('12345678');
      expect(phoneControl?.valid).toBeFalsy();
      expect(phoneControl?.hasError('pattern')).toBeTruthy();
      
      // Too long
      phoneControl?.setValue('1234567890123456');
      expect(phoneControl?.valid).toBeFalsy();
      expect(phoneControl?.hasError('pattern')).toBeTruthy();
      
      // Non-numeric
      phoneControl?.setValue('123456789a');
      expect(phoneControl?.valid).toBeFalsy();
      expect(phoneControl?.hasError('pattern')).toBeTruthy();
      
      // Valid phone (9 digits)
      phoneControl?.setValue('123456789');
      expect(phoneControl?.valid).toBeTruthy();
      
      // Valid phone (15 digits)
      phoneControl?.setValue('123456789012345');
      expect(phoneControl?.valid).toBeTruthy();
    });
  });

  describe('Password Match Validation', () => {
    it('should validate password matching', () => {
      const passwordControl = component.registrationForm.get('password');
      const confirmPasswordControl = component.registrationForm.get('confirmPassword');
      
      // Set valid password
      passwordControl?.setValue('Password1$');
      
      // Different confirm password
      confirmPasswordControl?.setValue('DifferentPassword1$');
      expect(component.registrationForm.hasError('passwordMismatch')).toBeTruthy();
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeTruthy();
      
      // Matching confirm password
      confirmPasswordControl?.setValue('Password1$');
      expect(component.registrationForm.hasError('passwordMismatch')).toBeFalsy();
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should not call register service if form is invalid', () => {
      // Form is invalid by default
      component.onSubmit();
      expect(component.submitted).toBeTrue();
      expect(userServiceSpy.register).not.toHaveBeenCalled();
    });

    it('should call register service with encrypted password on valid form submission', () => {
      // Set up form with valid values
      component.registrationForm.setValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1$',
        confirmPassword: 'Password1$',
        phone: '1234567890'
      });
      
      // Set up encrypt service to return a specific value
      const encryptedPassword = 'encrypted_password';
      encryptServiceSpy.encryptPassword.and.returnValue(encryptedPassword);
      
      // Set up user service to return a successful response
      userServiceSpy.register.and.returnValue(of({}));
      
      // Call the submit method
      component.onSubmit();
      
      // Verify submitted flag is set
      expect(component.submitted).toBeTrue();
      
      // Verify encrypt service was called
      expect(encryptServiceSpy.encryptPassword).toHaveBeenCalledWith('Password1$');
      
      // Verify user service was called with correct data
      expect(userServiceSpy.register).toHaveBeenCalledWith({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: encryptedPassword,
        phone: '1234567890'
      });
    });

    it('should handle registration error', () => {
      // Set up form with valid values
      component.registrationForm.setValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1$',
        confirmPassword: 'Password1$',
        phone: '1234567890'
      });
      
      // Mock the encrypt service
      encryptServiceSpy.encryptPassword.and.returnValue('encrypted_password');
      
      // Mock error response
      const errorResponse = { error: { message: 'Registration failed' } };
      userServiceSpy.register.and.returnValue(throwError(() => errorResponse));
      
      // Spy on console.error
      spyOn(console, 'error');
      
      // Call the submit method
      component.onSubmit();
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith('Registration failed', errorResponse);
    });
  });

  it('should navigate to login page when redirectToLogin is called', () => {
    component.redirectToLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});