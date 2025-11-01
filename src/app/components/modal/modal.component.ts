import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  isVisible = false;
  modalConfig: ModalConfig | null = null;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.modal$.subscribe((config) => {
      this.modalConfig = config;
      this.isVisible = !!config;
    });
  }

  onConfirm(): void {
    if (this.modalConfig?.onConfirm) {
      this.modalConfig.onConfirm();
    }
    this.close();
  }

  onCancel(): void {
    if (this.modalConfig?.onCancel) {
      this.modalConfig.onCancel();
    }
    this.close();
  }

  close(): void {
    this.modalService.hide();
  }

  // Prevent close when clicking on modal content
  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  getIconClass(): string {
    if (!this.modalConfig) return '';
    
    switch (this.modalConfig.type) {
      case 'success':
        return 'icon-success';
      case 'error':
        return 'icon-error';
      case 'warning':
        return 'icon-warning';
      case 'info':
        return 'icon-info';
      case 'confirm':
        return 'icon-confirm';
      default:
        return '';
    }
  }
}