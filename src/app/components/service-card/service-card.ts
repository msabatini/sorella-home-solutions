import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Service {
  title: string;
  description: string;
  icon: string;
  features: string[];
  price?: string;
}

@Component({
  selector: 'app-service-card',
  imports: [CommonModule],
  templateUrl: './service-card.html',
  styleUrl: './service-card.scss'
})
export class ServiceCard {
  @Input() service!: Service;
  @Input() expanded = false;

  toggleExpanded() {
    this.expanded = !this.expanded;
  }
}
