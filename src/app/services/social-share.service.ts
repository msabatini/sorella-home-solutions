import { Injectable } from '@angular/core';

export interface ShareOptions {
  url: string;
  title: string;
  text?: string;
  hashtags?: string[];
  via?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialShareService {

  constructor() { }

  // Share on Facebook
  shareOnFacebook(options: ShareOptions): void {
    const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
    facebookUrl.searchParams.append('u', options.url);
    facebookUrl.searchParams.append('quote', options.title);
    
    window.open(facebookUrl.toString(), 'facebook-share', 'width=600,height=400');
  }

  // Share on Twitter/X
  shareOnTwitter(options: ShareOptions): void {
    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.append('url', options.url);
    twitterUrl.searchParams.append('text', options.text || options.title);
    if (options.hashtags && options.hashtags.length > 0) {
      twitterUrl.searchParams.append('hashtags', options.hashtags.join(','));
    }
    if (options.via) {
      twitterUrl.searchParams.append('via', options.via);
    }

    window.open(twitterUrl.toString(), 'twitter-share', 'width=550,height=420');
  }

  // Share on LinkedIn
  shareOnLinkedIn(options: ShareOptions): void {
    const linkedInUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
    linkedInUrl.searchParams.append('url', options.url);

    window.open(linkedInUrl.toString(), 'linkedin-share', 'width=600,height=400');
  }

  // Share on WhatsApp
  shareOnWhatsApp(options: ShareOptions): void {
    const whatsappUrl = new URL('https://wa.me/');
    const text = `${options.title}\n\n${options.url}`;
    whatsappUrl.searchParams.append('text', text);
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  // Share via Email
  shareViaEmail(options: ShareOptions): void {
    const subject = encodeURIComponent(options.title);
    const body = encodeURIComponent(`${options.text || options.title}\n\n${options.url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  // Copy to Clipboard
  copyToClipboard(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          () => resolve(true),
          () => resolve(false)
        );
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          resolve(true);
        } catch (err) {
          resolve(false);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    });
  }

  // Native Share API (for mobile and modern browsers)
  nativeShare(options: ShareOptions): Promise<void> {
    if (navigator.share) {
      return navigator.share({
        title: options.title,
        text: options.text || options.title,
        url: options.url
      }).catch(() => {
        // User cancelled or share failed
      });
    } else {
      return Promise.reject('Share API not supported');
    }
  }

  // Check if native share API is available
  isNativeShareAvailable(): boolean {
    return !!navigator.share;
  }

  // Get share count URL for various platforms (informational)
  getShareCountUrls(url: string) {
    return {
      facebook: `https://graph.facebook.com/?ids=${encodeURIComponent(url)}`,
      twitter: `https://cdn.api.twitter.com/1/urls/count.json?url=${encodeURIComponent(url)}`
    };
  }
}