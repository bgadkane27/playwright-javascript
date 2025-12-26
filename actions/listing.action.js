import { test } from '@playwright/test';

export class ListingAction {
    constructor(page) {
        this.page = page;
    }

    /**
   * Clicks an option from the listing toolbar.
   *
   * This method clicks a toolbar option present
   * on the listing page based on its title.
   *
   * @param {string} option - Name of the listing toolbar option.
   */
    async clickListingMenuOption(option) {
        await test.step(`Click listing toolbar option: ${option}`, async () => {
            const menuItem = this.page.locator(`li[title="${option}"]`).first();
            await menuItem.waitFor({ state: 'visible' });
            await menuItem.click();

            // Wait for action to complete (better than fixed timeout)
            await this.page.waitForLoadState('networkidle');
        });
    }

    /**
     * Filters the master listing by the given name.
     *
     * This method enters the provided value into the
     * Name column filter textbox to narrow down the results.
     *
     * @param {string} option - The master name used for filtering.
     */
    async filterMasterByName(option) {
        await test.step(`Filter master list by name: ${option}`, async () => {
            await this.page
                .locator('input[aria-describedby="dx-col-3"]')
                .fill(option);

            await this.page.waitForTimeout(2000);
        });
    }

    /**
     * Selects a master row from the listing by name.
     *
     * This method locates the row containing the given name,
     * focuses on it, and performs a click to select the record.
     *
     * @param {string} option - The master name to be selected.
     */
    async selectMasterRowByName(option) {
        await test.step(`Select master row with name: ${option}`, async () => {
            const row = this.page
                .getByRole('row')
                .filter({ hasText: option });

            await row.focus();
            await row.click({ position: { x: 10, y: 10 } });

            await this.page.waitForTimeout(500);
        });
    }

    /**
     * Clears the Name column filter in the master listing.
     *
     * This method removes the applied filter value
     * to reset the listing view.
     */
    async clearMasterNameColumnFilter() {
        await test.step('Clear master name column filter', async () => {
            await this.page
                .locator('input[aria-describedby="dx-col-3"]')
                .clear();

            await this.page.waitForTimeout(500);
        });
    }
}