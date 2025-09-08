import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { AnimationService } from '../../services/animation.service';
import { ContactService, ContactFormData } from '../../services/contact.service';
import { ServiceIcons } from '../../../assets/icons/service-icons';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent, BackToTopComponent],
  providers: [ContactService],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  isSubmitting = false;
  formSubmitted = false;
  submitError = false;
  errorMessage = '';

  contactMethods = [
    {
      title: 'Phone',
      value: '(617) 555-0123',
      link: 'tel:+16175550123',
      description: 'Call us during business hours for immediate assistance',
      icon: 'phone'
    },
    {
      title: 'Email',
      value: 'hello@sorellahomesolutions.com',
      link: 'mailto:hello@sorellahomesolutions.com',
      description: 'Send us a message anytime',
      icon: 'email'
    },
    {
      title: 'Location',
      value: 'Greater Boston Area',
      link: null,
      description: 'Serving Massachusetts',
      icon: 'location'
    },
    {
      title: 'Business Hours',
      value: 'Mon - Fri: 8AM - 6PM',
      link: null,
      description: 'Weekend consultations available',
      icon: 'clock'
    }
  ];

  constructor(
    private fb: FormBuilder, 
    private animationService: AnimationService,
    private contactService: ContactService,
    private sanitizer: DomSanitizer
  ) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      serviceType: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.scrollToTop();
    
    // Header scroll behavior is now handled by the header component
    
    this.setupParallaxEffect();
    
    // Listen for form pre-population events
    window.addEventListener('prePopulateConsultation', (event: any) => {
      if (event.detail) {
        this.contactForm.patchValue({
          serviceType: event.detail.serviceType,
          message: event.detail.message
        });
      }
    });
    
    // Initialize animations
    setTimeout(() => {
      this.animationService.initScrollAnimations();
      this.animationService.triggerPageLoadAnimations();
    }, 100);
  }

  ngOnDestroy(): void {
    this.animationService.destroy();
  }



  private setupParallaxEffect() {
    const heroSection = document.querySelector('.contact-hero') as HTMLElement;
    if (!heroSection) return;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const heroHeight = heroSection.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Only apply parallax when hero is visible
      if (scrolled < heroHeight + windowHeight) {
        const parallaxSpeed = 0.3;
        const yPos = scrolled * parallaxSpeed;
        // Apply transform to the pseudo-element via CSS custom property
        heroSection.style.setProperty('--parallax-y', `${yPos}px`);
      }
    };

    // Use requestAnimationFrame for smooth performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Wait for CSS animations to complete before starting parallax
    setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      updateParallax(); // Initial call
    }, 500);
  }

  private scrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }



  getIconSvg(iconType: string): SafeHtml {
    const iconSvg = ServiceIcons[iconType as keyof typeof ServiceIcons] || ServiceIcons.phone;
    return this.sanitizer.bypassSecurityTrustHtml(iconSvg);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }

  submitForm(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.formSubmitted = false;
      this.submitError = false;
      this.errorMessage = '';
      
      const formData: ContactFormData = {
        fullName: this.contactForm.value.fullName,
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone || undefined,
        serviceType: this.contactForm.value.serviceType || undefined,
        message: this.contactForm.value.message
      };
      
      this.contactService.submitContactForm(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.formSubmitted = true;
          this.contactForm.reset();
          
          // Hide success message after 8 seconds
          setTimeout(() => {
            this.formSubmitted = false;
          }, 8000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitError = true;
          this.errorMessage = error.message || 'An error occurred. Please try again.';
          
          // Hide error message after 10 seconds
          setTimeout(() => {
            this.submitError = false;
            this.errorMessage = '';
          }, 10000);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      fullName: 'Full name',
      email: 'Email address',
      phone: 'Phone number',
      serviceType: 'Service type',
      message: 'Message'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }
}