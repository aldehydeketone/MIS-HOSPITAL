const { test, expect } = require('@playwright/test');

test.describe('Doctor Management CRUD', () => {

  test('Admin can CRUD doctors', async ({ page }) => {
    // Login as Admin
    await page.goto('/login');
    await page.fill('#email', 'admin@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Go to Doctors directory
    await page.goto('/doctors');
    await page.click('button:has-text("Add New Doctor")');

    // Fill new doctor credentials and profile details
    await page.fill('input:below(:text("Email Address"))', 'doctorC@hospital.test');
    await page.fill('input:below(:text("Password"))', 'Password123');
    await page.fill('input:below(:text("Doctor Name"))', 'Charles');
    await page.fill('input:below(:text("Specialization"))', 'Dermatology');
    await page.fill('input:below(:text("Department"))', 'Dermatological Sciences');
    await page.fill('input:below(:text("Contact Number"))', '555-0303');
    
    await page.click('button:has-text("Register Profile")');

    // Verify created doctor
    await expect(page.locator('table')).toContainText('Dr. Charles');
    await expect(page.locator('table')).toContainText('Dermatology');
  });

  test('Non-admin users cannot see management actions on doctors page', async ({ page }) => {
    // Login as Doctor
    await page.goto('/login');
    await page.fill('#email', 'doctorA@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Go to Doctors page
    await page.goto('/doctors');

    // Assert that "Add New Doctor" button is NOT visible
    await expect(page.locator('button:has-text("Add New Doctor")')).not.toBeVisible();
    
    // Assert that table actions (Edit/Delete) are NOT visible
    await expect(page.locator('table')).not.toContainText('Edit');
    await expect(page.locator('table')).not.toContainText('Delete');
  });
});
