const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // General Settings
  siteName: {
    type: String,
    default: 'Sorella Home Solutions'
  },
  siteEmail: {
    type: String,
    default: 'info@sorellahomesolutions.com'
  },
  sitePhone: {
    type: String,
    default: ''
  },
  siteDescription: {
    type: String,
    default: ''
  },

  // Blog Categories
  categories: [{
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: String,
    icon: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Email Configuration
  emailConfig: {
    smtpHost: {
      type: String,
      default: ''
    },
    smtpPort: {
      type: Number,
      default: 587
    },
    smtpUser: {
      type: String,
      default: ''
    },
    smtpPassword: {
      type: String,
      default: ''
    },
    smtpFrom: {
      type: String,
      default: 'noreply@sorellahomesolutions.com'
    },
    smtpSecure: {
      type: Boolean,
      default: false
    }
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

// Update the updatedAt field on save
settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);