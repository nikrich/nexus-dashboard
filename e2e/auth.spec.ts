import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Nexus Dashboard/i);
    await expect(page.getByText('Sign in')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');

    await expect(page).toHaveTitle(/Nexus Dashboard/i);
    await expect(page.getByText('Create account')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('should show validation errors on login with empty fields', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /sign in/i }).click();

    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should show validation errors on register with invalid data', async ({ page }) => {
    await page.goto('/register');

    // Fill in with mismatched passwords
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm Password').fill('differentpassword');

    await page.getByRole('button', { name: /create account/i }).click();

    // Should show error message for mismatched passwords
    await expect(page.getByText(/passwords do not match/i)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully register a new user', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;

    await page.goto('/register');

    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');

    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Should show user is logged in
    await expect(page.getByText('Test User')).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with existing user', async ({ page }) => {
    // First, register a user
    const timestamp = Date.now();
    const testEmail = `login-test-${timestamp}@example.com`;
    const testPassword = 'password123';

    await page.goto('/register');
    await page.getByLabel('Name').fill('Login Test User');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByLabel('Confirm Password').fill(testPassword);
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Now logout
    await page.getByRole('button', { name: /login test user/i }).click();
    await page.getByRole('menuitem', { name: /log out/i }).click();

    // Should redirect to login page
    await expect(page).toHaveURL('/login', { timeout: 5000 });

    // Now login with the same credentials
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.getByText('Login Test User')).toBeVisible({ timeout: 5000 });
  });

  test('should successfully logout', async ({ page }) => {
    // First, register and login a user
    const timestamp = Date.now();
    const testEmail = `logout-test-${timestamp}@example.com`;

    await page.goto('/register');
    await page.getByLabel('Name').fill('Logout Test User');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Click on user menu
    await page.getByRole('button', { name: /logout test user/i }).click();

    // Click logout
    await page.getByRole('menuitem', { name: /log out/i }).click();

    // Should redirect to login page
    await expect(page).toHaveURL('/login', { timeout: 5000 });

    // User should no longer be logged in
    // Try to access dashboard directly
    await page.goto('/');

    // Should redirect back to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/projects');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('should preserve callback URL after login', async ({ page }) => {
    // First, register a user
    const timestamp = Date.now();
    const testEmail = `callback-test-${timestamp}@example.com`;
    const testPassword = 'password123';

    await page.goto('/register');
    await page.getByLabel('Name').fill('Callback Test User');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByLabel('Confirm Password').fill(testPassword);
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Logout
    await page.getByRole('button', { name: /callback test user/i }).click();
    await page.getByRole('menuitem', { name: /log out/i }).click();

    // Try to access projects page
    await page.goto('/projects');

    // Should redirect to login with callback URL
    await expect(page).toHaveURL(/\/login\?callbackUrl=/, { timeout: 5000 });

    // Login
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to the original callback URL (projects page)
    await expect(page).toHaveURL('/projects', { timeout: 10000 });
  });
});
