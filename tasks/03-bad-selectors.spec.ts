import { test, expect } from "@playwright/test";

/**
 * TASK 03 — Fix the broken tests
 *
 * Find the bug in each test and propose a fix. Do not change what the test is asserting — only fix the broken part. Make them faster.
 */

// --- Test 1 ---
test("home page shows the correct hero heading", async ({ page }) => {
  await page.goto("/");
  const heading = page.getByAltText("Your door to more");
  await expect(heading).toBeVisible();
});

// --- Test 2 ---
test("newsletter success message appears after submit", async ({ page }) => {
  await page.goto("/");
  await page.fill('[data-testid="newsletter-input"]', "test@example.com");
  await page.click('[data-testid="newsletter-submit"]');
  await page.waitForTimeout(3000);
  await expect(
    page.locator('[data-testid="newsletter-success"]'),
  ).toBeVisible();
});

// --- Test 3 ---
test("GET /api/parcels/:id returns the created parcel", async ({ request }) => {
  const TOKEN = "test-token-inpost-2026";

  const createRes = await request.post("/api/parcels", { 
    headers: { Authorization: `Bearer ${TOKEN}` },
    data: {
      recipientName: "Jan Kowalski",
      recipientEmail: "jan@example.com",
      size: "A",
      deliveryType: "LOCKER",
      lockerCode: "KRK001",
    } 
  });

  expect(createRes.status()).toBe(201); 
  
  const newParcel = await createRes.json();

  const res = await request.get(`/api/parcels/${newParcel.id}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty("id", newParcel.id);
});

// --- Test 4 ---
test("system status shows ready after initialising", async ({ page }) => {
  await page.goto("/challenges/async");
  const status = page.locator('[data-testid="system-ready"]');
  await status.waitFor();
  await expect(status).toHaveText(/system ready/i);
});

// --- Test 5 ---
test("profile page shows the user email", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#email", "user@example.com");
  await page.fill("#password", "password12345");
  await page.click('[type="submit"]');
  await page.waitForURL("/profile");

  const emailEl = page.getByText("user@example.com");
  await expect(emailEl).toBeVisible();
});

// --- Test 6 (bonus) ---
test("newsletter form submits without error", async ({ page }) => {
  await page.goto("/");
  await page.fill('[data-testid="newsletter-input"]', "test@example.com");
  await page.click('[data-testid="newsletter-submit"]');
});
