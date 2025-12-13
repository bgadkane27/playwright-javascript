import { test as setup, expect } from '@playwright/test';
import path from 'path';
import login from '../testdata/common/login.json'

// Path where authentication state will be saved
const authFile = path.join(__dirname, '../.auth/user.json');

setup('Login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');

    // Fill in login credentials
    await page.fill('input[name="Username"]', login.Username);
    await page.fill('input[name="Password"]', login.Password);

    // Click Sign In button
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await page.waitForLoadState("domcontentloaded");
    
    // Save the login state to file
    await page.context().storageState({ path: authFile });

    console.log('✓ Login successful! State saved to:', authFile);
});