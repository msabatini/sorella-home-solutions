import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  currentRoute = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Track current route for active navigation
    this.trackCurrentRoute();
    // Add smooth scrolling for navigation links
    this.setupSmoothScrolling();
    // Setup mobile menu toggle
    this.setupMobileMenu();
    // Setup header background on scroll
    this.setupScrollHeader();
  }

  private setupSmoothScrolling() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('a[href^="#"]')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.substring(1);
        if (id) {
          const element = document.getElementById(id);
          if (element) {
            const headerOffset = 80;
            const elementPosition = element.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      }
    });
  }

  private setupMobileMenu() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Close mobile menu when clicking on nav links
      if (target.matches('.nav-link, .dropdown-link')) {
        this.isMobileMenuOpen = false;
        const navMenu = document.querySelector('.nav-menu');
        navMenu?.classList.remove('active');
      }
    });
  }

  private setupScrollHeader() {
    let ticking = false;
    
    const updateHeader = () => {
      const header = document.querySelector('.header') as HTMLElement;
      const heroSection = document.querySelector('.hero, .about-hero') as HTMLElement;
      
      if (header && heroSection) {
        const heroHeight = heroSection.offsetHeight;
        const scrollPosition = window.scrollY;
        
        // Add background when scrolled past 80% of hero section
        if (scrollPosition > heroHeight * 0.8) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    });
  }

  showDropdown() {
    this.isDropdownOpen = true;
  }

  hideDropdown() {
    this.isDropdownOpen = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const navMenu = document.querySelector('.nav-menu');
    if (this.isMobileMenuOpen) {
      navMenu?.classList.add('active');
    } else {
      navMenu?.classList.remove('active');
    }
  }

  private trackCurrentRoute() {
    // Set initial route
    this.currentRoute = this.router.url;
    
    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  isActiveRoute(route: string): boolean {
    // Handle home route
    if (route === '/' && this.currentRoute === '/') {
      return true;
    }
    
    // Handle other routes (including fragments)
    if (route !== '/' && this.currentRoute.startsWith(route)) {
      return true;
    }
    
    return false;
  }
}