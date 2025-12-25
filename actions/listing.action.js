export class ListingAction {
    constructor(page) {
        this.page = page;
    }

    async filterMasterByName(option) {
        await this.page.locator('input[aria-describedby="dx-col-3"]').fill(option);
        await this.page.waitForTimeout(2000);
    }

    async selectMasterRowByName(option) {
        const row = this.page.getByRole('row').filter({ hasText: option });
        await row.focus();
        await row.click({ position: { x: 10, y: 10 } });
        await this.page.waitForTimeout(500);
    }

    async clearMasterNameColumnFilter() {
        await this.page.locator('input[aria-describedby="dx-col-3"]').clear();
        await this.page.waitForTimeout(500);
    }
}