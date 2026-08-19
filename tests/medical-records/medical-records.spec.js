const { test, expect } = require('@playwright/test');

test.describe('Medical Clinical Records Management', () => {

  test('Doctor can create and read clinical logs for assigned patient', async ({ page }) => {
    // Login as Doctor A
    await page.goto('/login');
    await page.fill('#email', 'doctorA@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Go to patients list
    await page.goto('/patients');
    
    // John Doe is assigned to Doctor A (Dr. Austin). Click Medical Records.
    await page.click('table tr:has-text("John Doe") button:has-text("Medical Records")');
    await expect(page).toHaveURL(/\/medical-records\/1/);

    // Create a new record
    await page.click('button:has-text("Add Diagnostic Entry")');
    await page.fill('input:below(:text("Clinical Diagnosis"))', 'Mild Myocardial Ischemia');
    await page.fill('input:below(:text("Prescription"))', 'Aspirin 81mg once daily, Nitroglycerin sublingual as needed');
    await page.fill('textarea:below(:text("Internal Treatment Notes"))', 'Patient instructed to report chest pain immediately.');
    
    await page.click('button:has-text("Publish Entry")');

    // Verify entry is added to timeline
    await expect(page.locator('.card')).toContainText('Mild Myocardial Ischemia');
    await expect(page.locator('.card')).toContainText('Aspirin 81mg once daily');
  });

  test('Staff is restricted from viewing medical records page', async ({ page }) => {
    // Login as Staff
    await page.goto('/login');
    await page.fill('#email', 'staff@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Attempt direct URL navigation to records of patient 1
    await page.goto('/medical-records/1');

    // Expect redirect to access-denied or render Access Denied profile layout page
    await expect(page).toHaveURL(/\/access-denied/);
    await expect(page.locator('.denied-title')).toHaveText('Access Denied');
  });
});
