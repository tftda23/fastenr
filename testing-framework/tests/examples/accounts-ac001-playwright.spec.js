const { test, expect } = require('@playwright/test');
const config = require('../../config/test-config');
const path = require('path');
const fs = require('fs');

test.describe('Accounts - Accounts List Management', () => {
  // Use admin authentication state if available
  test.use({ 
    storageState: fs.existsSync(path.join(__dirname, '../../auth-states/admin-auth.json')) 
      ? path.join(__dirname, '../../auth-states/admin-auth.json') 
      : undefined 
  });

  test('AC001: Test accounts data table display', async ({ page }) => {
    const testConfig = config.testCategories.critical || config.testCategories.medium;
    test.setTimeout(testConfig.timeout);

    try {
      // Navigate to accounts page
      await page.goto('/dashboard/accounts');
      await page.waitForLoadState('networkidle');

      // Verify accounts page loaded
      await expect(page.locator('h1, h2').filter({ hasText: /accounts/i })).toBeVisible();

      // Look for accounts table or list
      const tableSelectors = [
        'table',
        '[data-testid*="table"]',
        '[data-testid*="accounts"]',
        '.accounts-table',
        '[role="table"]'
      ];

      let tableFound = false;
      for (const selector of tableSelectors) {
        if (await page.locator(selector).count() > 0) {
          await expect(page.locator(selector)).toBeVisible();
          tableFound = true;
          console.log(`✅ Found accounts table with selector: ${selector}`);
          break;
        }
      }

      if (!tableFound) {
        // Look for account cards or list items instead
        const cardSelectors = [
          '[data-testid*="account"]',
          '.account-card',
          '.account-item',
          '[class*="account"]'
        ];

        for (const selector of cardSelectors) {
          if (await page.locator(selector).count() > 0) {
            await expect(page.locator(selector).first()).toBeVisible();
            tableFound = true;
            console.log(`✅ Found accounts display with selector: ${selector}`);
            break;
          }
        }
      }

      expect(tableFound).toBe(true);

      // Look for "Add Account" or "New Account" button
      const addButtonSelectors = [
        'button:has-text("Add Account")',
        'button:has-text("New Account")',
        'button:has-text("Create Account")',
        '[data-testid*="add-account"]',
        '[data-testid*="new-account"]'
      ];

      let addButtonFound = false;
      for (const selector of addButtonSelectors) {
        if (await page.locator(selector).count() > 0) {
          await expect(page.locator(selector)).toBeVisible();
          addButtonFound = true;
          console.log(`✅ Found add account button with selector: ${selector}`);
          break;
        }
      }

      // Verify search functionality if present
      const searchSelectors = [
        'input[placeholder*="search" i]',
        'input[type="search"]',
        '[data-testid*="search"]'
      ];

      for (const selector of searchSelectors) {
        if (await page.locator(selector).count() > 0) {
          await expect(page.locator(selector)).toBeVisible();
          console.log(`✅ Found search functionality with selector: ${selector}`);
          break;
        }
      }

      console.log('✅ AC001: Accounts table test completed successfully');
      
    } catch (error) {
      console.error('❌ AC001: Accounts table test failed:', error);
      
      await page.screenshot({ 
        path: `testing-framework/reports/screenshots/ac001-accounts-table-failure-${Date.now()}.png`,
        fullPage: true 
      });
      
      throw error;
    }
  });

  test('AC006: Test new account creation button', async ({ page }) => {
    const testConfig = config.testCategories.high || config.testCategories.medium;
    test.setTimeout(testConfig.timeout);

    try {
      await page.goto('/dashboard/accounts');
      await page.waitForLoadState('networkidle');

      // Find and click the add account button
      const addButtonSelectors = [
        'button:has-text("Add Account")',
        'button:has-text("New Account")',
        'button:has-text("Create Account")',
        '[data-testid*="add-account"]',
        '[data-testid*="new-account"]',
        'a[href*="/accounts/new"]'
      ];

      let buttonClicked = false;
      for (const selector of addButtonSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.click(selector);
          buttonClicked = true;
          console.log(`✅ Clicked add account button with selector: ${selector}`);
          break;
        }
      }

      expect(buttonClicked).toBe(true);

      // Verify navigation to new account form
      await page.waitForURL('**/accounts/new', { timeout: 10000 });
      
      // Verify new account form is displayed
      await expect(page.locator('form, [data-testid*="form"]')).toBeVisible();
      
      // Look for common form fields
      const formFieldSelectors = [
        'input[name*="name"]',
        'input[placeholder*="name" i]',
        'input[type="text"]',
        'textarea'
      ];

      let formFieldFound = false;
      for (const selector of formFieldSelectors) {
        if (await page.locator(selector).count() > 0) {
          await expect(page.locator(selector).first()).toBeVisible();
          formFieldFound = true;
          console.log(`✅ Found form field with selector: ${selector}`);
          break;
        }
      }

      expect(formFieldFound).toBe(true);

      console.log('✅ AC006: New account creation button test completed successfully');
      
    } catch (error) {
      console.error('❌ AC006: New account creation test failed:', error);
      
      await page.screenshot({ 
        path: `testing-framework/reports/screenshots/ac006-new-account-failure-${Date.now()}.png`,
        fullPage: true 
      });
      
      throw error;
    }
  });
});

/*
Test Case Details:
- ID: AC001, AC006
- Area: Accounts
- Page: Accounts List (/dashboard/accounts)
- Feature: Accounts Table, Add Account Button
- Element Type: Table, Button
- Priority: Critical, High

Implementation Status: IMPLEMENTED
Coverage:
- Accounts page loading
- Table/list display
- Add account button functionality
- Navigation to new account form
- Form presence verification

Manual Verification Required:
- Data accuracy in accounts table
- Table sorting and filtering functionality
- Visual design and layout
- Performance with large datasets
- Account data completeness

Next Steps:
1. Add tests for account search functionality
2. Add tests for account filtering and sorting
3. Add tests for account editing and deletion
4. Add tests for account details view
5. Add tests for bulk operations
*/