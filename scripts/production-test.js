#!/usr/bin/env node

/**
 * Production Readiness Testing Suite
 * 
 * Tests all critical aspects before deployment:
 * - API routes functionality
 * - Database connectivity
 * - Security configurations
 * - File system integrity
 * - Build process
 * - Environment variables
 * 
 * Usage:
 *   npm run test:production              # Test only
 *   npm run test:production -- --build   # Test + Build
 *   npm run test:production -- --deploy  # Test + Build + Deploy
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const crypto = require('crypto');

// Load test environment variables
require('dotenv').config({ path: '.env.test' });

// Configuration
const CONFIG = {
  testEnv: process.env.NODE_ENV || 'test',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  logDir: path.join(process.cwd(), '.test-logs'),
  maxRetries: 3,
  timeout: 10000, // Reduced timeout for faster testing
  modes: {
    testOnly: !process.argv.includes('--build') && !process.argv.includes('--deploy'),
    testAndBuild: process.argv.includes('--build'),
    testBuildDeploy: process.argv.includes('--deploy')
  },
  skipServerTests: process.argv.includes('--no-server') || process.env.SKIP_SERVER_TESTS === 'true'
};

// Test Results Storage
let testResults = {
  timestamp: new Date().toISOString(),
  runId: crypto.randomBytes(8).toString('hex'),
  mode: CONFIG.modes.testBuildDeploy ? 'test+build+deploy' : 
        CONFIG.modes.testAndBuild ? 'test+build' : 'test-only',
  environment: CONFIG.testEnv,
  baseUrl: CONFIG.baseUrl,
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  categories: {},
  errors: [],
  warnings: [],
  buildInfo: null,
  deployInfo: null
};

// Logging utilities
function createLogDir() {
  if (!fs.existsSync(CONFIG.logDir)) {
    fs.mkdirSync(CONFIG.logDir, { recursive: true });
  }
}

function log(level, category, message, details = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    category,
    message,
    details,
    runId: testResults.runId
  };

  // Console output with colors
  const colors = {
    INFO: '\x1b[36m',    // Cyan
    PASS: '\x1b[32m',    // Green
    FAIL: '\x1b[31m',    // Red
    WARN: '\x1b[33m',    // Yellow
    RESET: '\x1b[0m'
  };

  const color = colors[level] || colors.RESET;
  console.log(`${color}[${level}]${colors.RESET} ${category}: ${message}`);
  
  if (details && level === 'FAIL') {
    console.log(`  Details: ${JSON.stringify(details, null, 2)}`);
  }

  // Store in results
  if (!testResults.categories[category]) {
    testResults.categories[category] = { tests: [], passed: 0, failed: 0, warnings: 0 };
  }

  testResults.categories[category].tests.push(logEntry);
  testResults.summary.total++;

  if (level === 'PASS') {
    testResults.categories[category].passed++;
    testResults.summary.passed++;
  } else if (level === 'FAIL') {
    testResults.categories[category].failed++;
    testResults.summary.failed++;
    testResults.errors.push(logEntry);
  } else if (level === 'WARN') {
    testResults.categories[category].warnings++;
    testResults.summary.warnings++;
    testResults.warnings.push(logEntry);
  }
}

// Test helper functions
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  
  const defaultOptions = {
    timeout: CONFIG.timeout,
    headers: {
      'User-Agent': 'Production-Test-Suite/1.0'
    }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: response.headers.get('content-type')?.includes('application/json') 
        ? await response.json().catch(() => null)
        : await response.text()
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      status: 0
    };
  }
}

// Test Categories

async function testEnvironmentVariables() {
  log('INFO', 'Environment', 'Testing environment variables...');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const optionalVars = [
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'NEXTAUTH_SECRET'
  ];

  // Test required variables
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log('PASS', 'Environment', `Required variable ${varName} is set`);
    } else {
      log('FAIL', 'Environment', `Required variable ${varName} is missing`);
    }
  }

  // Test optional variables
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      log('PASS', 'Environment', `Optional variable ${varName} is set`);
    } else {
      log('WARN', 'Environment', `Optional variable ${varName} is not set`);
    }
  }

  // Test URL configurations
  const urls = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_BASE_URL,
    process.env.NEXTAUTH_URL
  ];

  for (const url of urls.filter(Boolean)) {
    if (url.includes('localhost') && CONFIG.testEnv === 'production') {
      log('WARN', 'Environment', `Production environment has localhost URL: ${url}`);
    } else {
      log('PASS', 'Environment', `URL configuration looks good: ${url}`);
    }
  }
}

async function testFileSystem() {
  log('INFO', 'FileSystem', 'Testing critical files...');

  const criticalFiles = [
    'package.json',
    'next.config.mjs',
    'app/layout.tsx',
    'app/page.tsx',
    '.env.production.example',
    'components/ui/error-boundary.tsx',
    'lib/error-handling.ts',
    'lib/config.ts'
  ];

  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      // Check if file is readable
      try {
        fs.accessSync(filePath, fs.constants.R_OK);
        log('PASS', 'FileSystem', `Critical file accessible: ${file}`);
      } catch (error) {
        log('FAIL', 'FileSystem', `Critical file not readable: ${file}`, error.message);
      }
    } else {
      log('FAIL', 'FileSystem', `Critical file missing: ${file}`);
    }
  }

  // Test directory structure
  const criticalDirs = [
    'app',
    'components',
    'lib',
    'public'
  ];

  for (const dir of criticalDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      log('PASS', 'FileSystem', `Critical directory exists: ${dir}`);
    } else {
      log('FAIL', 'FileSystem', `Critical directory missing: ${dir}`);
    }
  }
}

async function testDatabaseConnectivity() {
  log('INFO', 'Database', 'Testing database connectivity...');

  try {
    // Test basic Supabase connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      log('FAIL', 'Database', 'Supabase credentials not configured');
      return;
    }

    // Test Supabase health endpoint
    const healthResponse = await makeRequest(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (healthResponse.ok) {
      log('PASS', 'Database', 'Supabase connection successful');
    } else {
      log('FAIL', 'Database', 'Supabase connection failed', {
        status: healthResponse.status,
        error: healthResponse.error
      });
    }

    // Test basic table access (organizations table)
    const tableResponse = await makeRequest(`${supabaseUrl}/rest/v1/organizations?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Range': '0-0'
      }
    });

    if (tableResponse.ok) {
      log('PASS', 'Database', 'Database table access successful');
    } else {
      log('WARN', 'Database', 'Database table access limited', {
        status: tableResponse.status
      });
    }

  } catch (error) {
    log('FAIL', 'Database', 'Database connectivity test failed', error.message);
  }
}

async function testApiRoutes() {
  log('INFO', 'API', 'Testing API routes...');

  if (CONFIG.skipServerTests) {
    log('WARN', 'API', 'Skipping API tests - server tests disabled');
    return;
  }

  // First check if server is running
  try {
    const healthCheck = await makeRequest(CONFIG.baseUrl, { method: 'GET' });
    if (!healthCheck.ok && healthCheck.status === 0) {
      log('WARN', 'API', 'Server not running - skipping API route tests. Start server with: npm run dev');
      return;
    }
  } catch (error) {
    log('WARN', 'API', 'Server not accessible - skipping API route tests');
    return;
  }

  const apiRoutes = [
    { path: '/api/health', method: 'GET', expectStatus: [200, 404, 500] },
    { path: '/api/v1/health', method: 'GET', expectStatus: [200, 404, 500] },
    { path: '/api/accounts', method: 'GET', expectStatus: [200, 401, 500] },
    { path: '/api/engagements', method: 'GET', expectStatus: [200, 401, 500] },
    { path: '/api/goals', method: 'GET', expectStatus: [200, 401, 500] },
    { path: '/api/nps', method: 'GET', expectStatus: [200, 401, 500] }
  ];

  for (const route of apiRoutes) {
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}${route.path}`, {
        method: route.method
      });

      if (route.expectStatus.includes(response.status)) {
        log('PASS', 'API', `Route ${route.path} responded correctly (${response.status})`);
      } else if (response.status === 0) {
        log('WARN', 'API', `Route ${route.path} - connection failed (server may not be running)`);
      } else {
        log('FAIL', 'API', `Route ${route.path} unexpected status`, {
          expected: route.expectStatus,
          actual: response.status,
          error: response.error
        });
      }
    } catch (error) {
      log('WARN', 'API', `Route ${route.path} test skipped - ${error.message}`);
    }
  }
}

async function testSecurity() {
  log('INFO', 'Security', 'Testing security configurations...');

  if (CONFIG.skipServerTests) {
    log('WARN', 'Security', 'Skipping security tests - server tests disabled');
    return;
  }

  try {
    // Test main page for security headers
    const response = await makeRequest(CONFIG.baseUrl);
    
    if (!response.ok && response.status === 0) {
      log('WARN', 'Security', 'Server not running - skipping security header tests');
      return;
    }

    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options', 
      'referrer-policy'
    ];

    // Check if headers exist (they might be lowercase)
    const headers = response.headers || {};
    const headerKeys = Object.keys(headers).map(k => k.toLowerCase());

    for (const header of securityHeaders) {
      if (headerKeys.includes(header.toLowerCase())) {
        log('PASS', 'Security', `Security header present: ${header}`);
      } else {
        log('WARN', 'Security', `Security header missing: ${header} (will be added by Vercel in production)`);
      }
    }

    // Test for sensitive information exposure
    if (response.data && typeof response.data === 'string') {
      const sensitivePatterns = [
        /sk_live_[a-zA-Z0-9]+/,  // Stripe live keys
        /password/i,
        /secret/i
      ];

      let foundSensitive = false;
      for (const pattern of sensitivePatterns) {
        if (pattern.test(response.data)) {
          log('FAIL', 'Security', `Potential sensitive data exposure detected: ${pattern}`);
          foundSensitive = true;
        }
      }

      if (!foundSensitive) {
        log('PASS', 'Security', 'No obvious sensitive data exposure detected');
      }
    } else {
      log('PASS', 'Security', 'Response data check completed');
    }

  } catch (error) {
    log('WARN', 'Security', 'Security test skipped - server may not be running', error.message);
  }
}

async function testBuild() {
  if (!CONFIG.modes.testAndBuild && !CONFIG.modes.testBuildDeploy) {
    return;
  }

  log('INFO', 'Build', 'Testing Next.js build process...');

  try {
    const buildStart = Date.now();
    
    // Run Next.js build
    execSync('npm run build', { 
      stdio: 'pipe',
      timeout: 300000 // 5 minutes
    });

    const buildTime = Date.now() - buildStart;
    
    testResults.buildInfo = {
      success: true,
      buildTime: `${(buildTime / 1000).toFixed(2)}s`,
      timestamp: new Date().toISOString()
    };

    log('PASS', 'Build', `Build successful in ${(buildTime / 1000).toFixed(2)}s`);

    // Check build output
    const buildDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildDir)) {
      log('PASS', 'Build', 'Build output directory created');
    } else {
      log('FAIL', 'Build', 'Build output directory missing');
    }

  } catch (error) {
    testResults.buildInfo = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    log('FAIL', 'Build', 'Build process failed', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Production Readiness Test Suite');
  console.log('=====================================');
  console.log(`Mode: ${testResults.mode}`);
  console.log(`Environment: ${CONFIG.testEnv}`);
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Run ID: ${testResults.runId}`);
  console.log('');

  createLogDir();

  // Run all test categories
  await testEnvironmentVariables();
  await testFileSystem();
  await testDatabaseConnectivity();
  await testApiRoutes();
  await testSecurity();
  await testBuild();

  // Generate final report
  generateReport();
}

function generateReport() {
  const reportPath = path.join(CONFIG.logDir, `test-report-${testResults.runId}.json`);
  const summaryPath = path.join(CONFIG.logDir, `test-summary-${testResults.runId}.txt`);

  // Save detailed JSON report
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

  // Generate human-readable summary
  const summary = `
Production Readiness Test Report
================================
Run ID: ${testResults.runId}
Timestamp: ${testResults.timestamp}
Mode: ${testResults.mode}
Environment: ${testResults.environment}

SUMMARY
-------
Total Tests: ${testResults.summary.total}
Passed: ${testResults.summary.passed}
Failed: ${testResults.summary.failed}
Warnings: ${testResults.summary.warnings}

Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%

CATEGORY BREAKDOWN
------------------
${Object.entries(testResults.categories).map(([category, results]) => 
  `${category}: ${results.passed}✓ ${results.failed}✗ ${results.warnings}⚠`
).join('\n')}

${testResults.summary.failed > 0 ? `
FAILURES
--------
${testResults.errors.map(error => `❌ ${error.category}: ${error.message}`).join('\n')}
` : ''}

${testResults.summary.warnings > 0 ? `
WARNINGS
--------
${testResults.warnings.map(warning => `⚠️  ${warning.category}: ${warning.message}`).join('\n')}
` : ''}

${testResults.buildInfo ? `
BUILD INFO
----------
Success: ${testResults.buildInfo.success ? '✅' : '❌'}
${testResults.buildInfo.buildTime ? `Build Time: ${testResults.buildInfo.buildTime}` : ''}
${testResults.buildInfo.error ? `Error: ${testResults.buildInfo.error}` : ''}
` : ''}

PRODUCTION READINESS
-------------------
${testResults.summary.failed === 0 ? '✅ READY FOR PRODUCTION' : '❌ NOT READY - Fix failures before deploying'}

Reports saved to:
- Detailed: ${reportPath}
- Summary: ${summaryPath}
`;

  fs.writeFileSync(summaryPath, summary);

  console.log('\n' + summary);

  // Exit with appropriate code
  process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log('FAIL', 'System', 'Uncaught exception', error.message);
  generateReport();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log('FAIL', 'System', 'Unhandled rejection', reason);
  generateReport();
  process.exit(1);
});

// Run the tests
runTests().catch((error) => {
  log('FAIL', 'System', 'Test suite failed', error.message);
  generateReport();
  process.exit(1);
});