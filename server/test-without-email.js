#!/usr/bin/env node

// Test version that simulates email sending without actually sending emails
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3002; // Different port to avoid conflicts

// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many contact form submissions, please try again later.' }
});

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

// Test contact form endpoint (simulates email sending)
app.post('/api/contact', contactLimiter, contactValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullName, email, phone, serviceType, message } = req.body;

    // Simulate email sending (without actually sending)
    console.log('📧 SIMULATED EMAIL SEND:');
    console.log('To: megan@sorellahomesolutions.com');
    console.log('From:', fullName, '<' + email + '>');
    console.log('Service:', serviceType || 'Not specified');
    console.log('Phone:', phone || 'Not provided');
    console.log('Message:', message);
    console.log('---');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error processing your message. Please try again.'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Sorella Contact API (Test Mode)'
  });
});

app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log('📧 Email sending is SIMULATED (no actual emails sent)');
});