import Messages from '../constants/toast-messages.js';
import { expect } from '@playwright/test';

class MessageHelper {

    static async assert(page, entity, action) {
        const message = Messages[entity][action];
        await expect(page.getByText(message).first()).toBeVisible({ timeout: 5000 });
    }
}

export default MessageHelper;