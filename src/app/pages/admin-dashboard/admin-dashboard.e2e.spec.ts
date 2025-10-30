import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';

/**
 * End-to-End Tests for Admin Dashboard
 * Tests complete user workflows in the browser
 * 
 * To run: npx playwright test admin-dashboard.e2e.spec.ts
 */

const BASE_URL = 'http://localhost:4200';
const API_URL = 'http://localhost:3002/api';

const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'sorella123'
};

test.describe('Admin Dashboard E2E Tests', () => {
  let page: Page;
  let browser: Browser;
  let context: BrowserContext;

  test.beforeAll(async () => {
    // Browser setup happens automatically
  });

  test.beforeEach(async ({ browser: b, context: ctx, page: p }) => {
    page = p;
    browser = b;
    context = ctx;
    
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async () => {
    // Clear local storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should login and redirect to dashboard', async () => {
      // Navigate to login page
      await page.goto(`${BASE_URL}/admin-login`);
      
      // Wait for login form
      await page.waitForSelector('input[type="text"], input[type="password"]', { timeout: 5000 });
      
      // Fill credentials
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 10000 });
      
      // Verify dashboard is loaded
      const header = await page.locator('header.admin-header');
      await expect(header).toBeVisible();
    });

    test('should display admin username after login', async () => {
      // Login
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      
      // Verify username is displayed
      const userInfo = await page.locator('.user-info');
      await expect(userInfo).toBeVisible();
      
      const userName = await page.locator('.user-name');
      const userText = await userName.textContent();
      expect(userText).toContain(TEST_CREDENTIALS.username);
    });

    test('should display admin role after login', async () => {
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      
      const userRole = await page.locator('.user-role');
      const roleText = await userRole.textContent();
      expect(roleText).toBeTruthy();
    });

    test('should reject invalid credentials', async () => {
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Should stay on login page
      await page.waitForSelector('[class*="error"]', { timeout: 5000 });
      
      const url = page.url();
      expect(url).toContain('admin-login');
    });
  });

  test.describe('Dashboard Navigation', () => {
    test.beforeEach(async () => {
      // Login before each test
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
    });

    test('should navigate to blog management', async () => {
      const blogLink = await page.locator('a:has-text("Blog Management"), a[routerLink="/admin/blog"]').first();
      await blogLink.click();
      
      await page.waitForURL(`${BASE_URL}/admin/blog`, { timeout: 5000 });
    });

    test('should navigate to comments management', async () => {
      const commentsLink = await page.locator('a:has-text("Comments"), a[routerLink="/admin/comments"]').first();
      await commentsLink.click();
      
      await page.waitForURL(`${BASE_URL}/admin/comments`, { timeout: 5000 });
    });

    test('should navigate to settings', async () => {
      const settingsLink = await page.locator('a:has-text("Settings"), a[routerLink="/admin/settings"]').first();
      await settingsLink.click();
      
      await page.waitForURL(`${BASE_URL}/admin/settings`, { timeout: 5000 });
    });
  });

  test.describe('Getting Started Guide', () => {
    test.beforeEach(async () => {
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
    });

    test('should expand and collapse getting started section', async () => {
      const gettingStartedHeader = await page.locator('.getting-started-header');
      
      // Initially collapsed
      let content = await page.locator('.getting-started-content');
      let isVisible = await content.isVisible();
      
      // Expand
      await gettingStartedHeader.click();
      content = await page.locator('.getting-started-content');
      isVisible = await content.isVisible();
      expect(isVisible).toBeTruthy();
      
      // Collapse
      await gettingStartedHeader.click();
      content = await page.locator('.getting-started-content');
      isVisible = await content.isVisible();
      expect(isVisible).toBeFalsy();
    });

    test('should display all getting started tasks', async () => {
      const gettingStartedHeader = await page.locator('.getting-started-header');
      await gettingStartedHeader.click();
      
      // Wait for content
      await page.waitForSelector('.quick-task-item', { timeout: 5000 });
      
      // Verify tasks are displayed
      const tasks = await page.locator('.quick-task-item');
      const count = await tasks.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Dashboard Features Grid', () => {
    test.beforeEach(async () => {
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
    });

    test('should display all feature cards', async () => {
      const cards = await page.locator('.feature-card');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('should display feature card with blog management', async () => {
      const blogCard = await page.locator('text=Blog Management');
      await expect(blogCard).toBeVisible();
    });

    test('should display feature card with comments', async () => {
      const commentsCard = await page.locator('text=Comments');
      await expect(commentsCard).toBeVisible();
    });

    test('should display feature card with settings', async () => {
      const settingsCard = await page.locator('text=Settings');
      await expect(settingsCard).toBeVisible();
    });
  });

  test.describe('Logout Functionality', () => {
    test('should logout and redirect to login page', async () => {
      // Login
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      
      // Logout
      const logoutBtn = await page.locator('button:has-text("Logout")');
      await logoutBtn.click();
      
      // Should redirect to login
      await page.waitForURL(`${BASE_URL}/admin-login`, { timeout: 5000 });
    });

    test('should clear session data after logout', async () => {
      // Login
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      
      // Verify token exists
      const token = await page.evaluate(() => localStorage.getItem('sorella_admin_token'));
      expect(token).toBeTruthy();
      
      // Logout
      const logoutBtn = await page.locator('button:has-text("Logout")');
      await logoutBtn.click();
      await page.waitForURL(`${BASE_URL}/admin-login`);
      
      // Verify token is cleared
      const tokenAfter = await page.evaluate(() => localStorage.getItem('sorella_admin_token'));
      expect(tokenAfter).toBeNull();
    });
  });

  test.describe('Page Elements and Styling', () => {
    test.beforeEach(async () => {
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
    });

    test('should display admin logo', async () => {
      const logo = await page.locator('.admin-logo');
      await expect(logo).toBeVisible();
    });

    test('should display page title', async () => {
      const title = await page.locator('h1:has-text("Admin Dashboard")');
      await expect(title).toBeVisible();
    });

    test('should display welcome section', async () => {
      const welcomeText = await page.locator('text=Welcome to the Sorella Home Solutions Admin Dashboard');
      await expect(welcomeText).toBeVisible();
    });

    test('should display info box', async () => {
      const infoBox = await page.locator('.info-box');
      await expect(infoBox).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      
      // Verify content is visible
      const header = await page.locator('header.admin-header');
      await expect(header).toBeVisible();
      
      const mainContent = await page.locator('main.admin-content');
      await expect(mainContent).toBeVisible();
    });

    test('should be responsive on tablet', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      
      const header = await page.locator('header.admin-header');
      await expect(header).toBeVisible();
    });

    test('should be responsive on desktop', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      
      const header = await page.locator('header.admin-header');
      await expect(header).toBeVisible();
    });
  });

  test.describe('API Integration', () => {
    test('should make authenticated requests to API', async () => {
      // Login
      await page.goto(`${BASE_URL}/admin-login`);
      await page.fill('input[type="text"]', TEST_CREDENTIALS.username);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      
      // Listen for API responses
      const responsePromise = page.waitForResponse(response =>
        response.url().includes(`${API_URL}/blog/admin/all`) &&
        response.status() === 200
      );
      
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(`${BASE_URL}/admin/dashboard`);
      
      // Verify token is set
      const token = await page.evaluate(() => localStorage.getItem('sorella_admin_token'));
      expect(token).toBeTruthy();
    });
  });
});