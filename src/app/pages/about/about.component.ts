import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { ServiceIcons } from '../../../assets/icons/service-icons';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {
  
  focusIcon: SafeHtml = {} as any;
  
  aboutSections = [
    {
      title: 'Our Mission',
      content: 'At Sorella Home Solutions, we believe your time is your most valuable asset. That\'s why we take the stress of home management off your plate—so you can focus on what truly matters, like family, career, and living well.'
    },
    {
      title: 'Our Experience',
      content: 'Our team brings experience managing over 13 million square feet of real estate, delivering the same level of precision, professionalism, and care to your home that we\'ve provided to some of the most complex properties in the industry.'
    },
    {
      title: 'Our Approach',
      content: 'From proactive maintenance and project oversight to 24/7 concierge support, we provide a seamless approach to caring for your home. With Sorella, investing in routine management today means avoiding costly surprises tomorrow—protecting both your time and your most important investment.'
    },
    {
      title: 'Our Promise',
      content: 'With Sorella, consider it done. We handle the details so you can enjoy the results, knowing your home is in expert hands.'
    }
  ];

  values = [
    {
      title: 'Excellence',
      description: 'We deliver exceptional service with meticulous attention to detail in every aspect of home management.',
      icon: 'excellence'
    },
    {
      title: 'Trust',
      description: 'Your home is your sanctuary. We earn your trust through transparency, reliability, and consistent results.',
      icon: 'trust'
    },
    {
      title: 'Innovation',
      description: 'We leverage cutting-edge technology and proven methodologies to streamline your home management experience.',
      icon: 'innovation'
    },
    {
      title: 'Partnership',
      description: 'We work alongside you as trusted partners, understanding your unique needs and exceeding your expectations.',
      icon: 'partnership'
    }
  ];

  stats = [
    {
      number: '13M+',
      target: 13,
      suffix: 'M+',
      label: 'Square Feet Managed',
      description: 'Real estate under our expert care'
    },
    {
      number: '24/7',
      target: 24,
      suffix: '/7',
      label: 'Concierge Support',
      description: 'Always available when you need us'
    },
    {
      number: '100%',
      target: 100,
      suffix: '%',
      label: 'Client Satisfaction',
      description: 'Committed to exceeding expectations'
    },
    {
      number: '20+',
      target: 20,
      suffix: '+',
      label: 'Years Experience',
      description: 'Industry expertise you can trust'
    }
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private animationService: AnimationService
  ) {}

  ngOnInit() {
    this.scrollToTop();
    this.focusIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.focusMatters);
    
    // Initialize animations after a short delay
    setTimeout(() => {
      this.animationService.initScrollAnimations();
      this.animationService.triggerPageLoadAnimations();
    }, 100);
  }

  ngOnDestroy() {
    this.animationService.destroy();
  }

  private scrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }
}