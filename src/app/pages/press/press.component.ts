import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { Testimonials } from '../../components/testimonials/testimonials';
import { AnimationService } from '../../services/animation.service';
import { CounterAnimationService } from '../../services/counter-animation.service';

interface PressItem {
  id: number;
  title: string;
  date: Date;
  publication: string;
  excerpt: string;
  link?: string;
  category: 'news' | 'award' | 'feature' | 'interview';
}

@Component({
  selector: 'app-press',
  imports: [CommonModule, HeaderComponent, FooterComponent, BackToTopComponent, Testimonials],
  templateUrl: './press.component.html',
  styleUrls: ['./press.component.scss']
})
export class PressComponent implements OnInit, OnDestroy, AfterViewInit {
  
  pressItems: PressItem[] = [];
  selectedYear: number | null = null;
  availableYears: number[] = [];
  filteredPressItems: PressItem[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private animationService: AnimationService,
    private counterService: CounterAnimationService
  ) {}

  ngOnInit() {
    this.scrollToTop();
    
    // Header scroll behavior is now handled by the header component
    
    this.setupParallaxEffect();
    this.initializePressData();
    this.calculateAvailableYears();
    this.filterPressItems();
    
    // Initialize animations after a short delay
    setTimeout(() => {
      this.animationService.initScrollAnimations();
      this.animationService.triggerPageLoadAnimations();
    }, 100);
  }

  ngOnDestroy() {
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
      // Press Features counter (dynamic based on pressItems length)
      const pressCountElement = statElements[0] as HTMLElement;
      if (pressCountElement) {
        this.counterService.startCounterOnVisible(pressCountElement, {
          target: this.pressItems.length,
          duration: 2000,
          suffix: '+'
        });
      }

      // Years of Coverage counter (dynamic based on availableYears length)
      const yearsCountElement = statElements[1] as HTMLElement;
      if (yearsCountElement) {
        this.counterService.startCounterOnVisible(yearsCountElement, {
          target: this.availableYears.length,
          duration: 2000
        });
      }

      // Positive Coverage counter (100%)
      const positiveCountElement = statElements[2] as HTMLElement;
      if (positiveCountElement) {
        this.counterService.startCounterOnVisible(positiveCountElement, {
          target: 100,
          duration: 2000,
          suffix: '%'
        });
      }
    }
  }

  private setupParallaxEffect() {
    const heroSection = document.querySelector('.press-hero') as HTMLElement;
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

  navigateToContact(type: 'general' | 'consultation' = 'general') {
    this.router.navigate(['/contact']).then(() => {
      // Wait for navigation to complete, then scroll to the contact form and pre-populate
      setTimeout(() => {
        const contactForm = document.querySelector('.contact-form-container');
        if (contactForm) {
          contactForm.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
        
        // Pre-populate form based on button clicked
        setTimeout(() => {
          // We need to access the contact form component to pre-populate
          // This will be handled by the contact component's form pre-population logic
          if (type === 'consultation') {
            // Trigger consultation pre-population
            const event = new CustomEvent('prePopulateConsultation', {
              detail: {
                serviceType: 'consultation',
                message: 'I would like to schedule a consultation to discuss my home management needs.'
              }
            });
            window.dispatchEvent(event);
          }
        }, 600); // Wait for scroll to complete
      }, 100);
    });
  }

  initializePressData() {
    this.pressItems = [
      {
        id: 1,
        title: "Sorella Home Solutions Launches Comprehensive Property Management Services",
        date: new Date('2024-01-15'),
        publication: "Boston Business Journal",
        excerpt: "New company brings institutional-grade property management expertise to residential market, offering 24/7 support and proactive maintenance solutions.",
        category: 'news'
      },
      {
        id: 2,
        title: "Rising Stars in Real Estate Services",
        date: new Date('2024-03-22'),
        publication: "New England Real Estate Magazine",
        excerpt: "Sorella Home Solutions recognized among innovative companies transforming the residential property management landscape.",
        category: 'feature'
      },
      {
        id: 3,
        title: "Excellence in Customer Service Award",
        date: new Date('2024-06-10'),
        publication: "Greater Boston Chamber of Commerce",
        excerpt: "Sorella Home Solutions receives recognition for outstanding customer service and innovative approach to home management.",
        category: 'award'
      },
      {
        id: 4,
        title: "The Future of Home Management: An Interview with Sorella's Founders",
        date: new Date('2024-08-05'),
        publication: "Property Management Today",
        excerpt: "Exclusive interview discussing the evolution of residential property services and the growing demand for concierge-level home management.",
        category: 'interview'
      },
      {
        id: 5,
        title: "Sorella Expands Corporate Relocation Services",
        date: new Date('2024-10-12'),
        publication: "Corporate Housing News",
        excerpt: "Company announces enhanced corporate relocation services, partnering with major Boston-area employers to streamline employee transitions.",
        category: 'news'
      },
      {
        id: 6,
        title: "Innovation in Home Services Technology",
        date: new Date('2024-11-18'),
        publication: "Tech Boston",
        excerpt: "Sorella Home Solutions integrates cutting-edge technology platforms to enhance service delivery and client communication.",
        category: 'feature'
      }
    ];

    // Sort by date (newest first)
    this.pressItems.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  calculateAvailableYears() {
    const years = [...new Set(this.pressItems.map(item => item.date.getFullYear()))];
    this.availableYears = years.sort((a, b) => b - a);
  }

  filterPressItems() {
    if (this.selectedYear) {
      this.filteredPressItems = this.pressItems.filter(item => 
        item.date.getFullYear() === this.selectedYear
      );
    } else {
      this.filteredPressItems = [...this.pressItems];
    }
  }

  selectYear(year: number | null) {
    this.selectedYear = year;
    this.filterPressItems();
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'news':
        return `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
        </svg>`;
      case 'award':
        return `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`;
      case 'feature':
        return `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>`;
      case 'interview':
        return `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>`;
      default:
        return `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`;
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getMonthYear(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  }
}