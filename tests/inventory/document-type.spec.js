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
import { DocumentTypePage } from '../../pages/inventory/document-type.page.js';
import documentTypeData from '../../testdata/inventory/document-type.json';

test.describe('Document Type CRUD Operations', () => {
    let documentTypePage;
    let menuAction;
    let listingAction;
    let setupAction;
    let commonAction;
    let lookupAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let toastHelper;

    test.beforeEach(async ({ page }) => {
        documentTypePage = new DocumentTypePage(page);
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

    test('validate: document type - should prevent duplicate code', async ({ page }) => {

        const CODE_COLUMN_INDEX = 2;
        const documentType = documentTypeData.validate;

        test.skip(
            !documentTypeData.feature?.allowCodeManual,
            'Setting → Allow code manual is OFF.'
        );

        test.skip(
            !documentType?.code || !documentType?.name,
            'Validation data missing: Document type code or name'
        );

        await test.step('Navigate to master: Document Type', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Document Type');
        });

        const exists = await listingAction.isRecordExists(
            documentType.code,
            CODE_COLUMN_INDEX
        );

        test.skip(
            !exists,
            `Precondition failed: Document Type code '${documentType.code}' not found.`
        );

        try {

            await test.step('Open form to create record', async () => {
                await menuAction.clickListingMenuOptionByTitle('New');
            });

            await test.step(`Fill code: ${documentType.code}`, async () => {
                await masterHeaderAction.fillCodeIntoTextBox(documentType.code);
            });

            await test.step(`Fill name: ${documentType.name}`, async () => {
                await masterHeaderAction.fillName(documentType.name);
            });

            await test.step('Save record', async () => {
                await menuAction.clickTopMenuOption('Save');
            });

            await test.step('Validate duplicate code error message', async () => {
                await toastHelper.assertDuplicateCodeMessage();
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListing('Document Type');
            });
        }

        SummaryHelper.logCodeValidationSummary(documentType.code);

    });

    test('validate: document type - should prevent duplicate name', async ({ page }) => {

        const ENTITY_NAME = 'Document Type';
        const NAME_COLUMN_INDEX = 3;
        const documentType = documentTypeData.validate;

        test.skip(
            !documentType?.name,
            'Validation data missing for name.'
        );

        await test.step(`Navigate to master: ${ENTITY_NAME}`, async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText(ENTITY_NAME);
        });

        // Precondition: Verify record with this name exists
        const exists = await listingAction.isRecordExists(documentType.name, NAME_COLUMN_INDEX);

        test.skip(
            !exists,
            `Precondition failed: Document type name '${documentType.name}' not found.`
        );

        try {

            await test.step(`Open form to create: ${documentType.name}`, async () => {
                await menuAction.clickListingMenuOptionByTitle('New');
            });

            await test.step(`Fill existing name: ${documentType.name}`, async () => {
                await masterHeaderAction.fillName(documentType.name);
            });

            await test.step('Save record', async () => {
                await menuAction.clickTopMenuOption('Save');
            });

            await test.step('Validate duplicate name error message', async () => {
                await toastHelper.assertDuplicateNameMessage();
            });
        } finally {
            await test.step(`Navigate back to listing: ${ENTITY_NAME}`, async () => {
                await menuAction.navigateBackToListing(ENTITY_NAME);
            });
        }

        SummaryHelper.logNameValidationSummary(documentType.name);

    });

    test('create: document type - should create successfully', async ({ page }) => {

        // ===== Record tracking =====
        const createdRecords = [];
        const skippedRecords = [];
        const failedRecords = [];
        const ENTITY_NAME = 'Document Type';
        const NAME_COLUMN_INDEX = 3;

        test.skip(
            !documentTypeData.create?.length,
            'No document types provided for creation'
        );

        await test.step(`Navigate to master: ${ENTITY_NAME}`, async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText(ENTITY_NAME);
        });

        // ===== Iterate to create =====
        for (const documentType of documentTypeData.create) {

            // ===== Skip invalid test data =====
            if (!documentType?.name || (documentTypeData.feature?.allowCodeManual && !documentType.code)) {
                skippedRecords.push(documentType?.name ?? 'UNKNOWN');
                console.warn(`⚠️ Create skipped due to missing required data`, documentType);
                continue;
            }

            // ===== Skip if already exists =====
            const exists = await listingAction.isRecordExists(documentType.name, NAME_COLUMN_INDEX);
            if (exists) {
                skippedRecords.push(documentType.name);
                console.warn(`⚠️ Skipped: Document type already exists → ${documentType.name}`);
                continue;
            }

            try {

                await test.step(`Open form to create: ${documentType.name}`, async () => {
                    await menuAction.clickListingMenuOptionByTitle('New');
                });

                await test.step(`Fill code: ${documentType.code} if feature is true`, async () => {
                    if (documentTypeData.feature?.allowCodeManual && documentType.code) {
                        await masterHeaderAction.fillCodeIntoTextBox(documentType.code);
                    }
                });

                await test.step(`Fill name: ${documentType.name}`, async () => {
                    await masterHeaderAction.fillName(documentType.name);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(documentType.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(documentType.nameArabic);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(documentType.description)) {
                        await masterHeaderAction.fillDescription(documentType.description);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(documentType.expiryNotificationBeforeDays)) {
                        await documentTypePage.fillExpiryNotificationBeforeDays(documentType.expiryNotificationBeforeDays);
                    }

                    await documentTypePage.selectCompanies(documentType.applicableCompanies);
                });

                await test.step('Save record', async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step('Validate record created message', async () => {
                    await toastHelper.assertByText('DocumentType', 'Create');
                });

                createdRecords.push(documentType.name);

            } catch (error) {
                failedRecords.push(documentType?.name);
                console.error(`🔴 ${ENTITY_NAME} creation failed for: ${documentType?.name}\n`, error);
            } finally {
                await menuAction
                    .navigateBackToListing(ENTITY_NAME)
                    .catch(async () => {
                        console.warn('🔴 Navigation failed, reloading page');
                        await page.reload();
                    });
            }
        }

        SummaryHelper.logCrudSummary({
            entityName: ENTITY_NAME,
            action: 'Create',
            successRecords: createdRecords,
            skippedRecords: skippedRecords,
            failedRecords: failedRecords,
            totalCount: documentTypeData.create.length
        });

        SummaryHelper.exportCrudSummary({
            entityName: ENTITY_NAME,
            action: 'Create',
            successRecords: createdRecords,
            skippedRecords: skippedRecords,
            failedRecords: failedRecords,
            totalCount: documentTypeData.create.length
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 ${ENTITY_NAME} creation failed for: ${failedRecords.join(', ')}`
            );
        }

    });

    test.fixme('update: document type - should update successfully', async ({ page }) => {

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
                    if (ValidationHelper.isNotNullOrWhiteSpace(stockAdjustmentReason.documentType)) {
                        await lookupAction.openLookupAndSelectItem('DocumentType', stockAdjustmentReason.documentType);
                    }
                });

                await test.step(`Open lookup and select adjustment type: ${stockAdjustmentReason.adjustmentType}`, async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(stockAdjustmentReason.adjustmentType)) {
                        await lookupAction.openLookupAndSelectItem('AdjustmentType', stockAdjustmentReason.adjustmentType);
                    }
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(stockAdjustmentReason.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(stockAdjustmentReason.nameArabic);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(stockAdjustmentReason.positiveAdjustmentAccount)) {
                        await lookupAction.openLookupAndSelectValue('PositiveAdjustmentMainAccount', stockAdjustmentReason.positiveAdjustmentAccount);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(stockAdjustmentReason.negativeAdjustmentAccount)) {
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

    test('delete: document type - should delete successfully', async ({ page }) => {

        // ===== Record tracking =====
        const ENTITY_NAME = 'Document Type';
        const deletedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        test.skip(
            !documentTypeData.delete?.length,
            'No document types provided for deletion'
        );

        await test.step(`Navigate to master: ${ENTITY_NAME}`, async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText(ENTITY_NAME);
        });

        // ===== Iterate & Delete =====
        for (const documentType of documentTypeData.delete) {

            if (!documentType?.name) {
                skippedRecords.push('UNKNOWN');
                console.warn('⚠️ Delete skipped: missing document type name', documentType);
                continue;
            }

            const result = await masterDeleteAction.safeDeleteByName({
                entityName: ENTITY_NAME,
                name: documentType.name,
                retries: 1
            });

            if (result === 'deleted') {
                deletedRecords.push(documentType.name);
            } else if (result === 'skipped') {
                skippedRecords.push(documentType.name);
            } else if (result === 'failed') {
                failedRecords.push(documentType.name);
            }

        }

        SummaryHelper.logCrudSummary({
            entityName: ENTITY_NAME,
            action: 'Delete',
            successRecords: deletedRecords,
            skippedRecords: skippedRecords,
            failedRecords: failedRecords,
            totalCount: documentTypeData.delete.length
        });

        SummaryHelper.exportCrudSummary({
            entityName: ENTITY_NAME,
            action: 'Delete',
            successRecords: deletedRecords,
            skippedRecords: skippedRecords,
            failedRecords: failedRecords,
            totalCount: documentTypeData.delete.length
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Document type delete failed for: ${failedRecords.join(', ')}`
            );
        }
    });

});