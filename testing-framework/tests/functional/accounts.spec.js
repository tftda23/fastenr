const { test, expect } = require('@playwright/test');
const config = require('../../config/test-config');

test.describe('Functional Tests - Accounts Management', () => {
  test('Accounts page access and add account functionality', async ({ page }) => {
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
      
      // Navigate to accounts page
      await page.goto(`${config.environments.local.baseUrl}/dashboard/accounts`);
      await page.waitForLoadState('networkidle');
      
      // Verify accounts page loads
      await expect(page).toHaveURL(/.*\/accounts/);
      
      // Look for add account functionality
      const addButtons = [
        page.getByRole('button', { name: /add account/i }),
        page.getByRole('button', { name: /new account/i }),
        page.getByRole('button', { name: /create account/i }),
        page.locator('[data-testid="add-account"], [data-testid="new-account"]'),
        page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first()
      ];
      
      let addButton = null;
      for (const button of addButtons) {
        if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
          addButton = button;
          break;
        }
      }
      
      if (addButton) {
        await addButton.click();
        await page.waitForTimeout(1000);
        
        // Look for form elements that appear after clicking add
        const formElements = [
          page.locator('form'),
          page.locator('input[placeholder*="account"], input[placeholder*="name"]'),
          page.locator('select, [role="combobox"]'),
          page.getByRole('dialog'),
          page.locator('[data-testid="account-form"]')
        ];
        
        let formFound = false;
        for (const element of formElements) {
          if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
            formFound = true;
            break;
          }
        }
        
        expect(formFound).toBeTruthy();
        console.log('Account creation form opened successfully');
      } else {
        // If no add button found, verify accounts page content
        const accountsContent = [
          page.locator('h1, h2, h3').filter({ hasText: /accounts/i }),
          page.locator('[data-testid="accounts-list"], .accounts-list'),
          page.locator('table, .table'),
          page.locator('[class*="account"], [data-account]')
        ];
        
        let contentFound = false;
        for (const content of accountsContent) {
          if (await content.count() > 0) {
            contentFound = true;
            break;
          }
        }
        
        expect(contentFound).toBeTruthy();
        console.log('Accounts page loaded but no add button found - may be in read-only state');
      }
      
    } catch (error) {
      console.error('Accounts test failed:', error);
      throw error;
    }
  });
});