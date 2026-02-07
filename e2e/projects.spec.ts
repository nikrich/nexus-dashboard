import { test, expect, type Page } from '@playwright/test';

/**
 * Helper function to create an authenticated user session
 */
async function registerAndLogin(page: Page, nameSuffix: string) {
  const timestamp = Date.now();
  const testEmail = `test-${nameSuffix}-${timestamp}@example.com`;
  const testPassword = 'password123';
  const testName = `Test User ${nameSuffix}`;

  await page.goto('/register');
  await page.getByLabel('Name').fill(testName);
  await page.getByLabel('Email').fill(testEmail);
  await page.getByLabel('Password', { exact: true }).fill(testPassword);
  await page.getByLabel('Confirm Password').fill(testPassword);
  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page).toHaveURL('/', { timeout: 10000 });

  return { email: testEmail, password: testPassword, name: testName };
}

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should display empty projects page for new user', async ({ page }) => {
    await registerAndLogin(page, 'empty-projects');

    // Navigate to projects page
    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL('/projects', { timeout: 5000 });

    // Should show empty state
    await expect(page.getByText(/no projects yet|get started/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display create project dialog', async ({ page }) => {
    await registerAndLogin(page, 'create-dialog');

    await page.goto('/projects');

    // Click on New Project button
    await page.getByRole('button', { name: /new project/i }).click();

    // Dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /create project/i })).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
  });

  test('should validate project creation form', async ({ page }) => {
    await registerAndLogin(page, 'validation');

    await page.goto('/projects');

    // Open create dialog
    await page.getByRole('button', { name: /new project/i }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: /^create project$/i }).click();

    // HTML5 validation should prevent submission
    const nameInput = page.getByLabel('Name');
    await expect(nameInput).toHaveAttribute('required');
  });

  test('should successfully create a new project', async ({ page }) => {
    await registerAndLogin(page, 'create-project');

    await page.goto('/projects');

    // Open create dialog
    await page.getByRole('button', { name: /new project/i }).click();

    // Fill in project details
    const projectName = 'Test Project ' + Date.now();
    const projectDescription = 'This is a test project for E2E testing';

    await page.getByLabel('Name').fill(projectName);
    await page.getByLabel('Description').fill(projectDescription);

    // Submit form
    await page.getByRole('button', { name: /^create project$/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Should show success message
    await expect(page.getByText(/project created successfully/i)).toBeVisible({ timeout: 5000 });

    // Project should appear in the list
    await expect(page.getByText(projectName)).toBeVisible({ timeout: 5000 });
  });

  test('should create multiple projects', async ({ page }) => {
    await registerAndLogin(page, 'multiple-projects');

    await page.goto('/projects');

    // Create first project
    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel('Name').fill('Project One');
    await page.getByLabel('Description').fill('First test project');
    await page.getByRole('button', { name: /^create project$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Create second project
    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel('Name').fill('Project Two');
    await page.getByLabel('Description').fill('Second test project');
    await page.getByRole('button', { name: /^create project$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Both projects should be visible
    await expect(page.getByText('Project One')).toBeVisible();
    await expect(page.getByText('Project Two')).toBeVisible();
  });

  test('should navigate to project details', async ({ page }) => {
    await registerAndLogin(page, 'project-details');

    await page.goto('/projects');

    // Create a project
    const projectName = 'Detail Test Project ' + Date.now();
    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel('Name').fill(projectName);
    await page.getByLabel('Description').fill('Testing project details view');
    await page.getByRole('button', { name: /^create project$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Click on the project card
    await page.getByText(projectName).click();

    // Should navigate to project detail page
    await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 5000 });

    // Project details should be visible
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
    await expect(page.getByText(/testing project details view/i)).toBeVisible();
  });

  test('should display project metadata on detail page', async ({ page }) => {
    const user = await registerAndLogin(page, 'project-metadata');

    await page.goto('/projects');

    // Create a project
    const projectName = 'Metadata Test Project ' + Date.now();
    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel('Name').fill(projectName);
    await page.getByLabel('Description').fill('Testing project metadata display');
    await page.getByRole('button', { name: /^create project$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Navigate to project details
    await page.getByText(projectName).click();
    await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 5000 });

    // Check metadata is displayed
    await expect(page.getByText(/owner:/i)).toBeVisible();
    await expect(page.getByText(user.name)).toBeVisible();
    await expect(page.getByText(/created:/i)).toBeVisible();

    // Check project members section
    await expect(page.getByRole('heading', { name: /project members/i })).toBeVisible();
    await expect(page.getByText(user.email)).toBeVisible();
    await expect(page.getByText(/owner/i)).toBeVisible();
  });

  test('should show project creation date', async ({ page }) => {
    await registerAndLogin(page, 'creation-date');

    await page.goto('/projects');

    // Create a project
    const projectName = 'Date Test Project ' + Date.now();
    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel('Name').fill(projectName);
    await page.getByLabel('Description').fill('Testing creation date');
    await page.getByRole('button', { name: /^create project$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Project card should show creation date
    const projectCard = page.locator('a').filter({ hasText: projectName });
    await expect(projectCard.getByText(/created/i)).toBeVisible();
  });

  test('should cancel project creation', async ({ page }) => {
    await registerAndLogin(page, 'cancel-creation');

    await page.goto('/projects');

    // Open create dialog
    await page.getByRole('button', { name: /new project/i }).click();

    // Fill in some data
    await page.getByLabel('Name').fill('Cancelled Project');
    await page.getByLabel('Description').fill('This should not be created');

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Project should not be created
    await expect(page.getByText('Cancelled Project')).not.toBeVisible();
  });

  test('should persist projects across page reloads', async ({ page }) => {
    await registerAndLogin(page, 'persist-projects');

    await page.goto('/projects');

    // Create a project
    const projectName = 'Persistent Project ' + Date.now();
    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel('Name').fill(projectName);
    await page.getByLabel('Description').fill('Testing persistence');
    await page.getByRole('button', { name: /^create project$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Reload the page
    await page.reload();

    // Project should still be visible
    await expect(page.getByText(projectName)).toBeVisible({ timeout: 5000 });
  });
});
