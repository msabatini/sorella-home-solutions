import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  constructor(private router: Router) {}



  callPhone() {
    window.location.href = 'tel:+16175554663'; // (617) 555-HOME
  }

  sendEmail() {
    window.location.href = 'mailto:hello@sorellahomesolutions.com';
  }
}