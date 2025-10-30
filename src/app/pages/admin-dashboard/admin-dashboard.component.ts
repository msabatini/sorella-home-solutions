import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService, Admin } from '../../services/auth.service';
import { ServiceIcons } from '../../../assets/icons/service-icons';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentAdmin$!: Observable<Admin | null>;
  showGettingStarted = false;
  icons = ServiceIcons;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.currentAdmin$ = this.authService.currentAdmin$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  toggleGettingStarted(): void {
    this.showGettingStarted = !this.showGettingStarted;
  }

  setActiveHelpTab(): void {
    // Store in sessionStorage to notify settings component
    sessionStorage.setItem('activeAdminTab', 'help');
  }

  getSafeIcon(iconName: keyof typeof ServiceIcons) {
    return this.sanitizer.bypassSecurityTrustHtml(ServiceIcons[iconName]);
  }
}