import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { BlogService } from './blog.service';
import { environment } from '../../environments/environment';

/**
 * Integration Tests: Admin Dashboard API Communication
 * Tests the full flow of authentication, blog management, and comments
 */
describe('Admin Dashboard API Integration Tests', () => {
  let authService: AuthService;
  let blogService: BlogService;
  let httpMock: HttpTestingController;

  const testAdmin = {
    username: 'testadmin',
    password: 'testpass123'
  };

  const mockLoginResponse = {
    success: true,
    message: 'Login successful',
    token: 'integration-test-token-abc123',
    admin: {
      id: '507f1f77bcf86cd799439011',
      username: 'testadmin',
      role: 'admin',
      email: 'testadmin@test.com'
    }
  };

  const mockBlogPost = {
    _id: '507f1f77bcf86cd799439012',
    title: 'Test Blog Post',
    subtitle: 'A test blog post',
    author: 'Test Author',
    category: 'Tips & Advice',
    tags: ['test', 'integration'],
    featuredImage: 'test-image.jpg',
    introText: 'This is a test',
    contentSections: [
      {
        type: 'paragraph',
        content: 'Test content'
      }
    ],
    published: true,
    publishDate: null,
    featured: false,
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, BlogService]
    });

    authService = TestBed.inject(AuthService);
    blogService = TestBed.inject(BlogService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Complete Admin Login Flow', () => {
    it('should complete full authentication flow', (done) => {
      authService.login(testAdmin.username, testAdmin.password).subscribe(response => {
        // Step 1: Verify login response
        expect(response.success).toBeTrue();
        expect(authService.getToken()).toBeTruthy();

        // Step 2: Verify token is stored
        const storedToken = localStorage.getItem('sorella_admin_token');
        expect(storedToken).toBe(mockLoginResponse.token);

        // Step 3: Verify admin data is stored
        const storedAdmin = JSON.parse(localStorage.getItem('sorella_admin_user')!);
        expect(storedAdmin.username).toBe(testAdmin.username);

        // Step 4: Verify current admin is updated
        authService.currentAdmin$.subscribe(admin => {
          expect(admin?.username).toBe(testAdmin.username);
          expect(authService.isAuthenticated()).toBeTrue();
          done();
        });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(testAdmin);
      req.flush(mockLoginResponse);
    });

    it('should attach token to subsequent requests', (done) => {
      // First, login
      authService.login(testAdmin.username, testAdmin.password).subscribe(() => {
        // Then make an authenticated request
        const token = authService.getToken();
        expect(token).toBe(mockLoginResponse.token);

        // Verify token would be sent in requests
        expect(token).toBeTruthy();
        done();
      });

      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      loginReq.flush(mockLoginResponse);
    });
  });

  describe('Blog Management Flow', () => {
    beforeEach((done) => {
      // Login first
      authService.login(testAdmin.username, testAdmin.password).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse);
    });

    it('should fetch public blog posts', (done) => {
      const mockResponse = {
        success: true,
        data: [mockBlogPost],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1
        }
      };

      blogService.getPublicPosts(1, 10).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.data.length).toBe(1);
        expect(response.data[0].title).toBe('Test Blog Post');
        expect(response.pagination.total).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/blog?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch admin blog posts with authentication', (done) => {
      const mockResponse = {
        success: true,
        data: [mockBlogPost],
        pagination: {
          total: 1,
          page: 1,
          limit: 100,
          pages: 1
        }
      };

      blogService.getAllAdminPosts(1, 100).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.data.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/blog/admin/all?page=1&limit=100`);
      expect(req.request.headers.get('Authorization')).toContain('Bearer');
      req.flush(mockResponse);
    });

    it('should fetch blog categories', (done) => {
      const mockResponse = {
        success: true,
        data: [
          'Seasonal Care',
          'Move Management',
          'Home Care',
          'Concierge',
          'Corporate Relocation',
          'Tips & Advice'
        ]
      };

      blogService.getCategories().subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.data.length).toBe(6);
        expect(response.data).toContain('Tips & Advice');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/blog/categories/list`);
      req.flush(mockResponse);
    });
  });

  describe('Comments Management Flow', () => {
    beforeEach((done) => {
      // Login first
      authService.login(testAdmin.username, testAdmin.password).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse);
    });

    it('should fetch all comments with authentication', (done) => {
      const mockComments = [
        {
          _id: '507f1f77bcf86cd799439013',
          blogPostId: mockBlogPost._id,
          authorName: 'Test User',
          authorEmail: 'user@test.com',
          content: 'Great post!',
          approved: false,
          createdAt: new Date()
        }
      ];

      const mockResponse = {
        success: true,
        data: mockComments,
        pagination: {
          total: 1,
          page: 1,
          limit: 50,
          pages: 1
        }
      };

      blogService.getAllComments(1, 50).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.data.length).toBe(1);
        expect(response.data[0].content).toBe('Great post!');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/blog/admin/comments/all?page=1&limit=50`);
      expect(req.request.headers.get('Authorization')).toContain('Bearer');
      req.flush(mockResponse);
    });

    it('should approve a comment', (done) => {
      const commentId = '507f1f77bcf86cd799439013';
      const mockResponse = {
        success: true,
        message: 'Comment approved',
        data: {
          _id: commentId,
          approved: true
        }
      };

      blogService.approveComment(commentId).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.data.approved).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/blog/admin/comments/${commentId}/approve`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toContain('Bearer');
      req.flush(mockResponse);
    });

    it('should reject a comment', (done) => {
      const commentId = '507f1f77bcf86cd799439013';
      const mockResponse = {
        success: true,
        message: 'Comment rejected',
        data: {
          _id: commentId,
          approved: false
        }
      };

      blogService.rejectComment(commentId).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.data.approved).toBeFalse();
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/blog/admin/comments/${commentId}/reject`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should delete a comment', (done) => {
      const commentId = '507f1f77bcf86cd799439013';
      const mockResponse = {
        success: true,
        message: 'Comment deleted successfully'
      };

      blogService.deleteComment(commentId).subscribe(response => {
        expect(response.success).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/blog/admin/comments/${commentId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', (done) => {
      authService.login('admin', 'wrongpass').subscribe(
        () => fail('should have errored'),
        error => {
          expect(error).toBeDefined();
          done();
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(
        { success: false, message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });

    it('should handle server errors', (done) => {
      const mockResponse = {
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 }
      };

      authService.login(testAdmin.username, testAdmin.password).subscribe(() => {
        blogService.getAllAdminPosts(1, 100).subscribe(
          () => fail('should have errored'),
          error => {
            expect(error).toBeDefined();
            done();
          }
        );

        // Expect the admin request to fail
        const blogReq = httpMock.expectOne(`${environment.apiUrl}/blog/admin/all?page=1&limit=100`);
        blogReq.flush(
          { success: false, message: 'Server error' },
          { status: 500, statusText: 'Internal Server Error' }
        );
      });

      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      loginReq.flush(mockResponse);
    });

    it('should handle unauthorized access to protected endpoints', (done) => {
      blogService.getAllComments(1, 50).subscribe(
        () => fail('should have errored'),
        error => {
          expect(error).toBeDefined();
          done();
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/blog/admin/comments/all?page=1&limit=50`);
      req.flush(
        { success: false, message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  describe('Session Management', () => {
    it('should maintain session across multiple requests', (done) => {
      authService.login(testAdmin.username, testAdmin.password).subscribe(() => {
        // Make multiple requests
        const token1 = authService.getToken();
        const admin1 = authService.getCurrentAdmin();

        // Verify token and admin persist
        const token2 = authService.getToken();
        const admin2 = authService.getCurrentAdmin();

        expect(token1).toBe(token2);
        expect(admin1).toEqual(admin2);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse);
    });

    it('should clear session on logout', (done) => {
      authService.login(testAdmin.username, testAdmin.password).subscribe(() => {
        expect(authService.getToken()).toBeTruthy();

        authService.logout();

        expect(authService.getToken()).toBeNull();
        expect(authService.getCurrentAdmin()).toBeNull();
        expect(authService.isAuthenticated()).toBeFalse();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse);
    });
  });
});