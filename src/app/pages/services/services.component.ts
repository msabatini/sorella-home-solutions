import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { ServiceIcons } from '../../../assets/icons/service-icons';
import { AnimationService } from '../../services/animation.service';
import { CounterAnimationService } from '../../services/counter-animation.service';

@Component({
  selector: 'app-services',
  imports: [CommonModule, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit, OnDestroy, AfterViewInit {
  
  services: Array<{
    title: string;
    icon: SafeHtml;
    description: string;
    detailedDescription?: string;
    detailedDescription2?: string;
    quote?: {
      text: string;
      author: string;
    };
    features: Array<string | { text: string; subFeatures?: string[] }>;
    benefits: string[];
    sectionId: string;
  }> = [];

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private animationService: AnimationService,
    private counterService: CounterAnimationService
  ) {}

  ngOnInit() {
    this.scrollToTop();
    
    // Header scroll behavior is now handled by the header component
    
    this.setupParallaxEffect();
    
    // Initialize animations
    setTimeout(() => {
      this.animationService.initScrollAnimations();
      this.animationService.triggerPageLoadAnimations();
    }, 100);
    
    this.services = [
      {
        title: 'Property Management',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.propertyManagement),
        description: 'Expert home care that gives you back your time while protecting your most important investment',
        detailedDescription: 'Your home is one of your most valuable assets. At Sorella Home Solutions, our Property Management services provide proactive, reliable care designed to protect your investment and give you peace of mind—all year long. Whether it\'s your primary residence, a second home, or a rental property, our team ensures that every detail is managed with precision and discretion. From routine maintenance to seasonal preparation, we take a hands-on, preventative approach that keeps small issues from becoming costly repairs. For homeowners who travel frequently, we provide full oversight of the property in your absence—so you can rest easy knowing your home is cared for as if it were our own.',
        quote: {
          text: 'We blend proactive preparation with reactive response. That\'s the Sorella difference.',
          author: 'Megan Calabrese, Founder'
        },
        features: [
          'Proactive Preventative Maintenance Plans',
          'Seasonal Home Care Routine Inspections Storm Preparedness',
          'Vendor Coordination and Management Through Trusted Service Partners',
          'Emergency Repairs and Rapid Response Services – Immediate support/24/7 coverage',
          'Investment Property Care – Reliable oversight, maximize value and tenant satisfaction'
        ],
        benefits: [
          'Protect your investment',
          'Prevent costly repairs',
          'Peace of mind while traveling',
          'Professional vendor oversight',
          'Maximize property value'
        ],
        sectionId: 'property-management'
      },
      {
        title: 'Project Management & Oversight',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.projectManagement),
        description: 'We know the home project, regardless of size require time, coordination and expertise.',
        detailedDescription: 'At Sorella, we aim to be the trusted partner for homeowners who what their projects managed with the same care and precision as their homes are lived in.',
        detailedDescription2: 'We deliver a high tech, high touch approach utilizing digital platforms for real time project tracking, and transparent communication and updates tailored to each client, ensuring seamless execution, impeccable attention to detail, and stress-free experiences.',
        quote: {
          text: 'We know how overwhelming home projects can feel. Our job is to make sure the process is smooth, efficient, and successful—delivering results that exceed expectations.',
          author: 'Megan Calabrese, Founder'
        },
        features: [
          { text: 'Renovation Oversight – From kitchens and baths to full-scale remodels, we manage contractors, budgets, and timelines' },
          { text: 'Repairs & Upgrades – Coordinating one-time projects such as roof repairs, HVAC replacement, or appliance installation' },
          { text: 'Vendor Coordination – Sourcing and managing trusted professionals, ensuring all work is performed to the highest standards' },
          { text: 'Quality Assurance – Frequent site check-ins and detailed updates to keep projects on track and clients informed' },
          { text: 'Budget & Timeline Management – Monitoring costs and schedules to protect your investment and avoid surprises' },
          { text: 'Full-Cycle Project Management –' },
          { text: 'Homeowner Representation –' },
          { text: 'Vendor and Contractor Management –' }
        ],
        benefits: [
          'Budget Management',
          'Quality assurance',
          'Stress-free experience',
          'High Touch Approach',
          'Trusted Vendor Network'
        ],
        sectionId: 'project-management'
      },
      {
        title: 'Move Management',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.moveManagement),
        description: 'Making the transition seamless from the first box packed to the final sweep-through, handling every detail with care, efficiency, and discretion.',
        detailedDescription: 'They say moving is one of life\'s most stressful events—clearly, they\'ve never moved with Sorella Home Solutions. Whether you\'re upsizing, downsizing, or simply relocating, our team specializes in making the transition seamless. From the first box packed to the final sweep-through, we handle every detail with care, efficiency, and discretion. Our move management services are especially valuable for downsizers, offering compassionate, personalized support to help simplify the process of editing, organizing, and transitioning into a new chapter. At Sorella, we bring a can-do attitude and swift work ethic to every project, ensuring even the most complex moves are executed smoothly. Consider us your trusted partner—one that removes the overwhelm so you can look forward to life in your new home.',
        features: [
          'Staging – Preparing your home to shine for prospective buyers',
          'Organizing – Streamlining belongings to make packing and unpacking effortless',
          'Facilitating Donations – Coordinating the removal and donation of items to local charities',
          'Coordinating Movers – Scheduling and overseeing reliable moving professionals',
          'Packing & Unpacking – Careful packing, efficient unpacking, and thoughtful placement in your new home',
          'Final Sweep-Through – Ensuring your former residence is left in pristine condition'
        ],
        benefits: [
          'Stress-free transition',
          'Compassionate support',
          'Efficient execution',
          'Complete coordination',
          'Trusted partnership'
        ],
        sectionId: 'move-management'
      },
      {
        title: 'Concierge Services',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.conciergeServices),
        description: 'Designed to handle the details—big and small—that keep your household running smoothly with discretion, precision, and care.',
        detailedDescription: 'Life is busy, but your home doesn\'t have to add to the stress. At Sorella Home Solutions, our Concierge Services are designed to handle the details—big and small—that keep your household running smoothly. From preparing your home for your return after a trip to coordinating everyday errands, we ensure everything is managed with discretion, precision, and care. Think of us as your behind-the-scenes partner, making sure your home always feels ready, welcoming, and effortlessly maintained.',
        quote: {
          text: 'Our concierge clients enjoy the peace of mind that comes from knowing every detail is handled—even before they think of it.',
          author: 'Megan Calabrese, Founder'
        },
        features: [
          'Everyday Concierge Services – Coordinating housekeeping, landscaping, pool service, and other vendors; scheduling carpet cleaning, window washing, and upholstery refreshes; managing dry cleaning, deliveries, and package acceptance; pet care coordination from daily walks to grooming and vet appointments',
          'While You\'re Away – Stocking the fridge and pantry for your return; arranging fresh flowers, setting the thermostat, and preparing the home for your arrival; overseeing car detailing, oil changes, and service appointments while you travel; providing regular property check-ins and vendor oversight',
          'Special Requests – Hosting a dinner party and need a private chef? Looking for someone to source last-minute gifts or prepare guest rooms for visiting family? Whatever the request, our team delivers with a "consider it done" mindset'
        ],
        benefits: [
          'Peace of mind',
          'Effortless maintenance',
          'Behind-the-scenes support',
          'Ready and welcoming home',
          '"Consider it done" service'
        ],
        sectionId: 'concierge-services'
      },
      {
        title: 'Corporate Relocation',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.corporateRelocation),
        description: 'Seamless transitions for companies and individuals, acting as a trusted extension of your HR and talent teams.',
        detailedDescription: 'Our Corporate Relocation services are designed to support both organizations and the individuals they\'re relocating. We act as a trusted extension of your HR and talent teams, providing a personalized experience that eases the stress of moving and creates a smooth landing for your employees. For companies, smooth relocations translate into higher employee satisfaction, faster onboarding, and a more positive overall experience. For employees, it means peace of mind knowing every detail is managed so they can focus on their new role and life ahead.',
        features: [
          'Property Sourcing & Advisory – Assistance identifying the right home or temporary housing that fits lifestyle and commute needs',
          'Move Coordination – Scheduling and overseeing trusted movers, packers, and transport services',
          'Concierge Settling-In – From utility setup and school research to coordinating local services, we make a new community feel like home from day one',
          'Family Support – Helping spouses and children acclimate by connecting them to local schools, activities, and trusted service providers',
          'Confidentiality & Discretion – Expertise in serving high-profile executives and professionals with the utmost privacy'
        ],
        benefits: [
          'Higher employee satisfaction',
          'Faster onboarding',
          'Positive experience',
          'Peace of mind',
          'Professional efficiency'
        ],
        sectionId: 'corporate-relocation'
      }
    ];

    // Handle fragment navigation
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          this.scrollToService(fragment);
        }, 100);
      }
    });
  }

  scrollToService(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }



  private setupParallaxEffect() {
    const heroSection = document.querySelector('.services-hero') as HTMLElement;
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

  navigateToContact() {
    this.router.navigate(['/contact']).then(() => {
      // Wait for navigation to complete, then scroll to the contact form
      setTimeout(() => {
        const contactForm = document.querySelector('.contact-form-container');
        if (contactForm) {
          contactForm.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    });
  }

  ngOnDestroy(): void {
    this.animationService.destroy();
  }

  ngAfterViewInit() {
    // Initialize counter animations after view is ready
    setTimeout(() => {
      this.initializeCounters();
    }, 1000); // Delay to allow page animations to settle
  }

  private initializeCounters() {
    // Get all stat number elements
    const statElements = document.querySelectorAll('.hero-stats .stat-number');
    
    if (statElements.length >= 3) {
      // 13M+ Square Feet Managed counter
      const sqFtElement = statElements[0] as HTMLElement;
      if (sqFtElement) {
        this.counterService.startCounterOnVisible(sqFtElement, {
          target: 13,
          duration: 2500,
          suffix: 'M+'
        });
      }

      // 24/7 Support counter
      const supportElement = statElements[1] as HTMLElement;
      if (supportElement) {
        this.counterService.startCounterOnVisible(supportElement, {
          target: 24,
          duration: 2000,
          suffix: '/7'
        });
      }

      // 100% Satisfaction counter
      const satisfactionElement = statElements[2] as HTMLElement;
      if (satisfactionElement) {
        this.counterService.startCounterOnVisible(satisfactionElement, {
          target: 100,
          duration: 2200,
          suffix: '%'
        });
      }
    }
  }
}