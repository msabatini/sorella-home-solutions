import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Testimonials } from '../../components/testimonials/testimonials';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { ServiceIcons } from '../../../assets/icons/service-icons';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, Testimonials, CommonModule, HeaderComponent, FooterComponent, BackToTopComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @ViewChild('heroVideo', { static: false }) heroVideo!: ElementRef<HTMLVideoElement>;
  
  services: {title: string, icon: SafeHtml, description: string, sectionId: string}[] = [];
  introSection: {title: string, icon: SafeHtml, paragraphs: string[]} = {} as any;
  chevronDownIcon: SafeHtml = {} as any;
  
  // Contact icons
  phoneIcon: SafeHtml = {} as any;
  emailIcon: SafeHtml = {} as any;
  locationIcon: SafeHtml = {} as any;
  
  // Contact form properties
  contactForm!: FormGroup;
  isSubmitting = false;
  formSubmitted = false;
  
  // Video properties
  videoLoaded = false; // Start with false so fallback shows initially
  isMobile = false;
  currentVideoSrc = '/home-page-hero-video4-web-compressed.mp4'; // Using existing deployed video file
  videoRetryCount = 0;
  maxRetries = 3;
  videoLoadTimeout: ReturnType<typeof setTimeout> | null = null;
  videoLoadStartTime = 0;

  constructor(
    private sanitizer: DomSanitizer, 
    private router: Router,
    private animationService: AnimationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.scrollToTop();
    this.setupScrollHeader();
    this.setupParallaxEffect();
    this.detectMobile();
    this.setVideoSource();
    this.chevronDownIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.chevronDown);
    
    // Initialize contact icons
    this.phoneIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.phone);
    this.emailIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.email);
    this.locationIcon = this.sanitizer.bypassSecurityTrustHtml(ServiceIcons.location);
    
    // Initialize contact form
    this.setupContactForm();
    
    // Initialize animations after a short delay
    setTimeout(() => {
      this.animationService.initScrollAnimations();
      this.animationService.triggerPageLoadAnimations();
    }, 100);
    
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
        description: 'Strategic planning and execution of projects of all scopes and sizes.',
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

  scrollToIntro() {
    const introSection = document.getElementById('intro');
    if (introSection) {
      introSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
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

  scrollToContact(type: 'general' | 'consultation' = 'general') {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Pre-populate form based on button clicked
      setTimeout(() => {
        if (type === 'consultation') {
          this.contactForm.patchValue({
            serviceType: 'consultation',
            message: 'I would like to schedule a consultation to discuss my home management needs.'
          });
        }
      }, 500); // Small delay to ensure smooth scroll completes
    }
  }

  navigateToService(serviceIndex: number) {
    // Navigate to services page and scroll to specific service
    this.router.navigate(['/services']).then(() => {
      // Wait for navigation to complete, then scroll to the specific service
      setTimeout(() => {
        const serviceElement = document.querySelector(`.service-detail:nth-child(${serviceIndex + 1})`);
        if (serviceElement) {
          serviceElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    });
  }

  ngAfterViewInit() {
    // Ensure video is properly initialized after view is ready
    setTimeout(() => {
      this.initializeVideo();
    }, 100);
  }

  private initializeVideo() {
    if (!this.heroVideo?.nativeElement) {
      console.warn('[VIDEO] Hero video element not found');
      return;
    }

    const video = this.heroVideo.nativeElement;
    this.videoLoadStartTime = Date.now();
    
    console.log(`[VIDEO] Initializing video element. Expecting src: ${this.currentVideoSrc}`);
    
    // Setup timeout to detect if video isn't loading
    this.videoLoadTimeout = setTimeout(() => {
      if (!this.videoLoaded && !video.src) {
        console.error('[VIDEO] ⚠️ TIMEOUT: Video element has no source after 5 seconds');
        this.handleVideoLoadFailure('Video source not set');
      } else if (!this.videoLoaded && video.readyState === 0) {
        console.error('[VIDEO] ⚠️ TIMEOUT: Video source set but no data loaded after 5 seconds');
        this.handleVideoLoadFailure('Video not loading - possible network or server issue');
      }
    }, 5000);
    
    // Handle page visibility changes (when user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.videoLoaded && video.paused) {
        console.log('[VIDEO] Page became visible, attempting to restart video');
        this.attemptVideoPlay(video);
      }
    });
    
    // Setup loadstart event listener to monitor video loading
    video.addEventListener('loadstart', () => {
      console.log('[VIDEO] ✓ Video loading started');
    });
    
    // Setup progress listener for debugging
    video.addEventListener('progress', () => {
      if (video.buffered.length > 0) {
        const loadedPercent = (video.buffered.end(0) / video.duration) * 100;
        if (loadedPercent > 10) {
          console.log(`[VIDEO] Progress: ${loadedPercent.toFixed(0)}% buffered`);
        }
      }
    });
    
    // Try to play after a short delay to allow initial buffering
    setTimeout(() => {
      console.log('[VIDEO] Attempting initial play after initialization');
      this.attemptVideoPlay(video);
    }, 500);
    
    // Final check: if video isn't playing after 3 seconds, ensure fallback is shown or retry
    setTimeout(() => {
      this.checkVideoPlaybackStatus(video);
    }, 3000);
  }

  ngOnDestroy() {
    this.animationService.destroy();
  }

  // Video-related methods
  onVideoLoaded() {
    this.videoLoaded = true;
    if (this.videoLoadTimeout) {
      clearTimeout(this.videoLoadTimeout);
      this.videoLoadTimeout = null;
    }
    const loadTime = Date.now() - this.videoLoadStartTime;
    console.log(`[VIDEO] ✅ Hero video loaded successfully (${loadTime}ms)`);
  }

  onVideoError(event?: Event) {
    this.videoLoaded = false;
    const video = this.heroVideo?.nativeElement as HTMLVideoElement;
    
    if (video) {
      const errorCode = video.error?.code;
      const errorMessage = video.error?.message;
      let errorType = 'Unknown error';
      
      switch (errorCode) {
        case 1: errorType = 'MEDIA_ERR_ABORTED - Video loading was aborted'; break;
        case 2: errorType = 'MEDIA_ERR_NETWORK - Network error'; break;
        case 3: errorType = 'MEDIA_ERR_DECODE - Video decoding failed'; break;
        case 4: errorType = 'MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported'; break;
      }
      
      console.warn('[VIDEO] ❌ Hero video error:', {
        errorType,
        errorMessage,
        src: video.src,
        currentTime: video.currentTime,
        readyState: video.readyState,
        networkState: video.networkState
      });
      
      // Attempt retry if we haven't exceeded max retries
      this.handleVideoLoadFailure(`${errorType}: ${errorMessage}`);
    } else {
      console.warn('[VIDEO] ❌ Hero video failed to load, showing fallback background');
      this.handleVideoLoadFailure('Video element not accessible');
    }
  }

  private handleVideoLoadFailure(reason: string) {
    console.error(`[VIDEO] Handling video load failure: ${reason}`);
    
    if (this.videoRetryCount < this.maxRetries) {
      this.videoRetryCount++;
      const delayMs = 1000 * Math.pow(2, this.videoRetryCount - 1); // Exponential backoff: 1s, 2s, 4s
      
      console.log(`[VIDEO] Retry attempt ${this.videoRetryCount}/${this.maxRetries} in ${delayMs}ms`);
      console.error(`[VIDEO] Error details: ${reason}`);
      
      setTimeout(() => {
        if (this.heroVideo?.nativeElement) {
          const video = this.heroVideo.nativeElement;
          console.log(`[VIDEO] Retrying video load (attempt ${this.videoRetryCount})`);
          
          // Force clear and reload
          video.src = '';
          video.load();
          
          // Reset src and reload
          setTimeout(() => {
            video.src = this.currentVideoSrc;
            video.load();
          }, 100);
        }
      }, delayMs);
    } else {
      console.error('[VIDEO] ❌ Max retries exceeded. Fallback background will be shown.');
      this.videoLoaded = false;
    }
  }

  onVideoClick(event: Event) {
    const video = event.target as HTMLVideoElement;
    console.log('Video clicked, attempting to play');
    this.attemptVideoPlay(video);
  }

  private attemptVideoPlay(video: HTMLVideoElement) {
    console.log(`[VIDEO] Attempting to play. Paused: ${video.paused}, ReadyState: ${video.readyState}, NetworkState: ${video.networkState}`);
    
    if (video.paused) {
      // Ensure video properties are set correctly
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[VIDEO] ✅ Video is playing successfully');
          })
          .catch(error => {
            console.warn(`[VIDEO] ⚠️ Autoplay prevented - ${error.name}: ${error.message}`);
            // Try to play with user interaction
            this.setupVideoPlayOnInteraction(video);
          });
      } else {
        console.warn('[VIDEO] ⚠️ Play promise is undefined - older browser');
      }
    } else {
      console.log('[VIDEO] ✅ Video is already playing');
    }
  }

  private setupVideoPlayOnInteraction(video: HTMLVideoElement) {
    let setupAttempts = 0;
    const playOnInteraction = () => {
      setupAttempts++;
      console.log(`[VIDEO] User interaction detected (attempt ${setupAttempts}) - attempting play`);
      
      // Ensure video is still muted and has correct attributes
      video.muted = true;
      video.loop = true;
      
      video.play().then(() => {
        console.log('[VIDEO] ✅ Video started playing after user interaction');
        // Remove the event listeners once video starts playing
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('keydown', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
      }).catch(error => {
        console.error(`[VIDEO] ❌ Video play failed even after interaction - ${error.name}: ${error.message}`);
        // If video still fails, show fallback background
        this.videoLoaded = false;
      });
    };

    // Add event listeners for user interaction
    document.addEventListener('click', playOnInteraction, { once: true });
    document.addEventListener('touchstart', playOnInteraction, { once: true });
    document.addEventListener('keydown', playOnInteraction, { once: true });
    document.addEventListener('scroll', playOnInteraction, { once: true });
    
    console.log('[VIDEO] 🎬 Video will start playing on user interaction (click, touch, key, or scroll)');
  }

  private checkVideoPlaybackStatus(video: HTMLVideoElement) {
    const status = {
      videoLoaded: this.videoLoaded,
      paused: video.paused,
      readyState: video.readyState,
      networkState: video.networkState,
      src: video.src,
      duration: video.duration,
      currentTime: video.currentTime
    };
    
    console.log('[VIDEO] Status check:', status);
    
    if (this.videoLoaded && video.paused) {
      console.log('[VIDEO] ⚠️ Video loaded but not playing - setting up interaction handlers');
      this.setupVideoPlayOnInteraction(video);
    } else if (this.videoLoaded && !video.paused) {
      console.log('[VIDEO] ✅ Video is loaded and playing successfully');
    } else if (!this.videoLoaded) {
      console.log('[VIDEO] ℹ️ Video not loaded - fallback background will be visible');
    }
  }

  private detectMobile() {
    this.isMobile = window.innerWidth <= 767;
    
    // Listen for window resize to update mobile detection
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 767;
      
      // If mobile state changed, update video source
      if (wasMobile !== this.isMobile) {
        this.setVideoSource();
      }
    });
  }

  private setVideoSource() {
    // Using deployed video file - not versioned file which isn't in git
    const newSrc = '/home-page-hero-video4-web-compressed.mp4';
    
    if (this.currentVideoSrc !== newSrc) {
      this.currentVideoSrc = newSrc;
      console.log(`[VIDEO] Setting video source - ${newSrc}`);
      
      // If video element exists and is initialized, reload it
      if (this.heroVideo?.nativeElement) {
        const video = this.heroVideo.nativeElement;
        video.src = this.currentVideoSrc;
        video.load();
      }
    }
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
      const heroSection = document.querySelector('.hero') as HTMLElement;
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

  // Contact form methods
  private setupContactForm() {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      serviceType: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private setupParallaxEffect() {
    const heroSection = document.querySelector('.hero') as HTMLElement;
    if (!heroSection) return;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const heroHeight = heroSection.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Only apply parallax when hero is visible
      if (scrolled < heroHeight + windowHeight) {
        const parallaxSpeed = 0.2;
        const yPos = scrolled * parallaxSpeed;
        // Apply transform to the pseudo-element via CSS custom property
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

  submitForm() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.formSubmitted = false;
      
      // Simulate form submission
      setTimeout(() => {
        this.isSubmitting = false;
        this.formSubmitted = true;
        this.contactForm.reset();
        
        // Hide success message after 8 seconds
        setTimeout(() => {
          this.formSubmitted = false;
        }, 8000);
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      fullName: 'Full name',
      email: 'Email address',
      phone: 'Phone number',
      serviceType: 'Service type',
      message: 'Message'
    };
    return displayNames[fieldName] || fieldName;
  }
}