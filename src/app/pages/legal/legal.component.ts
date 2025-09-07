import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss']
})
export class LegalComponent implements OnInit, OnDestroy {
  activeTab: string = 'privacy';

  constructor(
    private animationService: AnimationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.scrollToTop();
    this.animationService.initScrollAnimations();
    this.setupScrollHeader();
    
    // Handle fragment navigation
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        // Map fragments to tab names
        const fragmentToTab: { [key: string]: string } = {
          'privacy-policy': 'privacy',
          'terms-of-service': 'terms',
          'cookie-policy': 'cookies'
        };
        
        const tabName = fragmentToTab[fragment];
        if (tabName) {
          this.activeTab = tabName;
        }
      }
    });
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

  private setupScrollHeader() {
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.header');
      const heroSection = document.querySelector('.legal-hero') as HTMLElement;
      if (header && heroSection) {
        const heroHeight = heroSection.offsetHeight;
        const triggerPoint = heroHeight * 0.8;
        if (window.scrollY > triggerPoint) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}