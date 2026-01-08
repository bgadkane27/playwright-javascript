import { test } from '@playwright/test';

export class WarehousePage {
    constructor(page) {
        this.page = page;

        this.skipNegativeStock = page.locator('#Warehouse\\.SkipNegativeStockCheck_S_D');
    }

    /** Enable auto insert while creating customer */
    async enableSkipNegativeStock() {
        await test.step('Click Skip Negative Stock', async () => {
            await this.skipNegativeStock.click();
        });
    }
}