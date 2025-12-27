import { test, expect } from '@playwright/test'
import { SetupAction } from '../../components/setup.action.js';
import { CommonAction } from '../../components/common.action.js';
import { MenuAction } from '../../components/menu.action.js';
import { ListingAction } from '../../components/listing.action.js';
import { MasterHeaderAction } from '../../components/master-header.action.js';
import { MasterDeleteAction } from '../../components/master-delete.action.js'
import { DocumentAction } from '../../components/document.action.js';
import { LookupAction } from '../../components/lookup.action.js';
import { UploadAction } from '../../components/upload.action.js';
import { getUploadFile } from '../../utils/file.util.js';
import { SupplierPage } from '../../pages/purchase/supplier.page.js';
import supplierData from '../../testdata/purchase/supplier.json';
import StringHelper from '../../helpers/StringHelper.js';
import MessageHelper from '../../helpers/MessageHelper.js';
import SummaryHelper from '../../helpers/SummaryHelper.js';
import { SummaryUtil } from '../../utils/summary.util.js';

test.describe.only('Supplier CRUD Operations', () => {
    let setupAction;
    let supplierPage;
    let commonAction;
    let menuAction;
    let listingAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let documentAction;
    let lookupAction;
    let uploadAction;

    test.beforeEach(async ({ page }) => {
        setupAction = new SetupAction(page);
        supplierPage = new SupplierPage(page);
        commonAction = new CommonAction(page);
        menuAction = new MenuAction(page);
        listingAction = new ListingAction(page);
        masterHeaderAction = new MasterHeaderAction(page);
        masterDeleteAction = new MasterDeleteAction(page, listingAction, commonAction, menuAction);
        documentAction = new DocumentAction(page);
        lookupAction = new LookupAction(page);
        uploadAction = new UploadAction(page);

        await commonAction.navigateToApp('/');
        await menuAction.selectModule('Purchase');
    });

    test('Purchase | Validate supplier | Duplicate name or code not allowed', async ({ page }) => {

        const supplier = supplierData.validate;

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByTextWithIndex('Supplier', 1);
        });

        await test.step('Open new supplier creation form', async () => {
            await menuAction.clickListingMenuOptionWithIndex('New', 0);
        });

        await test.step('Attempt to save supplier with duplicate name', async () => {
            await masterHeaderAction.fillName(supplier.name);
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
            await masterHeaderAction.fillCode(supplier.code);
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
            SummaryUtil.logValidateSummary(supplier.name, supplier.code);
        });

    });

    test('Purchase | Delete supplier', async ({ page }) => {
        // ===== Deletion Summary Trackers =====
        const deletedRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByTextWithIndex('Supplier', 1);
        });

        // ===== Iterate To Delete =====
        for (const supplier of supplierData.delete) {
            try {
                await test.step(`Filter supplier record: ${supplier.name}`, async () => {
                    await listingAction.filterMasterByName(supplier.name);
                });

                const recordExists = await page.locator(`text=${supplier.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);

                if (!recordExists) {
                    console.warn(`⚠️ Deletion skipped because record not found: '${supplier.name}'.`);
                    skippedRecords.push(supplier.name);
                    continue;
                }

                await test.step(`Delete supplier: ${supplier.name}`, async () => {
                    await masterDeleteAction.deleteMasterByName('Supplier', supplier.name);
                });

                await test.step(`Validate supplier deleted message: ${supplier.name}`, async () => {
                    await MessageHelper.assert(page, 'Supplier', 'Delete');
                });

                // ===== Track record deletion =====
                deletedRecords.push(supplier.name);

            } catch (error) {
                // ===== Track record skip
                skippedRecords.push(supplier.name);
                console.warn(`⚠️ Deletion failed: '${supplier.name}': ${error.message}`);
            } finally {
                await test.step(`Clear supplier filter`, async () => {
                    await listingAction.clearMasterNameColumnFilter();
                });
            }
        }

        await test.step('Log delete summary', async () => {
            SummaryUtil.logCrudSummary({
                entityName: 'Supplier',
                action: 'Delete',
                successRecords: deletedRecords, skippedRecords,
                totalCount: supplierData.delete.length
            });
        });

        await test.step('Export delete summary', async () => {
            SummaryUtil.exportCrudSummary({
                entityName: 'Supplier',
                action: 'Delete',
                successRecords: deletedRecords, skippedRecords,
                totalCount: supplierData.delete.length
            });
        });
    });

});