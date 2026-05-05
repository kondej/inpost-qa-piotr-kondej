import { test, expect } from '@playwright/test'

/**
 * TASK 01 — Login
 *
 * Test the login flow at /login.
 * Credentials: user@example.com / password12345
 */

test.describe('Login', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('log in successfully', async ({ page }) => {
        await page.getByLabel("Email Address").fill('user@example.com');
        await page.getByLabel("Password").fill('password12345');

        await page.getByRole('button', { name: "Sign In" }).click();

        await expect(page).not.toHaveURL('/login');

        await expect(page.getByRole('button', { name: "Sign Out" })).toBeVisible();
        await expect(page.getByText('user@example.com')).toBeVisible();
    });

    test('display an error message for incorrect credentials', async ({ page }) => {
        await page.getByLabel("Email Address").fill('user@example.com');
        await page.getByLabel("Password").fill('wrong');
        
        await page.getByRole('button', { name: "Sign In" }).click();

        await expect(page).toHaveURL('/login');

        await expect(page.getByText(/failed/i)).toBeVisible();
    });

    test('prevent submission if required fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: "Sign In" }).click();

    await expect(page).toHaveURL('/login');
  });
})
