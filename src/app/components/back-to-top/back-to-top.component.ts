import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ServiceIcons } from '../../../assets/icons/service-icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './back-to-top.component.html',
  styleUrls: ['./back-to-top.component.scss']
})
export class BackToTopComponent implements OnInit, OnDestroy {
  isVisible = false;
  private scrollThreshold = 300; // Show button after scrolling 300px
  icons = ServiceIcons;
  isAdminLoggedIn = false;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkScrollPosition();
    // Check if admin is logged in
    this.authService.currentAdmin$.subscribe(admin => {
      this.isAdminLoggedIn = !!admin;
    });
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  private checkScrollPosition() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isVisible = scrollPosition > this.scrollThreshold;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  navigateToAdmin() {
    if (this.isAdminLoggedIn) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/admin-login']);
    }
  }

  getSafeIcon(iconName: keyof typeof ServiceIcons) {
    return this.sanitizer.bypassSecurityTrustHtml(ServiceIcons[iconName]);
  }
}