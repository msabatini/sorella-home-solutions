import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { ServiceIcons } from '../../../assets/icons/service-icons';

@Component({
  selector: 'app-services',
  imports: [CommonModule, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  
  services: Array<{
    title: string;
    icon: SafeHtml;
    description: string;
    features: string[];
    benefits: string[];
    sectionId: string;
  }> = [];

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.setupScrollHeader();
    
    this.services = [
      {
        title: 'Property Management',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.propertyManagement),
        description: 'Comprehensive property oversight and maintenance coordination that keeps your home in pristine condition while you focus on what matters most.',
        features: [
          'Preventive maintenance scheduling',
          'Vendor coordination and oversight',
          'Emergency response management',
          'Property inspections and reporting',
          'Budget planning and cost control'
        ],
        benefits: [
          'Preserve property value',
          'Prevent costly repairs',
          'Peace of mind',
          'Professional oversight',
          'Time savings'
        ],
        sectionId: 'property-management'
      },
      {
        title: 'Project Management & Oversight',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.projectManagement),
        description: 'Strategic planning and execution of complex projects with meticulous attention to detail, timeline management, and quality assurance.',
        features: [
          'Project planning and timeline development',
          'Contractor vetting and management',
          'Quality control and inspections',
          'Budget oversight and reporting',
          'Communication and progress updates'
        ],
        benefits: [
          'On-time completion',
          'Budget adherence',
          'Quality assurance',
          'Stress-free experience',
          'Professional results'
        ],
        sectionId: 'project-management'
      },
      {
        title: 'Move Management',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.moveManagement),
        description: 'Seamless relocation coordination from start to finish, handling every detail to make your move stress-free and efficient.',
        features: [
          'Moving timeline and logistics planning',
          'Professional mover coordination',
          'Packing and unpacking services',
          'Utility setup and transfers',
          'Address change management'
        ],
        benefits: [
          'Stress-free relocation',
          'Time efficiency',
          'Organized transition',
          'Professional handling',
          'Complete coordination'
        ],
        sectionId: 'move-management'
      },
      {
        title: 'Concierge Services',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.conciergeServices),
        description: 'Personalized assistance for all your lifestyle needs, providing luxury-level service to enhance your daily life and free up your valuable time.',
        features: [
          'Personal shopping and errands',
          'Appointment scheduling and coordination',
          'Travel planning and arrangements',
          'Event planning and coordination',
          'Household staff management'
        ],
        benefits: [
          'Luxury lifestyle support',
          'Time optimization',
          'Personalized service',
          'Convenience and comfort',
          'Professional assistance'
        ],
        sectionId: 'concierge-services'
      },
      {
        title: 'Corporate Relocation',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.corporateRelocation),
        description: 'Enterprise-level moving solutions for businesses, ensuring minimal disruption to operations while maintaining the highest standards of professionalism.',
        features: [
          'Corporate moving strategy development',
          'Employee relocation assistance',
          'Office setup and coordination',
          'IT and equipment management',
          'Timeline and logistics oversight'
        ],
        benefits: [
          'Minimal business disruption',
          'Employee satisfaction',
          'Cost-effective solutions',
          'Professional execution',
          'Comprehensive support'
        ],
        sectionId: 'corporate-relocation'
      }
    ];

    // Handle fragment navigation
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          this.scrollToService(fragment);
        }, 100);
      }
    });
  }

  scrollToService(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
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
}