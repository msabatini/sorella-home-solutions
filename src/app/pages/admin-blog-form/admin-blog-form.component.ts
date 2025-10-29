import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService, BlogPost } from '../../services/blog.service';

interface ContentSection {
  heading: string;
  content: string;
}

@Component({
  selector: 'app-admin-blog-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-blog-form.component.html',
  styleUrls: ['./admin-blog-form.component.scss']
})
export class AdminBlogFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  postId: string | null = null;
  loading = false;
  submitted = false;
  error: string | null = null;
  success: string | null = null;
  savingBlog = false;

  imagePreview: string | null = null;
  fileUploadError: string | null = null;

  contentSections: ContentSection[] = [{ heading: '', content: '' }];
  tags: string[] = [];
  tagInput = '';

  categories = [
    'Seasonal Care',
    'Move Management',
    'Home Care',
    'Concierge',
    'Corporate Relocation',
    'Tips & Advice'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEdit = true;
        this.postId = params['id'];
        this.loadPost();
      }
    });
  }

  initializeForm(): void {
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      subtitle: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      category: ['', Validators.required],
      featuredImage: ['', Validators.required],
      introText: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      metaDescription: ['', [Validators.maxLength(160)]],
      published: [true]
    });
  }

  loadPost(): void {
    this.loading = true;

    this.blogService.getPost(this.postId!).subscribe({
      next: (response) => {
        const post = response.data;
        this.form.patchValue({
          title: post.title,
          subtitle: post.subtitle,
          author: post.author,
          category: post.category,
          featuredImage: post.featuredImage,
          introText: post.introText,
          metaDescription: post.metaDescription,
          published: post.published
        });

        this.imagePreview = post.featuredImage;
        this.contentSections = post.contentSections || [{ heading: '', content: '' }];
        this.tags = post.tags || [];

        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load blog post';
        this.loading = false;
        console.error('Error loading post:', error);
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.fileUploadError = 'Please select a valid image file';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.fileUploadError = 'File size must be less than 5MB';
      return;
    }

    this.fileUploadError = null;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.form.patchValue({ featuredImage: this.imagePreview });
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.form.patchValue({ featuredImage: '' });
  }

  addTag(): void {
    const tag = this.tagInput.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  addContentSection(): void {
    this.contentSections.push({ heading: '', content: '' });
  }

  removeContentSection(index: number): void {
    if (this.contentSections.length > 1) {
      this.contentSections.splice(index, 1);
    }
  }

  updateContentSection(index: number, field: 'heading' | 'content', value: string): void {
    this.contentSections[index][field] = value;
  }

  saveBlog(): void {
    this.submitted = true;
    this.error = null;
    this.success = null;

    if (this.form.invalid || this.contentSections.length === 0) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.savingBlog = true;

    const postData = {
      ...this.form.value,
      contentSections: this.contentSections,
      tags: this.tags
    };

    const request = this.isEdit
      ? this.blogService.updatePost(this.postId!, postData)
      : this.blogService.createPost(postData);

    request.subscribe({
      next: (response) => {
        this.success = this.isEdit ? 'Post updated successfully!' : 'Post created successfully!';
        this.savingBlog = false;

        setTimeout(() => {
          this.router.navigate(['/admin/blog']);
        }, 1500);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to save blog post';
        this.savingBlog = false;
        console.error('Error saving post:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/blog']);
  }
}