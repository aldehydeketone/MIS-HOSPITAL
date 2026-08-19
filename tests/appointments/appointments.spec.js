const { test, expect } = require('@playwright/test');

test.describe('Appointment Slots Management', () => {

  test('Staff schedules appointment and Doctor updates status', async ({ page }) => {
    // 1. Staff Logs in to schedule appointment
    await page.goto('/login');
    await page.fill('#email', 'staff@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/appointments');
    await page.click('button:has-text("Schedule Appointment")');

    // Fill form
    await page.selectOption('select:below(:text("Select Patient"))', { label: 'John Doe (PAT-001)' });
    await page.selectOption('select:below(:text("Assign Doctor"))', { label: 'Dr. Austin (Cardiology)' });
    await page.fill('input:below(:text("Appointment Date"))', '2026-08-25');
    await page.fill('input:below(:text("Appointment Time"))', '11:00:00');
    await page.selectOption('select:below(:text("Appointment Type"))', 'Checkup');
    
    await page.click('button:has-text("Book Slot")');

    // Verify scheduled appointment appears in list
    await expect(page.locator('table')).toContainText('John Doe');
    await expect(page.locator('table')).toContainText('Dr. Austin');

    // Logout
    await page.click('.btn-logout');

    // 2. Doctor Austin logs in and completes the appointment slot
    await page.goto('/login');
    await page.fill('#email', 'doctorA@hospital.test');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/appointments');
    
    // Find the scheduled slot and click Update Status
    await page.click('table tr:has-text("11:00:00") button:has-text("Update Status")');
    await page.selectOption('select:below(:text("Select Status"))', 'Completed');
    await page.click('button:has-text("Save Status")');

    // Verify badge updated to Completed
    await expect(page.locator('table tr:has-text("11:00:00") .badge')).toHaveText('Completed');
  });
});
