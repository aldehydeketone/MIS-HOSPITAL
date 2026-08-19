const { test, expect } = require('@playwright/test');

test.describe('Patient Management CRUD', () => {

  test.beforeEach(async ({ page }) => {
    // Admin login before each test
    await page.goto('/login');
    await page.fill('#email', 'admin@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Create patient intake and verify in listing', async ({ page }) => {
    await page.goto('/patients');
    await page.click('button:has-text("Add New Patient")');
    
    // Fill Modal
    await page.fill('input:below(:text("Full Name"))', 'E2E Test Patient');
    await page.fill('input:below(:text("Age"))', '50');
    await page.selectOption('select:below(:text("Gender"))', 'Female');
    await page.fill('input:below(:text("Contact Number"))', '555-9999');
    await page.fill('textarea:below(:text("Residential Address"))', '999 E2E Blvd');
    
    await page.click('button:has-text("Register Intake")');

    // Verify addition
    await expect(page.locator('table')).toContainText('E2E Test Patient');
  });

  test('View patient demographics details page', async ({ page }) => {
    await page.goto('/patients');
    
    // Select first patient view details button
    await page.click('table tr:has-text("John Doe") button:has-text("View Details")');
    await expect(page).toHaveURL(/\/patients\/\d+/);
    await expect(page.locator('h1')).toContainText('Patient Profile: John Doe');
  });

  test('Update patient information', async ({ page }) => {
    await page.goto('/patients');
    await page.click('table tr:has-text("John Doe") button:has-text("Edit")');
    
    // Modify Age
    await page.fill('input:below(:text("Age"))', '35'); // originally 34
    await page.click('button:has-text("Save Changes")');

    // Verify update
    await expect(page.locator('table')).toContainText('35 yrs');
  });

  test('Delete patient record (Admin only)', async ({ page }) => {
    await page.goto('/patients');
    
    // Trigger delete
    page.once('dialog', dialog => dialog.accept()); // auto-accept confirm popup
    await page.click('table tr:has-text("E2E Test Patient") button:has-text("Delete")');

    // Verify deletion
    await expect(page.locator('table')).not.toContainText('E2E Test Patient');
  });
});
