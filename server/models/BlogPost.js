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
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

// Calculate read time and word count based on content
blogPostSchema.pre('save', function(next) {
  if (this.isModified('introText') || this.isModified('contentSections')) {
    const totalText = this.introText + ' ' + 
      this.contentSections.map(s => s.heading + ' ' + s.content).join(' ');
    const wordCount = totalText.trim().split(/\s+/).filter(w => w.length > 0).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200)); // Average 200 words per minute
    this.wordCount = wordCount;
  }
  next();
});

module.exports = mongoose.model('BlogPost', blogPostSchema);