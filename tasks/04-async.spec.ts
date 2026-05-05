import { test, expect } from '@playwright/test'

/**
 * TASK 04 — Async wait
 *
 * Write a stable test for the parcel tracking flow at /challenges/async.
 * The test must pass consistently across multiple runs.
 */

test('parcel tracking waits for the API response to resolve', async ({ page }) => {
  await page.goto('/challenges/async');

  await expect(page.getByTestId('system-status')).toHaveAttribute('data-status', 'ready');

  await page.getByLabel('Parcel number').fill('UK123456789GB');

  await expect(async () => {
    await page.getByRole('button', { name: /track parcel/i }).click();
    
    await expect(page.getByText(/parcel found/i)).toBeVisible();
  }).toPass();
});