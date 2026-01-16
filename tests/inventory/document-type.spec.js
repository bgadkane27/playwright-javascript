import { test, expect } from '../../fixtures/baseTest.js';
import { ENTITY } from '../../constants/entities.js';
import { LISTING_COLUMN_INDEX } from '../../constants/listing-columns.js';
import { ValidationHelper } from '../../helpers/validationHelper.js';
import { SummaryHelper } from '../../helpers/summaryHelper.js';
import { DocumentTypePage } from '../../pages/inventory/document-type.page.js';
import documentTypeData from '../../testdata/inventory/document-type.json';

// ===== Constants =====
const ENTITY_NAME = ENTITY.DOCUMENT_TYPE;

test.describe(`${ENTITY_NAME} | CRUD Operations`, () => {

    test.beforeEach(async ({ app }) => {
        await app.menu.clickLeftMenuOption('Setups');
        await app.setup.navigateToMasterByText(ENTITY_NAME);
    });

    test(`${ENTITY_NAME} | Validate | Duplicate code -> Validation error shown`,
        { tag: ['@inventory', '@document-type', '@validation', '@negative'] },
        async ({ app }) => {

            const documentType = documentTypeData.validate;

            // ===== Configuration validation =====
            test.skip(
                !documentTypeData.feature?.allowCodeManual,
                'Setting → Allow code manual is OFF.'
            );

            // ===== Test data validation =====
            test.skip(
                !documentType?.code || !documentType?.name,
                'Validation data missing: code or name'
            );

            // ===== Preconditions =====
            const exists = await app.listing.isRecordExists(
                documentType.code,
                LISTING_COLUMN_INDEX.CODE
            );

            test.skip(
                !exists,
                `Precondition failed: Document Type code '${documentType.code}' not found.`
            );

            try {

                await test.step('Open create form', async () => {
                    await app.menu.clickListingMenuOptionByTitle('New');
                });

                await test.step(`Fill duplicate code: ${documentType.code}`, async () => {
                    await app.header.fillCodeIntoTextBox(documentType.code);
                });

                await test.step(`Fill name: ${documentType.name}`, async () => {
                    await app.header.fillName(documentType.name);
                });

                await test.step('Save record', async () => {
                    await app.menu.clickTopMenuOption('Save');
                });

                await test.step('Validate duplicate code error message', async () => {
                    await app.toast.assertDuplicateCodeMessage();
                });
            } finally {
                await test.step(`Navigate back to listing of ${ENTITY_NAME}`, async () => {
                    await app.menu.navigateBackToListing(ENTITY_NAME);
                });
            }

            await test.step('Log validation summary', async () => {
                SummaryHelper.logValidation({
                    entityName: ENTITY_NAME,
                    type: 'Code',
                    value: documentType.code
                });
            });

        });

    test(`${ENTITY_NAME} | Validate | Duplicate name -> Validation error shown`,
        { tag: ['@inventory', '@document-type', '@validation', '@negative'] },
        async ({ app }) => {

            const { validate: documentType } = documentTypeData;

            // ===== Test data validation =====
            test.skip(
                !documentType?.name,
                'Validation data missing for name.'
            );

            // ===== Preconditions =====
            const exists = await app.listing.isRecordExists(
                documentType.name,
                LISTING_COLUMN_INDEX.NAME
            );

            test.skip(
                !exists,
                `Precondition failed: Document Type name '${documentType.name}' not found.`
            );

            try {

                await test.step('Open create form', async () => {
                    await app.menu.clickListingMenuOptionByTitle('New');
                });

                await test.step(`Fill existing name: ${documentType.name}`, async () => {
                    await app.header.fillName(documentType.name);
                });

                await test.step('Save record', async () => {
                    await app.menu.clickTopMenuOption('Save');
                });

                await test.step('Validate duplicate name error message', async () => {
                    await app.toast.assertDuplicateNameMessage();
                });
            } finally {
                await test.step(`Navigate back to listing of ${ENTITY_NAME}`, async () => {
                    await app.menu.navigateBackToListing(ENTITY_NAME);
                });
            }

            await test.step('Log validation summary', async () => {
                SummaryHelper.logValidation({
                    entityName: ENTITY_NAME,
                    type: 'Name',
                    value: documentType.name
                });
            });

        });

    test(`${ENTITY_NAME} | Create | Valid data -> Record created successfully`,
        { tag: ['@inventory', '@document-type', '@success', '@positive'] },
        async ({ app }) => {

            // ===== Record tracking =====
            const createdRecords = [];
            const skippedRecords = [];
            const failedRecords = [];

            const documentTypePage = new DocumentTypePage(app.page);

            test.skip(
                !documentTypeData.create?.length,
                'No document types provided for creation'
            );

            // ===== Iterate to create =====
            for (const documentType of documentTypeData.create) {

                // ===== Skip invalid test data =====
                if (!documentType?.name || (documentTypeData.feature?.allowCodeManual && !documentType.code)) {
                    skippedRecords.push(documentType?.name ?? 'UNKNOWN');
                    console.warn(`⚠️ Create skipped due to missing required data`, documentType);
                    continue;
                }

                // ===== Skip if already exists =====
                const exists = await app.listing.isRecordExists(documentType.name, LISTING_COLUMN_INDEX.NAME);
                if (exists) {
                    skippedRecords.push(documentType.name);
                    console.warn(`⚠️ Skipped: ${ENTITY_NAME} already exists → ${documentType.name}`);
                    continue;
                }

                try {

                    await test.step('Open create form', async () => {
                        await app.menu.clickListingMenuOptionByTitle('New');
                    });

                    await test.step(`Fill code: ${documentType.code} if feature is true`, async () => {
                        if (documentTypeData.feature?.allowCodeManual && documentType.code) {
                            await app.header.fillCodeIntoTextBox(documentType.code);
                        }
                    });

                    await test.step(`Fill name: ${documentType.name}`, async () => {
                        await app.header.fillName(documentType.name);
                    });

                    await test.step('Fill optional fields (if provided)', async () => {
                        if (ValidationHelper.isNotNullOrWhiteSpace(documentType.nameArabic)) {
                            await app.header.fillNameArabic(documentType.nameArabic);
                        }

                        if (ValidationHelper.isNotNullOrWhiteSpace(documentType.description)) {
                            await app.header.fillDescription(documentType.description);
                        }

                        if (ValidationHelper.isNotNullOrWhiteSpace(documentType.expiryNotificationBeforeDays)) {
                            await documentTypePage.fillExpiryNotificationBeforeDays(documentType.expiryNotificationBeforeDays);
                        }

                        await documentTypePage.selectCompanies(documentType.applicableCompanies);
                    });

                    await test.step('Save record', async () => {
                        await app.menu.clickTopMenuOption('Save');
                    });

                    await test.step('Validate record created success message', async () => {
                        await app.toast.assertByText('DocumentType', 'Create');
                    });

                    createdRecords.push(documentType.name);

                } catch (error) {
                    failedRecords.push(documentType?.name);
                    console.error(`🔴 ${ENTITY_NAME} creation failed for: ${documentType?.name}\n`, error);
                } finally {
                    await app.menu
                        .navigateBackToListing(ENTITY_NAME)
                        .catch(async () => {
                            console.warn('🔴 Navigation failed, reloading page');
                            await app.page.reload();
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

    test(`${ENTITY_NAME} | Update | Valid data -> Record updated successfully`,
        { tag: ['@inventory', '@document-type', '@success', '@positive'] },
        async ({ app }) => {

            // ===== Record tracking =====
            const updatedRecords = [];
            const skippedRecords = [];
            const failedRecords = [];

            const documentTypePage = new DocumentTypePage(app.page);

            test.skip(
                !documentTypeData.update?.length,
                'No document types provided for update'
            );

            // ===== Iterate to update =====
            for (const documentType of documentTypeData.update) {

                // ===== Skip invalid test data =====
                if (
                    !documentType?.name ||
                    !documentType?.updatedName ||
                    (documentTypeData.feature?.allowCodeManual && !documentType.updatedCode)
                ) {
                    skippedRecords.push(documentType?.name ?? 'UNKNOWN');
                    console.warn(`⚠️ Update skipped due to missing required data`, documentType);
                    continue;
                }

                // ===== Skip if record does NOT exist =====
                const exists = await app.listing.isRecordExists(documentType.name, LISTING_COLUMN_INDEX.NAME);
                if (!exists) {
                    skippedRecords.push(documentType.name);
                    console.warn(`⚠️ Skipped: ${ENTITY_NAME} does not exist → ${documentType.name}`);
                    continue;
                }

                try {

                    await test.step(`Select the record to update: ${documentType.name}`, async () => {
                        await app.listing.selectRecordByText(documentType.name);
                    });

                    await test.step('Open edit form', async () => {
                        await app.menu.clickListingMenuOptionByTitle('Edit');
                    });

                    await test.step(`Fill new code: ${documentType.updatedCode} if feature is true`, async () => {
                        if (documentTypeData.feature?.allowCodeManual && documentType.updatedCode) {
                            await app.header.fillCodeIntoTextBox(documentType.updatedCode);
                        }
                    });

                    await test.step(`Fill new name: ${documentType.updatedName}`, async () => {
                        await app.header.fillName(documentType.updatedName);
                    });

                    await test.step('Fill optional fields (if provided)', async () => {
                        if (ValidationHelper.isNotNullOrWhiteSpace(documentType.nameArabic)) {
                            await app.header.fillNameArabic(documentType.nameArabic);
                        }

                        if (ValidationHelper.isNotNullOrWhiteSpace(documentType.description)) {
                            await app.header.fillDescription(documentType.description);
                        }

                        if (ValidationHelper.isNotNullOrWhiteSpace(documentType.expiryNotificationBeforeDays)) {
                            await documentTypePage.fillExpiryNotificationBeforeDays(documentType.expiryNotificationBeforeDays);
                        }

                        await documentTypePage.selectCompanies(documentType.applicableCompanies);
                    });

                    await test.step('Save updated record', async () => {
                        await app.menu.clickTopMenuOption('Save');
                    });

                    await test.step(`Validate updated name: ${documentType.updatedName}`, async () => {
                        await expect(app.page.locator("input[name='DocumentType.Name']")).toHaveValue(documentType.updatedName);
                    });

                    updatedRecords.push(`${documentType.name} → ${documentType.updatedName}`);

                } catch (error) {
                    failedRecords.push(`${documentType.name} → ${documentType.updatedName}`);
                    console.error(`🔴 ${ENTITY_NAME} updation failed for: ${documentType?.name}\n`, error);
                } finally {
                    await app.menu
                        .navigateBackToListing(ENTITY_NAME)
                        .catch(async () => {
                            console.warn('🔴 Navigation failed, reloading page');
                            await app.page.reload();
                        });
                }
            }

            SummaryHelper.logCrudSummary({
                entityName: ENTITY_NAME,
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: documentTypeData.update.length
            });

            SummaryHelper.exportCrudSummary({
                entityName: ENTITY_NAME,
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: documentTypeData.update.length
            });

            if (failedRecords.length > 0) {
                throw new Error(
                    `🔴 ${ENTITY_NAME} updation failed for: ${failedRecords.join(', ')}`
                );
            }

        });

    test(`${ENTITY_NAME} | Delete | Valid data -> Record deleted successfully`,
        { tag: ['@inventory', '@document-type', '@success', '@positive'] },
        async ({ app }) => {

            // ===== Record tracking =====
            const deletedRecords = [];
            const skippedRecords = [];
            const failedRecords = [];

            test.skip(
                !documentTypeData.delete?.length,
                'No document types provided for deletion'
            );

            // ===== Iterate & Delete =====
            for (const documentType of documentTypeData.delete) {

                if (!documentType?.name) {
                    skippedRecords.push('UNKNOWN');
                    console.warn('⚠️ Delete skipped: missing document type name', documentType);
                    continue;
                }

                const result = await app.masterDelete.safeDeleteByName({
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
                    `🔴 ${ENTITY_NAME} deletion failed for: ${failedRecords.join(', ')}`
                );
            }
        });

});