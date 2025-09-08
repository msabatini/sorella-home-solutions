import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-minimal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 100px 20px; text-align: center; min-height: 60vh;">
      <h1>Contact Page - Minimal Test</h1>
      <p>If you can see this, the basic Angular routing is working!</p>
      <div style="background: #f0f0f0; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 8px;">
        <h2>Debug Info:</h2>
        <p>✅ Angular component loaded successfully</p>
        <p>✅ Template rendering works</p>
        <p>✅ Routing is functional</p>
      </div>
    </div>
  `
})
export class ContactMinimalComponent {
  constructor() {
    console.log('ContactMinimalComponent loaded successfully');
  }
}