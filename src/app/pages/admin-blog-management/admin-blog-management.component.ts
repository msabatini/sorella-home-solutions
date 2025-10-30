import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BlogService, BlogPost } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-blog-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  selectedPostIds: Set<string> = new Set();
  showBulkActionsMenu = false;
  bulkActionInProgress = false;
  bulkActionMessage: string | null = null;
  bulkDeleteConfirm = false;
  showCategorySelector = false;
  categories: string[] = ['Technology', 'Home Improvement', 'Design', 'DIY', 'Maintenance', 'Other'];

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router
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
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load blog posts';
        this.loading = false;
        console.error('Error loading posts:', error);
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
    this.deleteConfirmId = id;
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
      },
      error: (error) => {
        console.error('Error deleting post:', error);
        this.deleting = null;
      }
    });
  }

  togglePublish(post: BlogPost): void {
    const updated = { ...post, published: !post.published };
    
    this.blogService.updatePost(post._id, updated).subscribe({
      next: () => {
        post.published = !post.published;
      },
      error: (error) => {
        console.error('Error updating post:', error);
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

        this.bulkActionMessage = `✓ ${this.selectedPostIds.size} post(s) published successfully`;
        this.clearBulkSelection();
        this.bulkActionInProgress = false;

        // Clear message after 3 seconds
        setTimeout(() => this.bulkActionMessage = null, 3000);
      },
      error: (error) => {
        console.error('Bulk publish error:', error);
        this.bulkActionMessage = '✗ Failed to publish posts';
        this.bulkActionInProgress = false;
        setTimeout(() => this.bulkActionMessage = null, 3000);
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

        this.bulkActionMessage = `✓ ${this.selectedPostIds.size} post(s) unpublished successfully`;
        this.clearBulkSelection();
        this.bulkActionInProgress = false;

        setTimeout(() => this.bulkActionMessage = null, 3000);
      },
      error: (error) => {
        console.error('Bulk unpublish error:', error);
        this.bulkActionMessage = '✗ Failed to unpublish posts';
        this.bulkActionInProgress = false;
        setTimeout(() => this.bulkActionMessage = null, 3000);
      }
    });
  }

  bulkDelete(): void {
    if (!this.bulkDeleteConfirm) {
      this.bulkDeleteConfirm = true;
      return;
    }

    this.bulkActionInProgress = true;
    this.bulkActionMessage = null;

    this.blogService.bulkDelete(Array.from(this.selectedPostIds)).subscribe({
      next: () => {
        // Remove deleted posts from local list
        const idsToDelete = Array.from(this.selectedPostIds);
        this.posts = this.posts.filter(p => !idsToDelete.includes(p._id));

        this.bulkActionMessage = `✓ ${this.selectedPostIds.size} post(s) deleted successfully`;
        this.clearBulkSelection();
        this.bulkActionInProgress = false;
        this.bulkDeleteConfirm = false;

        setTimeout(() => this.bulkActionMessage = null, 3000);
      },
      error: (error) => {
        console.error('Bulk delete error:', error);
        this.bulkActionMessage = '✗ Failed to delete posts';
        this.bulkActionInProgress = false;
        this.bulkDeleteConfirm = false;
        setTimeout(() => this.bulkActionMessage = null, 3000);
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

        this.bulkActionMessage = `✓ Category updated for ${this.selectedPostIds.size} post(s)`;
        this.clearBulkSelection();
        this.bulkActionInProgress = false;

        setTimeout(() => this.bulkActionMessage = null, 3000);
      },
      error: (error) => {
        console.error('Bulk category update error:', error);
        this.bulkActionMessage = '✗ Failed to update category';
        this.bulkActionInProgress = false;
        setTimeout(() => this.bulkActionMessage = null, 3000);
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
}