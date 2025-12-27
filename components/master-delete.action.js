import { test } from '@playwright/test';

export class MasterDeleteAction {
    constructor(page, listingAction, commonAction, menuAction) {
        this.page = page;
        this.listingAction = listingAction;
        this.commonAction = commonAction;
        this.menuAction = menuAction;
    }

    /**
     * Deletes a master record by name.
     *
     * @param {string} masterType - Supplier / Customer / Salesman
     * @param {string} name - Record name to delete
     */
    async deleteMasterByName(masterType, name) {
        await test.step(`Delete ${masterType}: ${name}`, async () => {
            await this.listingAction.selectMasterRowByName(name);
            await this.commonAction.clickMeatballMenu();
            await this.menuAction.clickMenuOptionByText('Delete');
            await this.menuAction.clickMenuOptionByText('Ok');
        });
    }
}