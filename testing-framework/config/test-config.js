// Load environment variables from .env.local
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '../../.env.local');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.log('Dotenv error:', result.error);
} else {
  console.log('Loaded environment variables, TEST_ADMIN_EMAIL:', process.env.TEST_ADMIN_EMAIL);
}

// Fastenr Test Configuration
module.exports = {
  // Test Environment Configuration
  environments: {
    local: {
      baseUrl: 'http://localhost:3000',
      apiUrl: 'http://localhost:3000/api',
      database: 'local'
    },
    staging: {
      baseUrl: 'https://staging.fastenr.com',
      apiUrl: 'https://staging.fastenr.com/api',
      database: 'staging'
    },
    production: {
      baseUrl: 'https://fastenr.com',
      apiUrl: 'https://fastenr.com/api',
      database: 'production'
    }
  },

  // Test User Credentials (use environment variables in real implementation)
  testUsers: {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'test-admin@fastenr.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'TestPassword123!'
    },
    user: {
      email: process.env.TEST_USER_EMAIL || 'test-user@fastenr.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
    },
    superAdmin: {
      email: process.env.TEST_SUPER_ADMIN_EMAIL || 'adam@fastenr.com',
      password: process.env.TEST_SUPER_ADMIN_PASSWORD || 'SuperAdminPass123!'
    }
  },

  // Test Data Configuration
  testData: {
    users: {
      validUser: {
        email: process.env.TEST_USER_EMAIL || 'test-user@fastenr.com',
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
      },
      admin: {
        email: process.env.TEST_ADMIN_EMAIL || 'test-admin@fastenr.com',
        password: process.env.TEST_ADMIN_PASSWORD || 'TestPassword123!'
      },
      superAdmin: {
        email: process.env.TEST_SUPER_ADMIN_EMAIL || 'adam@fastenr.com',
        password: process.env.TEST_SUPER_ADMIN_PASSWORD || 'SuperAdminPass123!'
      }
    },
    organization: {
      name: 'Test Organization',
      domain: 'testorg.com'
    },
    account: {
      name: 'Test Account Inc',
      industry: 'Technology',
      size: 'Mid-market'
    },
    contact: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@testaccount.com',
      role: 'Decision Maker'
    }
  },

  // Automation Settings
  automation: {
    timeout: 30000,
    retries: 2,
    headless: true,
    screenshot: true,
    video: false,
    slowMo: 0
  },

  // Reporting Configuration
  reporting: {
    outputDir: './testing-framework/reports',
    formats: ['json', 'html', 'csv'],
    includeScreenshots: true,
    includeVideos: false
  },

  // Test Categories and Automation Levels
  testCategories: {
    critical: {
      runInCI: true,
      timeout: 60000,
      retries: 3
    },
    high: {
      runInCI: true,
      timeout: 45000,
      retries: 2
    },
    medium: {
      runInCI: false,
      timeout: 30000,
      retries: 1
    },
    low: {
      runInCI: false,
      timeout: 15000,
      retries: 1
    }
  }
};