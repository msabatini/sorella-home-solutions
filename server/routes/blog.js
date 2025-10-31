const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const BlogPost = require('../models/BlogPost');
const PostRevision = require('../models/PostRevision');
const Comment = require('../models/Comment');
const { authenticateToken } = require('../middleware/auth');

// Helper function to track changes and create revision
async function createPostRevision(postId, oldPost, newPost, revisionType = 'manual', changedBy = 'Admin') {
  try {
    // Calculate what changed
    const changes = [];
    const fieldsToTrack = ['title', 'subtitle', 'author', 'category', 'tags', 'featuredImage', 'introText', 'contentSections', 'metaDescription', 'published', 'publishDate', 'featured'];
    
    fieldsToTrack.forEach(field => {
      const oldValue = oldPost[field];
      const newValue = newPost[field];
      
      // Compare based on field type
      let changed = false;
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        changed = JSON.stringify(oldValue) !== JSON.stringify(newValue);
      } else if (typeof oldValue === 'object' && typeof newValue === 'object') {
        changed = JSON.stringify(oldValue) !== JSON.stringify(newValue);
      } else {
        changed = oldValue !== newValue;
      }
      
      if (changed) {
        changes.push({
          field,
          oldValue,
          newValue
        });
      }
    });
    
    // Only create revision if something actually changed
    if (changes.length > 0) {
      const revision = new PostRevision({
        blogPostId: postId,
        snapshot: {
          title: newPost.title,
          subtitle: newPost.subtitle,
          author: newPost.author,
          category: newPost.category,
          tags: newPost.tags,
          featuredImage: newPost.featuredImage,
          introText: newPost.introText,
          contentSections: newPost.contentSections,
          metaDescription: newPost.metaDescription,
          published: newPost.published,
          publishDate: newPost.publishDate,
          featured: newPost.featured
        },
        changes,
        revisionType,
        changedBy
      });
      
      await revision.save();
      return revision;
    }
  } catch (error) {
    console.error('Error creating post revision:', error);
    // Don't throw - revision tracking shouldn't break the main operation
  }
}

// ============ PUBLIC ENDPOINTS ============

// Get all published blog posts with pagination, filtering, and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search, sortBy = 'date' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const now = new Date();

    let query = { 
      published: true,
      $or: [
        { publishDate: null }, // Posts with no scheduled date (publish immediately)
        { publishDate: { $lte: now } } // Posts where publish date has passed
      ]
    };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Search in title, subtitle, and intro
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { introText: { $regex: search, $options: 'i' } }
      ];
    }

    // Determine sort order (featured posts always first)
    let sortOrder = {};
    switch(sortBy) {
      case 'date':
        sortOrder = { featured: -1, date: -1 };
        break;
      case 'views':
        sortOrder = { featured: -1, views: -1 };
        break;
      case 'oldest':
        sortOrder = { featured: -1, date: 1 };
        break;
      default:
        sortOrder = { featured: -1, date: -1 };
    }

    const total = await BlogPost.countDocuments(query);
    const posts = await BlogPost.find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog posts'
    });
  }
});

// Get all categories (must come before /:idOrSlug to avoid route matching)
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      'Seasonal Care',
      'Move Management',
      'Home Care',
      'Concierge',
      'Corporate Relocation',
      'Tips & Advice'
    ];

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// Get related posts by category and tags (must come before /:idOrSlug)
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Find posts with same category or tags, excluding current post
    const related = await BlogPost.find({
      _id: { $ne: post._id },
      published: true,
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } }
      ]
    })
    .limit(3);

    res.json({
      success: true,
      data: related
    });

  } catch (error) {
    console.error('Error fetching related posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching related posts'
    });
  }
});

// ============ ADMIN ENDPOINTS (must come before /:idOrSlug catch-all) ============

// Get all blog posts for admin (including unpublished)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 100, search, includeUnpublished = true } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {}; // No published filter - get all posts

    // Search in title, subtitle, and intro
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { introText: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await BlogPost.countDocuments(query);
    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching all blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog posts'
    });
  }
});

// ============ ADMIN COMMENT MANAGEMENT ENDPOINTS (must come before /:idOrSlug catch-all) ============

// Get all comments (admin only)
router.get('/admin/comments/all', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Comment.countDocuments({});
    const comments = await Comment.find({})
      .populate('blogPostId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Map to include blogPostTitle for convenience
    const enrichedComments = comments.map(comment => ({
      ...comment.toObject(),
      blogPostTitle: comment.blogPostId?.title || 'Deleted Post'
    }));

    res.json({
      success: true,
      data: enrichedComments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching all comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments'
    });
  }
});

// Approve comment (admin only)
router.put('/admin/comments/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      message: 'Comment approved',
      data: comment
    });

  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving comment'
    });
  }
});

// Reject comment (admin only)
router.put('/admin/comments/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      id,
      { approved: false },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      message: 'Comment rejected',
      data: comment
    });

  } catch (error) {
    console.error('Error rejecting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting comment'
    });
  }
});

// Delete comment (admin only)
router.delete('/admin/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment'
    });
  }
});

// Get single blog post by ID or slug (comes last)
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    
    let post;
    // Try to find by ID first, then by slug
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      post = await BlogPost.findById(idOrSlug);
    } else {
      post = await BlogPost.findOne({ slug: idOrSlug });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    // Get comments
    const comments = await Comment.find({ blogPostId: post._id, approved: true }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: post,
      comments
    });

  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post'
    });
  }
});

// Add comment to blog post
router.post('/:id/comments', [
  body('author').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('content').trim().isLength({ min: 5, max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { author, email, content } = req.body;

    // Verify blog post exists
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Create comment
    const comment = new Comment({
      blogPostId: id,
      author,
      email,
      content
    });

    await comment.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
});

// Get comments for a blog post
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Comment.countDocuments({ blogPostId: id, approved: true });
    const comments = await Comment.find({ blogPostId: id, approved: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: comments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments'
    });
  }
});

// ============ ADMIN ENDPOINTS ============

// Create new blog post (requires authentication)
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('subtitle').trim().isLength({ min: 5, max: 300 }).withMessage('Subtitle must be between 5 and 300 characters'),
  body('author').trim().isLength({ min: 2, max: 100 }).withMessage('Author must be between 2 and 100 characters'),
  body('category').isIn(['Seasonal Care', 'Move Management', 'Home Care', 'Concierge', 'Corporate Relocation', 'Tips & Advice']).withMessage('Invalid category'),
  body('featuredImage').trim().notEmpty().withMessage('Featured image is required'),
  body('introText').trim().isLength({ min: 10, max: 1000 }).withMessage('Intro text must be between 10 and 1000 characters')
], async (req, res) => {
  try {
    console.log('POST /api/blog - Request body:', req.body);
    
    // Validate standard fields first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Express validator errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ' + errors.array().map(e => `${e.param}: ${e.msg}`).join(', '),
        errors: errors.array()
      });
    }

    // Validate contentSections separately with better error handling
    const { contentSections = [] } = req.body;
    
    if (!Array.isArray(contentSections)) {
      console.log('Content sections is not an array:', typeof contentSections, contentSections);
      return res.status(400).json({
        success: false,
        message: `Content sections must be an array, received: ${typeof contentSections}`
      });
    }

    if (contentSections.length === 0) {
      console.log('No content sections provided');
      return res.status(400).json({
        success: false,
        message: 'At least one content section is required'
      });
    }

    // Validate each section has heading and content
    for (let i = 0; i < contentSections.length; i++) {
      const section = contentSections[i];
      
      if (!section || typeof section !== 'object') {
        console.log(`Section ${i + 1} is invalid:`, section, typeof section);
        return res.status(400).json({
          success: false,
          message: `Content section ${i + 1}: invalid format (not an object)`
        });
      }

      if (!section.heading || typeof section.heading !== 'string' || !section.heading.trim()) {
        console.log(`Section ${i + 1} heading invalid:`, section.heading);
        return res.status(400).json({
          success: false,
          message: `Content section ${i + 1}: heading is required (non-empty text)`
        });
      }

      if (!section.content || typeof section.content !== 'string' || !section.content.trim()) {
        console.log(`Section ${i + 1} content invalid:`, section.content);
        return res.status(400).json({
          success: false,
          message: `Content section ${i + 1}: content is required (non-empty text)`
        });
      }
    }

    const { title, subtitle, author, category, featuredImage, introText, tags = [], metaDescription, published = true, date, publishDate, scheduleForLater, featured = false } = req.body;

    // Generate slug manually as fallback
    const generateSlug = (titleStr) => {
      return titleStr
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    // Calculate the actual publish date for display
    let actualDate = Date.now();
    let actualPublishDate = null;
    
    if (scheduleForLater && publishDate) {
      actualPublishDate = new Date(publishDate);
      actualDate = actualPublishDate; // Use publishDate as the display date
    } else if (date) {
      actualDate = new Date(date);
    }

    const blogPost = new BlogPost({
      title: title.trim(),
      slug: generateSlug(title), // Set slug explicitly
      subtitle: subtitle.trim(),
      author: author.trim(),
      category,
      featuredImage: featuredImage.trim(),
      introText: introText.trim(),
      contentSections: contentSections.map(section => ({
        heading: section.heading.trim(),
        content: section.content.trim()
      })),
      tags,
      metaDescription,
      published: scheduleForLater ? false : published,
      date: actualDate,
      publishDate: actualPublishDate,
      featured
    });

    console.log('Created BlogPost object with slug:', blogPost.slug);
    await blogPost.save();

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blogPost
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog post with this title already exists. Please use a different title.'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating blog post'
    });
  }
});

// Update blog post (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow modifying slug directly
    delete updates.slug;
    delete updates.createdAt;

    // Get the old post before updating
    const oldPost = await BlogPost.findById(id);
    if (!oldPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // If publishDate is being updated, sync it to the date field
    if (updates.publishDate) {
      updates.date = new Date(updates.publishDate);
      console.log('Syncing publishDate to date field:', updates.publishDate);
    }

    // Use findByIdAndUpdate with 'new' option to get the updated document
    // Note: We use runValidators:true but findByIdAndUpdate may not trigger all pre-save hooks
    const post = await BlogPost.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    // For extra safety, if publishDate was updated, explicitly set the date field
    if (updates.publishDate && post) {
      post.date = new Date(updates.publishDate);
      await post.save();
    }

    // Create revision after successful update
    await createPostRevision(id, oldPost.toObject(), post.toObject(), 'manual');

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: post
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog post'
    });
  }
});

// Delete blog post (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Also delete associated comments
    await Comment.deleteMany({ blogPostId: id });

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog post'
    });
  }
});

// Toggle featured status (requires authentication)
router.put('/:id/toggle-featured', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    post.featured = !post.featured;
    await post.save();

    res.json({
      success: true,
      message: `Blog post ${post.featured ? 'marked as' : 'unmarked from'} featured`,
      data: post
    });

  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling featured status'
    });
  }
});

// ============ REVISION HISTORY ENDPOINTS ============

// Get revisions for a blog post (requires authentication)
router.get('/:id/revisions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    // Verify post exists
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const revisions = await PostRevision.find({ blogPostId: id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: revisions
    });

  } catch (error) {
    console.error('Error fetching revisions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revisions'
    });
  }
});

// Get a specific revision (requires authentication)
router.get('/:id/revisions/:revisionId', authenticateToken, async (req, res) => {
  try {
    const { id, revisionId } = req.params;

    // Verify post exists
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const revision = await PostRevision.findOne({
      _id: revisionId,
      blogPostId: id
    });

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: 'Revision not found'
      });
    }

    res.json({
      success: true,
      data: revision
    });

  } catch (error) {
    console.error('Error fetching revision:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revision'
    });
  }
});

// Restore blog post to a previous revision (requires authentication)
router.post('/:id/restore/:revisionId', authenticateToken, async (req, res) => {
  try {
    const { id, revisionId } = req.params;

    // Get the revision
    const revision = await PostRevision.findOne({
      _id: revisionId,
      blogPostId: id
    });

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: 'Revision not found'
      });
    }

    // Get current post for history
    const currentPost = await BlogPost.findById(id);
    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Restore post data from snapshot
    const restoredPost = await BlogPost.findByIdAndUpdate(
      id,
      {
        title: revision.snapshot.title,
        subtitle: revision.snapshot.subtitle,
        author: revision.snapshot.author,
        category: revision.snapshot.category,
        tags: revision.snapshot.tags,
        featuredImage: revision.snapshot.featuredImage,
        introText: revision.snapshot.introText,
        contentSections: revision.snapshot.contentSections,
        metaDescription: revision.snapshot.metaDescription,
        published: revision.snapshot.published,
        publishDate: revision.snapshot.publishDate,
        featured: revision.snapshot.featured
      },
      { new: true, runValidators: true }
    );

    // Create a revision entry for this restore action
    await createPostRevision(
      id,
      currentPost.toObject(),
      restoredPost.toObject(),
      'manual',
      'Admin'
    );

    res.json({
      success: true,
      message: 'Blog post restored successfully',
      data: restoredPost
    });

  } catch (error) {
    console.error('Error restoring blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring blog post'
    });
  }
});

// Auto-save new blog post (requires authentication)
router.post('/autosave', authenticateToken, async (req, res) => {
  try {
    const { title, subtitle, author, category, featuredImage, introText, contentSections, tags = [], metaDescription, published = false, publishDate } = req.body;

    // Helper to generate slug
    const generateSlug = (titleStr) => {
      return titleStr
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    // Filter out empty content sections and ensure at least one valid section
    let validSections = (contentSections || [])
      .filter(s => s && typeof s === 'object')
      .filter(s => 
        s.heading && typeof s.heading === 'string' && s.heading.trim() && 
        s.content && typeof s.content === 'string' && s.content.trim()
      )
      .map(s => ({
        heading: s.heading.trim(),
        content: s.content.trim()
      }));
    
    // If no valid sections, create one placeholder to avoid schema validation error
    if (validSections.length === 0) {
      validSections = [{ heading: 'Content', content: 'Your content goes here...' }];
    }

    const titleValue = (title || 'Untitled Draft').trim();
    const blogPost = new BlogPost({
      title: titleValue,
      slug: generateSlug(titleValue), // Set slug explicitly
      subtitle: (subtitle || '').trim(),
      author: (author || 'Unknown').trim(),
      category: category || 'Tips & Advice',
      featuredImage: (featuredImage || '').trim(),
      introText: (introText || '').trim(),
      contentSections: validSections,
      tags: Array.isArray(tags) ? tags : [],
      metaDescription: metaDescription || '',
      published: false, // Always draft on autosave
      publishDate: publishDate ? new Date(publishDate) : null,
      lastAutoSavedAt: new Date()
    });

    console.log('Autosave: Created BlogPost with slug:', blogPost.slug);
    await blogPost.save();

    res.status(201).json({
      success: true,
      message: 'Blog post auto-saved',
      data: blogPost
    });

  } catch (error) {
    console.error('Error auto-saving blog post:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog post with this title already exists.'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error auto-saving blog post'
    });
  }
});

// Auto-save existing blog post (requires authentication)
router.put('/:id/autosave', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow modifying slug, createdAt, or published via autosave
    delete updates.slug;
    delete updates.createdAt;
    delete updates.published;
    
    // Filter out empty content sections if provided
    if (updates.contentSections && Array.isArray(updates.contentSections)) {
      updates.contentSections = updates.contentSections.filter(s => 
        s && s.heading && s.heading.trim() && s.content && s.content.trim()
      );
      
      // If no valid sections, keep the original or provide a placeholder
      if (updates.contentSections.length === 0) {
        delete updates.contentSections; // Keep the original sections
      } else {
        // Trim whitespace from sections
        updates.contentSections = updates.contentSections.map(section => ({
          heading: section.heading.trim(),
          content: section.content.trim()
        }));
      }
    }
    
    updates.lastAutoSavedAt = new Date();

    // Get old post before updating
    const oldPost = await BlogPost.findById(id);
    if (!oldPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const post = await BlogPost.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: false } // Skip validation on autosave
    );

    // Create revision for autosave
    await createPostRevision(id, oldPost.toObject(), post.toObject(), 'autosave');

    res.json({
      success: true,
      message: 'Blog post auto-saved',
      data: post
    });

  } catch (error) {
    console.error('Error auto-saving blog post:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog post with this title already exists.'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error auto-saving blog post'
    });
  }
});

// ============ BULK ACTIONS ENDPOINTS ============

// Bulk publish posts (requires authentication)
router.post('/admin/bulk/publish', authenticateToken, async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post IDs'
      });
    }

    const result = await BlogPost.updateMany(
      { _id: { $in: postIds } },
      { published: true },
      { multi: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} post(s) published successfully`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Error bulk publishing posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing posts'
    });
  }
});

// Bulk unpublish posts (requires authentication)
router.post('/admin/bulk/unpublish', authenticateToken, async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post IDs'
      });
    }

    const result = await BlogPost.updateMany(
      { _id: { $in: postIds } },
      { published: false },
      { multi: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} post(s) unpublished successfully`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Error bulk unpublishing posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error unpublishing posts'
    });
  }
});

// Bulk delete posts (requires authentication)
router.post('/admin/bulk/delete', authenticateToken, async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post IDs'
      });
    }

    // Delete posts
    const deleteResult = await BlogPost.deleteMany(
      { _id: { $in: postIds } }
    );

    // Also delete associated comments and revisions
    await Comment.deleteMany({ blogPostId: { $in: postIds } });
    await PostRevision.deleteMany({ blogPostId: { $in: postIds } });

    res.json({
      success: true,
      message: `${deleteResult.deletedCount} post(s) deleted successfully`,
      data: { deletedCount: deleteResult.deletedCount }
    });

  } catch (error) {
    console.error('Error bulk deleting posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting posts'
    });
  }
});

// Bulk update category (requires authentication)
router.post('/admin/bulk/category', authenticateToken, async (req, res) => {
  try {
    const { postIds, category } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post IDs'
      });
    }

    if (!category || typeof category !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const result = await BlogPost.updateMany(
      { _id: { $in: postIds } },
      { category },
      { multi: true }
    );

    res.json({
      success: true,
      message: `Category updated for ${result.modifiedCount} post(s)`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Error bulk updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
});

module.exports = router;