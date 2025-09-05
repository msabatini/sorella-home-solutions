import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  contactMethods: Array<{
    title: string;
    value: string;
    link: string | null;
    description: string;
    icon: SafeHtml;
  }> = [];

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      service: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.contactMethods = [
      {
        title: 'Phone',
        value: '(617) 555-0123',
        link: 'tel:+16175550123',
        description: 'Call us during business hours for immediate assistance',
        icon: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 100 100" fill="currentColor">
          <!-- Phone handset -->
          <path d="M25 20C25 15 30 10 35 10H45C50 10 55 15 55 20V30C55 35 50 40 45 40H35C30 40 25 35 25 30V20Z" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <path d="M25 60C25 55 30 50 35 50H45C50 50 55 55 55 60V70C55 75 50 80 45 80H35C30 80 25 75 25 70V60Z" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <!-- Connection curve -->
          <path d="M40 40C40 40 20 45 20 50C20 55 40 60 40 60" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <!-- Signal waves -->
          <path d="M65 35C65 30 70 25 75 25" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M70 40C70 35 75 30 80 30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M65 45C65 40 70 35 75 35" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`)
      },
      {
        title: 'Email',
        value: 'hello@sorellahomesolutions.com',
        link: 'mailto:hello@sorellahomesolutions.com',
        description: 'Send us a message anytime',
        icon: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 100 100" fill="currentColor">
          <!-- Envelope -->
          <rect x="15" y="25" width="70" height="50" rx="5" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <!-- Envelope flap -->
          <path d="M15 30L50 55L85 30" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Content lines -->
          <line x1="25" y1="45" x2="45" y2="45" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="25" y1="52" x2="55" y2="52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="25" y1="59" x2="40" y2="59" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <!-- @ symbol -->
          <circle cx="70" cy="45" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
          <circle cx="70" cy="45" r="3" fill="currentColor"/>
        </svg>`)
      },
      {
        title: 'Location',
        value: 'Greater Boston Area',
        link: null,
        description: 'Serving Massachusetts',
        icon: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 100 100" fill="currentColor">
          <!-- Location pin -->
          <path d="M50 15C35 15 25 25 25 40C25 60 50 85 50 85S75 60 75 40C75 25 65 15 50 15Z" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <!-- Inner circle -->
          <circle cx="50" cy="40" r="8" fill="none" stroke="currentColor" stroke-width="3"/>
          <!-- Service area indicators -->
          <circle cx="30" cy="70" r="3" fill="currentColor" opacity="0.6"/>
          <circle cx="70" cy="70" r="3" fill="currentColor" opacity="0.6"/>
          <circle cx="50" cy="75" r="2" fill="currentColor" opacity="0.4"/>
          <!-- Coverage lines -->
          <path d="M30 70C40 72 45 73 50 73C55 73 60 72 70 70" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        </svg>`)
      },
      {
        title: 'Business Hours',
        value: 'Mon - Fri: 8AM - 6PM',
        link: null,
        description: 'Weekend consultations available',
        icon: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 100 100" fill="currentColor">
          <!-- Clock face -->
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="3.5"/>
          <!-- Clock hands -->
          <line x1="50" y1="50" x2="50" y2="30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          <line x1="50" y1="50" x2="65" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Hour markers -->
          <circle cx="50" cy="25" r="2" fill="currentColor"/>
          <circle cx="75" cy="50" r="2" fill="currentColor"/>
          <circle cx="50" cy="75" r="2" fill="currentColor"/>
          <circle cx="25" cy="50" r="2" fill="currentColor"/>
          <!-- Center dot -->
          <circle cx="50" cy="50" r="3" fill="currentColor"/>
          <!-- 24/7 indicators -->
          <text x="50" y="15" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor">24/7</text>
        </svg>`)
      }
    ];
  }

  ngOnInit(): void {
    this.setupScrollHeader();
  }

  private setupScrollHeader() {
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      // Simulate form submission
      setTimeout(() => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.contactForm.reset();
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}