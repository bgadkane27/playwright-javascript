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
import { StockAdjustmentReasonPage } from '../../pages/inventory/stock-adjustment-reason.page.js';
import stockAdjustmentReasonData from '../../testdata/inventory/stock-adjustment-reason.json';

test.describe('Stock Adjustment Reason CRUD Operations', () => {
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
        const VALIDATION_TIMEOUT = 5000;
        const stockAdjustmentReason = stockAdjustmentReasonData.validate;

        await test.step('Navigate to stock adjustment reason master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Adjustment Reason');
        });

        // ===== Precondition (SAFE skip) =====
        const exists = await listingAction.isRecordExists(stockAdjustmentReason.code, CODE_COLUMN_INDEX);

        test.skip(
            !exists,
            `Precondition failed: Stock adjustment reason '${stockAdjustmentReason.code}' not found.`
        );

        await test.step('Open new stock adjustment reason creation form', async () => {
            await menuAction.clickListingMenuOptionByTitle('New');
        });

        try {

            await test.step(`Fill code: ${stockAdjustmentReason.code}`, async () => {
                await masterHeaderAction.fillCodeIntoTextBox(stockAdjustmentReason.code);
            });

            await test.step(`Fill name: ${stockAdjustmentReason.name}`, async () => {
                await masterHeaderAction.fillName(stockAdjustmentReason.name);
            });

            await menuAction.clickTopMenuOption('Save');

            await test.step('Validate duplicate code error message', async () => {
                await expect(
                    page.getByText(/duplicate code.*already exists/i)
                ).toBeVisible({ timeout: VALIDATION_TIMEOUT });
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListing('Stock Adjustment Reason');
            });
        }

        await test.step('Log code validation summary', async () => {
            SummaryHelper.logCodeValidationSummary(stockAdjustmentReason.code);
        });
    });

    test('should prevent creating stock adjustment reason with duplicate name', async ({ page }) => {

        const NAME_COLUMN_INDEX = 3;
        const VALIDATION_TIMEOUT = 5000;
        const stockAdjustmentReason = stockAdjustmentReasonData.validate;

        await test.step('Navigate to stock adjustment reason master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Adjustment Reason');
        });

        // Precondition: Verify record with this name exists
        const exists = await listingAction.isRecordExists(stockAdjustmentReason.name, NAME_COLUMN_INDEX);

        test.skip(
            !exists,
            `Precondition failed: Stock adjustment reason '${stockAdjustmentReason.name}' not found.`
        );

        try {

            await test.step('Open form in create mode', async () => {
                await menuAction.clickListingMenuOptionByTitle('New');
            });

            await test.step(`Fill duplicate name: ${stockAdjustmentReason.name}`, async () => {
                await masterHeaderAction.fillName(stockAdjustmentReason.name);
            });

            await test.step('Attempt to save', async () => {
                await menuAction.clickTopMenuOption('Save');
            });

            await test.step('Verify duplicate name validation error', async () => {
                await expect(
                    page.locator('#ValidationSummary')
                        .filter({ hasText: /stock adjustment reason.*already exists/i })
                ).toBeVisible({ timeout: VALIDATION_TIMEOUT });
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListing('Stock Adjustment Reason');
            });
        }

        SummaryHelper.logNameValidationSummary(stockAdjustmentReason.name);

    });

    test.only('should create stock adjustment reason(s) successfully', async ({ page }) => {

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

                await test.step('Open form in create mode', async () => {
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

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(stockAdjustmentReason.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(stockAdjustmentReason.nameArabic);
                    }
                });

                await stockAdjustmentReasonPage.openDocumentType();
                await lookupAction.selectLookupBoxItemRow(stockAdjustmentReason.type);
                await stockAdjustmentReasonPage.openAdjustmentType();
                await lookupAction.selectLookupBoxItemRow(stockAdjustmentReason.adjustmentType);

                if (ValidationHelper.isNotNullOrWhiteSpace(stockAdjustmentReason.positiveAdjustmentAccount)) {
                    await stockAdjustmentReasonPage.openPositiveAdjustmentAccount(stockAdjustmentReason.positiveAdjustmentAccount);
                    await lookupAction.selectLookupText(stockAdjustmentReason.positiveAdjustmentAccount);
                }

                if (ValidationHelper.isNotNullOrWhiteSpace(stockAdjustmentReason.negativeAdjustmentAccount)) {
                    await stockAdjustmentReasonPage.openNegativeAdjustmentAccount(stockAdjustmentReason.negativeAdjustmentAccount);
                    await lookupAction.selectLookupText(stockAdjustmentReason.negativeAdjustmentAccount);
                }

                await test.step('Save record', async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step('Validate record created message', async () => {
                    await toastHelper.assertByText('StockAdjustmentReason', 'Create');
                });

                createdRecords.push(stockAdjustmentReason.name);

            } catch (error) {
                failedRecords.push(stockAdjustmentReason?.name);
                console.error(`🔴 Failed stock adjustment reason creation for: ${stockAdjustmentReason?.name}\n`, error);
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
                `🔴 Failed stock adjustment reason creation for: ${failedRecords.join(', ')}`
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
                masterType: 'StockAdjustmentReason',
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