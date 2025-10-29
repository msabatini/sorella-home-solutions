import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';

interface Comment {
  _id: string;
  author: string;
  email: string;
  content: string;
  blogPostId: string;
  blogPostTitle: string;
  approved: boolean;
  createdAt: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-admin-comments-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-comments-management.component.html',
  styleUrls: ['./admin-comments-management.component.scss']
})
export class AdminCommentsManagementComponent implements OnInit {
  comments: Comment[] = [];
  filteredComments: Comment[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  filterStatus: 'all' | 'approved' | 'pending' = 'all';
  selectedCommentId: string | null = null;
  processingCommentId: string | null = null;

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    this.error = null;
    
    this.blogService.getAllComments().subscribe({
      next: (response) => {
        this.comments = response.data || response;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.error = 'Failed to load comments. Please try again.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredComments = this.comments.filter(comment => {
      const matchesSearch = 
        comment.author.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        comment.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        comment.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        comment.blogPostTitle.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = 
        this.filterStatus === 'all' ||
        (this.filterStatus === 'approved' && comment.approved) ||
        (this.filterStatus === 'pending' && !comment.approved);

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  setFilterStatus(status: any): void {
    this.filterStatus = status as 'all' | 'approved' | 'pending';
    this.onFilterChange();
  }

  approveComment(comment: Comment): void {
    if (!comment._id) return;
    
    this.processingCommentId = comment._id;
    this.blogService.approveComment(comment._id).subscribe({
      next: () => {
        comment.approved = true;
        this.showNotification('Comment approved successfully', 'success');
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error approving comment:', err);
        this.showNotification('Failed to approve comment', 'error');
      },
      complete: () => {
        this.processingCommentId = null;
      }
    });
  }

  rejectComment(comment: Comment): void {
    if (!comment._id) return;
    
    this.processingCommentId = comment._id;
    this.blogService.rejectComment(comment._id).subscribe({
      next: () => {
        comment.approved = false;
        this.showNotification('Comment rejected successfully', 'success');
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error rejecting comment:', err);
        this.showNotification('Failed to reject comment', 'error');
      },
      complete: () => {
        this.processingCommentId = null;
      }
    });
  }

  deleteComment(comment: Comment): void {
    if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      if (!comment._id) return;
      
      this.processingCommentId = comment._id;
      this.blogService.deleteComment(comment._id).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c._id !== comment._id);
          this.applyFilters();
          this.showNotification('Comment deleted successfully', 'success');
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
          this.showNotification('Failed to delete comment', 'error');
        },
        complete: () => {
          this.processingCommentId = null;
        }
      });
    }
  }

  viewBlogPost(blogPostId: string): void {
    this.router.navigate(['/admin/blog', blogPostId]);
  }

  toggleCommentDetails(commentId: string): void {
    this.selectedCommentId = this.selectedCommentId === commentId ? null : commentId;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    // This can be enhanced with a toast notification service
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}