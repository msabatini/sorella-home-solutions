import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactForm } from '../../components/contact-form/contact-form';
import { Testimonials } from '../../components/testimonials/testimonials';

@Component({
  selector: 'app-home',
  imports: [ContactForm, Testimonials, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  services = [
    {
      title: 'Property Management',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>'
    },
    {
      title: 'Project Management & Oversight',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H19v2h-1.5v17h-11V4H5V2h1.5C7.33 2 8 2.67 8 3.5S7.33 5 6.5 5H8v1h8V5h1.5c-.83 0-1.5-.67-1.5-1.5S18.17 2 19 2z"/></svg>'
    },
    {
      title: 'Move Management',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
    },
    {
      title: 'Concierge Services',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
    },
    {
      title: 'Corporate Relocation',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>'
    }
  ];

  ngOnInit() {
    // Add smooth scrolling for navigation links
    this.setupSmoothScrolling();
    // Setup mobile menu toggle
    this.setupMobileMenu();
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
      if (target.closest('#mobile-menu')) {
        const navMenu = document.querySelector('.nav-menu');
        navMenu?.classList.toggle('active');
      }
    });
  }
}