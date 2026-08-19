const { test, expect } = require('@playwright/test');

test.describe('Privacy Access Restrictions', () => {

  test('Cross-doctor patient files access restriction check', async ({ page }) => {
    // 1. Doctor A (Dr. Austin) logs in
    await page.goto('/login');
    await page.fill('#email', 'doctorA@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Patient 2 (Jane Smith) is assigned to Doctor B (Dr. Beverly).
    // Doctor A attempts to view details page of Patient 2 directly via URL navigation
    await page.goto('/patients/2');

    // Expect redirect to access-denied
    await expect(page).toHaveURL(/\/access-denied/);
    await expect(page.locator('.denied-title')).toHaveText('Access Denied');

    // Doctor A attempts to view medical records page of Patient 2 directly via URL navigation
    await page.goto('/medical-records/2');
    await expect(page).toHaveURL(/\/access-denied/);
    
    // Logout
    await page.click('.btn-logout');

    // 2. Admin logs in to verify the breach attempts were logged
    await page.goto('/login');
    await page.fill('#email', 'admin@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Audit Logs
    await page.goto('/logs');

    // Verify logs capture the UNAUTHORIZED attempts
    await expect(page.locator('table')).toContainText('UNAUTHORIZED_PATIENT_ACCESS_ATTEMPT');
    await expect(page.locator('table')).toContainText('doctorA@hospital.test');
    await expect(page.locator('table')).toContainText('Attempted unauthorized view of patient: Jane Smith');
  });
});
