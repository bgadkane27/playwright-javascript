import { test } from '../../fixtures/baseTest.js';
import { SummaryHelper } from '../../helpers/summaryHelper.js';
import { ValidationHelper } from '../../helpers/validationHelper.js';
import { LISTING_COLUMN_INDEX } from '../../constants/listing-columns.js';
import { ENTITY } from '../../constants/entities.js';
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

});