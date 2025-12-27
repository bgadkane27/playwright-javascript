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
import { SummaryUtil } from '../../utils/logger.util.js';

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
            SummaryUtil.validationSummary(supplier.name, supplier.code);
        });

    });

    test.skip('Purchase | Delete supplier1', async ({ page }) => {
        // 🗑️ Deletion Summary Trackers
        const deletedRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByTextWithIndex('Supplier', 1);
        });

        // Iterate to delete
        for (const supplier of supplierData.delete) {
            try {
                // Search and filter the record
                await listingAction.filterMasterByName(supplier.name);

                // Check if the record exists before proceeding with deletion
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
                // await test.step(`Delete supplier: ${supplier.name}`, async () => {
                //     await listingAction.selectMasterRowByName(supplier.name);
                //     await commonAction.clickMeatballMenu();
                //     await menuAction.clickMenuOptionByText('Delete');
                //     await menuAction.clickMenuOptionByText('Ok');
                // });
                await test.step(`Delete supplier: ${supplier.name}`, async () => {
                    await deleteAction.deleteMasterByName('Supplier', supplier.name);
                });

                await test.step(`Validate supplier deleted messsage: ${supplier.name}`, async () => {
                    await MessageHelper.assert(page, 'Supplier', 'Delete');
                });

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

    test('Purchase | Delete supplier', async ({ page }) => {
        // ===== Deletion Summary Trackers =====
        const deletedRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByTextWithIndex('Supplier', 1);
        });

        // ===== Iterate to delete =====
        for (const supplier of supplierData.delete) {
            try {
                await test.step(`Filter supplier record: ${supplier.name}`, async () => {
                    await listingAction.filterMasterByName(supplier.name);
                });

                let recordExists = false;

                await test.step(`Check if record exists: ${supplier.name}`, async () => {
                    const row = page
                        .locator('tbody.dx-row.dx-data-row')
                        .filter({ hasText: supplier.name })
                        .first();

                    recordExists = (await row.count()) > 0;
                });

                if (!recordExists) {
                    console.warn(`⚠️ Deletion skipped because record not found: '${supplier.name}'.`);
                    skippedRecords.push(supplier.name);
                    continue;
                }

                await test.step(`Delete supplier: ${supplier.name}`, async () => {
                    await deleteAction.deleteMasterByName('Supplier', supplier.name);
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

        await test.step('Print delete summary report', async () => {
            SummaryUtil.printDeleteSummary('Supplier',
                deletedRecords,
                skippedRecords,
                supplierData.delete.length);
        });

        await test.step('Export delete summary', async () => {
            SummaryHelper.exportDeleteSummary(
                'Supplier',
                deletedRecords,
                skippedRecords
            );
        });
    });

});