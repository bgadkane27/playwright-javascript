import SuccessMessages from '../constants/SuccessMessages.js';
import { expect } from '@playwright/test';

class SuccessMessageHelper {

    static async assert(page, entity, action) {
        const message = SuccessMessages[entity][action];
        await expect(page.getByText(message).first()).toBeVisible();
    }
}

export default SuccessMessageHelper;