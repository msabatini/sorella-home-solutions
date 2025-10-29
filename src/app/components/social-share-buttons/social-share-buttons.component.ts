import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialShareService } from '../../services/social-share.service';

@Component({
  selector: 'app-social-share-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-share-buttons.component.html',
  styleUrls: ['./social-share-buttons.component.scss']
})
export class SocialShareButtonsComponent implements OnInit {
  @Input() url: string = '';
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() hashtags: string[] = ['SorellaHome', 'HomeServices'];
  
  isNativeShareAvailable: boolean = false;
  copyButtonText: string = 'Copy Link';
  showCopyFeedback: boolean = false;

  constructor(private socialShareService: SocialShareService) {}

  ngOnInit() {
    this.isNativeShareAvailable = this.socialShareService.isNativeShareAvailable();
  }

  shareOnFacebook() {
    this.socialShareService.shareOnFacebook({
      url: this.url,
      title: this.title,
      text: this.text
    });
  }

  shareOnTwitter() {
    this.socialShareService.shareOnTwitter({
      url: this.url,
      title: this.title,
      text: this.text,
      hashtags: this.hashtags,
      via: 'SorellaHome'
    });
  }

  shareOnLinkedIn() {
    this.socialShareService.shareOnLinkedIn({
      url: this.url,
      title: this.title,
      text: this.text
    });
  }

  shareOnWhatsApp() {
    this.socialShareService.shareOnWhatsApp({
      url: this.url,
      title: this.title,
      text: this.text
    });
  }

  shareViaEmail() {
    this.socialShareService.shareViaEmail({
      url: this.url,
      title: this.title,
      text: this.text
    });
  }

  nativeShare() {
    this.socialShareService.nativeShare({
      url: this.url,
      title: this.title,
      text: this.text
    });
  }

  async copyToClipboard() {
    const success = await this.socialShareService.copyToClipboard(this.url);
    if (success) {
      this.copyButtonText = '✓ Copied!';
      this.showCopyFeedback = true;
      setTimeout(() => {
        this.copyButtonText = 'Copy Link';
        this.showCopyFeedback = false;
      }, 2000);
    }
  }
}