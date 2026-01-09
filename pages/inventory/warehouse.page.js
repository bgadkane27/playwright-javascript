import { test } from '@playwright/test';

export class WarehousePage {
    constructor(page) {
        this.page = page;

        this.skipNegativeStockCheck = page.locator('#Warehouse\\.SkipNegativeStockCheck_S_D');
    }

    /** Enable auto insert while creating customer */
    async enableSkipNegativeStockCheck() {
        await test.step('Click Skip Negative Stock', async () => {
            await this.skipNegativeStockCheck.click();
        });
    }
}