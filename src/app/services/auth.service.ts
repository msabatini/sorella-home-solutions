import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: {
    id: string;
    username: string;
    role: string;
    email: string;
  };
}

export interface Admin {
  id: string;
  username: string;
  role: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'sorella_admin_token';
  private adminKey = 'sorella_admin_user';
  
  private currentAdminSubject = new BehaviorSubject<Admin | null>(this.getStoredAdmin());
  public currentAdmin$ = this.currentAdminSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Don't verify token in constructor - causes circular dependency with interceptor
    // Token verification happens lazily when needed or in components
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response.success) {
          this.setToken(response.token);
          this.setAdmin(response.admin);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.adminKey);
    this.currentAdminSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getCurrentAdmin(): Admin | null {
    return this.currentAdminSubject.value;
  }

  setAdmin(admin: Admin): void {
    localStorage.setItem(this.adminKey, JSON.stringify(admin));
    this.currentAdminSubject.next(admin);
  }

  updateCurrentAdmin(admin: Admin): void {
    this.setAdmin(admin);
  }

  private getStoredAdmin(): Admin | null {
    const stored = localStorage.getItem(this.adminKey);
    return stored ? JSON.parse(stored) : null;
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private verifyToken(): void {
    const token = this.getToken();
    if (token) {
      // Verify with backend
      this.http.get(`${this.apiUrl}/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.isAuthenticatedSubject.next(true);
        },
        error: () => {
          this.logout();
        }
      });
    }
  }
}