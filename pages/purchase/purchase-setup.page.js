import { test } from '@playwright/test';

export class PurchaseSetupPage {
    constructor(page) {
        this.page = page;
    }

    /**
     * Navigates to the specified master.
     *
     * This method clicks on the navigation link
     * that matches the provided master name.
     *
     * @param {string} masterName - The name of the master to navigate to.
     */
    async navigateToMaster(masterName) {
        await test.step(`Navigate to master: ${masterName}`, async () => {
            await this.page
                .getByRole("link", { name: masterName, exact: true })
                .click();
        });
    }

    /**
     * Navigates to the specified master.
     *
     * This method clicks on the navigation link
     * that matches the provided master name.
     *
     * @param {string} masterName - The name of the master to navigate to.
     */
    async navigateToBase(masterName) {
        await test.step(`Navigate to master: ${masterName}`, async () => {
            await this.page
                .getByRole("link", { name: masterName, exact: true }).nth(1)
                .click();
        });
    }

    /**
     * Opens a specific setting option under Purchase setup.
     *
     * This method clicks on the settings link based on
     * the provided option name.
     *
     * @param {string} option - The setting option to open.
     */
    async openSetting(option) {
        await test.step(`Open setting option: ${option}`, async () => {
            await this.page
                .getByRole("link", { name: option, exact: true })
                .click();
        });
    }
}