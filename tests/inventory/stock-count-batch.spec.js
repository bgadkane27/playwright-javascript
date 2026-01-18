import { test, expect } from '../base/baseTest.js';
import { MenuAction } from '../../components/menu.action.js';
import { LookupAction } from '../../components/lookup.action.js';
import { ListingAction } from '../../components/listing.action.js';
import { SetupAction } from '../../components/setup.action.js';
import { CommonAction } from '../../components/common.action.js';
import { MasterHeaderAction } from '../../components/master-header.action.js';
import { MasterDeleteAction } from '../../components/master-delete.action.js';
import { ValidationHelper } from '../../helpers/validationHelper.js';
import { ToastHelper } from '../../helpers/toastHelper.js';
import { SummaryHelper } from '../../helpers/summaryHelper.js';
import { DateHelper } from '../../helpers/dateHelper.js';
import { StockCountBatchPage } from '../../pages/inventory/stock-count-batch.page.js';
import stockCountBatchData from '../../testdata/inventory/stock-count-batch.json';

test.describe.skip('Stock Count Batch CRUD Operations', () => {
    let stockCountBatchPage;
    let menuAction;
    let listingAction;
    let setupAction;
    let commonAction;
    let lookupAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let toastHelper;

    test.beforeEach(async ({ page }) => {
        stockCountBatchPage = new StockCountBatchPage(page);
        menuAction = new MenuAction(page);
        listingAction = new ListingAction(page);
        setupAction = new SetupAction(page);
        commonAction = new CommonAction(page);
        lookupAction = new LookupAction(page);
        masterHeaderAction = new MasterHeaderAction(page);
        masterDeleteAction = new MasterDeleteAction(page, listingAction, commonAction, menuAction);
        toastHelper = new ToastHelper(page);

        await commonAction.navigateToApp('/');
        await menuAction.selectModule('Inventory');
    });

    test('create: stock count batch should show validation message for duplicate code', async ({ page }) => {

        const stockCountBatch = stockCountBatchData.validate;
        const todayDate = DateHelper.getDate();

        await test.step('Navigate to stock count batch master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Count Batch');
        });

        // ===== Precondition (SAFE skip) =====
        const exists = await listingAction.isRecordExists(stockCountBatch?.code, 2);

        test.skip(
            !exists,
            `Precondition failed: Stock count batch '${stockCountBatch?.code}' not found.`
        );

        await test.step('Open new stock count batch creation form', async () => {
            await menuAction.clickListingMenuOptionByTitle('New');
        });

        try {

            await test.step(`Fill code: ${stockCountBatch.code}`, async () => {
                await masterHeaderAction.fillCodeIntoTextBox(stockCountBatch.code);
            });

            await test.step(`Fill name: ${stockCountBatch.name}`, async () => {
                await masterHeaderAction.fillName(stockCountBatch.name);
            });

            await test.step('Open Warehouse lookup', async () => {
                await stockCountBatchPage.openWarehouseLookup();
            });

            await test.step(`Select warehouse: ${stockCountBatch.warehouse}`, async () => {
                await lookupAction.selectLookupText(stockCountBatch.warehouse);
            });

            await test.step(`Fill Freeze Date: ${todayDate}`, async () => {
                await stockCountBatchPage.fillFreezedDate(todayDate);
            });

            await menuAction.clickTopMenuOption('Save');

            await test.step('Validate duplicate code error message', async () => {
                await expect(
                    page.getByText(/duplicate code.*already exists/i)
                ).toBeVisible({ timeout: 5000 });
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListingByTitle('Stock Count Batch');
            });
        }

        await test.step('Log code validation summary', async () => {
            SummaryHelper.logCodeValidationSummary(stockCountBatch.code);
        });
    });

    test('create: stock count batch should show validation message for duplicate name', async ({ page }) => {

        const stockCountBatch = stockCountBatchData.validate;
        const todayDate = DateHelper.getDate();

        await test.step('Navigate to stock count batch master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Count Batch');
        });

        // ===== Precondition (SAFE skip) =====
        const exists = await listingAction.isRecordExists(stockCountBatch?.name, 3);

        test.skip(
            !exists,
            `Precondition failed: Stock count batch '${stockCountBatch?.name}' not found.`
        );

        await test.step('Open new stock count batch creation form', async () => {
            await menuAction.clickListingMenuOptionByTitle('New');
        });

        try {
            await test.step(`Fill name: ${stockCountBatch.name}`, async () => {
                await masterHeaderAction.fillName(stockCountBatch.name);
            });

            await test.step('Open Warehouse lookup', async () => {
                await stockCountBatchPage.openWarehouseLookup();
            });

            await test.step(`Select warehouse: ${stockCountBatch.warehouse}`, async () => {
                await lookupAction.selectLookupText(stockCountBatch.warehouse);
            });

            await test.step(`Fill Freeze Date: ${todayDate}`, async () => {
                await stockCountBatchPage.fillFreezedDate(todayDate);
            });

            await menuAction.clickTopMenuOption('Save');

            await test.step('Validate duplicate name error message', async () => {
                await expect(
                    page.getByText(/stock count batch.*already exists/i)
                ).toBeVisible({ timeout: 5000 });
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListingByTitle('Stock Count Batch');
            });
        }

        await test.step('Log name validation summary', async () => {
            SummaryHelper.logNameValidationSummary(stockCountBatch.name);
        });

    });

    test('create: stock count batch should show validation message for freezed date', async ({ page }) => {

        const stockCountBatch = stockCountBatchData.validate;

        await test.step('Navigate to stock count batch master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Count Batch');
        });

        try {

            await test.step('Open new stock count batch creation form', async () => {
                await menuAction.clickListingMenuOptionByTitle('New');
            });

            await test.step(`Fill stock count batch code: ${stockCountBatch.code} if feature is true`, async () => {
                if (stockCountBatchData.feature?.allowCodeManual && stockCountBatch.code) {
                    await masterHeaderAction.fillCodeIntoTextBox(stockCountBatch.code);
                }
            });

            await test.step(`Fill name: ${stockCountBatch.newName}`, async () => {
                await masterHeaderAction.fillName(stockCountBatch.newName);
            });

            await test.step('Open Warehouse lookup', async () => {
                await stockCountBatchPage.openWarehouseLookup();
            });

            await test.step(`Select warehouse: ${stockCountBatch.warehouse}`, async () => {
                await lookupAction.selectLookupText(stockCountBatch.warehouse);
            });

            await menuAction.clickTopMenuOption('Save');

            await test.step('Validate freezed date required error message', async () => {
                await expect(
                    page.getByText(/StockFreezeDate.*is required/i).first()
                ).toBeVisible({ timeout: 5000 });
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListingByTitle('Stock Count Batch');
            });
        }

    });

    test('should create stock count batches successfully', async ({ page }) => {

        // ===== Record tracking =====
        const createdRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to stock count batch master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Count Batch');
        });

        // ===== Iterate to create =====
        for (const [index, stockCountBatch] of stockCountBatchData.create.entries()) {
            const newDate = DateHelper.getDate(index - 1);

            // ===== Skip invalid test data =====
            if (!stockCountBatch?.name || (stockCountBatchData.feature?.allowCodeManual && !stockCountBatch.code)) {
                skippedRecords.push(stockCountBatch?.name ?? 'UNKNOWN');
                console.warn(`⚠️ Create skipped due to missing required data`, stockCountBatch);
                continue;
            }

            // ===== Skip if already exists =====
            const exists = await listingAction.isRecordExists(stockCountBatch.name, 3);
            if (exists) {
                skippedRecords.push(stockCountBatch.name);
                console.warn(`⚠️ Skipped: Stock count batch already exists → ${stockCountBatch.name}`);
                continue;
            }

            try {

                await test.step(`Open new stock count batch creation form`, async () => {
                    await menuAction.clickListingMenuOptionByTitle('New');
                });

                await test.step(`Fill stock count batch code: ${stockCountBatch.code} if feature is true`, async () => {
                    if (stockCountBatchData.feature?.allowCodeManual && stockCountBatch.code) {
                        await masterHeaderAction.fillCodeIntoTextBox(stockCountBatch.code);
                    }
                });

                await test.step(`Fill stock count batch name: ${stockCountBatch.name}`, async () => {
                    await masterHeaderAction.fillName(stockCountBatch.name);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNonEmptyString(stockCountBatch.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(stockCountBatch.nameArabic);
                    }

                    if (ValidationHelper.isNonEmptyString(stockCountBatch.description)) {
                        await masterHeaderAction.fillDescription(stockCountBatch.description);
                    }
                });

                await test.step('Open Warehouse lookup', async () => {
                    await stockCountBatchPage.openWarehouseLookup();
                });

                await test.step(`Select warehouse: ${stockCountBatch.warehouse}`, async () => {
                    await lookupAction.selectLookupText(stockCountBatch.warehouse);
                });

                await test.step(`Fill Freeze Date: ${newDate}`, async () => {
                    await stockCountBatchPage.fillFreezedDate(newDate);
                });

                if (ValidationHelper.isNonEmptyString(stockCountBatch.adjustmentMethod)) {
                    await test.step('Open Adjustment Method lookup popup', async () => {
                        await stockCountBatchPage.openAdjustmentMethodLookup();
                    });

                    await test.step(`Select Adjustment Method: ${stockCountBatch.adjustmentMethod}`, async () => {
                        await lookupAction.selectLookupBoxItemRow(stockCountBatch.adjustmentMethod);
                    });
                }

                await menuAction.clickTopMenuOption('Save');

                await test.step(`Validate stock count batch created message`, async () => {
                    await toastHelper.assertTextToast('StockCountBatch', 'Create');
                });

                createdRecords.push(stockCountBatch.name);

            } catch (error) {
                failedRecords.push(stockCountBatch?.name);
                console.error(`🔴 Failed stock count batch creation: ${stockCountBatch?.name}\n`, error);
            } finally {
                await menuAction
                    .navigateBackToListingByTitle('Stock Count Batch')
                    .catch(async () => {
                        console.warn('🔴 Navigation failed, reloading page');
                        await page.reload();
                    });
            }
        }

        await test.step('Log create summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Stock Count Batch',
                action: 'Create',
                successRecords: createdRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: stockCountBatchData.create.length
            });
        });


        await test.step('Export create summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Stock Count Batch',
                action: 'Create',
                successRecords: createdRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: stockCountBatchData.create.length
            });
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Failed stock count batch creation for: ${failedRecords.join(', ')}`
            );
        }

    });

    test('should update stock count batches successfully', async ({ page }) => {

        // ===== Record tracking =====
        const updatedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to stock count batch master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Count Batch');
        });

        // ===== Iterate to update =====
        for (const stockCountBatch of stockCountBatchData.update) {

            // ===== Skip invalid data =====
            if (
                !stockCountBatch?.name ||
                !stockCountBatch?.newName ||
                (stockCountBatchData.feature?.allowCodeManual && !stockCountBatch.code)
            ) {
                skippedRecords.push(stockCountBatch?.name ?? 'UNKNOWN');
                console.warn(`⚠️ Update skipped due to missing required data`, stockCountBatch);
                continue;
            }

            // ===== Skip if record does NOT exist =====
            const exists = await listingAction.isRecordExists(stockCountBatch.name, 3);
            if (!exists) {
                skippedRecords.push(stockCountBatch.name);
                console.warn(`⚠️ Skipped: Stock count batch does not exist → ${stockCountBatch.name}`);
                continue;
            }

            try {

                await test.step(`Select the record: ${stockCountBatch.name}`, async () => {
                    await listingAction.selectRecordByText(stockCountBatch.name);
                });

                await test.step(`Open stock count batch in edit mode`, async () => {
                    await menuAction.clickListingMenuOptionByTitle('Edit');
                });

                await test.step(`Fill stock count batch code: ${stockCountBatch.newCode} if feature is true`, async () => {
                    if (stockCountBatchData.feature?.allowCodeManual && stockCountBatch.newCode) {
                        await masterHeaderAction.fillCodeIntoTextBox(stockCountBatch.newCode);
                    }
                });

                await test.step(`Fill stock count batch new name: ${stockCountBatch.newName}`, async () => {
                    await masterHeaderAction.fillName(stockCountBatch.newName);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNonEmptyString(stockCountBatch.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(stockCountBatch.nameArabic);
                    }

                    if (ValidationHelper.isNonEmptyString(stockCountBatch.description)) {
                        await masterHeaderAction.fillDescription(stockCountBatch.description);
                    }

                });

                if (ValidationHelper.isNonEmptyString(stockCountBatch.adjustmentMethod)) {
                    await test.step('Open Adjustment Method lookup popup', async () => {
                        await stockCountBatchPage.openAdjustmentMethodLookup();
                    });

                    await test.step(`Select Adjustment Method: ${stockCountBatch.adjustmentMethod}`, async () => {
                        await lookupAction.selectLookupBoxItemRow(stockCountBatch.adjustmentMethod);
                    });
                }

                await menuAction.clickTopMenuOption('Save');

                await test.step(`Validate updated name: ${stockCountBatch.newName}`, async () => {
                    await expect(page.locator("input[name='StockCountBatch.Name']")).toHaveValue(stockCountBatch.newName);
                });

                updatedRecords.push(`${stockCountBatch.name} → ${stockCountBatch.newName}`);

            } catch (error) {
                failedRecords.push(stockCountBatch?.name);
                console.error(`🔴 Failed stock count batch update: ${stockCountBatch?.name} \n`, error);
            } finally {
                await test.step(`Back to listing`, async () => {
                    await menuAction
                        .navigateBackToListingByTitle('Stock Count Batch')
                        .catch(async () => {
                            console.warn('🔴 Navigation failed, reloading page');
                            await page.reload();
                        });
                });

                await test.step(`Clear stock count batch filter`, async () => {
                    await listingAction.clearFilterDataFromColumnIndex(3);
                });
            }
        }

        await test.step('Log update summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Stock Count Batch',
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: stockCountBatchData.update.length
            });
        });

        await test.step('Export update summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Stock Count Batch',
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: stockCountBatchData.update.length
            });
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Stock count batch update failed for: ${failedRecords.join(', ')}`
            );
        }
    });

    test('should delete stock count batches successfully', async ({ page }) => {

        // ===== Record tracking =====
        const deletedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to stock count batch master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Count Batch');
        });

        // ===== Iterate & Delete =====
        for (const stockCountBatch of stockCountBatchData.delete) {
            const result = await masterDeleteAction.safeDeleteByName({
                entityName: 'StockCountBatch',
                name: stockCountBatch.name,
                retries: 1
            });

            if (result === 'deleted') {
                deletedRecords.push(stockCountBatch.name);
            }

            if (result === 'skipped') {
                skippedRecords.push(stockCountBatch.name);
            }

            if (result === 'failed') {
                failedRecords.push(stockCountBatch.name);
            }
        }

        await test.step('Log delete summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Stock Count Batch',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: stockCountBatchData.delete.length
            });
        });

        await test.step('Export delete summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Stock Count Batch',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: stockCountBatchData.delete.length
            });
        });

        // ===== Fail test ONLY for real failures =====
        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Stock count batch delete failed for: ${failedRecords.join(', ')}`
            );
        }
    });

});