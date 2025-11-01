import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalConfig | null>(null);
  public modal$ = this.modalSubject.asObservable();

  constructor() {}

  show(config: ModalConfig): void {
    this.modalSubject.next(config);
  }

  hide(): void {
    this.modalSubject.next(null);
  }

  showSuccess(title: string, message: string): Promise<void> {
    return new Promise((resolve) => {
      this.show({
        title,
        message,
        type: 'success',
        confirmText: 'OK',
        onConfirm: () => {
          this.hide();
          resolve();
        }
      });
    });
  }

  showError(title: string, message: string): Promise<void> {
    return new Promise((resolve) => {
      this.show({
        title,
        message,
        type: 'error',
        confirmText: 'OK',
        onConfirm: () => {
          this.hide();
          resolve();
        }
      });
    });
  }

  showConfirm(title: string, message: string, confirmText = 'Confirm', cancelText = 'Cancel'): Promise<boolean> {
    return new Promise((resolve) => {
      this.show({
        title,
        message,
        type: 'confirm',
        confirmText,
        cancelText,
        onConfirm: () => {
          this.hide();
          resolve(true);
        },
        onCancel: () => {
          this.hide();
          resolve(false);
        }
      });
    });
  }

  showInfo(title: string, message: string): Promise<void> {
    return new Promise((resolve) => {
      this.show({
        title,
        message,
        type: 'info',
        confirmText: 'OK',
        onConfirm: () => {
          this.hide();
          resolve();
        }
      });
    });
  }

  showWarning(title: string, message: string): Promise<void> {
    return new Promise((resolve) => {
      this.show({
        title,
        message,
        type: 'warning',
        confirmText: 'OK',
        onConfirm: () => {
          this.hide();
          resolve();
        }
      });
    });
  }
}