import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BlogService, BlogPost } from '../../services/blog.service';

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

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;

    // Get all posts (we'll fetch with a high limit to show all)
    this.blogService.getPosts(1, 100).subscribe({
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
}