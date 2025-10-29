import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, Category, Admin, EmailConfig, GeneralSettings } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss']
})
export class AdminSettingsComponent implements OnInit {
  activeTab: 'general' | 'categories' | 'admins' | 'email' = 'general';

  // General Settings
  generalForm!: FormGroup;
  generalLoading = false;
  generalSuccess: string | null = null;
  generalError: string | null = null;

  // Categories
  categories: Category[] = [];
  categoriesLoading = false;
  categoriesError: string | null = null;
  showCategoryForm = false;
  categoryForm!: FormGroup;
  editingCategoryId: string | null = null;
  categorySuccess: string | null = null;
  categoryDeleteConfirm: string | null = null;

  // Admins
  admins: Admin[] = [];
  adminsLoading = false;
  adminsError: string | null = null;
  showAdminForm = false;
  adminForm!: FormGroup;
  adminSuccess: string | null = null;
  adminDeleteConfirm: string | null = null;
  currentUserId: string | null = null;

  // Email Config
  emailForm!: FormGroup;
  emailLoading = false;
  emailSuccess: string | null = null;
  emailError: string | null = null;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    try {
      this.initializeForms();
      this.loadCurrentUser();
      this.loadSettings();
      this.loadCategories();
      this.loadAdmins();
      this.loadEmailConfig();
    } catch (error) {
      console.error('Error initializing settings component:', error);
    }
  }

  // ============ INITIALIZATION ============

  initializeForms(): void {
    this.generalForm = this.formBuilder.group({
      siteName: ['', [Validators.required, Validators.minLength(3)]],
      siteEmail: ['', [Validators.required, Validators.email]],
      sitePhone: ['', Validators.pattern(/^[\+]?[1-9][\d\s\-\(\)\.]{0,20}$/)],
      siteDescription: ['']
    });

    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      icon: ['']
    });

    this.adminForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['editor', Validators.required]
    });

    this.emailForm = this.formBuilder.group({
      smtpHost: ['', Validators.required],
      smtpPort: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
      smtpUser: ['', Validators.required],
      smtpPassword: [''],
      smtpFrom: ['', [Validators.required, Validators.email]],
      smtpSecure: [false]
    });
  }

  loadCurrentUser(): void {
    const admin = this.authService.getCurrentAdmin();
    this.currentUserId = admin?.id || null;
  }

  setActiveTab(tab: any): void {
    this.activeTab = tab as 'general' | 'categories' | 'admins' | 'email';
  }

  // ============ GENERAL SETTINGS ============

  loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (response) => {
        const settings = response.data;
        this.generalForm.patchValue({
          siteName: settings.siteName,
          siteEmail: settings.siteEmail,
          sitePhone: settings.sitePhone,
          siteDescription: settings.siteDescription
        });
      },
      error: (error) => {
        console.error('Error loading settings:', error);
      }
    });
  }

  saveGeneralSettings(): void {
    if (this.generalForm.invalid) {
      this.generalError = 'Please fill in all required fields correctly';
      return;
    }

    this.generalLoading = true;
    this.generalError = null;
    this.generalSuccess = null;

    const settings: GeneralSettings = this.generalForm.value;

    this.settingsService.updateGeneralSettings(settings).subscribe({
      next: (response) => {
        this.generalSuccess = 'Settings updated successfully!';
        this.generalLoading = false;

        setTimeout(() => {
          this.generalSuccess = null;
        }, 3000);
      },
      error: (error) => {
        this.generalError = error.error?.message || 'Failed to update settings';
        this.generalLoading = false;
      }
    });
  }

  // ============ CATEGORIES ============

  loadCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = null;

    this.settingsService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
        this.categoriesLoading = false;
      },
      error: (error) => {
        this.categoriesError = 'Failed to load categories';
        this.categoriesLoading = false;
      }
    });
  }

  openCategoryForm(): void {
    this.showCategoryForm = true;
    this.editingCategoryId = null;
    this.categoryForm.reset();
  }

  editCategory(category: Category): void {
    this.editingCategoryId = category._id || null;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      icon: category.icon || ''
    });
    this.showCategoryForm = true;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categorySuccess = null;
      return;
    }

    const categoryData: Category = this.categoryForm.value;

    if (this.editingCategoryId) {
      // Update existing category
      this.settingsService.updateCategory(this.editingCategoryId, categoryData).subscribe({
        next: (response) => {
          this.categories = response.data;
          this.categorySuccess = 'Category updated successfully!';
          this.resetCategoryForm();

          setTimeout(() => {
            this.categorySuccess = null;
          }, 2000);
        },
        error: (error) => {
          this.categorySuccess = error.error?.message || 'Failed to update category';
        }
      });
    } else {
      // Create new category
      this.settingsService.addCategory(categoryData).subscribe({
        next: (response) => {
          this.categories = response.data;
          this.categorySuccess = 'Category added successfully!';
          this.resetCategoryForm();

          setTimeout(() => {
            this.categorySuccess = null;
          }, 2000);
        },
        error: (error) => {
          this.categorySuccess = error.error?.message || 'Failed to add category';
        }
      });
    }
  }

  confirmDeleteCategory(id: string): void {
    this.categoryDeleteConfirm = id;
  }

  deleteCategory(id: string): void {
    this.settingsService.deleteCategory(id).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.categoryDeleteConfirm = null;
        this.categorySuccess = 'Category deleted successfully!';

        setTimeout(() => {
          this.categorySuccess = null;
        }, 2000);
      },
      error: (error) => {
        this.categorySuccess = error.error?.message || 'Failed to delete category';
        this.categoryDeleteConfirm = null;
      }
    });
  }

  cancelCategoryDelete(): void {
    this.categoryDeleteConfirm = null;
  }

  resetCategoryForm(): void {
    this.showCategoryForm = false;
    this.editingCategoryId = null;
    this.categoryForm.reset();
  }

  // ============ ADMIN ACCOUNTS ============

  loadAdmins(): void {
    this.adminsLoading = true;
    this.adminsError = null;

    this.settingsService.getAdmins().subscribe({
      next: (response) => {
        this.admins = response.data;
        this.adminsLoading = false;
      },
      error: (error) => {
        this.adminsError = 'Failed to load admin accounts';
        this.adminsLoading = false;
      }
    });
  }

  openAdminForm(): void {
    this.showAdminForm = true;
    this.adminForm.reset({ role: 'editor' });
  }

  saveAdmin(): void {
    if (this.adminForm.invalid) {
      return;
    }

    const adminData = this.adminForm.value;

    this.settingsService.createAdmin(adminData).subscribe({
      next: (response) => {
        this.adminSuccess = 'Admin account created successfully!';
        this.loadAdmins();
        this.resetAdminForm();

        setTimeout(() => {
          this.adminSuccess = null;
        }, 2000);
      },
      error: (error) => {
        this.adminSuccess = error.error?.message || 'Failed to create admin account';
      }
    });
  }

  confirmDeleteAdmin(id: string): void {
    this.adminDeleteConfirm = id;
  }

  deleteAdmin(id: string): void {
    this.settingsService.deleteAdmin(id).subscribe({
      next: (response) => {
        this.loadAdmins();
        this.adminDeleteConfirm = null;
        this.adminSuccess = 'Admin account deleted successfully!';

        setTimeout(() => {
          this.adminSuccess = null;
        }, 2000);
      },
      error: (error) => {
        this.adminSuccess = error.error?.message || 'Failed to delete admin account';
        this.adminDeleteConfirm = null;
      }
    });
  }

  cancelAdminDelete(): void {
    this.adminDeleteConfirm = null;
  }

  resetAdminForm(): void {
    this.showAdminForm = false;
    this.adminForm.reset({ role: 'editor' });
  }

  isCurrentUser(id: string): boolean {
    return id === this.currentUserId;
  }

  // ============ EMAIL CONFIGURATION ============

  loadEmailConfig(): void {
    this.emailLoading = true;
    this.emailError = null;

    this.settingsService.getEmailConfig().subscribe({
      next: (response) => {
        this.emailForm.patchValue(response.data);
        this.emailLoading = false;
      },
      error: (error) => {
        this.emailError = 'Failed to load email configuration';
        this.emailLoading = false;
      }
    });
  }

  saveEmailConfig(): void {
    if (this.emailForm.invalid) {
      this.emailError = 'Please fill in all required fields correctly';
      return;
    }

    this.emailLoading = true;
    this.emailError = null;
    this.emailSuccess = null;

    const config = this.emailForm.value;

    this.settingsService.updateEmailConfig(config).subscribe({
      next: (response) => {
        this.emailSuccess = 'Email configuration updated successfully!';
        this.emailLoading = false;

        setTimeout(() => {
          this.emailSuccess = null;
        }, 3000);
      },
      error: (error) => {
        this.emailError = error.error?.message || 'Failed to update email configuration';
        this.emailLoading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // ============ HELPERS ============

  getAdminRoleLabel(role: string): string {
    return role === 'admin' ? 'Administrator' : 'Editor';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}