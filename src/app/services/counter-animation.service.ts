import { Injectable } from '@angular/core';

export interface CounterConfig {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  separator?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CounterAnimationService {
  
  constructor() { }

  /**
   * Animates a counter from 0 to target value
   * @param element - The DOM element to update
   * @param config - Counter configuration
   * @returns Promise that resolves when animation completes
   */
  animateCounter(element: HTMLElement, config: CounterConfig): Promise<void> {
    return new Promise((resolve) => {
      const {
        target,
        duration = 2000,
        suffix = '',
        prefix = '',
        decimals = 0,
        separator = ','
      } = config;

      const startTime = performance.now();
      const startValue = 0;
      
      // Easing function for smooth animation
      const easeOutQuart = (t: number): number => {
        return 1 - Math.pow(1 - t, 4);
      };

      // Add animating class at start
      element.classList.add('animating');

      const updateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Apply easing
        const easedProgress = easeOutQuart(progress);
        
        // Calculate current value
        const currentValue = startValue + (target - startValue) * easedProgress;
        
        // Format the number
        const formattedValue = this.formatNumber(currentValue, decimals, separator);
        
        // Add prefix and suffix
        const displayValue = `${prefix}${formattedValue}${suffix}`;
        
        // Update the element
        element.textContent = displayValue;
        
        // Continue animation or resolve
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          // Ensure final value is exact
          const finalValue = `${prefix}${this.formatNumber(target, decimals, separator)}${suffix}`;
          element.textContent = finalValue;
          
          // Remove animating class after a delay to show final state
          setTimeout(() => {
            element.classList.remove('animating');
          }, 500);
          
          resolve();
        }
      };

      requestAnimationFrame(updateCounter);
    });
  }

  /**
   * Animates multiple counters when they come into view
   * @param elements - Array of elements with their configurations
   * @param options - Intersection observer options
   */
  animateCountersOnScroll(
    elements: { element: HTMLElement; config: CounterConfig }[],
    options: IntersectionObserverInit = { threshold: 0.5 }
  ): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const elementData = elements.find(item => item.element === entry.target);
          if (elementData) {
            this.animateCounter(elementData.element, elementData.config);
            observer.unobserve(entry.target);
          }
        }
      });
    }, options);

    elements.forEach(({ element }) => {
      observer.observe(element);
    });
  }

  /**
   * Formats a number with decimals and separators
   */
  private formatNumber(value: number, decimals: number, separator: string): string {
    const rounded = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    const parts = rounded.toFixed(decimals).split('.');
    
    // Add thousand separators
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    return parts.join('.');
  }

  /**
   * Creates a counter animation that starts immediately
   * @param element - The DOM element to update
   * @param config - Counter configuration
   */
  startCounter(element: HTMLElement, config: CounterConfig): void {
    this.animateCounter(element, config);
  }

  /**
   * Creates a counter animation that starts when element is visible
   * @param element - The DOM element to update
   * @param config - Counter configuration
   * @param threshold - Intersection threshold (0-1)
   */
  startCounterOnVisible(element: HTMLElement, config: CounterConfig, threshold = 0.5): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateCounter(element, config);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold });

    observer.observe(element);
  }
}