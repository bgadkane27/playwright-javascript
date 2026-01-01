import { test, expect } from '@playwright/test';

export class PaymentTermPage {
    constructor(page) {
        this.page = page;

        this.dueDays = page.getByLabel('Due Days');
        this.autoInsertCustomer = page.locator('#PaymentTerm\\.AutoInsertWhileCreatingCustomer_S_D');
        this.autoInsertSupplier = page.locator('#PaymentTerm\\.AutoInsertWhileCreatingSupplier_S_D');
    }

    /** Fill Due Days */
    async fillDueDays(value) {
        await test.step(`Fill Due Days: ${value}`, async () => {
            await this.dueDays.fill(String(value));
        });
    }

    /** Enable auto insert while creating customer (toggle-safe) */
    async enableAutoInsertCustomer() {
        await test.step('Ensure auto insert is enabled for customer', async () => {
            const isChecked = await this.autoInsertCustomer.isChecked();

            if (!isChecked) {
                await this.autoInsertCustomer.click();
            }

            await expect(this.autoInsertCustomer).toBeChecked();
        });
    }

    /** Enable auto insert while creating supplier (toggle-safe) */
    async enableAutoInsertSupplier() {
        await test.step('Ensure auto insert is enabled for supplier', async () => {
            const isChecked = await this.autoInsertSupplier.isChecked();

            if (!isChecked) {
                await this.autoInsertSupplier.click();
            }

            await expect(this.autoInsertSupplier).toBeChecked();
        });
    }
}
