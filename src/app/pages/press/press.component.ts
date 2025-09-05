import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { Testimonials } from '../../components/testimonials/testimonials';

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
export class PressComponent implements OnInit {
  
  pressItems: PressItem[] = [];
  selectedYear: number | null = null;
  availableYears: number[] = [];
  filteredPressItems: PressItem[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.scrollToTop();
    this.setupScrollHeader();
    this.initializePressData();
    this.calculateAvailableYears();
    this.filterPressItems();
  }

  private setupScrollHeader() {
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  private scrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
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