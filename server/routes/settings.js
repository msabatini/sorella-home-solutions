const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/auth');

// ============ GENERAL SETTINGS ============

// Get all settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = new Settings({
        categories: [
          { name: 'Seasonal Care' },
          { name: 'Move Management' },
          { name: 'Home Care' },
          { name: 'Concierge' },
          { name: 'Corporate Relocation' },
          { name: 'Tips & Advice' }
        ]
      });
      await settings.save();
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// Update general settings
router.put('/general', authMiddleware, async (req, res) => {
  try {
    const { siteName, siteEmail, sitePhone, siteDescription } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.siteName = siteName || settings.siteName;
    settings.siteEmail = siteEmail || settings.siteEmail;
    settings.sitePhone = sitePhone || settings.sitePhone;
    settings.siteDescription = siteDescription || settings.siteDescription;
    settings.updatedBy = req.user.id;

    await settings.save();

    res.json({
      success: true,
      message: 'General settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update general settings',
      error: error.message
    });
  }
});

// ============ CATEGORIES ============

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({
        categories: [
          { name: 'Seasonal Care' },
          { name: 'Move Management' },
          { name: 'Home Care' },
          { name: 'Concierge' },
          { name: 'Corporate Relocation' },
          { name: 'Tips & Advice' }
        ]
      });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings.categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Add new category
router.post('/categories', authMiddleware, async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Check if category already exists
    if (settings.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    settings.categories.push({
      name: name.trim(),
      description: description || '',
      icon: icon || ''
    });

    settings.updatedBy = req.user.id;
    await settings.save();

    res.json({
      success: true,
      message: 'Category added successfully',
      data: settings.categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add category',
      error: error.message
    });
  }
});

// Update category
router.put('/categories/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    const category = settings.categories.id(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.icon = icon || category.icon;

    settings.updatedBy = req.user.id;
    await settings.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: settings.categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// Delete category
router.delete('/categories/:id', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    const category = settings.categories.id(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    settings.categories.id(req.params.id).deleteOne();
    settings.updatedBy = req.user.id;
    await settings.save();

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: settings.categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

// ============ ADMIN ACCOUNT MANAGEMENT ============

// Get all admins
router.get('/admins', authMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: error.message
    });
  }
});

// Create new admin
router.post('/admins', authMiddleware, async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    // Validate input
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and email are required'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    const newAdmin = new Admin({
      username: username.toLowerCase(),
      password,
      email: email.toLowerCase(),
      role: role || 'editor'
    });

    await newAdmin.save();

    res.json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create admin account',
      error: error.message
    });
  }
});

// Update admin
router.put('/admins/:id', authMiddleware, async (req, res) => {
  try {
    const { email, role } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent removing the last admin
    if (role === 'editor' && req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote yourself from admin'
      });
    }

    admin.email = email || admin.email;
    admin.role = role || admin.role;

    await admin.save();

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update admin',
      error: error.message
    });
  }
});

// Delete admin
router.delete('/admins/:id', authMiddleware, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: error.message
    });
  }
});

// ============ EMAIL CONFIGURATION ============

// Get email configuration (without password for security)
router.get('/email-config', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    const emailConfig = { ...settings.emailConfig.toObject() };
    // Don't send password back to frontend
    delete emailConfig.smtpPassword;

    res.json({
      success: true,
      data: emailConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email configuration',
      error: error.message
    });
  }
});

// Update email configuration
router.put('/email-config', authMiddleware, async (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpFrom, smtpSecure } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.emailConfig = {
      smtpHost: smtpHost || settings.emailConfig.smtpHost,
      smtpPort: smtpPort || settings.emailConfig.smtpPort,
      smtpUser: smtpUser || settings.emailConfig.smtpUser,
      smtpPassword: smtpPassword || settings.emailConfig.smtpPassword,
      smtpFrom: smtpFrom || settings.emailConfig.smtpFrom,
      smtpSecure: smtpSecure !== undefined ? smtpSecure : settings.emailConfig.smtpSecure
    };

    settings.updatedBy = req.user.id;
    await settings.save();

    // Return without password
    const emailConfig = { ...settings.emailConfig.toObject() };
    delete emailConfig.smtpPassword;

    res.json({
      success: true,
      message: 'Email configuration updated successfully',
      data: emailConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update email configuration',
      error: error.message
    });
  }
});

module.exports = router;