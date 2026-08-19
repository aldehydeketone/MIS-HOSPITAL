const { test, expect } = require('@playwright/test');

test.describe('Dashboard Layouts Verification', () => {

  test('Admin dashboard shows full management metrics', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check metric labels
    await expect(page.locator('.stats-grid')).toContainText('Total Patients');
    await expect(page.locator('.stats-grid')).toContainText('Total Doctors');
    await expect(page.locator('.stats-grid')).toContainText('Total Staff');
    await expect(page.locator('.stats-grid')).toContainText('Total Appointments');
    await expect(page.locator('.stats-grid')).toContainText('Admissions');
  });

  test('Doctor dashboard shows clinical focus metrics', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'doctorA@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check labels
    await expect(page.locator('.stats-grid')).toContainText('My Patients');
    await expect(page.locator('.stats-grid')).toContainText("Today's Appointments");
    await expect(page.locator('.stats-grid')).toContainText('Pending Appointments');
  });

  test('Staff dashboard shows operations metrics', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'staff@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check labels
    await expect(page.locator('.stats-grid')).toContainText('Total Patient Directory');
    await expect(page.locator('.stats-grid')).toContainText("Today's Appointments");
    await expect(page.locator('.stats-grid')).toContainText('Active Admissions');
  });
});
