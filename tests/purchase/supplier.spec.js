import { test, expect } from '@playwright/test'
import { CommonAction } from '../../actions/common.action.js';
import { MenuAction } from '../../actions/menu.action.js';
import { ListingAction } from '../../actions/listing.action.js';
import { MasterAction } from '../../actions/master.action.js';
import { DocumentAction } from '../../actions/document.action.js';
import { LookupAction } from '../../actions/lookup.action.js';
import { UploadAction } from '../../actions/upload.action.js';
import { getUploadFile } from '../../utils/file.util.js';
import { PurchaseSetupPage } from '../../pages/purchase/purchase-setup.page.js';
import { SupplierPage } from '../../pages/purchase/supplier.page.js';
import supplierData from '../../testdata/purchase/supplier.data.json';
import StringHelper from '../../helpers/StringHelper.js';
import MessageHelper from '../../helpers/MessageHelper.js';
import SummaryHelper from '../../helpers/SummaryHelper.js';
import { logSummary } from '../../utils/logger.util.js';

test.describe.serial('Supplier CRUD Operations', () => {
    let purchaseSetupPage;
    let supplierPage;
    let commonAction;
    let menuAction;
    let listingAction;
    let masterAction;
    let documentAction;
    let lookupAction;
    let uploadAction;

    test.beforeEach(async ({ page }) => {
        purchaseSetupPage = new PurchaseSetupPage(page);
        supplierPage = new SupplierPage(page);
        commonAction = new CommonAction(page);
        menuAction = new MenuAction(page);
        listingAction = new ListingAction(page);
        masterAction = new MasterAction(page);
        documentAction = new DocumentAction(page);
        lookupAction = new LookupAction(page);
        uploadAction = new UploadAction(page);

        await commonAction.navigateToApp('/');
        await menuAction.selectModule('Purchase');
    });

    test('should not allow duplicate supplier creation', async ({ page }) => {

        const supplier = supplierData.validate;

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await purchaseSetupPage.navigateToBase('Supplier');
        });

        await test.step('Open new supplier creation form', async () => {
            await listingAction.clickListingMenuOption('New');
        });

        await test.step('Attempt to save supplier with duplicate name', async () => {
            await masterAction.fillName(supplier.name);
            await menuAction.clickTopMenuOption('Save');
        });

        await test.step('Validate duplicate supplier name message', async () => {
            await expect.soft(
                page.getByText(
                    `Supplier with ${supplier.name} name already exists.`,
                    { exact: false }
                )
            ).toBeVisible();
        });

        await test.step('Attempt to save supplier with duplicate code', async () => {
            await masterAction.fillCode(supplier.code);
            await menuAction.clickTopMenuOption('Save');
        });

        await test.step('Validate duplicate supplier code message', async () => {
            await expect.soft(
                page.getByText(
                    `Duplicate code found. Code: ${supplier.code} already exists!`,
                    { exact: false }
                )
            ).toBeVisible();
        });

        await test.step('Log validation summary', async () => {
            logSummary(supplier.name, supplier.code);
        });

    });

    test('should able to delete supplier', async ({ page }) => {
        // 🗑️ Deletion Summary Trackers
        const deletedRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await purchaseSetupPage.navigateToBase('Supplier');
        });

        // Iterate to delete
        for (const supplier of supplierData.delete) {
            try {
                // Search and filter the record
                await listingAction.filterMasterByName(supplier.name);

                // Check if the record exists before proceeding with deletion
                // const recordExists = await page.locator(`text=${supplier.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);
                const row = page
                    .locator('tbody.dx-row.dx-data-row')
                    .filter({ hasText: supplier.name })
                    .first();

                const recordExists = await row.count() > 0;

                if (!recordExists) {
                    console.warn(`⚠️ Deletion skipped because record not found '${supplier.name}'.`);
                    skippedRecords.push(supplier.name);
                    continue;
                }

                // Proceed with deletion if record exists
                await test.step(`Delete supplier: ${supplier.name}`, async () => {
                    await listingAction.selectMasterRowByName(supplier.name);
                    await commonAction.clickMeatballMenu();
                    await menuAction.clickMenuOptionByText('Delete');
                    await menuAction.clickMenuOptionByText('Ok');
                });

                // Validate deleted message
                await MessageHelper.assert(page, 'Supplier', 'Delete');

                // Track successful deletion
                deletedRecords.push(supplier.name);

            } catch (error) {
                skippedRecords.push(supplier.name);
                console.warn(`⚠️ Deletion failed: '${supplier.name}': ${error.message}`);
            } finally {
                // 🧹 Always reset filter
                await listingAction.clearMasterNameColumnFilter();
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Supplier Delete Summary ==========');
        console.log(`📄 Total Records Attempted: ${supplierData.delete.length}`);
        console.log(`✅ Successfully Deleted: ${deletedRecords.length}`);
        if (deletedRecords.length) {
            console.log('🗑️ Deleted Records: ' + deletedRecords.join(', '));
        }
        console.log(`⚠️ Skipped/Failed: ${skippedRecords.length}`);
        if (skippedRecords.length) {
            console.log('🚫 Skipped Records: ' + skippedRecords.join(', '));
        }
        console.log(`🕒 Test Executed At: ${new Date().toLocaleString('en-IN')}`);
        console.log('======================================');

        SummaryHelper.exportDeleteSummary(
            'Supplier',
            deletedRecords,
            skippedRecords
        );
    });

});