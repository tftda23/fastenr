// Playwright configuration for Fastenr testing
const { defineConfig, devices } = require('@playwright/test');
const config = require('./config/test-config');

module.exports = defineConfig({
  // Test directory
  testDir: './tests',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: './testing-framework/reports/playwright-report' }],
    ['json', { outputFile: './testing-framework/reports/test-results.json' }],
    ['list']
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like \`await page.goto('/')\`
    baseURL: config.environments.local.baseUrl,
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Global timeout for each test
    actionTimeout: config.automation.timeout,
    
    // Timeout for navigation actions
    navigationTimeout: config.automation.timeout,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Test against branded browsers
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  // Run your local dev server before starting the tests
  // webServer: {
  //   command: 'npm run dev',
  //   url: config.environments.local.baseUrl,
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
  
  // Global setup and teardown
  globalSetup: require.resolve('./utils/global-setup.js'),
  globalTeardown: require.resolve('./utils/global-teardown.js'),
  
  // Test timeout
  timeout: 60 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 10 * 1000,
  },
});