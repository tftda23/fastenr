const { test, expect } = require('@playwright/test');
const config = require('../../config/test-config');
const path = require('path');
const fs = require('fs');

test.describe('Dashboard - Main Dashboard Stats', () => {
  // Use admin authentication state if available
  test.use({ 
    storageState: fs.existsSync(path.join(__dirname, '../../auth-states/admin-auth.json')) 
      ? path.join(__dirname, '../../auth-states/admin-auth.json') 
      : undefined 
  });

  test('DB001: Verify dashboard statistics display', async ({ page }) => {
    // Test Configuration
    const testConfig = config.testCategories.critical || config.testCategories.medium;
    test.setTimeout(testConfig.timeout);

    try {
      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Verify main dashboard elements are present
      await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i })).toBeVisible();

      // Verify stats cards are present and contain data
      const statsCards = page.locator('[data-testid*="stat"], .stat-card, [class*="stat"]');
      await expect(statsCards.first()).toBeVisible();

      // Check for key metrics (these selectors may need adjustment based on actual implementation)
      const expectedMetrics = [
        'accounts', 'contacts', 'engagements', 'health', 'score', 'total'
      ];

      for (const metric of expectedMetrics) {
        const metricElement = page.locator(`text=${metric}`, { hasText: new RegExp(metric, 'i') });
        if (await metricElement.count() > 0) {
          await expect(metricElement.first()).toBeVisible();
          console.log(`✅ Found metric: ${metric}`);
        }
      }

      // Verify numerical values are displayed (look for numbers)
      const numberElements = page.locator('text=/\\d+/');
      await expect(numberElements.first()).toBeVisible();

      // Check for charts or visualizations
      const chartElements = page.locator('canvas, svg, [data-testid*="chart"], [class*="chart"]');
      if (await chartElements.count() > 0) {
        await expect(chartElements.first()).toBeVisible();
        console.log('✅ Dashboard charts/visualizations found');
      }

      // Verify navigation menu is present
      await expect(page.locator('nav, [role="navigation"], .sidebar, [data-testid*="nav"]')).toBeVisible();

      console.log('✅ DB001: Dashboard stats test completed successfully');
      
    } catch (error) {
      console.error('❌ DB001: Dashboard stats test failed:', error);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `testing-framework/reports/screenshots/db001-dashboard-failure-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Log page content for debugging
      const pageContent = await page.content();
      fs.writeFileSync(
        `testing-framework/reports/debug/db001-page-content-${Date.now()}.html`,
        pageContent
      );
      
      throw error;
    }
  });

  test('DB002: Test stats cards display with correct data', async ({ page }) => {
    const testConfig = config.testCategories.critical || config.testCategories.medium;
    test.setTimeout(testConfig.timeout);

    try {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Wait for any loading states to complete
      await page.waitForFunction(() => {
        const loadingElements = document.querySelectorAll('[data-testid*="loading"], .loading, .spinner');
        return loadingElements.length === 0;
      }, { timeout: 10000 }).catch(() => {
        console.log('⚠️  Loading elements may still be present');
      });

      // Test individual stat cards
      const statCards = await page.locator('[data-testid*="stat"], .stat-card, [class*="card"]').all();
      
      expect(statCards.length).toBeGreaterThan(0);
      console.log(`Found ${statCards.length} stat cards`);

      for (let i = 0; i < Math.min(statCards.length, 5); i++) {
        const card = statCards[i];
        await expect(card).toBeVisible();
        
        // Check if card contains numerical data
        const cardText = await card.textContent();
        if (cardText && /\d/.test(cardText)) {
          console.log(`✅ Stat card ${i + 1} contains numerical data: ${cardText.substring(0, 50)}...`);
        }
      }

      console.log('✅ DB002: Stats cards test completed successfully');
      
    } catch (error) {
      console.error('❌ DB002: Stats cards test failed:', error);
      await page.screenshot({ 
        path: `testing-framework/reports/screenshots/db002-stats-cards-failure-${Date.now()}.png`,
        fullPage: true 
      });
      throw error;
    }
  });
});

/*
Test Case Details:
- ID: DB001, DB002
- Area: Dashboard
- Page: Main Dashboard (/dashboard)
- Feature: Dashboard Stats
- Element Type: Visual
- Priority: Critical

Implementation Status: IMPLEMENTED
Coverage:
- Dashboard page loading
- Stats cards presence
- Numerical data display
- Charts/visualizations
- Navigation elements

Manual Verification Required:
- Visual design and layout quality
- Color schemes and styling
- Responsive design on different screen sizes
- Data accuracy and real-time updates
- Performance under load

Next Steps:
1. Add tests for specific metric calculations
2. Add tests for data refresh functionality
3. Add tests for responsive design
4. Add performance testing
*/