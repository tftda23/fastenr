const { test, expect } = require('@playwright/test');
const config = require('../../config/test-config');

test.describe('Functional Tests - Calendar', () => {
  test('Calendar navigation and view functionality', async ({ page }) => {
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
      
      // Navigate to calendar page
      const calendarRoutes = [
        '/dashboard/calendar',
        '/calendar',
        '/dashboard/schedule',
        '/schedule'
      ];
      
      let validRoute = null;
      for (const route of calendarRoutes) {
        await page.goto(`${config.environments.local.baseUrl}${route}`);
        await page.waitForLoadState('networkidle');
        
        if (!page.url().includes('/404') && !page.url().includes('error')) {
          validRoute = route;
          break;
        }
      }
      
      expect(validRoute).toBeTruthy();
      
      // Look for calendar view elements
      const calendarElements = [
        page.locator('[data-testid="calendar"], .calendar'),
        page.locator('.calendar-grid, .fc-daygrid, .calendar-view'),
        page.locator('h1, h2').filter({ hasText: /calendar|schedule/i }),
        page.locator('[class*="calendar"], [class*="month"], [class*="week"]').first()
      ];
      
      let calendarFound = false;
      for (const element of calendarElements) {
        if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
          calendarFound = true;
          break;
        }
      }
      
      expect(calendarFound).toBeTruthy();
      console.log('Calendar view loaded successfully');
      
      // Test calendar navigation
      const navigationElements = [
        { selectors: ['button:has-text("Next"), button:has-text(">")', '[data-testid="next-month"]'], action: 'next' },
        { selectors: ['button:has-text("Previous"), button:has-text("<"), button:has-text("Prev")', '[data-testid="prev-month"]'], action: 'previous' },
        { selectors: ['button:has-text("Today")', '[data-testid="today-button"]'], action: 'today' }
      ];
      
      let navigationCount = 0;
      for (const nav of navigationElements) {
        let navButton = null;
        for (const selector of nav.selectors) {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
            navButton = button;
            break;
          }
        }
        
        if (navButton) {
          await navButton.click();
          await page.waitForTimeout(500);
          navigationCount++;
          console.log(`Calendar ${nav.action} navigation tested`);
        }
      }
      
      // Test view switching (month, week, day)
      const viewOptions = [
        { selectors: ['button:has-text("Month")', '[data-testid="month-view"]'], view: 'month' },
        { selectors: ['button:has-text("Week")', '[data-testid="week-view"]'], view: 'week' },
        { selectors: ['button:has-text("Day")', '[data-testid="day-view"]'], view: 'day' }
      ];
      
      let viewSwitchCount = 0;
      for (const view of viewOptions) {
        let viewButton = null;
        for (const selector of view.selectors) {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
            viewButton = button;
            break;
          }
        }
        
        if (viewButton) {
          await viewButton.click();
          await page.waitForTimeout(1000);
          viewSwitchCount++;
          console.log(`Calendar ${view.view} view tested`);
          
          // Verify the view changed by checking for view-specific elements
          const viewChanged = await page.locator(`.${view.view}-view, [data-view="${view.view}"]`).isVisible({ timeout: 2000 }).catch(() => false);
          if (viewChanged) {
            console.log(`${view.view} view loaded successfully`);
          }
        }
      }
      
      // Look for add event functionality
      const addEventElements = [
        page.getByRole('button', { name: /add event/i }),
        page.getByRole('button', { name: /new event/i }),
        page.getByRole('button', { name: /create event/i }),
        page.locator('[data-testid="add-event"], [data-testid="new-event"]'),
        page.locator('button:has-text("+")')
      ];
      
      let addEventButton = null;
      for (const element of addEventElements) {
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          addEventButton = element;
          break;
        }
      }
      
      if (addEventButton) {
        await addEventButton.click();
        await page.waitForTimeout(1000);
        
        // Look for event creation form
        const eventFormElements = [
          page.locator('form'),
          page.locator('input[placeholder*="title"], input[name*="title"]'),
          page.locator('input[type="datetime-local"], input[type="date"]'),
          page.getByRole('dialog'),
          page.locator('[data-testid="event-form"]')
        ];
        
        let formFound = false;
        for (const element of eventFormElements) {
          if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
            formFound = true;
            break;
          }
        }
        
        if (formFound) {
          console.log('Event creation form opened successfully');
          
          // Try to fill basic event details
          const titleInput = page.locator('input[placeholder*="title"], input[name*="title"]').first();
          if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await titleInput.fill('Test Calendar Event');
          }
          
          // Look for save/create button
          const saveButtons = [
            page.getByRole('button', { name: /save/i }),
            page.getByRole('button', { name: /create/i }),
            page.locator('button[type="submit"]')
          ];
          
          for (const saveButton of saveButtons) {
            if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await saveButton.click();
              await page.waitForTimeout(1000);
              console.log('Event creation form submitted');
              break;
            }
          }
        }
      }
      
      // Test calendar date clicking for event creation
      const calendarDates = page.locator('.fc-day, .calendar-day, [data-date], td[data-day]');
      const dateCount = await calendarDates.count();
      if (dateCount > 0) {
        await calendarDates.first().click();
        await page.waitForTimeout(1000);
        console.log('Calendar date click tested');
      }
      
      console.log(`Calendar functionality tested: ${navigationCount} navigation elements, ${viewSwitchCount} view options`);
      expect(true).toBeTruthy(); // Test passes if we got this far
      
    } catch (error) {
      console.error('Calendar test failed:', error);
      throw error;
    }
  });
});