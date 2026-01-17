import { test as base } from '@playwright/test';

import { MenuAction } from '../components/menu.action.js';
import { LookupAction } from '../components/lookup.action.js';
import { ListingAction } from '../components/listing.action.js';
import { SetupAction } from '../components/setup.action.js';
import { CommonAction } from '../components/common.action.js';
import { DocumentAction } from '../components/document.action.js';
import { UploadAction } from '../components/upload.action.js';
import { MasterHeaderAction } from '../components/master-header.action.js';
import { MasterDeleteAction } from '../components/master-delete.action.js';
import { ToastHelper } from '../helpers/toastHelper.js';

async function openModule(app, moduleName) {
  await app.common.navigateToApp('/');
  await app.menu.selectModule(moduleName);
}

export const test = base.extend({

  /* ================== APP CONTEXT ================== */
  app: async ({ page }, use) => {

    const common = new CommonAction(page);
    const menu = new MenuAction(page);
    const listing = new ListingAction(page);
    const lookup = new LookupAction(page);
    const setup = new SetupAction(page);
    const document = new DocumentAction(page);
    const upload = new UploadAction(page);
    const header = new MasterHeaderAction(page);
    const toast = new ToastHelper(page);

    const masterDelete = new MasterDeleteAction(
      page,
      listing,
      common,
      menu
    );

    await use({
      page,
      common,
      menu,
      listing,
      lookup,
      setup,
      document,
      upload,
      header,
      masterDelete,
      toast
    });
  },

  /* ================== MODULE SETUPS ================== */

  // accountingModule: async ({ app }, use) => {
  //   await app.common.navigateToApp('/');
  //   await app.menu.selectModule('Accounting');
  //   await use(true);
  // },

  // salesModule: async ({ app }, use) => {
  //   await app.common.navigateToApp('/');
  //   await app.menu.selectModule('Sales');
  //   await use(true);
  // },

  // purchaseModule: async ({ app }, use) => {
  //   await app.common.navigateToApp('/');
  //   await app.menu.selectModule('Purchase');
  //   await use(true);
  // },

  // inventoryModule: async ({ app }, use) => {
  //   await app.common.navigateToApp('/');
  //   await app.menu.selectModule('Inventory');
  //   await use(true);
  // }

  accountingModule: async ({ app }, use) => {
    await openModule(app, 'Accounting');
    await use(true);
  },

  salesModule: async ({ app }, use) => {
    await openModule(app, 'Sales');
    await use(true);
  },

  purchaseModule: async ({ app }, use) => {
    await openModule(app, 'Purchase');
    await use(true);
  },

  inventoryModule: async ({ app }, use) => {
    await openModule(app, 'Inventory');
    await use(true);
  }

});

export const expect = test.expect;