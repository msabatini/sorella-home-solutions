#!/usr/bin/env node

const http = require('http');

const testData = JSON.stringify({
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '555-123-4567',
  serviceType: 'consultation',
  message: 'This is a test message to verify the contact form is working properly.'
});

const options = {
  hostname: 'localhost',
  port: 3002, // Test server port
  path: '/api/contact',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('🧪 Testing contact form endpoint (without email)...');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📊 Response Status:', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      console.log('✅ Response Body:', response);
      
      if (res.statusCode === 200 && response.success) {
        console.log('\n🎉 SUCCESS: Contact form validation and processing works perfectly!');
        console.log('📧 The only remaining step is to configure Gmail SMTP credentials');
      } else {
        console.log('\n❌ FAILED: Contact form endpoint returned an error');
      }
    } catch (error) {
      console.log('❌ Failed to parse response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(testData);
req.end();