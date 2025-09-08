import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  serviceType?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  errors?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3001/api';
  private readonly requestTimeout = 30000; // 30 seconds

  constructor(private http: HttpClient) {}

  submitContactForm(formData: ContactFormData): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.apiUrl}/contact`, formData)
      .pipe(
        timeout(this.requestTimeout),
        catchError(this.handleError)
      );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'Network error. Please check your connection and try again.';
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Please check your form data and try again.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later or contact us directly.';
          break;
        case 0:
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
          break;
        default:
          errorMessage = error.error?.message || 'Something went wrong. Please try again.';
      }
    }

    console.error('Contact form error:', error);
    
    return throwError(() => ({
      success: false,
      message: errorMessage,
      originalError: error
    }));
  };
}