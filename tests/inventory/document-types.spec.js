import { test, expect } from '../../fixtures/baseTest.js';
import { DocumentTypePage } from '../../pages/inventory/document-type.page.js';
import { SummaryHelper } from '../../helpers/summaryHelper.js';
import documentTypeData from '../../testdata/inventory/document-type.json';

test.describe('Document Type CRUD Operations', () => {

    test('validate: document type - should prevent duplicate code', async ({ app, inventorySetup }) => {

        const ENTITY_NAME = 'Document Type';
        var documentTypePage = new DocumentTypePage(page);
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

        await test.step(`Navigate to listing of ${ENTITY_NAME}`, async () => {
            await app.menu.clickLeftMenuOption('Setups');
            await app.setup.navigateToMasterByText(ENTITY_NAME);
        });

        const exists = await app.listing.isRecordExists(
            documentType.code,
            CODE_COLUMN_INDEX
        );

        test.skip(
            !exists,
            `Precondition failed: Document Type code '${documentType.code}' not found.`
        );

        try {

            await test.step('Open form to create record', async () => {
                await app.menu.clickListingMenuOptionByTitle('New');
            });

            await test.step(`Fill code: ${documentType.code}`, async () => {
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

        SummaryHelper.logCodeValidationSummary(documentType.code);

    });

});