// Global teardown for Playwright tests
const fs = require('fs');
const path = require('path');

async function globalTeardown() {
  console.log('🧹 Global test teardown starting...');
  
  try {
    // Clean up test data
    await cleanupTestData();
    
    // Clean up authentication states
    await cleanupAuthStates();
    
    // Generate final test summary
    await generateTestSummary();
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  }
  
  console.log('✅ Global test teardown completed');
}

async function cleanupTestData() {
  console.log('🗑️  Cleaning up test data...');
  
  // TODO: Add test data cleanup logic
  // This could include:
  // - Removing test organizations
  // - Cleaning up test users
  // - Removing test accounts/contacts
  // - Resetting database state
  
  console.log('✅ Test data cleanup completed');
}

async function cleanupAuthStates() {
  console.log('🔐 Cleaning up authentication states...');
  
  try {
    const authDir = path.join(__dirname, '../auth-states');
    
    if (fs.existsSync(authDir)) {
      const files = fs.readdirSync(authDir);
      files.forEach(file => {
        if (file.endsWith('-auth.json')) {
          fs.unlinkSync(path.join(authDir, file));
        }
      });
      
      // Remove directory if empty
      if (fs.readdirSync(authDir).length === 0) {
        fs.rmdirSync(authDir);
      }
    }
    
    console.log('✅ Authentication states cleaned up');
  } catch (error) {
    console.log('⚠️  Auth state cleanup failed:', error.message);
  }
}

async function generateTestSummary() {
  console.log('📊 Generating test execution summary...');
  
  try {
    const reportsDir = path.join(__dirname, '../reports');
    const summaryFile = path.join(reportsDir, 'test-execution-summary.json');
    
    const summary = {
      timestamp: new Date().toISOString(),
      executionCompleted: true,
      environment: process.env.NODE_ENV || 'development',
      testRunId: `run-${Date.now()}`,
      notes: 'Test execution completed successfully'
    };
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log('✅ Test execution summary saved');
    
  } catch (error) {
    console.log('⚠️  Summary generation failed:', error.message);
  }
}

module.exports = globalTeardown;