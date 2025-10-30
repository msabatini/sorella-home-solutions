import { Component, OnInit, OnDestroy, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { SocialShareButtonsComponent } from '../../components/social-share-buttons/social-share-buttons.component';
import { AnimationService } from '../../services/animation.service';
import { BlogService, BlogPost } from '../../services/blog.service';
import { ServiceIcons } from '../../../assets/icons/service-icons';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule,
    HeaderComponent, 
    FooterComponent, 
    BackToTopComponent,
    SocialShareButtonsComponent
  ],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, OnDestroy {
  phoneIcon: SafeHtml;
  blogPosts: BlogPost[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  private jsonLdScripts: HTMLScriptElement[] = [];
  
  constructor(
    private animationService: AnimationService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private blogService: BlogService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.phoneIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.phone);
  }

  ngOnInit() {
    this.scrollToTop();
    this.setupScrollHeader();
    this.setupParallaxEffect();
    this.loadBlogPosts();
    
    // Initialize animations after a short delay
    setTimeout(() => {
      this.animationService.initScrollAnimations();
      this.animationService.triggerPageLoadAnimations();
    }, 100);
  }

  private loadBlogPosts() {
    this.isLoading = true;
    this.error = null;
    
    this.blogService.getPosts(1, 100).subscribe({
      next: (response) => {
        this.blogPosts = response.data;
        this.isLoading = false;
        
        // Inject JSON-LD schemas for each blog post
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.injectJSONLDScripts();
          }, 100);
        }
      },
      error: (error) => {
        console.error('Error loading blog posts:', error);
        this.error = 'Failed to load blog posts. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.animationService.destroy();
    this.removeJSONLDScripts();
  }

  private injectJSONLDScripts() {
    // Remove existing scripts first
    this.removeJSONLDScripts();

    // Inject JSON-LD schema for each blog post
    this.blogPosts.forEach(post => {
      const schema = this.blogService.generateJSONLD(post);
      const script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'type', 'application/ld+json');
      this.renderer.setAttribute(script, 'data-post-id', post._id);
      const schemaText = this.renderer.createText(JSON.stringify(schema));
      this.renderer.appendChild(script, schemaText);
      this.renderer.appendChild(this.document.head, script);
      this.jsonLdScripts.push(script);
    });
  }

  private removeJSONLDScripts() {
    // Remove all JSON-LD scripts that were injected by this component
    this.jsonLdScripts.forEach(script => {
      this.renderer.removeChild(this.document.head, script);
    });
    this.jsonLdScripts = [];
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
      const heroSection = document.querySelector('.blog-hero') as HTMLElement;
      if (header && heroSection) {
        const heroHeight = heroSection.offsetHeight;
        if (window.scrollY > heroHeight) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  private setupParallaxEffect() {
    const heroSection = document.querySelector('.blog-hero') as HTMLElement;
    if (!heroSection) return;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const heroHeight = heroSection.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Only apply parallax when hero is visible
      if (scrolled < heroHeight + windowHeight) {
        const parallaxSpeed = 0.3;
        const yPos = scrolled * parallaxSpeed;
        heroSection.style.setProperty('--parallax-y', `${yPos}px`);
      }
    };

    // Use requestAnimationFrame for smooth performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Wait for CSS animations to complete before starting parallax
    setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      updateParallax(); // Initial call
    }, 500);
  }

  navigateToContact() {
    this.router.navigate(['/contact']).then(() => {
      // Wait for navigation to complete, then scroll to the contact form
      setTimeout(() => {
        const contactForm = document.querySelector('.contact-form-container');
        if (contactForm) {
          contactForm.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    });
  }

  scheduleConsultation() {
    window.location.href = 'mailto:hello@sorellahomesolutions.com?subject=Schedule%20a%20Home%20Care%20Consultation';
  }

  getShareUrl(post: BlogPost): string {
    return `${window.location.origin}/blog/${post.slug}`;
  }
}