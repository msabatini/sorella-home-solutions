#!/usr/bin/env node

/**
 * Comprehensive Admin Dashboard API Test Suite
 * Tests all authentication, blog, and comments endpoints
 */

const http = require('http');
const https = require('https');

const API_BASE_URL = 'http://localhost:3002/api';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'sorella123';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: []
};

let authToken = null;

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test reporting function
function reportTest(name, passed, details = '') {
  testResults.total++;
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`${status} | ${name}${details ? ` (${details})` : ''}`);
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  testResults.tests.push({ name, passed, details });
}

// Main test execution
async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}🧪 ADMIN DASHBOARD API TEST SUITE${colors.reset}\n`);

  try {
    // ===== AUTHENTICATION TESTS =====
    console.log(`${colors.bright}📋 AUTHENTICATION TESTS${colors.reset}`);
    console.log('─'.repeat(50));

    // Test 1: Login
    console.log('\n→ Testing Login Endpoint...');
    let response = await makeRequest('POST', '/auth/login', {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });
    
    let loginPassed = response.status === 200 && response.data.success && response.data.token;
    reportTest('Login with valid credentials', loginPassed, `Status: ${response.status}`);
    
    if (loginPassed) {
      authToken = response.data.token;
      console.log(`  └─ Token obtained: ${authToken.substring(0, 20)}...`);
    }

    // Test 2: Failed Login
    response = await makeRequest('POST', '/auth/login', {
      username: ADMIN_USERNAME,
      password: 'wrongpassword'
    });
    reportTest('Login with invalid password fails', response.status === 401, `Status: ${response.status}`);

    // Test 3: Token Verification
    if (authToken) {
      response = await makeRequest('GET', '/auth/verify');
      reportTest('Token verification', response.status === 200 && response.data.success, `Status: ${response.status}`);
    }

    // ===== BLOG ENDPOINTS TESTS =====
    console.log(`\n${colors.bright}📚 BLOG ENDPOINTS TESTS${colors.reset}`);
    console.log('─'.repeat(50));

    // Test 4: Get public blog posts
    console.log('\n→ Testing Blog Endpoints...');
    response = await makeRequest('GET', '/blog?page=1&limit=10');
    reportTest('Get public blog posts', response.status === 200 && response.data.success, `Status: ${response.status}`);
    if (response.status === 200) {
      console.log(`  └─ Total posts: ${response.data.pagination?.total || 0}`);
    }

    // Test 5: Get blog categories
    response = await makeRequest('GET', '/blog/categories/list');
    reportTest('Get blog categories', response.status === 200 && response.data.success, `Status: ${response.status}`);
    if (response.status === 200 && response.data.data) {
      console.log(`  └─ Categories: ${response.data.data.join(', ')}`);
    }

    // Test 6: Get admin blog posts (requires auth)
    if (authToken) {
      response = await makeRequest('GET', '/blog/admin/all');
      reportTest('Get admin blog posts (authenticated)', response.status === 200 && response.data.success, `Status: ${response.status}`);
      if (response.status === 200) {
        console.log(`  └─ Total admin posts: ${response.data.pagination?.total || 0}`);
      }
    }

    // ===== COMMENTS TESTS =====
    console.log(`\n${colors.bright}💬 COMMENTS MANAGEMENT TESTS${colors.reset}`);
    console.log('─'.repeat(50));

    // Test 7: Get all comments (requires auth)
    if (authToken) {
      console.log('\n→ Testing Comments Endpoints...');
      response = await makeRequest('GET', '/blog/admin/comments/all');
      reportTest('Get all comments (authenticated)', response.status === 200 && response.data.success, `Status: ${response.status}`);
      if (response.status === 200) {
        console.log(`  └─ Total comments: ${response.data.pagination?.total || 0}`);
      }
    }

    // ===== AUTH GUARD TESTS =====
    console.log(`\n${colors.bright}🔒 AUTH GUARD TESTS${colors.reset}`);
    console.log('─'.repeat(50));

    // Test 8: Unauthorized access to admin endpoints
    console.log('\n→ Testing Protected Endpoints...');
    const savedToken = authToken;
    authToken = null; // Clear token to test unauthorized access

    response = await makeRequest('GET', '/blog/admin/all');
    reportTest('Admin endpoints blocked without token', response.status === 401 || response.status === 403, `Status: ${response.status}`);

    response = await makeRequest('GET', '/blog/admin/comments/all');
    reportTest('Comments endpoints blocked without token', response.status === 401 || response.status === 403, `Status: ${response.status}`);

    authToken = savedToken; // Restore token

    // ===== TEST RESULTS SUMMARY =====
    console.log(`\n${colors.bright}${colors.cyan}📊 TEST RESULTS SUMMARY${colors.reset}`);
    console.log('═'.repeat(50));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log('═'.repeat(50));

    if (testResults.failed === 0) {
      console.log(`\n${colors.bright}${colors.green}✨ ALL TESTS PASSED!${colors.reset}\n`);
    } else {
      console.log(`\n${colors.bright}${colors.red}⚠️  SOME TESTS FAILED${colors.reset}\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`${colors.red}Test execution error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});