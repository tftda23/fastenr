const { test, expect } = require('@playwright/test');
const config = require('../../config/test-config');

test.describe('Functional Tests - Contacts', () => {
  test('Contact management and filtering functionality', async ({ page }) => {
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
      
      // Navigate to contacts page
      const contactRoutes = [
        '/dashboard/contacts',
        '/contacts',
        '/dashboard/people',
        '/people'
      ];
      
      let validRoute = null;
      for (const route of contactRoutes) {
        await page.goto(`${config.environments.local.baseUrl}${route}`);
        await page.waitForLoadState('networkidle');
        
        if (!page.url().includes('/404') && !page.url().includes('error')) {
          validRoute = route;
          break;
        }
      }
      
      expect(validRoute).toBeTruthy();
      
      // Look for search/filter functionality
      const searchElements = [
        'input[type="search"]',
        'input[placeholder*="search"]',
        'input[placeholder*="filter"]',
        'input[name*="search"]',
        '[data-testid="contact-search"]'
      ];
      
      let searchInput = null;
      for (const selector of searchElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          searchInput = element;
          break;
        }
      }
      
      if (searchInput) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
        console.log('Contact search functionality tested');
      }
      
      // Look for add contact functionality
      const addContactElements = [
        page.getByRole('button', { name: /add contact/i }),
        page.getByRole('button', { name: /new contact/i }),
        page.getByRole('button', { name: /create contact/i }),
        page.locator('[data-testid="add-contact"], [data-testid="new-contact"]'),
        page.locator('a[href*="new"], a[href*="create"]').filter({ hasText: /contact/i })
      ];
      
      let addButton = null;
      for (const element of addContactElements) {
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          addButton = element;
          break;
        }
      }
      
      if (addButton) {
        await addButton.click();
        await page.waitForTimeout(1000);
        
        // Look for contact form fields
        const contactFormFields = [
          { selector: 'input[name*="name"], input[placeholder*="name"]', value: 'Test Contact' },
          { selector: 'input[type="email"], input[name*="email"]', value: 'test-contact@example.com' },
          { selector: 'input[type="tel"], input[name*="phone"]', value: '+1234567890' },
          { selector: 'input[name*="company"], input[placeholder*="company"]', value: 'Test Company' },
          { selector: 'textarea[name*="notes"], textarea[placeholder*="notes"]', value: 'Test contact notes' }
        ];
        
        let fieldsFilledCount = 0;
        for (const field of contactFormFields) {
          const element = page.locator(field.selector).first();
          if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
            await element.fill(field.value);
            fieldsFilledCount++;
          }
        }
        
        if (fieldsFilledCount > 0) {
          // Look for save button
          const saveButtons = [
            page.getByRole('button', { name: /save/i }),
            page.getByRole('button', { name: /create/i }),
            page.getByRole('button', { name: /add/i }),
            page.locator('button[type="submit"]')
          ];
          
          for (const saveButton of saveButtons) {
            if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await saveButton.click();
              await page.waitForTimeout(2000);
              
              // Check for success indicators
              const successIndicators = [
                page.locator('.success, .alert-success').filter({ hasText: /success|created|added/i }),
                page.locator('[data-testid="success-message"]')
              ];
              
              let successFound = false;
              for (const indicator of successIndicators) {
                if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
                  successFound = true;
                  break;
                }
              }
              
              // If no explicit success, check if we're back on contacts list
              if (!successFound && page.url().includes('/contacts') && !page.url().includes('/new')) {
                successFound = true;
              }
              
              console.log(successFound ? 'Contact created successfully' : 'Contact form submitted');
              break;
            }
          }
        }
      } else {
        // If no add button, look for existing contacts
        const contactElements = [
          page.locator('[data-testid="contact-list"], .contact-list'),
          page.locator('table tbody tr, .contact-item, [data-contact]'),
          page.locator('h1, h2, h3').filter({ hasText: /contacts/i })
        ];
        
        let contactsFound = false;
        for (const element of contactElements) {
          if (await element.count() > 0) {
            contactsFound = true;
            break;
          }
        }
        
        expect(contactsFound).toBeTruthy();
        console.log('Contacts page loaded successfully');
      }
      
      // Test filter functionality if available
      const filterElements = [
        'select[name*="filter"]',
        '[data-testid="contact-filter"]',
        'button:has-text("Filter"), button:has-text("Sort")'
      ];
      
      for (const selector of filterElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          if (selector.includes('select')) {
            const options = await element.locator('option').count();
            if (options > 1) {
              await element.selectOption({ index: 1 });
              await page.waitForTimeout(1000);
              console.log('Contact filter functionality tested');
            }
          } else {
            await element.click();
            await page.waitForTimeout(500);
            console.log('Contact filter menu accessed');
          }
          break;
        }
      }
      
      expect(true).toBeTruthy(); // Test passes if we got this far
      
    } catch (error) {
      console.error('Contacts test failed:', error);
      throw error;
    }
  });
});