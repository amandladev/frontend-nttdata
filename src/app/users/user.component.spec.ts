import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { UsersComponent } from './users.component';
import { UserService } from '../services/user.service';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  const mockUsers = [
    { id: 1, fullName: 'User 1', phone: "194441234" },
    { id: 2, fullName: 'User 2', phone: "194441235" },
  ];

  const mockResponse = {
    data: mockUsers,
    total: 20,
    page: 1,
    pageSize: 10
  };

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['error']);

    await TestBed.configureTestingModule({
      declarations: [UsersComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should redirect to login if no token exists', () => {
      // Setup localStorage to return null for token
      spyOn(localStorage, 'getItem').and.returnValue(null);

      // Initialize component
      fixture.detectChanges();

      // Verify navigation to login
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      // Verify users were not fetched
      expect(userServiceSpy.getUsers).not.toHaveBeenCalled();
    });

    it('should fetch users if token exists', () => {
      // Setup localStorage to return a token
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      // Setup userService to return mock data
      userServiceSpy.getUsers.and.returnValue(of(mockResponse));

      // Initialize component
      fixture.detectChanges();

      // Verify users were fetched
      expect(userServiceSpy.getUsers).toHaveBeenCalledWith(1, 10);
      // Verify data was stored
      expect(component.users).toEqual(mockUsers);
      expect(component.totalUsers).toBe(20);
    });
  });

  describe('fetchUsers', () => {
    beforeEach(() => {
      // Setup localStorage to return a token
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    });

    it('should update users and total when API call is successful', () => {
      // Setup successful response
      userServiceSpy.getUsers.and.returnValue(of(mockResponse));

      // Call fetchUsers
      component.fetchUsers();

      // Verify data was updated
      expect(component.users).toEqual(mockUsers);
      expect(component.totalUsers).toBe(20);
      // Verify no error toast was shown
      expect(toastrServiceSpy.error).not.toHaveBeenCalled();
    });

    it('should show error toast when API response is invalid', () => {
      // Setup invalid response
      userServiceSpy.getUsers.and.returnValue(of(null as any));

      // Call fetchUsers
      component.fetchUsers();

      // Verify error toast was shown
      expect(toastrServiceSpy.error).toHaveBeenCalledWith(
        'Unable to connect to the server',
        'Connection Error'
      );
      // Verify data was not updated
      expect(component.users).toEqual([]);
      expect(component.totalUsers).toBe(0);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      // Setup localStorage to return a token
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      // Setup successful response
      userServiceSpy.getUsers.and.returnValue(of(mockResponse));
    });

    it('should update page and fetch users when changePage is called', () => {
      // Call changePage with new page number
      component.changePage(2);

      // Verify page was updated
      expect(component.page).toBe(2);
      // Verify users were fetched with new page number
      expect(userServiceSpy.getUsers).toHaveBeenCalledWith(2, 10);
    });

    it('should maintain pageSize when changing pages', () => {
      // Set a custom page size
      component.pageSize = 20;

      // Change page
      component.changePage(2);

      // Verify users were fetched with correct page size
      expect(userServiceSpy.getUsers).toHaveBeenCalledWith(2, 20);
    });
  });

  describe('Logout', () => {
    it('should clear token and redirect to login', () => {
      // Setup localStorage spy
      spyOn(localStorage, 'removeItem');
      
      // Call logout
      component.logout();

      // Verify token was removed
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      // Verify navigation to login
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});