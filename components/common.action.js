import { test } from '@playwright/test';

export class CommonAction {
    constructor(page) {
        this.page = page;
    }

    /**
     * Navigates to the application URL.
     *
     * This method opens the given path in the browser
     * and waits until the DOM content is fully loaded.
     *
     * @param {string} path - Application path to navigate (default: '/')
     */
    async navigateToApp(path = '/') {
        await test.step(`Navigate to application: ${path}`, async () => {
            await this.page.goto(path);
            await this.page.waitForLoadState('domcontentloaded');
            // await this.page.waitForLoadState('networkidle');
        });
    }

    /**
     * Clicks on the meatball (three-dot) menu.
     *
     * This method locates the meatball menu icon
     * and clicks it to open additional options.
     */
    async clickMeatballMenu() {
        await test.step('Click meatball menu', async () => {
            await this.page.locator('.dxm-popOut:has(img[alt="..."])').click();
            await this.page.waitForTimeout(500);
        });
    }

    /**
     * Clicks the Save button in a popup dialog.
     *
     * This method clicks the Save button
     * and waits for the save action to complete.
     */
    async clickPopupSave() {
        await test.step('Click Save button in popup', async () => {
            await this.page.getByRole('button', { name: 'Save', exact: true }).click();
            await this.page.waitForTimeout(2000);
        });
    }

    /**
     * Clicks the "Add a row" button.
     *
     * This method is used to add a new row
     * in grid or table-based screens.
     */
    async clickAddRow() {
        await test.step('Click Add a row button', async () => {
            await this.page.getByRole('button', { name: 'Add a row' }).click();
        });
    }
}
