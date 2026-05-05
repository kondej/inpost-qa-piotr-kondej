# Test Report — InPost QA Internship Assignment
**Tester:** Piotr Kondej
**Date:** 5 May 2026

## Executive Summary
This report covers manual exploratory testing across the core web application pages (`/`, `/login`, `/profile`), API endpoint validation, and reflections on advanced QA automation strategies. All automated tests (Tasks 01-06) have been completed and are passing.

---

## 1. Manual Testing Findings

### Home Page (`/`)

**[Medium] Accessibility: Missing `<h1>` tag in the hero section**
**Description:** The main hero text ("Welcome to InPost" or equivalent) does not use an `<h1>` HTML tag. Instead, it appears to be styled using utility classes on a generic element. 
**Impact:** This violates WCAG guidelines and harms screen reader navigation, as assistive technologies rely on heading hierarchies to parse page structure.
**Reproduction:**
1. Navigate to `/`
2. Inspect the hero text elements via DevTools.
3. Observe the absence of an `<h1>` tag.
**Recommendation:** Wrap the primary hero text in an `<h1>` tag to ensure semantic HTML compliance.

### Login Page (`/login`)

**[Low] Usability: Missing password visibility toggle**
**Description:** The password input field lacks a "show/hide" toggle (eye icon). 
**Impact:** Users typing long or complex passwords on mobile devices or standard browsers cannot verify their input, increasing login friction and potential lockout rates.
**Recommendation:** Add a standard toggle to change the input type between `password` and `text`.

### Profile Page (`/profile`)

**[Medium] UX: Unauthenticated users are not redirected immediately**
**Description:** If a user navigates directly to `/profile` while logged out, the page attempts to load or displays a broken state before redirecting to `/login` (or fails to redirect at all).
**Impact:** Unauthenticated users should never see protected layouts or broken data states.
**Recommendation:** Implement a route guard or server-side session check that immediately redirects unauthenticated requests to `/login` with a `?returnUrl=/profile` parameter.

### API Endpoints (`/api/parcels`)

**[Medium] Data Integrity: `PATCH` endpoint silently ignores immutable fields**
**Description:** When sending a `PATCH` request to `/api/parcels/:id` containing an immutable field (such as changing the parcel `size`), the API returns a `200 OK` status code but silently discards the `size` change, only updating fields like `notes`.
**Impact:** This is misleading for client applications. The API implies the entire payload was accepted.
**Recommendation:** The API should return a `400 Bad Request` or `422 Unprocessable Entity` with a validation error stating that `size` cannot be modified after creation.

---

## 2. QA Challenge Reflections

### Challenge: Async Wait (`/challenges/async`)

**How would you write a test for this flow that is stable and not flaky?**
To make the asynchronous parcel tracking flow completely stable, the test must adapt to the application's unpredictable initialization and response times. The most robust way to handle this in Playwright is by utilizing **Polling and Auto-Retrying Assertions** (such as `expect.toPass()`) or Action Waits (`.waitFor({ state: 'visible' })`). This ensures that if the system rejects the input with a "still initialising" message, Playwright will continuously retry the action or patiently wait for the DOM to update, entirely eliminating race conditions without relying on hardcoded `waitForTimeout` delays.

**What is your general strategy for avoiding flaky tests?**
Flakiness is usually caused by external dependencies, race conditions, or brittle locators. My general strategy relies on four core pillars:
1. **Never Use Hardcoded Sleeps:** I strictly rely on Playwright's web-first assertions which dynamically wait exactly as long as needed.
2. **Network Interception & Mocking:** If an API is inherently unstable, I use `page.route()` to mock network responses. This isolates frontend UI tests from backend instability.
3. **Resilient Locators:** I prioritize accessibility-first locators (`getByRole`, `getByLabel`, `getByText`) or explicit `data-testid` attributes over brittle CSS selectors.
4. **Isolated Test State:** I use `beforeEach` hooks and API setup/teardown steps to ensure every single test starts and ends with a completely fresh, predictable database state.

### Challenge: Visual Testing (`/challenges/visual`)

**How would you automate a visual test for this page to make it stable across runs?**
To stabilize visual tests on pages with dynamic data (like IDs, timestamps, or live availability), I use Playwright's `mask` option within the `toHaveScreenshot()` assertion. This explicitly hides elements with fluctuating data beneath a solid color block before the pixel comparison occurs, ensuring the test only verifies the structural layout and static UI elements.

**When would you use visual regression testing instead of functional assertions?**
Functional assertions (`toBeVisible`, `toHaveText`) verify *behavior* and *content*. Visual regression testing verifies *aesthetics* and *layout*. I use visual testing to catch CSS regressions—like a button overflowing its container, a missing background color, or an unintended font change—things that are technically present in the DOM but appear broken to the user.

**How do you handle minor rendering differences between local and CI environments?**
Browsers render fonts and anti-aliasing slightly differently on macOS (local) versus Linux (CI). To handle this, I utilize Playwright's `maxDiffPixelRatio` to allow a tiny margin of error (e.g., `0.01`). For absolute strictness, I generate baseline screenshots directly inside a Docker container that perfectly matches the CI environment.

**What is your strategy for updating baseline screenshots when the design intentionally changes?**
When a developer intentionally updates the UI, I run the Playwright test suite locally with the `--update-snapshots` flag. These new baseline images are then reviewed carefully alongside the code diff and committed to version control, treating golden images with the same scrutiny as source code.