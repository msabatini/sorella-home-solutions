const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  blogPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null // null = top-level comment, has value = reply to a comment
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  approved: {
    type: Boolean,
    default: true // Published immediately as per requirement
  },
  ipAddress: {
    type: String,
    default: null // For rate limiting and spam detection
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
commentSchema.index({ blogPostId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);