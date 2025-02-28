import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, UserRegistration } from './user.service';
import { environment } from '../../environments/environment.development';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://test-api.com';

  beforeEach(() => {
    (environment as any).apiUrl = apiUrl;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    const mockUserData: UserRegistration = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      phone: '1234567890'
    };

    it('should send POST request with correct data and headers', () => {
      const mockResponse = { id: 1, ...mockUserData };

      service.register(mockUserData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUserData);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.withCredentials).toBeFalse();

      req.flush(mockResponse);
    });

    it('should handle registration error', () => {
      const mockError = {
        status: 400,
        statusText: 'Bad Request',
        error: {
          message: 'Email already exists'
        }
      };

      service.register(mockUserData).subscribe({
        error: error => {
          expect(error.error.message).toBe('Email already exists');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      req.flush(mockError.error, mockError);
    });
  });

  describe('getUsers', () => {
    const mockToken = 'fake-jwt-token';
    const mockUsers = [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' }
    ];
    const mockResponse = {
      data: mockUsers,
      total: 10,
      page: 1,
      pageSize: 10
    };

    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue(mockToken);
    });

    it('should send GET request with correct headers and default pagination', () => {
      service.getUsers().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/list?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

      req.flush(mockResponse);
    });

    it('should send GET request with custom pagination', () => {
      const page = 2;
      const pageSize = 20;

      service.getUsers(page, pageSize).subscribe(response => {
        expect(response).toEqual({ ...mockResponse, page, pageSize });
      });

      const req = httpMock.expectOne(`${apiUrl}/list?page=2&pageSize=20`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

      req.flush({ ...mockResponse, page, pageSize });
    });

    it('should handle error response', () => {
      const mockError = {
        status: 401,
        statusText: 'Unauthorized',
        error: {
          message: 'Invalid token'
        }
      };

      service.getUsers().subscribe({
        error: error => {
          expect(error.error.message).toBe('Invalid token');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/list?page=1&pageSize=10`);
      req.flush(mockError.error, mockError);
    });
  });
});