import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.development';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://test-api.com';

  beforeEach(() => {
    const mockEnvironment = {
      apiUrl: apiUrl
    };

    (environment as any).apiUrl = mockEnvironment.apiUrl;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST request to correct URL with credentials', () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'encrypted_password'
      };

      const mockResponse = {
        token: 'fake-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com'
        }
      };

      // Make the call
      service.login(mockCredentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);

      req.flush(mockResponse);
    });

    it('should handle login error', () => {
        const mockCredentials = {
          email: 'test@example.com',
          password: 'wrong_password'
        };
      
        const mockError = {
          status: 401,
          statusText: 'Unauthorized', 
          error: {
            message: 'Invalid credentials'
          }
        };
      
        service.login(mockCredentials).subscribe({
          error: (error) => {
            expect(error.status).toBe(401);
            expect(error.error.message).toBe('Invalid credentials');
          }
        });
      
        const req = httpMock.expectOne(`${apiUrl}/login`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockCredentials);
      
        // Return error response
        req.flush(mockError.error, { 
          status: mockError.status,
          statusText: mockError.statusText
        });
      });

  });
});