import { Routes } from '@angular/router';

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
  { path: '**', redirectTo: '' }
];
