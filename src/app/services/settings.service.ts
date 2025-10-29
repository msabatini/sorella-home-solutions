import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  _id?: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt?: string;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
  smtpFrom: string;
  smtpSecure: boolean;
}

export interface Admin {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface GeneralSettings {
  siteName: string;
  siteEmail: string;
  sitePhone: string;
  siteDescription: string;
}

export interface Settings {
  _id?: string;
  siteName: string;
  siteEmail: string;
  sitePhone: string;
  siteDescription: string;
  categories: Category[];
  emailConfig: EmailConfig;
  updatedAt?: string;
  updatedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  // General Settings
  getSettings(): Observable<{ success: boolean; data: Settings }> {
    return this.http.get<{ success: boolean; data: Settings }>(`${this.apiUrl}`);
  }

  updateGeneralSettings(settings: GeneralSettings): Observable<{ success: boolean; message: string; data: Settings }> {
    return this.http.put<{ success: boolean; message: string; data: Settings }>(
      `${this.apiUrl}/general`,
      settings
    );
  }

  // Categories
  getCategories(): Observable<{ success: boolean; data: Category[] }> {
    return this.http.get<{ success: boolean; data: Category[] }>(`${this.apiUrl}/categories`);
  }

  addCategory(category: Category): Observable<{ success: boolean; message: string; data: Category[] }> {
    return this.http.post<{ success: boolean; message: string; data: Category[] }>(
      `${this.apiUrl}/categories`,
      category
    );
  }

  updateCategory(id: string, category: Category): Observable<{ success: boolean; message: string; data: Category[] }> {
    return this.http.put<{ success: boolean; message: string; data: Category[] }>(
      `${this.apiUrl}/categories/${id}`,
      category
    );
  }

  deleteCategory(id: string): Observable<{ success: boolean; message: string; data: Category[] }> {
    return this.http.delete<{ success: boolean; message: string; data: Category[] }>(
      `${this.apiUrl}/categories/${id}`
    );
  }

  // Admin Management
  getAdmins(): Observable<{ success: boolean; data: Admin[] }> {
    return this.http.get<{ success: boolean; data: Admin[] }>(`${this.apiUrl}/admins`);
  }

  createAdmin(admin: { username: string; password: string; email: string; role: string }): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/admins`,
      admin
    );
  }

  updateAdmin(id: string, admin: { email: string; role: string }): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.put<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/admins/${id}`,
      admin
    );
  }

  deleteAdmin(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/admins/${id}`
    );
  }

  // Email Configuration
  getEmailConfig(): Observable<{ success: boolean; data: EmailConfig }> {
    return this.http.get<{ success: boolean; data: EmailConfig }>(`${this.apiUrl}/email-config`);
  }

  updateEmailConfig(config: Partial<EmailConfig>): Observable<{ success: boolean; message: string; data: EmailConfig }> {
    return this.http.put<{ success: boolean; message: string; data: EmailConfig }>(
      `${this.apiUrl}/email-config`,
      config
    );
  }
}