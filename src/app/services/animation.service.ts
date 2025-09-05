import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private observer: IntersectionObserver | null = null;

  constructor() { }

  /**
   * Initialize scroll animations using Intersection Observer
   */
  initScrollAnimations() {
    // Create intersection observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Handle counter animations
          if (entry.target.classList.contains('counter')) {
            this.animateCounter(entry.target as HTMLElement);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Find and observe all elements with animation classes
    this.observeElements();
  }

  /**
   * Find and observe elements for animation
   */
  private observeElements() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(element => {
      if (this.observer) {
        this.observer.observe(element);
      }
    });

    // Also observe counter elements
    const counterElements = document.querySelectorAll('.counter');
    counterElements.forEach(element => {
      if (this.observer) {
        this.observer.observe(element);
      }
    });
  }

  /**
   * Trigger page load animations
   */
  triggerPageLoadAnimations() {
    setTimeout(() => {
      const loadElements = document.querySelectorAll('.animate-on-load');
      loadElements.forEach(element => {
        element.classList.add('animate-in');
      });
    }, 100);
  }

  /**
   * Animate counter numbers
   */
  private animateCounter(element: HTMLElement) {
    const target = parseInt(element.getAttribute('data-target') || '0');
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = parseInt(element.getAttribute('data-duration') || '2000');
    
    // Find the stat-number element inside the counter element
    const numberElement = element.querySelector('.stat-number') as HTMLElement;
    if (!numberElement) return;
    
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    // Add counting class for pulse effect
    numberElement.classList.add('counting');

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        numberElement.textContent = Math.floor(current).toString() + suffix;
        requestAnimationFrame(updateCounter);
      } else {
        numberElement.textContent = target.toString() + suffix;
        // Remove counting class when animation is complete
        numberElement.classList.remove('counting');
      }
    };

    updateCounter();
  }

  /**
   * Clean up observers
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}