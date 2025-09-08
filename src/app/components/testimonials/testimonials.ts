import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  service: string;
}

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss'
})
export class Testimonials implements OnInit, OnDestroy {
  currentTestimonial = 0;
  private intervalId: any;
  private isHovered = false;
  
  testimonials: Testimonial[] = [
    {
      name: 'M.G.',
      location: 'Boston Property Owner',
      rating: 5,
      text: 'When our condo building needed a new roof, Sorella stepped in and handled everything from start to finish. They gathered multiple quotes, coordinated the vendors, and oversaw the entire project. What could have been a stressful, time-consuming process for the owners turned into a seamless experience. The work was done quickly, the pricing was reasonable, and we never had to worry about the details. Sorella truly took the pressure off all of us.',
      service: 'Property Management'
    },
    {
      name: 'M.A.',
      location: 'Hingham Homeowner',
      rating: 5,
      text: 'Thanks to Sorella, my backyard has been transformed into a gathering place for my family. They managed every detail of installing our new patio and fire pit, and the result is more than just beautiful—it\'s a space where I can make memories with my kids and grandkids. Evenings by the fire, roasting s\'mores, laughing together… it\'s everything I dreamed of and more. Sorella gave us more than a project—they gave us a place to enjoy life.',
      service: 'Project Management'
    },
    {
      name: 'G.E.',
      location: 'Hingham Homeowner',
      rating: 5,
      text: 'Moving was such an emotional process for me, but Sorella turned what I expected to be overwhelming into something almost effortless. Their team handled everything—packing, purging, coordinating donations—and even got to the new house before the movers arrived to deep clean and prepare. By 8 p.m. on the night of the move, the kitchen was fully unpacked and organized, the bedrooms were set up, and the beds were made. Instead of feeling stressed, I felt at home. Sorella didn\'t just move my belongings—they gave me peace of mind during one of life\'s biggest transitions.',
      service: 'Move Management'
    }
  ];

  ngOnInit() {
    // Ensure first testimonial is active
    this.currentTestimonial = 0;
    
    // Auto-rotate testimonials every 5 seconds
    this.intervalId = setInterval(() => {
      this.nextTestimonial();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }

  previousTestimonial() {
    this.pauseAutoRotation();
    this.currentTestimonial = this.currentTestimonial === 0 
      ? this.testimonials.length - 1 
      : this.currentTestimonial - 1;
    this.resumeAutoRotation();
  }

  goToTestimonial(index: number) {
    this.pauseAutoRotation();
    this.currentTestimonial = index;
    this.resumeAutoRotation();
  }

  private pauseAutoRotation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private resumeAutoRotation() {
    // Only resume if not currently hovered
    if (!this.isHovered) {
      this.intervalId = setInterval(() => {
        this.nextTestimonial();
      }, 5000);
    }
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  onCardHover() {
    this.isHovered = true;
    this.pauseAutoRotation();
  }

  onCardLeave() {
    this.isHovered = false;
    this.resumeAutoRotation();
  }
}
