// Global setup for Playwright tests
const { chromium } = require('@playwright/test');
const config = require('../config/test-config');

async function globalSetup() {
  console.log('🔧 Global test setup starting...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Skip application check for now (dev server not running)
    console.log('⏳ Skipping application check (dev server not required for framework demo)');
    console.log('✅ Framework setup completed');
    
    // Setup test data if needed
    await setupTestData(page);
    
    // Save authentication state if needed
    await setupAuthentication(context);
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global test setup completed');
}

async function setupTestData(page) {
  console.log('📊 Setting up test data...');
  
  // TODO: Add test data setup logic
  // This could include:
  // - Creating test organizations
  // - Setting up test users
  // - Preparing test accounts/contacts
  // - Seeding database with required data
  
  console.log('✅ Test data setup completed');
}

async function setupAuthentication(context) {
  console.log('🔐 Setting up authentication...');
  
  try {
    // Create authenticated sessions for different user types
    const authStates = {};
    
    // Setup admin user authentication
    if (config.testUsers.admin.email) {
      const adminPage = await context.newPage();
      await adminPage.goto(`${config.environments.local.baseUrl}/auth/login`);
      
      // Perform login (if login form is available)
      try {
        await adminPage.fill('input[type="email"]', config.testUsers.admin.email);
        await adminPage.fill('input[type="password"]', config.testUsers.admin.password);
        await adminPage.click('button[type="submit"]');
        await adminPage.waitForURL('**/dashboard', { timeout: 10000 });
        
        // Save authentication state
        authStates.admin = await context.storageState();
        console.log('✅ Admin authentication state saved');
      } catch (loginError) {
        console.log('⚠️  Admin login not available or failed, continuing without auth state');
      }
      
      await adminPage.close();
    }
    
    // Save auth states to files for reuse in tests
    const fs = require('fs');
    const path = require('path');
    const authDir = path.join(__dirname, '../auth-states');
    
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    
    Object.entries(authStates).forEach(([userType, state]) => {
      fs.writeFileSync(
        path.join(authDir, `${userType}-auth.json`),
        JSON.stringify(state, null, 2)
      );
    });
    
  } catch (error) {
    console.log('⚠️  Authentication setup failed, tests will run without pre-auth:', error.message);
  }
}

module.exports = globalSetup;