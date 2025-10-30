import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  subtitle: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  featuredImage: string;
  introText: string;
  contentSections: ContentSection[];
  readTime: number;
  wordCount: number;
  metaDescription: string;
  published: boolean;
  publishDate?: string | null;
  featured?: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  lastAutoSavedAt?: string | null;
}

export interface ContentSection {
  heading: string;
  content: string;
}

export interface PostRevisionChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface PostRevision {
  _id: string;
  blogPostId: string;
  snapshot: BlogPost;
  changes: PostRevisionChange[];
  changedBy: string;
  revisionType: 'manual' | 'autosave' | 'scheduled_publish';
  createdAt: string;
}

export interface Comment {
  _id: string;
  blogPostId: string;
  author: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

export interface BlogResponse {
  success: boolean;
  data: BlogPost | BlogPost[];
  message?: string;
}

export interface CommentsResponse {
  success: boolean;
  data: Comment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ListResponse {
  success: boolean;
  data: BlogPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}/blog`;

  constructor(private http: HttpClient) {}

  // Get all published blog posts
  getPosts(page: number = 1, limit: number = 10, category?: string, tag?: string, search?: string): Observable<ListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) {
      params = params.set('category', category);
    }
    if (tag) {
      params = params.set('tag', tag);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ListResponse>(this.apiUrl, { params });
  }

  // Get single blog post by ID or slug
  getPost(idOrSlug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${idOrSlug}`);
  }

  // Get related posts
  getRelatedPosts(id: string): Observable<BlogResponse> {
    return this.http.get<BlogResponse>(`${this.apiUrl}/${id}/related`);
  }

  // Add comment to blog post
  addComment(blogPostId: string, comment: { author: string; email: string; content: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${blogPostId}/comments`, comment);
  }

  // Get comments for blog post
  getComments(blogPostId: string, page: number = 1, limit: number = 10): Observable<CommentsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<CommentsResponse>(`${this.apiUrl}/${blogPostId}/comments`, { params });
  }

  // Create blog post (admin only) - token auto-added by interceptor
  createPost(post: any): Observable<BlogResponse> {
    return this.http.post<BlogResponse>(this.apiUrl, post);
  }

  // Update blog post (admin only) - token auto-added by interceptor
  updatePost(id: string, post: any): Observable<BlogResponse> {
    return this.http.put<BlogResponse>(`${this.apiUrl}/${id}`, post);
  }

  // Delete blog post (admin only) - token auto-added by interceptor
  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ADMIN COMMENT MANAGEMENT

  // Get all comments (admin only)
  getAllComments(page: number = 1, limit: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/admin/comments/all`, { params });
  }

  // Approve comment (admin only)
  approveComment(commentId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/comments/${commentId}/approve`, {});
  }

  // Reject comment (admin only)
  rejectComment(commentId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/comments/${commentId}/reject`, {});
  }

  // Delete comment (admin only)
  deleteComment(commentId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/comments/${commentId}`);
  }

  // Get all posts for admin (including unpublished)
  getAllPosts(page: number = 1, limit: number = 100): Observable<ListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('includeUnpublished', 'true');

    return this.http.get<ListResponse>(`${this.apiUrl}/admin/all`, { params });
  }

  // Auto-save blog post (admin only)
  autoSavePost(id: string | null, post: any): Observable<BlogResponse> {
    if (id && id !== 'new') {
      return this.http.put<BlogResponse>(`${this.apiUrl}/${id}/autosave`, post);
    } else {
      return this.http.post<BlogResponse>(`${this.apiUrl}/autosave`, post);
    }
  }

  // Toggle featured status (admin only)
  toggleFeatured(id: string): Observable<BlogResponse> {
    return this.http.put<BlogResponse>(`${this.apiUrl}/${id}/toggle-featured`, {});
  }

  // REVISION HISTORY (admin only)

  // Get revisions for a post
  getPostRevisions(postId: string, limit: number = 20): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(`${this.apiUrl}/${postId}/revisions`, { params });
  }

  // Get a specific revision
  getPostRevision(postId: string, revisionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${postId}/revisions/${revisionId}`);
  }

  // Restore post to a previous revision
  restorePostRevision(postId: string, revisionId: string): Observable<BlogResponse> {
    return this.http.post<BlogResponse>(`${this.apiUrl}/${postId}/restore/${revisionId}`, {});
  }
}