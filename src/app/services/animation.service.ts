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
    const duration = parseInt(element.getAttribute('data-duration') || '2000');
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current).toString();
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toString();
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