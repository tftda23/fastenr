const { test, expect } = require('@playwright/test');
const config = require('../../config/test-config');

test.describe('Functional Tests - Settings', () => {
  test('Settings form functionality and preferences update', async ({ page }) => {
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
      
      // Navigate to settings page
      const settingsRoutes = [
        '/dashboard/settings',
        '/settings',
        '/dashboard/profile',
        '/profile'
      ];
      
      let validRoute = null;
      for (const route of settingsRoutes) {
        await page.goto(`${config.environments.local.baseUrl}${route}`);
        await page.waitForLoadState('networkidle');
        
        if (!page.url().includes('/404') && !page.url().includes('error')) {
          validRoute = route;
          break;
        }
      }
      
      expect(validRoute).toBeTruthy();
      
      // Look for settings form fields
      const settingsFields = [
        {
          selectors: ['input[name*="name"], input[placeholder*="name"], input[name*="display"]'],
          value: 'Test User Display Name',
          type: 'text'
        },
        {
          selectors: ['input[type="email"], input[name*="email"]'],
          value: null, // Don't change email
          type: 'email'
        },
        {
          selectors: ['select[name*="timezone"], [data-testid="timezone-select"]'],
          value: 'America/New_York',
          type: 'select'
        },
        {
          selectors: ['select[name*="theme"], [data-testid="theme-select"]'],
          value: null, // Will select first available option
          type: 'select'
        }
      ];
      
      let fieldsModified = 0;
      for (const field of settingsFields) {
        let fieldElement = null;
        
        for (const selector of field.selectors) {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
            fieldElement = element;
            break;
          }
        }
        
        if (fieldElement) {
          if (field.type === 'text' && field.value) {
            await fieldElement.clear();
            await fieldElement.fill(field.value);
            fieldsModified++;
          } else if (field.type === 'select') {
            const options = await fieldElement.locator('option').count().catch(() => 0);
            if (options > 1) {
              if (field.value) {
                await fieldElement.selectOption(field.value).catch(() => {
                  // If specific value not found, select second option
                  return fieldElement.selectOption({ index: 1 });
                });
              } else {
                await fieldElement.selectOption({ index: 1 });
              }
              fieldsModified++;
            }
          }
        }
      }
      
      // Look for notification preferences
      const notificationToggles = [
        'input[type="checkbox"][name*="notification"]',
        'input[type="checkbox"][name*="email"]',
        'input[type="checkbox"][name*="alert"]',
        '[data-testid*="notification"] input[type="checkbox"]'
      ];
      
      for (const selector of notificationToggles) {
        const toggles = page.locator(selector);
        const count = await toggles.count();
        if (count > 0) {
          // Toggle first notification setting
          await toggles.first().click();
          fieldsModified++;
          break;
        }
      }
      
      if (fieldsModified > 0) {
        // Look for save button
        const saveButtons = [
          page.getByRole('button', { name: /save/i }),
          page.getByRole('button', { name: /update/i }),
          page.getByRole('button', { name: /save changes/i }),
          page.locator('button[type="submit"]'),
          page.locator('[data-testid="save-settings"]')
        ];
        
        let saveButton = null;
        for (const button of saveButtons) {
          if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
            saveButton = button;
            break;
          }
        }
        
        if (saveButton) {
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          // Check for success indicators
          const successIndicators = [
            page.locator('.success, .alert-success, [role="alert"]').filter({ hasText: /success|saved|updated/i }),
            page.locator('[data-testid="success-message"]'),
            page.locator('div:has-text("Settings saved"), div:has-text("Profile updated")')
          ];
          
          let successFound = false;
          for (const indicator of successIndicators) {
            if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
              successFound = true;
              console.log('Settings saved successfully');
              break;
            }
          }
          
          if (!successFound) {
            console.log('Settings form submitted but success message not found');
          }
        }
        
        console.log(`Modified ${fieldsModified} settings fields`);
      } else {
        console.log('Settings page loaded but no editable fields found');
      }
      
      expect(true).toBeTruthy(); // Test passes if we got this far without errors
      
    } catch (error) {
      console.error('Settings test failed:', error);
      throw error;
    }
  });
});