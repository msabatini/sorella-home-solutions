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
      name: 'Sarah Johnson',
      location: 'Downtown District',
      rating: 5,
      text: 'Sorella Home Solutions transformed our outdated kitchen into a modern masterpiece. The attention to detail and quality of work exceeded our expectations. Highly recommended!',
      service: 'Kitchen Remodeling'
    },
    {
      name: 'Michael Chen',
      location: 'Riverside Heights',
      rating: 5,
      text: 'The bathroom renovation was completed on time and within budget. The team was professional, clean, and the results are absolutely stunning. We love our new spa-like bathroom!',
      service: 'Bathroom Renovation'
    },
    {
      name: 'Emily Rodriguez',
      location: 'Oak Valley',
      rating: 5,
      text: 'Working with their interior design team was a dream. They understood our vision perfectly and created a space that truly feels like home. The whole process was seamless.',
      service: 'Interior Design'
    },
    {
      name: 'David Thompson',
      location: 'Pine Ridge',
      rating: 5,
      text: 'Their home maintenance service gives us peace of mind. Regular check-ups and prompt repairs have saved us from major issues. Professional and reliable service.',
      service: 'Home Maintenance'
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
