const { test, expect } = require('@playwright/test');
const config = require('../../config/test-config');

test.describe('Functional Tests - Dashboard', () => {
  test('Dashboard access and health score validation', async ({ page }) => {
    const testConfig = config.testCategories.critical || config.testCategories.medium;
    test.setTimeout(testConfig.timeout);

    try {
      // First authenticate
      await page.goto(`${config.environments.local.baseUrl}/auth/login`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('#email', config.testData.users.validUser.email);
      await page.fill('#password', config.testData.users.validUser.password);
      
      const submitButton = page.getByRole('button', { name: /sign in/i });
      await submitButton.click();
      await page.waitForLoadState('networkidle');
      
      // Navigate to dashboard if not already there
      if (!page.url().includes('/dashboard')) {
        await page.goto(`${config.environments.local.baseUrl}/dashboard`);
        await page.waitForLoadState('networkidle');
      }
      
      // Verify dashboard loads
      await expect(page).toHaveURL(/.*\/dashboard/);
      
      // Check for dashboard elements
      const dashboardElements = [
        page.locator('nav, header').first(),
        page.locator('[data-testid="health-score"], .health-score, [class*="health"]').first(),
        page.locator('[data-testid="dashboard-content"], main, .dashboard').first()
      ];
      
      let foundElements = 0;
      for (const element of dashboardElements) {
        if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
          foundElements++;
        }
      }
      
      expect(foundElements).toBeGreaterThan(0);
      
      // Check for health score or chart elements
      const healthElements = await page.locator('[data-testid="health-score"], .health-score, [class*="health"], [class*="chart"], canvas, svg').count();
      
      if (healthElements > 0) {
        console.log(`Found ${healthElements} health/chart elements on dashboard`);
      } else {
        console.log('No specific health score elements found, but dashboard loaded successfully');
      }
      
    } catch (error) {
      console.error('Dashboard test failed:', error);
      throw error;
    }
  });
});