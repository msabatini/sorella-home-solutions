const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');
const { authenticateToken } = require('../middleware/auth');

// ============ PUBLIC ENDPOINTS ============

// Get all published blog posts with pagination, filtering, and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search, sortBy = 'date' } = req.query;
    const skip = (page - 1) * limit;
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
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
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
    const { page = 1, limit = 100, search } = req.query;
    const skip = (page - 1) * limit;

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
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
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
    const skip = (page - 1) * limit;

    const total = await Comment.countDocuments({});
    const comments = await Comment.find({})
      .populate('blogPostId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
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
    const skip = (page - 1) * limit;

    const total = await Comment.countDocuments({ blogPostId: id, approved: true });
    const comments = await Comment.find({ blogPostId: id, approved: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: comments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
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
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('subtitle').trim().isLength({ min: 5, max: 300 }),
  body('author').trim().isLength({ min: 2, max: 100 }),
  body('category').isIn(['Seasonal Care', 'Move Management', 'Home Care', 'Concierge', 'Corporate Relocation', 'Tips & Advice']),
  body('featuredImage').trim().notEmpty(),
  body('introText').trim().isLength({ min: 10, max: 1000 }),
  body('contentSections').isArray()
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

    const { title, subtitle, author, category, featuredImage, introText, contentSections, tags = [], metaDescription, published = true, date, publishDate, scheduleForLater, featured = false } = req.body;

    const blogPost = new BlogPost({
      title,
      subtitle,
      author,
      category,
      featuredImage,
      introText,
      contentSections,
      tags,
      metaDescription,
      published: scheduleForLater ? false : published,
      date: date ? new Date(date) : Date.now(),
      publishDate: scheduleForLater && publishDate ? new Date(publishDate) : null,
      featured
    });

    await blogPost.save();

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blogPost
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blog post'
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

    const post = await BlogPost.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

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

// Auto-save new blog post (requires authentication)
router.post('/autosave', authenticateToken, async (req, res) => {
  try {
    const { title, subtitle, author, category, featuredImage, introText, contentSections, tags = [], metaDescription, published = false, publishDate } = req.body;

    const blogPost = new BlogPost({
      title: title || 'Untitled Draft',
      subtitle: subtitle || '',
      author: author || 'Unknown',
      category: category || 'Tips & Advice',
      featuredImage: featuredImage || '',
      introText: introText || '',
      contentSections: contentSections || [{ heading: '', content: '' }],
      tags,
      metaDescription,
      published: false, // Always draft on autosave
      publishDate: publishDate ? new Date(publishDate) : null,
      lastAutoSavedAt: new Date()
    });

    await blogPost.save();

    res.status(201).json({
      success: true,
      message: 'Blog post auto-saved',
      data: blogPost
    });

  } catch (error) {
    console.error('Error auto-saving blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error auto-saving blog post'
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
    
    updates.lastAutoSavedAt = new Date();

    const post = await BlogPost.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: false } // Skip validation on autosave
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post auto-saved',
      data: post
    });

  } catch (error) {
    console.error('Error auto-saving blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error auto-saving blog post'
    });
  }
});

module.exports = router;