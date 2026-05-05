import { test, expect } from '@playwright/test'

/**
 * TASK 05 — Visual regression
 *
 * Write a visual test for the locker details page at /challenges/visual.
 */

test('locker card', async ({ page }) => {
  await page.goto('/challenges/visual');

  await expect(page.locator('.animate-spin')).toBeHidden();

  const lockerCard = page.getByTestId('locker-card'); 
  await expect(lockerCard).toBeVisible();

  await expect(lockerCard).toHaveScreenshot('locker-details.png', {
    mask: [
      page.getByTestId('dynamic-locker-id'), 
      page.getByTestId('dynamic-timestamp')
    ],
    maxDiffPixelRatio: 0.01 
  });
})
