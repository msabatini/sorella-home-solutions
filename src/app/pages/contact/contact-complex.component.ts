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
      <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor">
        <rect x="30" y="15" width="40" height="70" rx="8" fill="none" stroke="currentColor" stroke-width="3"/>
        <rect x="35" y="25" width="30" height="45" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <circle cx="50" cy="78" r="3"/>
        <line x1="42" y1="20" x2="58" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `);
  }

  private getEmailIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor">
        <rect x="15" y="25" width="70" height="50" rx="5" fill="none" stroke="currentColor" stroke-width="3"/>
        <path d="M15 25L50 50L85 25" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="75" cy="35" r="3"/>
      </svg>
    `);
  }

  private getLocationIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 15C35 15 25 25 25 40C25 60 50 85 50 85S75 60 75 40C75 25 65 15 50 15Z" fill="none" stroke="currentColor" stroke-width="3"/>
        <circle cx="50" cy="40" r="8" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <circle cx="50" cy="40" r="3"/>
      </svg>
    `);
  }

  private getClockIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="3"/>
        <path d="M50 25V50L65 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="50" cy="20" r="2.5"/>
        <circle cx="80" cy="50" r="2.5"/>
        <circle cx="50" cy="80" r="2.5"/>
        <circle cx="20" cy="50" r="2.5"/>
        <circle cx="50" cy="50" r="3"/>
      </svg>
    `);
  }
}