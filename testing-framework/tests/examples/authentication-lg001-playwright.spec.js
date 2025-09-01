const { test, expect } = require('@playwright/test');
const config = require('../../config/test-config');

test.describe('Authentication - Login Form', () => {
  test('LG001: Test email/password login', async ({ page }) => {
    // Test Configuration
    const testConfig = config.testCategories.critical || config.testCategories.medium;
    test.setTimeout(testConfig.timeout);

    try {
      // Navigate to login page
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');

      // Verify login page elements are present
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Test with valid credentials
      await page.fill('input[type="email"]', config.testUsers.user.email);
      await page.fill('input[type="password"]', config.testUsers.user.password);
      
      // Submit login form
      await page.click('button[type="submit"]');
      
      // Verify successful login - should redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Verify dashboard elements are present
      await expect(page.locator('text=Dashboard')).toBeVisible();
      
      // Verify user is logged in (check for user profile or logout button)
      await expect(page.locator('[data-testid="user-profile"], button:has-text("Logout"), [aria-label*="logout"]')).toBeVisible();
      
      console.log('✅ LG001: Login test completed successfully');
      
    } catch (error) {
      console.error('❌ LG001: Login test failed:', error);
      
      // Take screenshot on failure for debugging
      await page.screenshot({ 
        path: `testing-framework/reports/screenshots/lg001-login-failure-${Date.now()}.png`,
        fullPage: true 
      });
      
      throw error;
    }
  });

  test('LG002: Test login with invalid credentials', async ({ page }) => {
    // Test Configuration
    const testConfig = config.testCategories.critical || config.testCategories.medium;
    test.setTimeout(testConfig.timeout);

    try {
      // Navigate to login page
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');

      // Test with invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      // Submit login form
      await page.click('button[type="submit"]');
      
      // Verify error message appears
      await expect(page.locator('text=Invalid credentials, text=Login failed, [role="alert"]')).toBeVisible({ timeout: 5000 });
      
      // Verify user stays on login page
      await expect(page).toHaveURL(/.*\/auth\/login/);
      
      console.log('✅ LG002: Invalid login test completed successfully');
      
    } catch (error) {
      console.error('❌ LG002: Invalid login test failed:', error);
      await page.screenshot({ 
        path: `testing-framework/reports/screenshots/lg002-invalid-login-failure-${Date.now()}.png`,
        fullPage: true 
      });
      throw error;
    }
  });
});

/*
Test Case Details:
- ID: LG001, LG002
- Area: Authentication
- Page: Login Page (/auth/login)
- Feature: Login Form
- Element Type: Form
- Priority: Critical

Implementation Status: IMPLEMENTED
Coverage: 
- Valid login flow
- Invalid credentials handling
- Error message display
- Redirect verification
- UI element presence

Next Steps:
1. Add tests for forgot password functionality
2. Add tests for social login if available
3. Add tests for form validation
4. Add tests for session handling
*/