import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss']
})
export class LegalComponent implements OnInit, OnDestroy {
  activeTab = 'privacy';

  constructor(
    private animationService: AnimationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.scrollToTop();
    this.animationService.initScrollAnimations();
    this.setupScrollHeader();
    this.setupParallaxEffect();
    
    // Handle fragment navigation
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        // Map fragments to tab names
        const fragmentToTab: Record<string, string> = {
          'privacy-policy': 'privacy',
          'terms-of-service': 'terms',
          'cookie-policy': 'cookies'
        };
        
        const tabName = fragmentToTab[fragment];
        if (tabName) {
          this.activeTab = tabName;
        }
      }
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
      const heroSection = document.querySelector('.legal-hero') as HTMLElement;
      if (header && heroSection) {
        const heroHeight = heroSection.offsetHeight;
        const triggerPoint = heroHeight * 0.8;
        if (window.scrollY > triggerPoint) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  private setupParallaxEffect() {
    const heroSection = document.querySelector('.legal-hero') as HTMLElement;
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}