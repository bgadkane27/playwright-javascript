import { expect } from '@playwright/test';
import { test as fixtureTest } from './fixtures.js';

export const test = fixtureTest;

/**
 * Global beforeEach
 * -----------------
 * Runs before EVERY test that imports `test` from baseTest.js
 */
test.beforeEach(async ({ page }, testInfo) => {
    console.info(`\n🧪 Test: ${testInfo.title}`);
    // Default navigation (can be overridden in spec if needed)
    await page.goto('/');
});

/**
 * Global afterEach
 * ----------------
 * Runs after EVERY test
 */
test.afterEach(async ({ }, testInfo) => {
    console.info(
        `\n📋  [Test Summary] 
    🧪 Test      : ${testInfo.title}
    📌 Status    : ${testInfo.status}
    🕒 Duration  : ${(testInfo.duration / 1000).toFixed(2)} s`
    );

    // Optional: log error details for failed tests
    if (testInfo.status === 'failed' && testInfo.error) {
        console.error(testInfo.error.message);
    }
});

export { expect };
