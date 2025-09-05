import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { AnimationService } from '../../services/animation.service';
import { ServiceIcons } from '../../../assets/icons/service-icons';

@Component({
  selector: 'app-contact-complex',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {
  
  contactForm: FormGroup;
  isSubmitting = false;
  formSubmitted = false;
  submitError = false;
  
  // Icon properties for contact info
  phoneIcon: SafeHtml = {} as any;
  emailIcon: SafeHtml = {} as any;
  locationIcon: SafeHtml = {} as any;

  contactMethods: Array<{
    icon: SafeHtml;
    title: string;
    value: string;
    description: string;
    link: string | null;
  }> = [];

  constructor(
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private animationService: AnimationService
  ) {
    this.contactForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      serviceType: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Initialize icons
    this.phoneIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.phone);
    this.emailIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.email);
    this.locationIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.location);
  }

  ngOnInit() {
    this.setupScrollHeader();
    this.initializeContactMethods();
    this.animationService.initScrollAnimations();
    this.animationService.triggerPageLoadAnimations();
  }

  ngOnDestroy() {
    this.animationService.destroy();
  }

  private initializeContactMethods() {
    this.contactMethods = [
      {
        icon: this.getPhoneIcon(),
        title: 'Phone',
        value: '(617) 555-0123',
        description: 'Call us during business hours',
        link: 'tel:+16175550123'
      },
      {
        icon: this.getEmailIcon(),
        title: 'Email',
        value: 'hello@sorellahomesolutions.com',
        description: 'Send us a message anytime',
        link: 'mailto:hello@sorellahomesolutions.com'
      },
      {
        icon: this.getLocationIcon(),
        title: 'Location',
        value: 'Greater Boston Area',
        description: 'Serving Massachusetts',
        link: null
      },
      {
        icon: this.getClockIcon(),
        title: 'Business Hours',
        value: 'Mon - Fri: 8AM - 6PM',
        description: 'Weekend consultations available',
        link: null
      }
    ];
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

  submitForm() {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitError = false;
      
      // Simulate form submission
      setTimeout(() => {
        this.isSubmitting = false;
        this.formSubmitted = true;
        this.contactForm.reset();
        
        // Hide success message after 8 seconds
        setTimeout(() => {
          this.formSubmitted = false;
        }, 8000);
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  onSubmit() {
    this.submitForm();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} is too short`;
      if (field.errors['pattern']) return 'Please enter a valid phone number';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone number',
      serviceType: 'Service type',
      message: 'Message'
    };
    return displayNames[fieldName] || fieldName;
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} is too short`;
      if (field.errors['pattern']) return 'Please enter a valid phone number';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone number',
      serviceType: 'Service type',
      propertyType: 'Property type',
      message: 'Message',
      preferredContact: 'Preferred contact method',
      timeline: 'Timeline'
    };
    return labels[fieldName] || fieldName;
  }

  private getPhoneIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Premium Phone Icon -->
        <defs>
          <linearGradient id="phoneGradContact1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(0, 162, 255, 0.2)" />
            <stop offset="100%" style="stop-color:rgba(0, 162, 255, 0.05)" />
          </linearGradient>
        </defs>
        <!-- Main phone body -->
        <rect x="26" y="16" width="28" height="48" rx="6" stroke="currentColor" stroke-width="2.5" fill="url(#phoneGradContact1)"/>
        <!-- Screen -->
        <rect x="30" y="22" width="20" height="30" rx="2" stroke="currentColor" stroke-width="1.5" fill="rgba(255, 255, 255, 0.1)"/>
        <!-- Home button -->
        <circle cx="40" cy="58" r="2.5" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 162, 255, 0.3)"/>
        <!-- Signal waves -->
        <path d="M58 28C58 22 53 18 47 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
        <path d="M62 24C62 16 56 10 48 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        <path d="M66 20C66 10 58 4 50 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
        <!-- Care elements -->
        <circle cx="18" cy="35" r="2" fill="currentColor" opacity="0.4"/>
        <circle cx="62" cy="45" r="2" fill="currentColor" opacity="0.4"/>
      </svg>
    `);
  }

  private getEmailIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Premium Email Icon -->
        <defs>
          <linearGradient id="emailGradContact2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(0, 162, 255, 0.2)" />
            <stop offset="100%" style="stop-color:rgba(0, 162, 255, 0.05)" />
          </linearGradient>
        </defs>
        <!-- Main envelope -->
        <rect x="12" y="22" width="56" height="36" rx="6" stroke="currentColor" stroke-width="2.5" fill="url(#emailGradContact2)"/>
        <!-- Envelope flap -->
        <path d="M12 28L40 46L68 28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Content lines -->
        <line x1="20" y1="36" x2="38" y2="36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
        <line x1="20" y1="40" x2="48" y2="40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
        <line x1="20" y1="44" x2="32" y2="44" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
        <!-- Care elements -->
        <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.4"/>
        <circle cx="64" cy="16" r="2" fill="currentColor" opacity="0.4"/>
        <!-- Notification dot -->
        <circle cx="60" cy="30" r="3" fill="rgba(0, 162, 255, 0.8)"/>
      </svg>
    `);
  }

  private getLocationIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Premium Service Area Icon -->
        <defs>
          <linearGradient id="locationGradContact3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(0, 162, 255, 0.2)" />
            <stop offset="100%" style="stop-color:rgba(0, 162, 255, 0.05)" />
          </linearGradient>
        </defs>
        <!-- Main location pin -->
        <path d="M40 12C52 12 62 22 62 36C62 52 40 72 40 72S18 52 18 36C18 22 28 12 40 12Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="url(#locationGradContact3)"/>
        <!-- House inside pin -->
        <path d="M32 30L40 22L48 30V42C48 43 47 44 46 44H34C33 44 32 43 32 42V30Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255, 255, 255, 0.2)"/>
        <!-- Door -->
        <path d="M36 44V38H44V44" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Window -->
        <rect x="38" y="32" width="4" height="4" stroke="currentColor" stroke-width="1.2" fill="rgba(255, 255, 255, 0.3)"/>
        <!-- Service area coverage -->
        <circle cx="24" cy="56" r="3" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 162, 255, 0.3)" opacity="0.7"/>
        <circle cx="56" cy="56" r="3" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 162, 255, 0.3)" opacity="0.7"/>
        <circle cx="40" cy="64" r="2" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 162, 255, 0.4)" opacity="0.6"/>
        <!-- Coverage lines -->
        <path d="M24 56C30 58 35 60 40 60C45 60 50 58 56 56" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
        <!-- Care elements -->
        <circle cx="12" cy="40" r="1.5" fill="currentColor" opacity="0.4"/>
        <circle cx="68" cy="40" r="1.5" fill="currentColor" opacity="0.4"/>
      </svg>
    `);
  }

  private getClockIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Premium Business Hours Icon -->
        <defs>
          <linearGradient id="clockGradContact4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(0, 162, 255, 0.2)" />
            <stop offset="100%" style="stop-color:rgba(0, 162, 255, 0.05)" />
          </linearGradient>
        </defs>
        <!-- Clock face -->
        <circle cx="40" cy="40" r="28" stroke="currentColor" stroke-width="2.5" fill="url(#clockGradContact4)"/>
        <!-- Clock hands -->
        <path d="M40 20V40L52 48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Hour markers -->
        <circle cx="40" cy="16" r="2" fill="currentColor"/>
        <circle cx="64" cy="40" r="2" fill="currentColor"/>
        <circle cx="40" cy="64" r="2" fill="currentColor"/>
        <circle cx="16" cy="40" r="2" fill="currentColor"/>
        <!-- Additional hour markers -->
        <circle cx="56" cy="24" r="1.5" fill="currentColor" opacity="0.7"/>
        <circle cx="56" cy="56" r="1.5" fill="currentColor" opacity="0.7"/>
        <circle cx="24" cy="56" r="1.5" fill="currentColor" opacity="0.7"/>
        <circle cx="24" cy="24" r="1.5" fill="currentColor" opacity="0.7"/>
        <!-- Center dot -->
        <circle cx="40" cy="40" r="3" fill="currentColor"/>
        <!-- Care elements -->
        <circle cx="8" cy="20" r="1.5" fill="currentColor" opacity="0.4"/>
        <circle cx="72" cy="60" r="1.5" fill="currentColor" opacity="0.4"/>
      </svg>
    `);
  }
}