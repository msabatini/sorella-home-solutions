import { Component, OnInit } from '@angular/core';
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
export class Testimonials implements OnInit {
  currentTestimonial = 0;
  
  testimonials: Testimonial[] = [
    {
      name: 'Sarah Mitchell',
      location: 'Beacon Hill',
      rating: 5,
      text: 'Sorella has completely transformed how we manage our home. Their proactive maintenance approach caught issues before they became expensive problems, and their 24/7 support gives us incredible peace of mind. We can finally focus on what truly matters.',
      service: 'Home Management'
    },
    {
      name: 'David Chen',
      location: 'Back Bay',
      rating: 5,
      text: 'The project oversight for our kitchen renovation was flawless. Sorella coordinated everything—contractors, timelines, quality control—while we continued our busy lives. The attention to detail and professionalism exceeded all expectations.',
      service: 'Project Management'
    },
    {
      name: 'Jennifer Rodriguez',
      location: 'Cambridge',
      rating: 5,
      text: 'Moving with three kids seemed impossible until Sorella stepped in. They handled every detail from packing to setup, making our transition seamless. Their team treated our belongings like their own. Absolutely exceptional service.',
      service: 'Move Management'
    },
    {
      name: 'Robert Thompson',
      location: 'Newton',
      rating: 5,
      text: 'The concierge services are a game-changer. From coordinating repairs to managing deliveries, Sorella handles everything with discretion and care. It\'s like having a trusted partner who anticipates our needs before we even ask.',
      service: 'Concierge Services'
    }
  ];

  ngOnInit() {
    // Auto-rotate testimonials every 5 seconds
    setInterval(() => {
      this.nextTestimonial();
    }, 5000);
  }

  nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }

  previousTestimonial() {
    this.currentTestimonial = this.currentTestimonial === 0 
      ? this.testimonials.length - 1 
      : this.currentTestimonial - 1;
  }

  goToTestimonial(index: number) {
    this.currentTestimonial = index;
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
