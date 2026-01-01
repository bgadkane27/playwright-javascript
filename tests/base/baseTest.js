// baseTest.js
import { test as base, expect } from '@playwright/test';

/**
 * Base Test
 * -------------
 * This file acts as a single entry point for:
 * - Global hooks (beforeEach / afterEach)
 * - Shared logging
 * - Future fixtures (auth, storage, API context, etc.)
 */

export const test = base;

/**
 * Global beforeEach
 * -----------------
 * Runs before EVERY test that imports `test` from baseTest.js
 */
test.beforeEach(async ({ page }, testInfo) => {
    // console.info(`▶️ Running Test: ${testInfo.title}`);
    // Default navigation (can be overridden in spec if needed)
    await page.goto('/');
});

/**
 * Global afterEach
 * ----------------
 * Runs after EVERY test
 */
test.afterEach(async ({}, testInfo) => {
    console.info(
    `\n📋  [Test Summary] 
    🧪 Test      : ${testInfo.title}
    📌 Status    : ${testInfo.status}
    ⏱  Duration  : ${(testInfo.duration / 1000).toFixed(2)} s`
    );

    // Optional: log error details for failed tests
    if (testInfo.status === 'failed' && testInfo.error) {
        console.error('❌ Error:', testInfo.error.message);
    }
});

export { expect };
