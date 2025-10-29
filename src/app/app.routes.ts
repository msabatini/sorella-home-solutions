import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  { 
    path: 'services', 
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent)
  },
  { 
    path: 'press', 
    loadComponent: () => import('./pages/press/press.component').then(m => m.PressComponent)
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  { 
    path: 'legal', 
    loadComponent: () => import('./pages/legal/legal.component').then(m => m.LegalComponent)
  },
  { 
    path: 'blog', 
    loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent)
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin/blog/:id',
    loadComponent: () => import('./pages/admin-blog-form/admin-blog-form.component').then(m => m.AdminBlogFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/blog',
    loadComponent: () => import('./pages/admin-blog-management/admin-blog-management.component').then(m => m.AdminBlogManagementComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/comments',
    loadComponent: () => import('./pages/admin-comments-management/admin-comments-management.component').then(m => m.AdminCommentsManagementComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/settings',
    loadComponent: () => import('./pages/admin-settings/admin-settings.component').then(m => m.AdminSettingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];
