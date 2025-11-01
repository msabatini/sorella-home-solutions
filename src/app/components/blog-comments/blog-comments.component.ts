import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService, Comment } from '../../services/blog.service';

interface CaptchaState {
  problem: string;
  sessionId: number;
}

@Component({
  selector: 'app-blog-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-comments.component.html',
  styleUrls: ['./blog-comments.component.scss']
})
export class BlogCommentsComponent implements OnInit, OnDestroy {
  @Input() blogPostId: string = '';

  comments: Comment[] = [];
  isLoadingComments: boolean = false;
  commentsError: string | null = null;

  // Form state
  showCommentForm: boolean = false;
  formData = {
    author: '',
    email: '',
    content: ''
  };
  
  captcha: CaptchaState | null = null;
  captchaAnswer: string = '';
  isSubmittingComment: boolean = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

  // Reply state
  replyingTo: { commentId: string; authorName: string } | null = null;

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.loadComments();
  }

  ngOnDestroy() {
    // Clean up if needed
  }

  loadComments() {
    if (!this.blogPostId) return;

    this.isLoadingComments = true;
    this.commentsError = null;

    this.blogService.getComments(this.blogPostId, 1, 50).subscribe({
      next: (response) => {
        this.comments = response.data;
        this.isLoadingComments = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.commentsError = 'Failed to load comments';
        this.isLoadingComments = false;
      }
    });
  }

  generateCaptcha() {
    this.blogService.generateCaptcha().subscribe({
      next: (response) => {
        this.captcha = {
          problem: response.problem,
          sessionId: response.sessionId
        };
        this.captchaAnswer = '';
      },
      error: (error) => {
        console.error('Error generating captcha:', error);
        this.submitError = 'Failed to generate captcha';
      }
    });
  }

  toggleCommentForm() {
    this.showCommentForm = !this.showCommentForm;
    if (this.showCommentForm && !this.captcha) {
      this.generateCaptcha();
    }
    this.replyingTo = null;
    this.resetForm();
  }

  replyToComment(commentId: string, authorName: string) {
    this.showCommentForm = true;
    this.replyingTo = { commentId, authorName };
    if (!this.captcha) {
      this.generateCaptcha();
    }
  }

  cancelReply() {
    this.replyingTo = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      author: '',
      email: '',
      content: ''
    };
    this.captchaAnswer = '';
    this.submitError = null;
    this.submitSuccess = null;
  }

  submitComment() {
    // Validation
    if (!this.formData.author.trim()) {
      this.submitError = 'Name is required';
      return;
    }
    if (!this.formData.email.trim()) {
      this.submitError = 'Email is required';
      return;
    }
    if (!this.formData.content.trim()) {
      this.submitError = 'Comment content is required';
      return;
    }
    
    // Convert captchaAnswer to string and trim
    const captchaAnswerStr = String(this.captchaAnswer || '').trim();
    if (!this.captcha || !captchaAnswerStr) {
      this.submitError = 'Please answer the captcha';
      return;
    }

    this.submitError = null;
    this.isSubmittingComment = true;

    const commentPayload = {
      author: this.formData.author.trim(),
      email: this.formData.email.trim(),
      content: this.formData.content.trim(),
      captchaAnswer: captchaAnswerStr,
      captchaProblem: this.captcha.problem,
      parentCommentId: this.replyingTo?.commentId
    };

    this.blogService.addComment(this.blogPostId, commentPayload).subscribe({
      next: (response) => {
        this.isSubmittingComment = false;
        this.submitSuccess = this.replyingTo 
          ? 'Reply posted successfully!' 
          : 'Comment posted successfully!';
        this.resetForm();
        
        // Refresh comments after a short delay
        setTimeout(() => {
          this.loadComments();
          this.showCommentForm = false;
          this.submitSuccess = null;
        }, 1500);
      },
      error: (error) => {
        this.isSubmittingComment = false;
        const errorData = error.error;
        
        if (errorData?.code === 'CAPTCHA_FAILED') {
          this.submitError = 'Incorrect captcha answer. Please try again.';
          this.generateCaptcha();
        } else if (errorData?.code === 'SPAM_DETECTED') {
          this.submitError = 'Your comment contains flagged content. Please review and try again.';
        } else {
          this.submitError = errorData?.message || 'Failed to submit comment. Please try again.';
        }
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    const maskedName = name.substring(0, 2) + '*'.repeat(Math.max(0, name.length - 2));
    return `${maskedName}@${domain}`;
  }
}