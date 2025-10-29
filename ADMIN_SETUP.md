# Admin Login System Setup Guide

## Overview

The Sorella Home Solutions website now includes a complete admin authentication system with JWT-based security. This allows admins to securely access the admin dashboard and manage blog content.

## Features

- **Secure Login**: JWT token-based authentication
- **Session Management**: Automatic token verification and refresh
- **Protected Routes**: Admin dashboard protected with auth guard
- **HTTP Interceptor**: Automatic token injection in authenticated requests
- **Local Storage**: Secure token and user data persistence

## First-Time Setup

### 1. Initialize Admin User

Before you can log in, you need to create an admin user in the database.

```bash
cd server
npm run init-admin
```

This creates a default admin account with:
- **Username**: `admin`
- **Password**: `sorella123`
- **Email**: `admin@sorellahomesolutions.com`
- **Role**: `admin`

> ⚠️ **Important**: Change the default credentials in production! Set environment variables:
> ```
> ADMIN_USERNAME=your_username
> ADMIN_PASSWORD=your_strong_password
> ```

### 2. Start Backend Server

```bash
cd server
npm start
```

The server should output:
```
🚀 Sorella Contact API running on port 3002
✅ MongoDB connected successfully
```

### 3. Start Frontend Application

In a new terminal:

```bash
npm start
```

Navigate to `http://localhost:4201`

## Accessing the Admin Panel

### Login Page

1. Navigate to **`http://localhost:4201/admin-login`**
2. Enter your credentials:
   - Username: `admin` (or your configured username)
   - Password: `sorella123` (or your configured password)
3. Click **Sign In**

### Admin Dashboard

After successful login, you'll be redirected to **`http://localhost:4201/admin`**

The dashboard includes:
- Welcome message with your username and role
- Quick access cards for:
  - Blog Management
  - Comments Moderation
  - System Settings
- Logout button in the header

## Architecture

### Frontend Components

#### **AdminLoginComponent** (`src/app/pages/admin-login/`)
- Reactive form validation
- Error handling and display
- Automatic redirect if already authenticated
- Loading state management

#### **AdminDashboardComponent** (`src/app/pages/admin-dashboard/`)
- Protected route with AuthGuard
- Displays current user information
- Logout functionality
- Feature cards (expandable for future features)

#### **AuthGuard** (`src/app/guards/auth.guard.ts`)
- Protects admin routes
- Automatically redirects to login if not authenticated
- Stores return URL for post-login redirect

#### **AuthInterceptor** (`src/app/interceptors/auth.interceptor.ts`)
- Automatically adds JWT token to all HTTP requests
- Ensures protected API endpoints receive proper authorization

### Backend Authentication

#### **JWT Endpoints** (`server/routes/auth.js`)

**POST `/api/auth/login`**
```javascript
Request:
{
  "username": "admin",
  "password": "sorella123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "admin": {
    "id": "507f1f77...",
    "username": "admin",
    "role": "admin",
    "email": "admin@example.com"
  }
}
```

**GET `/api/auth/verify`**
- Verifies JWT token validity
- Requires `Authorization: Bearer <token>` header
- Returns current admin info if valid

**POST `/api/auth/register`**
- Creates additional admin accounts
- Requires valid credentials
- Validates duplicate usernames/emails

#### **Authentication Middleware** (`server/middleware/auth.js`)
- Validates JWT tokens on protected routes
- Extracts admin information from token
- Rejects invalid or expired tokens

#### **Admin Model** (`server/models/Admin.js`)
- Stores admin user data
- Implements password hashing (bcryptjs)
- Provides password comparison method

## Environment Variables

Create or update `.env` in the server directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/sorella-home-solutions

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d

# Admin (for init-admin script)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sorella123

# Server
PORT=3002
NODE_ENV=development
```

## Security Considerations

### ✅ Implemented

- **Password Hashing**: Passwords are hashed with bcryptjs before storage
- **JWT Signing**: Tokens signed with secret key (set in environment)
- **Token Expiration**: Tokens expire after configurable period (default: 7 days)
- **HTTP Interceptor**: Automatic token injection in requests
- **Route Guards**: Protected routes require valid authentication
- **Token Validation**: Backend verifies token on sensitive operations

### 🔒 Production Recommendations

1. **Change JWT Secret**: Set unique secret in production
2. **HTTPS Only**: Always use HTTPS in production
3. **Secure Cookies**: Consider using httpOnly cookies instead of localStorage
4. **Rate Limiting**: Implement login attempt rate limiting
5. **Strong Passwords**: Enforce strong password requirements
6. **Token Refresh**: Implement token refresh mechanism for long sessions
7. **Audit Logging**: Log all admin actions
8. **2FA**: Consider adding two-factor authentication

## Usage Examples

### Login with Credentials

```typescript
this.authService.login('admin', 'sorella123').subscribe({
  next: (response) => {
    console.log('Login successful');
    console.log(response.admin);
  },
  error: (error) => {
    console.error('Login failed:', error.message);
  }
});
```

### Check Authentication Status

```typescript
// Get current status
if (this.authService.isAuthenticated()) {
  console.log('User is logged in');
}

// Subscribe to changes
this.authService.isAuthenticated$.subscribe(isAuth => {
  console.log('Auth status:', isAuth);
});

// Get current admin
const admin = this.authService.getCurrentAdmin();
console.log('Logged in as:', admin?.username);
```

### Protected API Requests

All requests made through HttpClient automatically include the JWT token:

```typescript
// Token is automatically added by AuthInterceptor
this.http.get('/api/blog').subscribe(data => {
  console.log(data);
});

// Equivalent to:
// Headers: { Authorization: 'Bearer <token>' }
```

### Logout

```typescript
this.authService.logout();
// Clears token and user data from localStorage
// Redirects to login page (handled by component)
```

## Testing

### 1. Test Login

1. Go to `http://localhost:4201/admin-login`
2. Enter credentials: `admin` / `sorella123`
3. Should redirect to `/admin` dashboard

### 2. Test Session Persistence

1. Log in successfully
2. Refresh the page (Cmd+R or Ctrl+R)
3. Should remain logged in and show dashboard

### 4. Test Token Verification

1. Open browser DevTools → Application → Local Storage
2. Check `sorella_admin_token` contains valid JWT
3. Navigate to protected routes directly in address bar
4. Should load dashboard without re-login

### 5. Test Logout

1. Click "Logout" button
2. Should redirect to `/admin-login`
3. Check localStorage - token should be cleared
4. Try accessing `/admin` directly - should redirect to login

### 6. Test Auth Guard

1. Without logging in, try to access `http://localhost:4201/admin`
2. Should automatically redirect to `/admin-login`

## Troubleshooting

### Issue: "Invalid credentials" error

**Solution**: 
- Verify you ran `npm run init-admin` first
- Check MongoDB is running: `mongod`
- Verify credentials match what you set in environment variables

### Issue: Token not being sent with requests

**Solution**:
- Check that AuthInterceptor is registered in `app.config.ts`
- Verify token exists in localStorage under key `sorella_admin_token`
- Check network tab in DevTools - Authorization header should be present

### Issue: Stuck on login page after entering credentials

**Solution**:
- Check browser console for errors
- Verify backend server is running on port 3002
- Check CORS is configured correctly on backend
- Verify JWT_SECRET environment variable is set

### Issue: "Cannot read property 'authService' of undefined"

**Solution**:
- This was fixed in the dashboard component
- Ensure you're using the latest version of admin-dashboard.component.ts
- Services should be injected in constructor, not accessed in class properties

## Next Steps

The admin login system is ready. The next features to implement are:

1. **Blog Management Dashboard**
   - Create blog post form
   - Edit existing posts
   - Delete posts
   - Upload featured images

2. **Comments Management**
   - View comments on posts
   - Approve/reject comments
   - Delete inappropriate comments
   - Reply to comments

3. **Admin Settings**
   - Manage admin accounts
   - View activity logs
   - Configure system settings

## API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/login` | No | User login |
| POST | `/api/auth/register` | No | Create admin account |
| GET | `/api/auth/verify` | Yes | Verify token |
| GET | `/api/blog` | No | Get all blog posts |
| POST | `/api/blog` | Yes | Create blog post |
| GET | `/api/blog/:id` | No | Get single blog post |
| PUT | `/api/blog/:id` | Yes | Update blog post |
| DELETE | `/api/blog/:id` | Yes | Delete blog post |

## Support

For issues or questions about the admin system:
1. Check this documentation first
2. Review console errors in browser DevTools
3. Check server logs for backend errors
4. Verify all environment variables are set correctly