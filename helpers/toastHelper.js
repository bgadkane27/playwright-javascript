import Messages from '../constants/toast-messages.js';
import { expect } from '@playwright/test';

export class ToastHelper {
    constructor(page) {
        this.page = page;
        this.successToast = page.locator('.dx-toast-success');
        this.messageToast = page.locator('.dx-toast-message');
    }

    /**
     * Assert toast using exact text match
     * Useful when toast structure changes but text remains same
     *
     * @param {string} entity - Entity name (e.g. Supplier, Customer)
     * @param {string} action - Action name (e.g. Create, Update, Delete)
     */
    async assertByText(entity, action) {
        const expectedMessage = Messages[entity][action];

        await expect(
            this.page.getByText(expectedMessage).first()
        ).toBeVisible({ timeout: 5000 });
    }

    /**
     * Assert success toast message
     * Uses success toast container
     *
     * @param {string} entity - Entity name
     * @param {string} action - Action name
     */
    async assertBySuccess(entity, action) {
        const expectedMessage = Messages[entity][action];

        const toast = this.successToast.first();

        await expect(toast).toBeVisible({ timeout: 5000 });
        await expect(toast).toContainText(expectedMessage);
    }

    /**
     * Assert toast message from message container
     * Useful when toast type is not strictly success
     *
     * @param {string} entity - Entity name
     * @param {string} action - Action name
     */
    async assertByMessage(entity, action) {
        const expectedMessage = Messages[entity][action];

        const toast = this.messageToast.first();

        await expect(toast).toBeVisible({ timeout: 5000 });
        await expect(toast).toContainText(expectedMessage);
    }
}