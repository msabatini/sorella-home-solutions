import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, Admin, LoginResponse } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty token', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should initialize with no admin', () => {
      expect(service.getCurrentAdmin()).toBeNull();
    });

    it('should initialize with unauthenticated state', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('Login Functionality', () => {
    it('should successfully login with valid credentials', (done) => {
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin',
          email: 'admin@test.com'
        }
      };

      service.login('testadmin', 'password123').subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.token).toBe('mock-jwt-token');
        expect(service.getToken()).toBe('mock-jwt-token');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should store token in localStorage after successful login', (done) => {
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin',
          email: 'admin@test.com'
        }
      };

      service.login('testadmin', 'password123').subscribe(() => {
        const storedToken = localStorage.getItem('sorella_admin_token');
        expect(storedToken).toBe('mock-jwt-token');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);
    });

    it('should store admin data in localStorage after successful login', (done) => {
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin',
          email: 'admin@test.com'
        }
      };

      service.login('testadmin', 'password123').subscribe(() => {
        const storedAdmin = localStorage.getItem('sorella_admin_user');
        const admin = JSON.parse(storedAdmin!);
        expect(admin.username).toBe('testadmin');
        expect(admin.role).toBe('admin');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);
    });

    it('should update authentication state on successful login', (done) => {
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin',
          email: 'admin@test.com'
        }
      };

      service.login('testadmin', 'password123').subscribe(() => {
        expect(service.isAuthenticated()).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);
    });

    it('should emit currentAdmin$ observable after login', (done) => {
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin',
          email: 'admin@test.com'
        }
      };

      service.currentAdmin$.subscribe(admin => {
        if (admin) {
          expect(admin.username).toBe('testadmin');
          done();
        }
      });

      service.login('testadmin', 'password123').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);
    });

    it('should handle failed login', (done) => {
      const mockError = {
        success: false,
        message: 'Invalid credentials'
      };

      service.login('testadmin', 'wrongpassword').subscribe(
        () => fail('should have failed'),
        error => {
          expect(error).toBeDefined();
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockError, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Logout Functionality', () => {
    it('should clear token on logout', (done) => {
      // First login
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin',
          email: 'admin@test.com'
        }
      };

      service.login('testadmin', 'password123').subscribe(() => {
        expect(service.getToken()).toBe('mock-jwt-token');

        // Then logout
        service.logout();
        expect(service.getToken()).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);
    });

    it('should clear admin data on logout', (done) => {
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin',
          email: 'admin@test.com'
        }
      };

      service.login('testadmin', 'password123').subscribe(() => {
        expect(service.getCurrentAdmin()).toBeTruthy();

        service.logout();
        expect(service.getCurrentAdmin()).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);
    });

    it('should update authentication state on logout', (done) => {
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin',
          email: 'admin@test.com'
        }
      };

      service.login('testadmin', 'password123').subscribe(() => {
        expect(service.isAuthenticated()).toBeTrue();

        service.logout();
        expect(service.isAuthenticated()).toBeFalse();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);
    });

    it('should emit null currentAdmin$ on logout', (done) => {
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin',
          email: 'admin@test.com'
        }
      };

      let emissionCount = 0;
      service.currentAdmin$.subscribe(admin => {
        emissionCount++;
        if (emissionCount === 2) { // First is null, second is the admin
          // Now test logout
          service.logout();
        } else if (emissionCount === 3) { // Third is null after logout
          expect(admin).toBeNull();
          done();
        }
      });

      service.login('testadmin', 'password123').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);
    });
  });

  describe('Token Management', () => {
    it('should get token from localStorage', () => {
      localStorage.setItem('sorella_admin_token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should set token in localStorage', () => {
      service.setToken('new-token');
      expect(localStorage.getItem('sorella_admin_token')).toBe('new-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('Admin Management', () => {
    it('should get current admin', () => {
      const admin: Admin = {
        id: '123',
        username: 'testadmin',
        role: 'admin',
        email: 'admin@test.com'
      };

      service.setAdmin(admin);
      expect(service.getCurrentAdmin()).toEqual(admin);
    });

    it('should set admin in localStorage and observable', () => {
      const admin: Admin = {
        id: '123',
        username: 'testadmin',
        role: 'admin',
        email: 'admin@test.com'
      };

      service.setAdmin(admin);
      const stored = JSON.parse(localStorage.getItem('sorella_admin_user')!);
      expect(stored).toEqual(admin);
    });

    it('should update current admin', () => {
      const admin1: Admin = {
        id: '123',
        username: 'admin1',
        role: 'admin',
        email: 'admin1@test.com'
      };

      const admin2: Admin = {
        id: '123',
        username: 'admin2',
        role: 'editor',
        email: 'admin2@test.com'
      };

      service.setAdmin(admin1);
      expect(service.getCurrentAdmin()?.username).toBe('admin1');

      service.updateCurrentAdmin(admin2);
      expect(service.getCurrentAdmin()?.username).toBe('admin2');
    });
  });

  describe('Token Verification', () => {
    it('should verify token with backend', () => {
      const mockResponse = {
        success: true,
        message: 'Token is valid',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin'
        }
      };

      service.setToken('mock-token');
      service['verifyToken']();

      const req = httpMock.expectOne(`${apiUrl}/verify`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      req.flush(mockResponse);
    });

    it('should handle token verification failure', () => {
      service.setToken('invalid-token');
      spyOn(service, 'logout');

      service['verifyToken']();

      const req = httpMock.expectOne(`${apiUrl}/verify`);
      req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(service.logout).toHaveBeenCalled();
    });
  });

  describe('Authentication State', () => {
    it('should correctly report authentication status', () => {
      expect(service.isAuthenticated()).toBeFalse();

      service.setToken('test-token');
      expect(service.isAuthenticated()).toBeFalse(); // Still false because subject wasn't updated

      // Set via authenticated stream
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        admin: {
          id: '123',
          username: 'testadmin',
          role: 'admin',
          email: 'admin@test.com'
        }
      };

      service.login('testadmin', 'password123').subscribe();
      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);

      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('Observable Streams', () => {
    it('should provide currentAdmin$ observable', (done) => {
      const admin: Admin = {
        id: '123',
        username: 'testadmin',
        role: 'admin',
        email: 'admin@test.com'
      };

      service.setAdmin(admin);
      service.currentAdmin$.subscribe(value => {
        expect(value).toEqual(admin);
        done();
      });
    });

    it('should provide isAuthenticated$ observable', (done) => {
      service.isAuthenticated$.subscribe(isAuth => {
        expect(typeof isAuth).toBe('boolean');
        done();
      });
    });
  });
});