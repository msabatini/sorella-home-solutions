import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BlogService, BlogPost } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-admin-blog-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent],
  templateUrl: './admin-blog-management.component.html',
  styleUrls: ['./admin-blog-management.component.scss']
})
export class AdminBlogManagementComponent implements OnInit {
  posts: BlogPost[] = [];
  loading = true;
  error: string | null = null;
  deleteConfirmId: string | null = null;
  deleting: string | null = null;
  searchQuery = '';

  // Bulk Actions
  selectedPostIds = new Set<string>();
  showBulkActionsMenu = false;
  bulkActionInProgress = false;
  bulkActionMessage: string | null = null;
  bulkDeleteConfirm = false;
  showCategorySelector = false;
  categories: string[] = ['Technology', 'Home Improvement', 'Design', 'DIY', 'Maintenance', 'Other'];
  
  // Rank Management
  manualRanks: { [key: string]: number } = {};

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;

    // Get all posts including unpublished (admin only)
    this.blogService.getAllPosts(1, 100).subscribe({
      next: (response) => {
        this.posts = response.data;
        // Initialize manual ranks
        this.posts.forEach(post => {
          this.manualRanks[post._id] = post.sortOrder || 0;
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load blog posts';
        this.loading = false;
        this.modalService.showError('Error Loading Posts', 'Failed to load blog posts');
      }
    });
  }

  get filteredPosts(): BlogPost[] {
    if (!this.searchQuery) {
      return this.posts;
    }

    const query = this.searchQuery.toLowerCase();
    return this.posts.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query)
    );
  }

  createNewPost(): void {
    this.router.navigate(['/admin/blog/new']);
  }

  editPost(id: string): void {
    this.router.navigate(['/admin/blog', id]);
  }

  confirmDelete(id: string, event: Event): void {
    event.stopPropagation();
    
    this.modalService.showConfirm(
      'Delete Blog Post',
      'Are you sure you want to delete this blog post? This action cannot be undone.',
      'Delete',
      'Cancel'
    ).then(confirmed => {
      if (confirmed) {
        this.deletePost(id);
      }
    });
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deletePost(id: string): void {
    this.deleting = id;

    this.blogService.deletePost(id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p._id !== id);
        this.deleteConfirmId = null;
        this.deleting = null;
        this.modalService.showSuccess('Success', 'Blog post deleted successfully');
      },
      error: () => {
        this.deleting = null;
        this.modalService.showError('Error', 'Failed to delete blog post');
      }
    });
  }

  togglePublish(post: BlogPost): void {
    const updated = { ...post, published: !post.published };
    
    this.blogService.updatePost(post._id, updated).subscribe({
      next: () => {
        post.published = !post.published;
        const action = post.published ? 'published' : 'unpublished';
        this.modalService.showSuccess('Success', `Blog post ${action} successfully`);
      },
      error: () => {
        this.modalService.showError('Error', 'Failed to update blog post');
      }
    });
  }

  getStatusBadge(post: BlogPost): string {
    return post.published ? 'published' : 'draft';
  }

  getStatusLabel(post: BlogPost): string {
    return post.published ? 'Published' : 'Draft';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // BULK ACTIONS METHODS

  togglePostSelection(postId: string): void {
    if (this.selectedPostIds.has(postId)) {
      this.selectedPostIds.delete(postId);
    } else {
      this.selectedPostIds.add(postId);
    }
    this.showBulkActionsMenu = this.selectedPostIds.size > 0;
  }

  isPostSelected(postId: string): boolean {
    return this.selectedPostIds.has(postId);
  }

  toggleAllSelection(): void {
    if (this.selectedPostIds.size === this.filteredPosts.length && this.selectedPostIds.size > 0) {
      this.selectedPostIds.clear();
      this.showBulkActionsMenu = false;
    } else {
      this.filteredPosts.forEach(post => this.selectedPostIds.add(post._id));
      this.showBulkActionsMenu = this.selectedPostIds.size > 0;
    }
  }

  isAllSelected(): boolean {
    return this.filteredPosts.length > 0 && this.selectedPostIds.size === this.filteredPosts.length;
  }

  isIndeterminate(): boolean {
    return this.selectedPostIds.size > 0 && this.selectedPostIds.size < this.filteredPosts.length;
  }

  bulkPublish(): void {
    this.bulkActionInProgress = true;
    this.bulkActionMessage = null;

    this.blogService.bulkPublish(Array.from(this.selectedPostIds)).subscribe({
      next: () => {
        // Update local posts
        this.selectedPostIds.forEach(id => {
          const post = this.posts.find(p => p._id === id);
          if (post) {
            post.published = true;
          }
        });

        this.modalService.showSuccess('Success', `${this.selectedPostIds.size} post(s) published successfully`);
        this.clearBulkSelection();
        this.bulkActionInProgress = false;
      },
      error: () => {
        this.modalService.showError('Error', 'Failed to publish posts');
        this.bulkActionInProgress = false;
      }
    });
  }

  bulkUnpublish(): void {
    this.bulkActionInProgress = true;
    this.bulkActionMessage = null;

    this.blogService.bulkUnpublish(Array.from(this.selectedPostIds)).subscribe({
      next: () => {
        // Update local posts
        this.selectedPostIds.forEach(id => {
          const post = this.posts.find(p => p._id === id);
          if (post) {
            post.published = false;
          }
        });

        this.modalService.showSuccess('Success', `${this.selectedPostIds.size} post(s) unpublished successfully`);
        this.clearBulkSelection();
        this.bulkActionInProgress = false;
      },
      error: () => {
        this.modalService.showError('Error', 'Failed to unpublish posts');
        this.bulkActionInProgress = false;
      }
    });
  }

  bulkDelete(): void {
    if (!this.bulkDeleteConfirm) {
      this.modalService.showConfirm(
        'Delete Multiple Posts',
        `Are you sure you want to delete ${this.selectedPostIds.size} blog post(s)? This action cannot be undone.`,
        'Delete All',
        'Cancel'
      ).then(confirmed => {
        if (confirmed) {
          this.bulkDeleteConfirm = true;
          this.performBulkDelete();
        }
      });
      return;
    }
  }

  private performBulkDelete(): void {
    this.bulkActionInProgress = true;
    this.bulkActionMessage = null;

    this.blogService.bulkDelete(Array.from(this.selectedPostIds)).subscribe({
      next: () => {
        // Remove deleted posts from local list
        const idsToDelete = Array.from(this.selectedPostIds);
        this.posts = this.posts.filter(p => !idsToDelete.includes(p._id));

        this.modalService.showSuccess('Success', `${this.selectedPostIds.size} post(s) deleted successfully`);
        this.clearBulkSelection();
        this.bulkActionInProgress = false;
        this.bulkDeleteConfirm = false;
      },
      error: () => {
        this.modalService.showError('Error', 'Failed to delete posts');
        this.bulkActionInProgress = false;
        this.bulkDeleteConfirm = false;
      }
    });
  }

  bulkUpdateCategory(category: string): void {
    this.bulkActionInProgress = true;
    this.bulkActionMessage = null;
    this.showCategorySelector = false;

    this.blogService.bulkUpdateCategory(Array.from(this.selectedPostIds), category).subscribe({
      next: () => {
        // Update local posts
        this.selectedPostIds.forEach(id => {
          const post = this.posts.find(p => p._id === id);
          if (post) {
            post.category = category;
          }
        });

        this.modalService.showSuccess('Success', `Category updated for ${this.selectedPostIds.size} post(s)`);
        this.clearBulkSelection();
        this.bulkActionInProgress = false;
      },
      error: () => {
        this.modalService.showError('Error', 'Failed to update category');
        this.bulkActionInProgress = false;
      }
    });
  }

  clearBulkSelection(): void {
    this.selectedPostIds.clear();
    this.showBulkActionsMenu = false;
  }

  cancelBulkDelete(): void {
    this.bulkDeleteConfirm = false;
  }

  get selectedCount(): number {
    return this.selectedPostIds.size;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }

  updatePostRank(post: BlogPost): void {
    const newRank = this.manualRanks[post._id];
    
    // Validate input
    if (newRank === undefined || newRank === null || newRank < 0) {
      this.manualRanks[post._id] = post.sortOrder || 0;
      return;
    }

    // Only update if changed
    if (newRank === post.sortOrder) return;

    this.blogService.updateSortOrder(post._id, newRank).subscribe({
      next: () => {
        post.sortOrder = newRank;
        this.loadPosts(); // Reload to reflect new sorting
        this.modalService.showSuccess('Order Updated', `The blog post has been moved to position ${newRank}.`);
      },
      error: () => {
        this.modalService.showError('Error', 'Failed to update post order');
        this.manualRanks[post._id] = post.sortOrder || 0; // Reset on error
      }
    });
  }
}