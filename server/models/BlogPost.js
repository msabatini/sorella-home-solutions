const mongoose = require('mongoose');

const contentSectionSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { _id: false });

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    default: 'Sorella Home Solutions'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['Seasonal Care', 'Move Management', 'Home Care', 'Concierge', 'Corporate Relocation', 'Tips & Advice'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String,
    required: true
  },
  introText: {
    type: String,
    required: true
  },
  contentSections: [contentSectionSchema],
  readTime: {
    type: Number,
    required: true,
    default: 5
  },
  metaDescription: {
    type: String,
    trim: true
  },
  published: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: null
  },
  wordCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastAutoSavedAt: {
    type: Date,
    default: null
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  socialMeta: {
    ogTitle: {
      type: String,
      trim: true
    },
    ogDescription: {
      type: String,
      trim: true
    },
    ogImage: {
      type: String,
      trim: true
    },
    twitterTitle: {
      type: String,
      trim: true
    },
    twitterDescription: {
      type: String,
      trim: true
    },
    twitterImage: {
      type: String,
      trim: true
    },
    linkedinTitle: {
      type: String,
      trim: true
    },
    linkedinDescription: {
      type: String,
      trim: true
    },
    linkedinImage: {
      type: String,
      trim: true
    }
  }
});

// Auto-generate slug from title
blogPostSchema.pre('save', function(next) {
  console.log('Pre-save hook: slug generation - title:', this.title, 'current slug:', this.slug, 'isNew:', this.isNew);
  
  // For new documents or when title is provided, generate slug
  if (this.title) {
    const newSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (!this.slug || this.isModified('title') || this.isNew) {
      this.slug = newSlug;
      console.log('✓ Generated slug:', newSlug);
    }
  } else {
    console.log('⚠ Title is missing, cannot generate slug');
  }
  
  console.log('Pre-save hook: final slug value:', this.slug);
  this.updatedAt = Date.now();
  next();
});

// Calculate read time and word count based on content
blogPostSchema.pre('save', function(next) {
  if (this.isModified('introText') || this.isModified('contentSections')) {
    try {
      const introText = this.introText || '';
      const contentText = Array.isArray(this.contentSections) 
        ? this.contentSections.map(s => (s.heading || '') + ' ' + (s.content || '')).join(' ')
        : '';
      
      const totalText = introText + ' ' + contentText;
      const wordCount = totalText.trim().split(/\s+/).filter(w => w.length > 0).length;
      this.readTime = Math.max(1, Math.ceil(wordCount / 200)); // Average 200 words per minute
      this.wordCount = wordCount;
    } catch (err) {
      console.error('Error calculating read time:', err);
      this.readTime = 5;
      this.wordCount = 0;
    }
  }
  next();
});

module.exports = mongoose.model('BlogPost', blogPostSchema);