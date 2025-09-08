import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-contact-simple',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main style="padding: 100px 20px; text-align: center; min-height: 60vh;">
      <h1>Contact Page Test</h1>
      <p>If you can see this, the basic contact component is working!</p>
      <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h2>Debug Info:</h2>
        <p>Component loaded successfully</p>
        <p>Header and Footer should be visible</p>
      </div>
    </main>
    <app-footer></app-footer>
  `
})
export class ContactSimpleComponent {
  constructor() {
    console.log('ContactSimpleComponent loaded');
  }
}