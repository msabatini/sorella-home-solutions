# Blog Management System Documentation

## Overview

The Sorella Home Solutions website now includes a complete blog management system that allows admins to create, edit, and manage blog posts with a professional content editor interface.

## Features

### ✅ Implemented

- **Blog Post Management**
  - Create new blog posts
  - Edit existing blog posts
  - Delete blog posts with confirmation
  - Publish/unpublish posts instantly
  - Toggle publish status without page reload

- **Content Creation**
  - Title, subtitle, and author fields
  - Category selection (6 predefined categories)
  - Intro text with character counter
  - SEO meta description
  - Multiple content sections (add/remove dynamically)
  - Tags system (add/remove tags freely)

- **Featured Image Management**
  - Drag-and-drop image upload
  - Image preview
  - File validation (image type, max 5MB)
  - Remove image functionality
  - Automatic base64 encoding for storage

- **Admin Interface**
  - Blog management list view
  - Search/filter blog posts (by title, author, category)
  - Table with sortable columns
  - Status indicators (Published/Draft)
  - View count display
  - Quick edit/delete actions
  - Responsive mobile design

- **User Experience**
  - Form validation with error messages
  - Loading states
  - Success/error notifications
  - Auto-redirect after save
  - Unsaved changes protection (via browser)
  - Beautiful UI with smooth animations

## Accessing Blog Management

1. **Login** to admin panel: `http://localhost:4201/admin-login`
   - Username: `admin`
   - Password: `sorella123`

2. **Navigate to Blog Management**: `http://localhost:4201/admin/blog`
   - Or click "Manage Posts" on the admin dashboard

## Creating a New Blog Post

### Step 1: Start Creation
Click the **"+ New Post"** button on the blog management page.

You'll be taken to the blog form at: `http://localhost:4201/admin/blog/new`

### Step 2: Fill Basic Information
- **Title** (5-200 characters) - Main heading of your post
- **Subtitle** (5-300 characters) - Subheading/summary
- **Author** - Name of the person writing the post
- **Category** - Choose from 6 predefined categories:
  - Seasonal Care
  - Move Management
  - Home Care
  - Concierge
  - Corporate Relocation
  - Tips & Advice

### Step 3: Upload Featured Image
1. Click the image upload area
2. Select a PNG, JPG, or GIF image (max 5MB)
3. Image preview will appear
4. You can remove and upload a different image anytime

### Step 4: Add Intro & Meta
- **Intro Text** (10-1000 characters) - Introduction paragraph
- **Meta Description** (optional, max 160 characters) - For SEO

### Step 5: Add Tags
1. Type a tag name in the input field
2. Press Enter or click "Add" button
3. Tags appear as badges below
4. Click the × button on any tag to remove it

### Step 6: Create Content Sections
The form starts with one empty section.

For each section:
1. Add a **Heading** (section title)
2. Add **Content** (section body text)
3. Click **"Add Section"** to create more sections
4. Click **"Remove Section"** to delete a section (keep at least one)

### Step 7: Publish or Save as Draft
- Check **"Publish immediately"** to make it public right away
- Leave unchecked to save as draft

### Step 8: Save
Click **"Create Post"** button to save your new blog post.

You'll be redirected to the blog management list.

## Editing a Blog Post

1. Go to **Blog Management** (`/admin/blog`)
2. Find the post you want to edit
3. Click the **pencil icon** in the Actions column
4. Make your changes
5. Click **"Update Post"** to save

You can edit any field at any time, and toggle the publish status without leaving the form.

## Deleting a Blog Post

1. Go to **Blog Management**
2. Find the post to delete
3. Click the **trash icon** in the Actions column
4. A confirmation dialog appears
5. Click **"Yes"** to confirm deletion
6. The post and all associated comments will be deleted

> ⚠️ **Warning**: Deletion is permanent and cannot be undone.

## Publishing & Unpublishing

### Publish a Post
Click the **"Draft"** button in the Status column to make it public immediately.

The button will change to **"Published"** in green.

### Unpublish a Post
Click the **"Published"** button to remove it from public view.

The button will change to **"Draft"** in orange.

Posts can be toggled without reloading the page.

## Searching & Filtering

Use the search box at the top of the blog management page to find posts:
- Search by **title**
- Search by **author** name
- Search by **category**

Results update as you type.

## Content Best Practices

### Title
- Clear and descriptive
- Include relevant keywords for SEO
- 5-200 characters

### Subtitle
- Summarizes the post
- Appears in blog listings
- 5-300 characters

### Category
- Choose the most relevant category
- Helps with site organization
- Used for filtering and related posts

### Intro Text
- Hook the reader immediately
- First 100-150 characters visible in listings
- 10-1000 characters

### Content Sections
- Break content into digestible sections
- Each section should have a clear heading
- Use multiple sections for longer posts
- Recommended 2-5 sections per post

### Featured Image
- High-quality image (recommended 800x600px or larger)
- Visually represents the post content
- Used in post listings and at top of article
- PNG or JPG recommended for best quality

### Tags
- Use 2-5 tags per post
- Lowercase, single words or phrases
- Examples: "organizing", "moving-tips", "spring-cleaning"

### Meta Description
- 120-160 characters optimal
- Appears in search engine results
- Should include target keywords
- Call to action is helpful

## Database Structure

Blog posts are stored in MongoDB with the following schema:

```javascript
{
  _id: ObjectId,
  title: String,
  slug: String, // Auto-generated from title
  subtitle: String,
  author: String,
  date: Date,
  category: String,
  tags: [String],
  featuredImage: String, // Base64 encoded image
  introText: String,
  contentSections: [
    {
      heading: String,
      content: String
    }
  ],
  metaDescription: String,
  published: Boolean,
  views: Number,
  readTime: Number, // Auto-calculated
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public Endpoints

**GET `/api/blog`**
- Returns all published blog posts
- Query params: `page`, `limit`, `category`, `tag`, `search`, `sortBy`

**GET `/api/blog/:idOrSlug`**
- Returns single blog post
- Increments view count

**GET `/api/blog/:id/related`**
- Returns 3 related posts by category/tags

### Admin Endpoints (Requires Authentication)

**POST `/api/blog`**
- Creates new blog post
- Headers: `Authorization: Bearer <token>`

**PUT `/api/blog/:id`**
- Updates existing blog post
- Headers: `Authorization: Bearer <token>`

**DELETE `/api/blog/:id`**
- Deletes blog post and associated comments
- Headers: `Authorization: Bearer <token>`

## Technical Architecture

### Frontend Components

#### **AdminBlogManagementComponent** (`admin-blog-management/`)
- Displays list of all blog posts
- Search/filter functionality
- Edit and delete operations
- Publish/unpublish toggle
- Responsive table layout

#### **AdminBlogFormComponent** (`admin-blog-form/`)
- Form for creating/editing posts
- Image upload handling
- Dynamic content sections
- Tags management
- Form validation
- Success/error notifications

### Backend Integration

Blog management uses the existing blog API endpoints with JWT authentication:

```typescript
// BlogService methods
blogService.createPost(postData)
blogService.updatePost(id, postData)
blogService.deletePost(id)
blogService.getPosts(page, limit)
blogService.getPost(id)
```

The **AuthInterceptor** automatically attaches JWT tokens to all authenticated requests.

## Troubleshooting

### Issue: "Failed to load blog posts"
**Solution**:
- Verify backend server is running on port 3002
- Check MongoDB connection
- Ensure you're logged in with valid admin token

### Issue: Image upload fails
**Solution**:
- Check file size (max 5MB)
- Ensure file is a valid image (PNG, JPG, GIF)
- Try with a different image file

### Issue: "Blog post not found" when editing
**Solution**:
- Post may have been deleted
- Refresh the blog management page
- Check MongoDB for data integrity

### Issue: Can't delete a post
**Solution**:
- Ensure you have admin privileges
- Check network tab in DevTools for errors
- Try refreshing the page and trying again

### Issue: Form validation errors
**Solution**:
- Title must be 5-200 characters
- Subtitle must be 5-300 characters
- Intro text must be 10-1000 characters
- Featured image is required
- Category must be selected
- At least one content section required

## Performance Considerations

- Images are stored as base64 strings in the database
- For large-scale deployments, consider:
  - Storing images in external storage (AWS S3, Cloudinary)
  - Implementing image compression
  - Adding CDN for image delivery
  - Pagination for blog listing

## Future Enhancements

Planned features:
- Rich text editor (WYSIWYG)
- Markdown support
- Scheduled publishing
- Author profiles
- Post versioning/history
- SEO preview
- Bulk operations
- Image gallery/media library
- Post templates
- Analytics dashboard

## Security

- All admin operations require JWT authentication
- Tokens auto-attach via HTTP interceptor
- Backend validates all requests
- Password-protected admin accounts
- Token expiration: 7 days (configurable)

## Support

For issues or questions:
1. Check this documentation
2. Review browser console errors
3. Check server logs: `npm start` output
4. Verify database connection in MongoDB
5. Ensure all environment variables are set

## Quick Start Checklist

- [ ] Backend server running (`npm start` in `/server`)
- [ ] Frontend server running (`npm start`)
- [ ] Admin account initialized (`npm run init-admin`)
- [ ] Logged in to admin panel
- [ ] Navigated to `/admin/blog`
- [ ] Created first blog post
- [ ] Published the post
- [ ] Verified post appears on public blog page