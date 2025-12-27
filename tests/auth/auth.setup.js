import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../../pages/common/login.page';
import login from '../../testdata/common/loginData.json';

const authFile = path.join(process.cwd(), '.auth/user.json');

setup('Login into system', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await setup.step('Navigate to login page', async () => {
        await loginPage.navigateTo('/');
    });

    await setup.step('Login with valid credentials', async () => {
        await loginPage.login(login.username, login.password);
    });

    await setup.step('Verify title should contain Enfinity', async () => {
        await expect(page).toHaveTitle(/Enfinity/);
    });

    await setup.step('Save authentication state', async () => {
        await page.context().storageState({ path: authFile });
    });

    await setup.step('Login Summary', async () => {
        console.info('===== Successful Login Summary =====\n');
        console.info(`✅ Login with username: ${login.username}`);
        console.info(`🕒 Login Time: ${new Date().toLocaleString('en-IN')}\n`);
    });
});