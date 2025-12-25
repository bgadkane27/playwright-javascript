import { test } from '@playwright/test'

export class MenuAction {
    constructor(page) {
        this.page = page;
    }

    /**
     * To Select Module
     * @param {string} option - Name of the module to select
     */
    async selectModule(option) {
        await this.page.getByTitle("Change module").click();
        await this.page.getByRole("link", { name: option, exact: true }).click();
    }

    /**
    * Click Left Menu Option
    * @param {string} option - click option from left menu
    */
    async clickLeftMenuOption(option) {
        await this.page.getByTitle(option).click();
    }

    /**
     * Click Listing Toolbar Option
     * @param {string} option - click option from listing toolbar
     */
    async clickListingMenuOption(option) {
        await this.page.locator(`li[title="${option}"]`).click();
        await this.page.waitForTimeout(3000);
    }

    /**
     * Click Master/Transation Toolbar Option
     * @param {string} option - click option from master/transaction
     */
    async clickTopMenuOption(option) {
        const optionButton = this.page.locator('div.dxm-hasText', { hasText: option }).first();
        await optionButton.click();
        await this.page.waitForTimeout(1000);
    }

    /**
     * Click Master/Transation Toolbar Option
     * @param {string} option - click option from master/transaction
     */
    async clickMenuOptionByText(option) {
        await test.step(`Click top menu option: ${option}`, async () => {
            await this.page.getByText(option, { exact: true }).click();
            await this.page.waitForTimeout(1000);
        });
    }

}
