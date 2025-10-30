const mongoose = require('mongoose');

const postRevisionSchema = new mongoose.Schema({
  blogPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true,
    index: true
  },
  // Full snapshot of the post at this revision
  snapshot: {
    title: String,
    subtitle: String,
    author: String,
    category: String,
    tags: [String],
    featuredImage: String,
    introText: String,
    contentSections: [{
      heading: String,
      content: String
    }],
    metaDescription: String,
    published: Boolean,
    publishDate: Date,
    featured: Boolean
  },
  // Track what changed in this revision
  changes: [{
    field: String,        // e.g., 'title', 'contentSections', etc.
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  // Who made this change (admin user if available)
  changedBy: {
    type: String,
    default: 'Admin'
  },
  // Revision type
  revisionType: {
    type: String,
    enum: ['manual', 'autosave', 'scheduled_publish'],
    default: 'manual'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Keep only the last 50 revisions per post (cleanup on creation)
postRevisionSchema.post('save', async function(doc) {
  try {
    const revisionCount = await mongoose.model('PostRevision').countDocuments({
      blogPostId: doc.blogPostId
    });
    
    if (revisionCount > 50) {
      // Delete oldest revisions, keeping only the 50 most recent
      const revisionsToDelete = await mongoose.model('PostRevision')
        .find({ blogPostId: doc.blogPostId })
        .sort({ createdAt: 1 })
        .limit(revisionCount - 50);
      
      const idsToDelete = revisionsToDelete.map(r => r._id);
      await mongoose.model('PostRevision').deleteMany({
        _id: { $in: idsToDelete }
      });
    }
  } catch (error) {
    console.error('Error cleaning up old revisions:', error);
  }
});

module.exports = mongoose.model('PostRevision', postRevisionSchema);