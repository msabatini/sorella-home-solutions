import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { ModalComponent } from '../../components/modal/modal.component';

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
  imports: [CommonModule, FormsModule, ModalComponent],
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
    private router: Router,
    private modalService: ModalService
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
        this.error = 'Failed to load comments. Please try again.';
        this.loading = false;
        this.modalService.showError('Error Loading Comments', 'Failed to load comments. Please try again.');
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
        this.modalService.showSuccess('Success', 'Comment approved successfully');
        this.applyFilters();
      },
      error: (err) => {
        this.modalService.showError('Error', 'Failed to approve comment');
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
        this.modalService.showSuccess('Success', 'Comment rejected successfully');
        this.applyFilters();
      },
      error: (err) => {
        this.modalService.showError('Error', 'Failed to reject comment');
      },
      complete: () => {
        this.processingCommentId = null;
      }
    });
  }

  deleteComment(comment: Comment): void {
    if (!comment._id) return;

    this.modalService.showConfirm(
      'Delete Comment',
      'Are you sure you want to delete this comment? This action cannot be undone.',
      'Delete',
      'Cancel'
    ).then(confirmed => {
      if (confirmed) {
        this.processingCommentId = comment._id;
        this.blogService.deleteComment(comment._id).subscribe({
          next: () => {
            this.comments = this.comments.filter(c => c._id !== comment._id);
            this.applyFilters();
            this.modalService.showSuccess('Success', 'Comment deleted successfully');
          },
          error: (err) => {
            this.modalService.showError('Error', 'Failed to delete comment');
          },
          complete: () => {
            this.processingCommentId = null;
          }
        });
      }
    });
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}