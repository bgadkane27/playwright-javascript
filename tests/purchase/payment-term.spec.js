import { test, expect } from '../base/baseTest.js';
import { SetupAction } from '../../components/setup.action.js';
import { CommonAction } from '../../components/common.action.js';
import { MenuAction } from '../../components/menu.action.js';
import { ListingAction } from '../../components/listing.action.js';
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
    let setupAction;
    let paymentTermPage;
    let commonAction;
    let menuAction;
    let listingAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let documentAction;
    let lookupAction;
    let uploadAction;
    let toastHelper;

    test.beforeEach(async ({ page }) => {
        setupAction = new SetupAction(page);
        paymentTermPage = new PaymentTermPage(page);
        commonAction = new CommonAction(page);
        menuAction = new MenuAction(page);
        listingAction = new ListingAction(page);
        masterHeaderAction = new MasterHeaderAction(page);
        masterDeleteAction = new MasterDeleteAction(page, listingAction, commonAction, menuAction);
        documentAction = new DocumentAction(page);
        lookupAction = new LookupAction(page);
        uploadAction = new UploadAction(page);
        toastHelper = new ToastHelper(page);

        await menuAction.selectModule('Purchase');
    });

    test.only('should not allow duplicate payment term creation', async ({ page }) => {

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

});