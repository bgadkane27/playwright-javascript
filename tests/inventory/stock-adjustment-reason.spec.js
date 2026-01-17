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
import { StockAdjustmentReasonPage } from '../../pages/inventory/stock-adjustment-reason.page.js';
import stockAdjustmentReasonData from '../../testdata/inventory/stock-adjustment-reason.json';

test.describe.skip('Stock Adjustment Reason CRUD Operations', () => {
    let stockAdjustmentReasonPage;
    let menuAction;
    let listingAction;
    let setupAction;
    let commonAction;
    let lookupAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let toastHelper;

    test.beforeEach(async ({ page }) => {
        stockAdjustmentReasonPage = new StockAdjustmentReasonPage(page);
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

    test('should prevent creating stock adjustment reason with duplicate code', async ({ page }) => {

        const CODE_COLUMN_INDEX = 2;
        const stockAdjustmentReason = stockAdjustmentReasonData.validate;

        test.skip(
            !stockAdjustmentReasonData.feature?.allowCodeManual,
            'Setting → Allow code manual is OFF.'
        );

        await test.step('Navigate to stock adjustment reason master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Adjustment Reason');
        });

        const exists = await listingAction.isRecordExists(
            stockAdjustmentReason.code,
            CODE_COLUMN_INDEX
        );

        test.skip(
            !exists,
            `Precondition failed: Stock adjustment reason code '${stockAdjustmentReason.code}' not found.`
        );

        try {

            await test.step(`Open form to create: ${stockAdjustmentReason.name}`, async () => {
                await menuAction.clickListingMenuOptionByTitle('New');
            });

            await test.step(`Fill code: ${stockAdjustmentReason.code}`, async () => {
                await masterHeaderAction.fillCodeIntoTextBox(stockAdjustmentReason.code);
            });

            await test.step(`Fill name: ${stockAdjustmentReason.name}`, async () => {
                await masterHeaderAction.fillName(stockAdjustmentReason.name);
            });

            await test.step('Save record', async () => {
                await menuAction.clickTopMenuOption('Save');
            });

            await test.step('Validate duplicate code error message', async () => {
                await toastHelper.assertValidationMessage('duplicate code.*already exists');
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListing('Stock Adjustment Reason');
            });
        }

        SummaryHelper.logCodeValidationSummary(stockAdjustmentReason.code);

    });

    test('should prevent creating stock adjustment reason with duplicate name', async ({ page }) => {

        const NAME_COLUMN_INDEX = 3;
        const stockAdjustmentReason = stockAdjustmentReasonData.validate;

        test.skip(
            !stockAdjustmentReason?.name,
            'Validation data missing: stock adjustment reason name'
        );

        await test.step('Navigate to stock adjustment reason master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Adjustment Reason');
        });

        // Precondition: Verify record with this name exists
        const exists = await listingAction.isRecordExists(stockAdjustmentReason.name, NAME_COLUMN_INDEX);

        test.skip(
            !exists,
            `Precondition failed: Stock adjustment reason name '${stockAdjustmentReason.name}' not found.`
        );

        try {

            await test.step(`Open form to create: ${stockAdjustmentReason.name}`, async () => {
                await menuAction.clickListingMenuOptionByTitle('New');
            });

            await test.step(`Fill existing name: ${stockAdjustmentReason.name}`, async () => {
                await masterHeaderAction.fillName(stockAdjustmentReason.name);
            });

            await test.step('Attempt to save', async () => {
                await menuAction.clickTopMenuOption('Save');
            });

            await test.step('Validate duplicate name error message', async () => {
                await toastHelper.assertValidationMessage('already exists');
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListing('Stock Adjustment Reason');
            });
        }

        SummaryHelper.logNameValidationSummary(stockAdjustmentReason.name);

    });

    test('should create stock adjustment reason(s) successfully', async ({ page }) => {

        // ===== Record tracking =====
        const createdRecords = [];
        const skippedRecords = [];
        const failedRecords = [];
        const NAME_COLUMN_INDEX = 3;

        await test.step('Navigate to stock adjustment reason master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Adjustment Reason');
        });

        // ===== Iterate to create =====
        for (const stockAdjustmentReason of stockAdjustmentReasonData.create) {

            // ===== Skip invalid test data =====
            if (!stockAdjustmentReason?.name || (stockAdjustmentReasonData.feature?.allowCodeManual && !stockAdjustmentReason.code)) {
                skippedRecords.push(stockAdjustmentReason?.name ?? 'UNKNOWN');
                console.warn(`⚠️ Create skipped due to missing required data`, stockAdjustmentReason);
                continue;
            }

            // ===== Skip if already exists =====
            const exists = await listingAction.isRecordExists(stockAdjustmentReason.name, NAME_COLUMN_INDEX);
            if (exists) {
                skippedRecords.push(stockAdjustmentReason.name);
                console.warn(`⚠️ Skipped: Stock adjustment reason already exists → ${stockAdjustmentReason.name}`);
                continue;
            }

            try {

                await test.step(`Open form to create: ${stockAdjustmentReason.name}`, async () => {
                    await menuAction.clickListingMenuOptionByTitle('New');
                });

                await test.step(`Fill code: ${stockAdjustmentReason.code} if feature is true`, async () => {
                    if (stockAdjustmentReasonData.feature?.allowCodeManual && stockAdjustmentReason.code) {
                        await masterHeaderAction.fillCodeIntoTextBox(stockAdjustmentReason.code);
                    }
                });

                await test.step(`Fill name: ${stockAdjustmentReason.name}`, async () => {
                    await masterHeaderAction.fillName(stockAdjustmentReason.name);
                });

                await test.step(`Open lookup and select document type: ${stockAdjustmentReason.documentType}`, async () => {
                    await lookupAction.openLookupAndSelectItem('DocumentType', stockAdjustmentReason.documentType);
                });

                await test.step(`Open lookup and select document type: ${stockAdjustmentReason.adjustmentType}`, async () => {
                    await lookupAction.openLookupAndSelectItem('AdjustmentType', stockAdjustmentReason.adjustmentType);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNonEmptyString(stockAdjustmentReason.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(stockAdjustmentReason.nameArabic);
                    }

                    if (ValidationHelper.isNonEmptyString(stockAdjustmentReason.positiveAdjustmentAccount)) {
                        await lookupAction.openLookupAndSelectValue('PositiveAdjustmentMainAccount', stockAdjustmentReason.positiveAdjustmentAccount);
                    }

                    if (ValidationHelper.isNonEmptyString(stockAdjustmentReason.negativeAdjustmentAccount)) {
                        await lookupAction.openLookupAndSelectValue('NegativeAdjustmentMainAccount', stockAdjustmentReason.negativeAdjustmentAccount);
                    }
                });

                await test.step('Save record', async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step('Validate record created message', async () => {
                    await toastHelper.assertTextToast('StockAdjustmentReason', 'Create');
                });

                createdRecords.push(stockAdjustmentReason.name);

            } catch (error) {
                failedRecords.push(stockAdjustmentReason?.name);
                console.error(`🔴 Stock adjustment reason creation failed for: ${stockAdjustmentReason?.name}\n`, error);
            } finally {
                await menuAction
                    .navigateBackToListing('Stock Adjustment Reason')
                    .catch(async () => {
                        console.warn('🔴 Navigation failed, reloading page');
                        await page.reload();
                    });
            }
        }

        SummaryHelper.logCrudSummary({
            entityName: 'Stock Adjustment Reason',
            action: 'Create',
            successRecords: createdRecords,
            skippedRecords: skippedRecords,
            failedRecords: failedRecords,
            totalCount: stockAdjustmentReasonData.create.length
        });

        SummaryHelper.exportCrudSummary({
            entityName: 'Stock Adjustment Reason',
            action: 'Create',
            successRecords: createdRecords,
            skippedRecords: skippedRecords,
            failedRecords: failedRecords,
            totalCount: stockAdjustmentReasonData.create.length
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Stock adjustment reason creation failed for: ${failedRecords.join(', ')}`
            );
        }

    });

    test('should update stock adjustment reason(s) successfully', async ({ page }) => {

        // ===== Record tracking =====
        const updatedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];
        const NAME_COLUMN_INDEX = 3;

        await test.step('Navigate to stock adjustment reason master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Adjustment Reason');
        });

        // ===== Iterate to update =====
        for (const stockAdjustmentReason of stockAdjustmentReasonData.update) {

            // ===== Skip invalid test data =====
            if (
                !stockAdjustmentReason?.name ||
                !stockAdjustmentReason?.newName ||
                (stockAdjustmentReasonData.feature?.allowCodeManual && !stockAdjustmentReason.newCode)
            ) {
                skippedRecords.push(stockAdjustmentReason?.name ?? 'UNKNOWN');
                console.warn(`⚠️ Update skipped due to missing required data`, stockAdjustmentReason);
                continue;
            }

            // ===== Skip if record does NOT exist =====
            const exists = await listingAction.isRecordExists(stockAdjustmentReason.name, NAME_COLUMN_INDEX);
            if (!exists) {
                skippedRecords.push(stockAdjustmentReason.name);
                console.warn(`⚠️ Skipped: Stock adjustment reason does not exist → ${stockAdjustmentReason.name}`);
                continue;
            }

            try {

                await test.step(`Select the record to update: ${stockAdjustmentReason.name}`, async () => {
                    await listingAction.selectRecordByText(stockAdjustmentReason.name);
                });

                await test.step('Open form to edit', async () => {
                    await menuAction.clickListingMenuOptionByTitle('Edit');
                });

                await test.step(`Fill new code: ${stockAdjustmentReason.newCode} if feature is true`, async () => {
                    if (stockAdjustmentReasonData.feature?.allowCodeManual && stockAdjustmentReason.newCode) {
                        await masterHeaderAction.fillCodeIntoTextBox(stockAdjustmentReason.newCode);
                    }
                });

                await test.step(`Fill new name: ${stockAdjustmentReason.newName}`, async () => {
                    await masterHeaderAction.fillName(stockAdjustmentReason.newName);
                });

                await test.step(`Open lookup and select document type: ${stockAdjustmentReason.documentType}`, async () => {
                    if (ValidationHelper.isNonEmptyString(stockAdjustmentReason.documentType)) {
                        await lookupAction.openLookupAndSelectItem('DocumentType', stockAdjustmentReason.documentType);
                    }
                });

                await test.step(`Open lookup and select adjustment type: ${stockAdjustmentReason.adjustmentType}`, async () => {
                    if (ValidationHelper.isNonEmptyString(stockAdjustmentReason.adjustmentType)) {
                        await lookupAction.openLookupAndSelectItem('AdjustmentType', stockAdjustmentReason.adjustmentType);
                    }
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNonEmptyString(stockAdjustmentReason.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(stockAdjustmentReason.nameArabic);
                    }

                    if (ValidationHelper.isNonEmptyString(stockAdjustmentReason.positiveAdjustmentAccount)) {
                        await lookupAction.openLookupAndSelectValue('PositiveAdjustmentMainAccount', stockAdjustmentReason.positiveAdjustmentAccount);
                    }

                    if (ValidationHelper.isNonEmptyString(stockAdjustmentReason.negativeAdjustmentAccount)) {
                        await lookupAction.openLookupAndSelectValue('NegativeAdjustmentMainAccount', stockAdjustmentReason.negativeAdjustmentAccount);
                    }
                });

                await test.step('Save updated record', async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step(`Validate updated name: ${stockAdjustmentReason.newName}`, async () => {
                    await expect(page.locator("input[name='StockAdjustmentReason.Name']")).toHaveValue(stockAdjustmentReason.newName);
                });

                updatedRecords.push(`${stockAdjustmentReason.name} → ${stockAdjustmentReason.newName}`);

            } catch (error) {
                failedRecords.push(`${stockAdjustmentReason.name} → ${stockAdjustmentReason.newName}`);
                console.error(`🔴 Stock adjustment reason updation failed for: ${stockAdjustmentReason?.name}\n`, error);
            } finally {
                await menuAction
                    .navigateBackToListing('Stock Adjustment Reason')
                    .catch(async () => {
                        console.warn('🔴 Navigation failed, reloading page');
                        await page.reload();
                    });
            }
        }

        SummaryHelper.logCrudSummary({
            entityName: 'Stock Adjustment Reason',
            action: 'Update',
            successRecords: updatedRecords,
            skippedRecords: skippedRecords,
            failedRecords: failedRecords,
            totalCount: stockAdjustmentReasonData.update.length
        });

        SummaryHelper.exportCrudSummary({
            entityName: 'Stock Adjustment Reason',
            action: 'Update',
            successRecords: updatedRecords,
            skippedRecords: skippedRecords,
            failedRecords: failedRecords,
            totalCount: stockAdjustmentReasonData.update.length
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Stock adjustment reason updation failed for: ${failedRecords.join(', ')}`
            );
        }

    });

    test('should delete stock adjustment reason(s) successfully', async ({ page }) => {

        // ===== Record tracking =====
        const deletedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to stock adjustment reason master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Adjustment Reason');
        });

        // ===== Iterate & Delete =====
        for (const stockAdjustmentReason of stockAdjustmentReasonData.delete) {
            const result = await masterDeleteAction.safeDeleteByName({
                entityName: 'StockAdjustmentReason',
                name: stockAdjustmentReason.name,
                retries: 1
            });

            if (result === 'deleted') {
                deletedRecords.push(stockAdjustmentReason.name);
            }

            if (result === 'skipped') {
                skippedRecords.push(stockAdjustmentReason.name);
            }

            if (result === 'failed') {
                failedRecords.push(stockAdjustmentReason.name);
            }
        }

        SummaryHelper.logCrudSummary({
            entityName: 'Stock Adjustment Reason',
            action: 'Delete',
            successRecords: deletedRecords,
            skippedRecords: skippedRecords,
            failedRecords: failedRecords,
            totalCount: stockAdjustmentReasonData.delete.length
        });

        SummaryHelper.exportCrudSummary({
            entityName: 'Stock Adjustment Reason',
            action: 'Delete',
            successRecords: deletedRecords,
            skippedRecords: skippedRecords,
            failedRecords: failedRecords,
            totalCount: stockAdjustmentReasonData.delete.length
        });

        // ===== Fail test ONLY for real failures =====
        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Stock adjustment reason delete failed for: ${failedRecords.join(', ')}`
            );
        }
    });

});