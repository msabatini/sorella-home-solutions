import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContactForm } from '../../components/contact-form/contact-form';
import { Testimonials } from '../../components/testimonials/testimonials';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { ServiceIcons } from '../../../assets/icons/service-icons';

@Component({
  selector: 'app-home',
  imports: [ContactForm, Testimonials, CommonModule, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  services: Array<{title: string, icon: SafeHtml, description: string, sectionId: string}> = [];
  introSection: {title: string, icon: SafeHtml, paragraphs: string[]} = {} as any;
  chevronDownIcon: SafeHtml = {} as any;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.chevronDownIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.chevronDown);
    
    this.introSection = {
      title: 'Focusing on what truly matters...',
      icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.focusMatters),
      paragraphs: [
        'At Sorella Home Solutions, we believe your time is your most valuable asset. That\'s why we take the stress of home management off your plate—so you can focus on what truly matters, like family, career, and living well. Our team, with experience managing over 13 million square feet of real estate, brings the same level of precision, professionalism, and care to your home that we\'ve delivered to some of the most complex properties in the industry.',
        'From proactive maintenance and project oversight to 24/7 concierge support, we provide a seamless approach to caring for your home. With Sorella, investing in routine management today means avoiding costly surprises tomorrow—protecting both your time and your most important investment.',
        'With Sorella, consider it done.'
      ]
    };
    
    this.services = [
      {
        title: 'Property Management',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.propertyManagement),
        description: 'Comprehensive property oversight and maintenance coordination',
        sectionId: 'property-management'
      },
      {
        title: 'Project Management & Oversight',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.projectManagement),
        description: 'Strategic planning and execution of complex projects',
        sectionId: 'project-management'
      },
      {
        title: 'Move Management',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.moveManagement),
        description: 'Seamless relocation coordination from start to finish',
        sectionId: 'move-management'
      },
      {
        title: 'Concierge Services',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.conciergeServices),
        description: 'Personalized assistance for all your lifestyle needs',
        sectionId: 'concierge-services'
      },
      {
        title: 'Corporate Relocation',
        icon: this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.corporateRelocation),
        description: 'Enterprise-level moving solutions for businesses',
        sectionId: 'corporate-relocation'
      }
    ];
  }

  scrollToServices() {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}