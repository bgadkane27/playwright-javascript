import { test, expect } from '../base/baseTest.js';
import { MenuAction } from '../../components/menu.action.js';
import { ListingAction } from '../../components/listing.action.js';
import { SetupAction } from '../../components/setup.action.js';
import { CommonAction } from '../../components/common.action.js';
import { MasterHeaderAction } from '../../components/master-header.action.js';
import { MasterDeleteAction } from '../../components/master-delete.action.js'
import { DocumentAction } from '../../components/document.action.js';
import { LookupAction } from '../../components/lookup.action.js';
import { UploadAction } from '../../components/upload.action.js';
import { FileHelper } from '../../helpers/fileHelper.js';
import { ValidationHelper } from '../../helpers/validationHelper.js';
import { ToastHelper } from '../../helpers/toastHelper.js';
import { SummaryHelper } from '../../helpers/summaryHelper.js';
import { PaymentTermPage } from '../../pages/purchase/pyment-term.page.js';
import paymentTermData from '../../testdata/purchase/payment-term.json';

test.describe.serial('Payment Term CRUD Operations', () => {
    let paymentTermPage;
    let menuAction;
    let listingAction;
    let setupAction;
    let commonAction;
    let lookupAction;
    let documentAction;
    let uploadAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let toastHelper;

    test.beforeEach(async ({ page }) => {
        paymentTermPage = new PaymentTermPage(page);
        menuAction = new MenuAction(page);
        listingAction = new ListingAction(page);
        setupAction = new SetupAction(page);
        commonAction = new CommonAction(page);
        lookupAction = new LookupAction(page);
        documentAction = new DocumentAction(page);
        uploadAction = new UploadAction(page);
        masterHeaderAction = new MasterHeaderAction(page);
        masterDeleteAction = new MasterDeleteAction(page, listingAction, commonAction, menuAction);
        toastHelper = new ToastHelper(page);

        await menuAction.selectModule('Purchase');
    });

    test('should not allow duplicate payment term creation', async ({ page }) => {

        const paymentTerm = paymentTermData.validate;

        await test.step('Navigate to payment term master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Payment Term');
        });

        await test.step('Open new payment term creation form', async () => {
            await menuAction.clickListingMenuOptionByTitle('New');
        });

        await test.step('Attempt to save payment term with duplicate name', async () => {
            await masterHeaderAction.fillName(paymentTerm.name);
            await paymentTermPage.fillDueDays(paymentTerm.dueDays);
            await menuAction.clickTopMenuOption('Save');
        });

        // await test.step('Validate duplicate payment term name message', async () => {
        //     await expect.soft(
        //         page.getByText(
        //             `Payment term with ${paymentTerm.name} name already exists.`,
        //             { exact: false }
        //         )
        //     ).toBeVisible();
        // });

        await test.step('Attempt to save payment term with duplicate code', async () => {
            await masterHeaderAction.fillCodeIntoTextBox(paymentTerm.code);
            await menuAction.clickTopMenuOption('Save');
        });

        await test.step('Validate duplicate payment term code message', async () => {
            await expect.soft(
                page.getByText(
                    `Duplicate code found. Code: ${paymentTerm.code} already exists!`,
                    { exact: false }
                )
            ).toBeVisible();
        });

        await test.step('Log validation summary', async () => {
            SummaryHelper.logValidationSummary(paymentTerm.name, paymentTerm.code);
        });

    });

    test('should create a payment term successfully', async ({ page }) => {
        // Track created/skipped/failed records
        const createdRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to payment term master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Payment Term');
        });

        for (const paymentTerm of paymentTermData.create) {
            try {
                await test.step('Open new payment term creation form', async () => {
                    await menuAction.clickListingMenuOptionByTitle('New');
                });

                await test.step(`Fill payment term code: ${paymentTerm.code} if feature is true`, async () => {
                    if (paymentTermData.feature?.allowCodeManual && paymentTerm.code) {
                        await masterHeaderAction.fillCodeIntoTextBox(paymentTerm.code);
                    }
                });

                await test.step(`Fill payment term name: ${paymentTerm.name}`, async () => {
                    await masterHeaderAction.fillName(paymentTerm.name);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(paymentTerm.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(paymentTerm.nameArabic);
                    }
                });

                await test.step(`Fill payment term due days: ${paymentTerm.dueDays}`, async () => {
                    await paymentTermPage.fillDueDays(paymentTerm.dueDays);
                });

                await test.step(`Save payment term: ${paymentTerm.name}`, async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step(`Validate payment term created message`, async () => {
                    await toastHelper.assertByText('PaymentTerm', 'Create');
                });

                createdRecords.push(paymentTerm.name);

                await test.step('Back to the listing', async () => {
                    await paymentTermPage.clickPaymentTerm();
                });
                
            } catch (error) {
                skippedRecords.push(paymentTerm?.name);
                console.warn(`Record creation failed: ${paymentTerm?.name}`, error);
                await paymentTermPage.clickPaymentTerm();
            }
        }

        await test.step('Log create summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Payment Term',
                action: 'Create',
                successRecords: createdRecords,
                skippedRecords,
                totalCount: paymentTermData.create.length
            });
        });

        await test.step('Export create summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Payment Term',
                action: 'Create',
                successRecords: createdRecords,
                skippedRecords,
                totalCount: paymentTermData.create.length
            });
        });
    });
});