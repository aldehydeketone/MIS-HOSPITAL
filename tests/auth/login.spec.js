const { test, expect } = require('@playwright/test');

test.describe('Authentication Tests', () => {

  test('Protected page access without login redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Invalid login credentials show error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@hospital.test');
    await page.fill('#password', 'WrongPassword');
    await page.click('button[type="submit"]');

    const errorBox = page.locator('.form-error');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toHaveText(/Invalid email or password/i);
  });

  test('Admin login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('.sidebar-user-name')).toHaveText('Admin User');
    await expect(page.locator('.sidebar-user-role')).toHaveText('admin');
  });

  test('Doctor login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'doctorA@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('.sidebar-user-name')).toHaveText('Dr. Austin');
    await expect(page.locator('.sidebar-user-role')).toHaveText('doctor');
  });

  test('Staff login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'staff@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('.sidebar-user-name')).toHaveText('Staff Member');
    await expect(page.locator('.sidebar-user-role')).toHaveText('staff');
  });

  test('Logout redirects to /login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('#email', 'admin@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Click logout
    await page.click('.btn-logout');
    await expect(page).toHaveURL(/\/login/);

    // Try returning to dashboard, should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
