import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService, Admin } from '../../services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;
  let mockAdmin: Admin;

  beforeEach(async () => {
    // Create mock admin
    mockAdmin = {
      id: '123',
      username: 'testadmin',
      role: 'admin',
      email: 'admin@test.com'
    };

    // Create spy objects
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentAdmin$: of(mockAdmin)
    });

    const sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml']);
    sanitizerSpy.bypassSecurityTrustHtml.and.returnValue('<svg>mocked</svg>');

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DomSanitizer, useValue: sanitizerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with getting started section collapsed', () => {
      expect(component.showGettingStarted).toBe(false);
    });

    it('should load currentAdmin$ from AuthService on init', () => {
      fixture.detectChanges();
      component.currentAdmin$.subscribe(admin => {
        expect(admin).toEqual(mockAdmin);
      });
    });

    it('should have icons property defined', () => {
      expect(component.icons).toBeDefined();
    });
  });

  describe('Getting Started Toggle', () => {
    it('should toggle getting started section', () => {
      expect(component.showGettingStarted).toBe(false);
      component.toggleGettingStarted();
      expect(component.showGettingStarted).toBe(true);
      component.toggleGettingStarted();
      expect(component.showGettingStarted).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      for (let i = 0; i < 5; i++) {
        component.toggleGettingStarted();
        expect(component.showGettingStarted).toBe(i % 2 === 0);
      }
    });
  });

  describe('Navigation', () => {
    it('should navigate to blog management page', () => {
      const router = TestBed.inject(RouterTestingModule);
      spyOn(router, 'navigate');
      component.navigateTo('/admin/blog');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/blog']);
    });

    it('should navigate to settings page', () => {
      const router = TestBed.inject(RouterTestingModule);
      spyOn(router, 'navigate');
      component.navigateTo('/admin/settings');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/settings']);
    });

    it('should navigate to comments page', () => {
      const router = TestBed.inject(RouterTestingModule);
      spyOn(router, 'navigate');
      component.navigateTo('/admin/comments');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/comments']);
    });
  });

  describe('Logout Functionality', () => {
    it('should call authService.logout on logout', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should navigate to login page after logout', () => {
      const router = TestBed.inject(RouterTestingModule);
      spyOn(router, 'navigate');
      component.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/admin-login']);
    });
  });

  describe('Help Tab Functionality', () => {
    it('should set active help tab in session storage', () => {
      spyOn(sessionStorage, 'setItem');
      component.setActiveHelpTab();
      expect(sessionStorage.setItem).toHaveBeenCalledWith('activeAdminTab', 'help');
    });

    it('should retrieve help tab setting from session storage', () => {
      component.setActiveHelpTab();
      const value = sessionStorage.getItem('activeAdminTab');
      expect(value).toBe('help');
    });
  });

  describe('Icon Sanitization', () => {
    it('should sanitize icon HTML', () => {
      const result = component.getSafeIcon('book');
      expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
    });

    it('should handle icon requests properly', () => {
      component.getSafeIcon('book');
      expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(
        jasmine.anything()
      );
    });
  });

  describe('Observable Streams', () => {
    it('should provide currentAdmin$ observable', (done) => {
      fixture.detectChanges();
      component.currentAdmin$.subscribe(admin => {
        expect(admin).toEqual(mockAdmin);
        done();
      });
    });

    it('should emit null when no admin is logged in', (done) => {
      const emptyAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
        currentAdmin$: of(null)
      });
      TestBed.overrideProvider(AuthService, { useValue: emptyAuthService });
      
      const testFixture = TestBed.createComponent(AdminDashboardComponent);
      testFixture.componentInstance.ngOnInit();
      
      testFixture.componentInstance.currentAdmin$.subscribe(admin => {
        expect(admin).toBeNull();
        done();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should implement OnInit', () => {
      expect(component.ngOnInit).toBeDefined();
      expect(typeof component.ngOnInit).toBe('function');
    });

    it('should call ngOnInit without errors', () => {
      expect(() => {
        component.ngOnInit();
      }).not.toThrow();
    });
  });

  describe('User Information Display', () => {
    it('should display correct admin username', (done) => {
      fixture.detectChanges();
      component.currentAdmin$.subscribe(admin => {
        expect(admin?.username).toBe('testadmin');
        done();
      });
    });

    it('should display correct admin role', (done) => {
      fixture.detectChanges();
      component.currentAdmin$.subscribe(admin => {
        expect(admin?.role).toBe('admin');
        done();
      });
    });

    it('should display correct admin email', (done) => {
      fixture.detectChanges();
      component.currentAdmin$.subscribe(admin => {
        expect(admin?.email).toBe('admin@test.com');
        done();
      });
    });
  });
});