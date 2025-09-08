# Sorella Home Solutions - Contact Form Backend

This is the backend API for handling contact form submissions from the Sorella Home Solutions website.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your email configuration:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RECIPIENT_EMAIL=megan@sorellahomesolutions.com

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:4200
```

### 3. Gmail SMTP Setup

To use Gmail for sending emails, you need to:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in the `EMAIL_PASS` field (not your regular Gmail password)

### 4. Alternative Email Providers

If you prefer not to use Gmail, you can configure other SMTP providers by modifying the transporter in `server.js`:

#### For business email (cPanel/hosting provider):
```javascript
const transporter = nodemailer.createTransporter({
  host: 'mail.yourdomain.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

#### For SendGrid:
```javascript
const transporter = nodemailer.createTransporter({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### 5. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

### 6. Test the API

You can test the contact endpoint:

```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

## API Endpoints

### POST /api/contact
Handles contact form submissions.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "serviceType": "property-management",
  "message": "I'm interested in your services..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your message! We'll get back to you within 24 hours."
}
```

### GET /api/health
Health check endpoint.

## Security Features

- **Rate Limiting**: 5 requests per 15 minutes per IP
- **Input Validation**: All form fields are validated
- **CORS Protection**: Only allows requests from your frontend domain
- **Helmet**: Security headers for protection
- **Email Sanitization**: Prevents email injection attacks

## Production Deployment

1. Update `FRONTEND_URL` in `.env` to your production domain
2. Set `NODE_ENV=production`
3. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server.js --name "sorella-contact-api"
```

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**: Make sure you're using an App Password, not your regular Gmail password
2. **CORS errors**: Check that `FRONTEND_URL` matches your frontend domain exactly
3. **Rate limiting**: Wait 15 minutes or restart the server to reset rate limits during testing

### Logs:
The server logs all email sending attempts and errors to the console.