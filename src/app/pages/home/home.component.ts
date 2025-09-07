import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Testimonials } from '../../components/testimonials/testimonials';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { ServiceIcons } from '../../../assets/icons/service-icons';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, Testimonials, CommonModule, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  
  services: Array<{title: string, icon: SafeHtml, description: string, sectionId: string}> = [];
  introSection: {title: string, icon: SafeHtml, paragraphs: string[]} = {} as any;
  chevronDownIcon: SafeHtml = {} as any;
  
  // Contact icons
  phoneIcon: SafeHtml = {} as any;
  emailIcon: SafeHtml = {} as any;
  locationIcon: SafeHtml = {} as any;
  
  // Contact form properties
  contactForm!: FormGroup;
  isSubmitting = false;
  formSubmitted = false;

  constructor(
    private sanitizer: DomSanitizer, 
    private router: Router,
    private animationService: AnimationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.scrollToTop();
    this.setupScrollHeader();
    this.setupParallaxEffect();
    this.chevronDownIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.chevronDown);
    
    // Initialize contact icons
    this.phoneIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.phone);
    this.emailIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.email);
    this.locationIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.location);
    
    // Initialize contact form
    this.setupContactForm();
    
    // Initialize animations after a short delay
    setTimeout(() => {
      this.animationService.initScrollAnimations();
      this.animationService.triggerPageLoadAnimations();
    }, 100);
    
    this.introSection = {
      title: 'Focusing on what truly matters...',
      icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.focusMatters),
      paragraphs: [
        'At Sorella Home Solutions, we believe your time is your most valuable asset. That\'s why we take the stress of home management off your plate—so you can focus on what truly matters, like family, career, and living well. Our team, with experience managing over 13 million square feet of real estate, brings the same level of precision, professionalism, and care to your home that we\'ve delivered to some of the most complex properties in the industry.',
        'From proactive maintenance and project oversight to 24/7 concierge support, we provide a seamless approach to caring for your home. With Sorella, investing in routine management today means avoiding costly surprises tomorrow—protecting both your time and your most important investment.',
        'With Sorella, consider it done.'
      ]
    };
    
    this.services = [
      {
        title: 'Property Management',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.propertyManagement),
        description: 'Comprehensive property oversight and maintenance coordination',
        sectionId: 'property-management'
      },
      {
        title: 'Project Management & Oversight',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.projectManagement),
        description: 'Strategic planning and execution of complex projects',
        sectionId: 'project-management'
      },
      {
        title: 'Move Management',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.moveManagement),
        description: 'Seamless relocation coordination from start to finish',
        sectionId: 'move-management'
      },
      {
        title: 'Concierge Services',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.conciergeServices),
        description: 'Personalized assistance for all your lifestyle needs',
        sectionId: 'concierge-services'
      },
      {
        title: 'Corporate Relocation',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.corporateRelocation),
        description: 'Enterprise-level moving solutions for businesses',
        sectionId: 'corporate-relocation'
      }
    ];
  }

  scrollToServices() {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  scrollToContact(type: 'general' | 'consultation' = 'general') {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Pre-populate form based on button clicked
      setTimeout(() => {
        if (type === 'consultation') {
          this.contactForm.patchValue({
            serviceType: 'consultation',
            message: 'I would like to schedule a consultation to discuss my home management needs.'
          });
        }
      }, 500); // Small delay to ensure smooth scroll completes
    }
  }

  navigateToService(serviceIndex: number) {
    // Navigate to services page and scroll to specific service
    this.router.navigate(['/services']).then(() => {
      // Wait for navigation to complete, then scroll to the specific service
      setTimeout(() => {
        const serviceElement = document.querySelector(`.service-detail:nth-child(${serviceIndex + 1})`);
        if (serviceElement) {
          serviceElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    });
  }

  ngOnDestroy() {
    this.animationService.destroy();
  }

  private scrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }

  private setupScrollHeader() {
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.header');
      const heroSection = document.querySelector('.hero') as HTMLElement;
      if (header && heroSection) {
        const heroHeight = heroSection.offsetHeight;
        if (window.scrollY > heroHeight) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  private setupParallaxEffect() {
    const heroSection = document.querySelector('.hero') as HTMLElement;
    if (!heroSection) return;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const heroHeight = heroSection.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Only apply parallax when hero is visible
      if (scrolled < heroHeight + windowHeight) {
        const parallaxSpeed = 0.2;
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

  // Contact form methods
  private setupContactForm() {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      serviceType: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  submitForm() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.formSubmitted = false;
      
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
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors && field.touched) {
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
}