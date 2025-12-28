import Messages from '../constants/toast-messages.js';
import { expect } from '@playwright/test';

export class MessageUtil {

    static async assert(page, entity, action) {
        const message = Messages[entity][action];
        await expect(page.getByText(message).first()).toBeVisible({ timeout: 5000 });
    }

}