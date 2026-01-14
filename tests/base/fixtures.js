import { test as base } from '@playwright/test';

import { MenuAction } from '../../components/menu.action.js';
import { LookupAction } from '../../components/lookup.action.js';
import { ListingAction } from '../../components/listing.action.js';
import { SetupAction } from '../../components/setup.action.js';
import { CommonAction } from '../../components/common.action.js';
import { DocumentAction } from '../../components/document.action.js';
import { UploadAction } from '../../components/upload.action.js';
import { MasterHeaderAction } from '../../components/master-header.action.js';
import { MasterDeleteAction } from '../../components/master-delete.action.js';
import { ToastHelper } from '../../helpers/toastHelper.js';

export const test = base.extend({

    commonAction: async ({ page }, use) => {
        await use(new CommonAction(page));
    },

    menuAction: async ({ page }, use) => {
        await use(new MenuAction(page));
    },

    setupAction: async ({ page }, use) => {
        await use(new SetupAction(page));
    },

    listingAction: async ({ page }, use) => {
        await use(new ListingAction(page));
    },

    lookupAction: async ({ page }, use) => {
        await use(new LookupAction(page));
    },

    documentAction: async ({ page }, use) => {
        await use(new DocumentAction(page));
    },

    uploadAction: async ({ page }, use) => {
        await use(new UploadAction(page));
    },

    masterHeaderAction: async ({ page }, use) => {
        await use(new MasterHeaderAction(page));
    },

    masterDeleteAction: async (
        { page, listingAction, commonAction, menuAction },
        use
    ) => {
        await use(
            new MasterDeleteAction(
                page,
                listingAction,
                commonAction,
                menuAction
            )
        );
    },

    toastHelper: async ({ page }, use) => {
        await use(new ToastHelper(page));
    },

    /* ---------- Module setups ---------- */

    accountingSetup: async ({ commonAction, menuAction }, use) => {
        await commonAction.navigateToApp('/');
        await menuAction.selectModule('Accounting');
        await use(true);
    },

    salesSetup: async ({ commonAction, menuAction }, use) => {
        await commonAction.navigateToApp('/');
        await menuAction.selectModule('Sales');
        await use(true);
    },

    purchaseSetup: async ({ commonAction, menuAction }, use) => {
        await commonAction.navigateToApp('/');
        await menuAction.selectModule('Purchase');
        await use(true);
    },

    inventorySetup: async ({ commonAction, menuAction }, use) => {
        await commonAction.navigateToApp('/');
        await menuAction.selectModule('Inventory');
        await use(true);
    }
});