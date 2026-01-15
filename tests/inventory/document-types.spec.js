import { test, expect } from '../../fixtures/baseTest.js';
import { DocumentTypePage } from '../../pages/inventory/document-type.page.js';
import { SummaryHelper } from '../../helpers/summaryHelper.js';
import { ENTITY_COLUMN } from '../../constants/listing-columns.js';
import { ENTITY } from '../../constants/entities.js';
import documentTypeData from '../../testdata/inventory/document-type.json';

// ===== Constants =====
const ENTITY_NAME = ENTITY.DOCUMENT_TYPE;

test.describe(`${ENTITY_NAME} | CRUD Operations`, () => {

    test.beforeEach(async ({ app, inventorySetup }) => {
        await app.menu.clickLeftMenuOption('Setups');
        await app.setup.navigateToMasterByText(ENTITY_NAME);
    });

    test(`${ENTITY_NAME} | Create | Duplicate code -> Validation error shown`, async ({ app }) => {

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
            ENTITY_COLUMN.CODE
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
            SummaryHelper.logCodeValidationSummary(documentType.code);
        });

    });

    test(`${ENTITY_NAME} | Create | Duplicate name -> Validation error shown`, async ({ app }) => {

        const documentType = documentTypeData.validate;

        // ===== Test data validation =====
        test.skip(
            !documentType?.name,
            'Validation data missing for name.'
        );

        // ===== Preconditions =====
        const exists = await app.listing.isRecordExists(
            documentType.name,
            ENTITY_COLUMN.NAME
        );

        test.skip(
            !exists,
            `Precondition failed: Document type name '${documentType.name}' not found.`
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
            SummaryHelper.logNameValidationSummary(documentType.name);
        });

    });

});