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

    test('create: stock adjustment reason - should show validation message for duplicate code', async ({ page }) => {

        const stockAdjustmentReason = stockAdjustmentReasonData.validate;
        
        await test.step('Navigate to stock adjustment reason master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Stock Adjustment Reason');
        });

        // ===== Precondition (SAFE skip) =====
        const exists = await listingAction.isRecordExists(stockAdjustmentReason?.code, 2);

        test.skip(
            !exists,
            `Precondition failed: Stock adjustment reason '${stockAdjustmentReason?.code}' not found.`
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
                ).toBeVisible({ timeout: 5000 });
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

});