const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const settingsRoutes = require('./routes/settings');
const Admin = require('./models/Admin');

const app = express();
const PORT = process.env.PORT || 3002;

// ============ DATABASE CONNECTION & INITIALIZATION ============
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sorella-home-solutions';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    
    // Initialize admin user if not exists
    await initializeAdmin();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// ============ ADMIN INITIALIZATION ============
const initializeAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      return;
    }
    
    // Create default admin user
    const admin = new Admin({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'sorella123',
      email: 'admin@sorellahomesolutions.com',
      role: 'admin'
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    // Don't exit - server should still run even if admin initialization fails
  }
};

connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many contact form submissions, please try again later.'
  }
});

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Validation rules
const contactValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d\s\-\(\)\.]{0,20}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('serviceType')
    .optional()
    .isIn(['property-management', 'project-oversight', 'move-management', 'concierge', 'corporate-relocation', 'consultation', 'other'])
    .withMessage('Invalid service type'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
];

// Contact form endpoint
app.post('/api/contact', contactLimiter, contactValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullName, email, phone, serviceType, message } = req.body;

    // Create email transporter
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    // Service type display names
    const serviceDisplayNames = {
      'property-management': 'Property Management',
      'project-oversight': 'Project Management & Oversight',
      'move-management': 'Move Management',
      'concierge': 'Concierge Services',
      'corporate-relocation': 'Corporate Relocation',
      'consultation': 'Initial Consultation',
      'other': 'Other'
    };

    // Email content
    const emailSubject = `New Contact Form Submission - ${fullName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #0e2340; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Sorella Home Solutions</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 25px;">
            <h2 style="color: #0e2340; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #00a2ff; padding-bottom: 10px;">Contact Information</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #0e2340; display: inline-block; width: 120px;">Name:</strong>
              <span style="color: #333;">${fullName}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #0e2340; display: inline-block; width: 120px;">Email:</strong>
              <a href="mailto:${email}" style="color: #00a2ff; text-decoration: none;">${email}</a>
            </div>
            
            ${phone ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #0e2340; display: inline-block; width: 120px;">Phone:</strong>
              <a href="tel:${phone}" style="color: #00a2ff; text-decoration: none;">${phone}</a>
            </div>
            ` : ''}
            
            ${serviceType ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #0e2340; display: inline-block; width: 120px;">Service:</strong>
              <span style="color: #333;">${serviceDisplayNames[serviceType] || serviceType}</span>
            </div>
            ` : ''}
          </div>
          
          <div>
            <h3 style="color: #0e2340; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #00a2ff; padding-bottom: 8px;">Message</h3>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #00a2ff;">
              <p style="margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Submitted on ${new Date().toLocaleString('en-US', { 
                timeZone: 'America/New_York',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} EST
            </p>
          </div>
        </div>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: `"Sorella Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL || 'megan@sorellahomesolutions.com',
      subject: emailSubject,
      html: emailHtml,
      replyTo: email
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Send error response
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again or contact us directly.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Sorella Contact API'
  });
});

// ============ API ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sorella Contact API running on port ${PORT}`);
  console.log(`📧 Email configured for: ${process.env.EMAIL_USER || 'Not configured'}`);
  console.log(`📬 Recipient: ${process.env.RECIPIENT_EMAIL || 'megan@sorellahomesolutions.com'}`);
});

module.exports = app;