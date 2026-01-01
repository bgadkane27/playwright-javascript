import { test as base } from '@playwright/test';

export const test = base;

test.afterEach(async ({ }, testInfo) => {
    console.info(
        `[TEST SUMMARY] ${testInfo.title} | 
        Status: ${testInfo.status} |
        Duration: ${testInfo.duration}ms`
    );
});

export { expect } from '@playwright/test';