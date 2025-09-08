# Gmail SMTP Setup Guide

## Step-by-Step Instructions

### 1. Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA (you'll need your phone)

### 2. Generate App Password
1. Still in **Security** settings, click **2-Step Verification**
2. Scroll down and click **App passwords**
3. Select **Mail** from the dropdown
4. Select **Other (Custom name)** and type "Sorella Contact Form"
5. Click **Generate**
6. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

### 3. Update Environment File
Edit `/server/.env`:

```env
# Replace with your Gmail address
EMAIL_USER=your-gmail@gmail.com

# Replace with the 16-character app password (no spaces)
EMAIL_PASS=abcdefghijklmnop

# This stays the same
RECIPIENT_EMAIL=megan@sorellahomesolutions.com
```

### 4. Test the Setup
1. Save the `.env` file
2. Restart the backend server: `cd server && npm start`
3. Visit `http://localhost:4200/contact`
4. Fill out and submit the test form
5. Check `megan@sorellahomesolutions.com` for the email

## Alternative: Business Email Setup

If you prefer to use a business email instead of Gmail:

```env
# For most hosting providers (like GoDaddy, Bluehost, etc.)
EMAIL_USER=contact@sorellahomesolutions.com
EMAIL_PASS=your-email-password

# SMTP settings might need to be customized in server.js
# Common settings:
# - Host: mail.sorellahomesolutions.com
# - Port: 587 (TLS) or 465 (SSL)
# - Secure: true for port 465, false for port 587
```

## Troubleshooting

### "Invalid login" error:
- Make sure 2FA is enabled
- Use the app password, not your regular Gmail password
- Remove any spaces from the app password

### "Less secure app access" error:
- This is outdated - use app passwords instead
- App passwords work even with "less secure apps" disabled

### Still not working?
- Try a different Gmail account
- Check if your hosting provider blocks outgoing SMTP
- Consider using a service like SendGrid or Mailgun for production

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- App passwords are safer than your main Gmail password
- You can revoke app passwords anytime in Google settings