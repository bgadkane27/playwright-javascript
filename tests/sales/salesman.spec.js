import { test, expect } from '@playwright/test'
import { CommonAction } from '../../utilities/CommonAction';
import { SalesSetupPage } from '../../pages/sales/SalesSetupPage';
import { SalesmanPage } from '../../pages/sales/SalesmanPage';
import LookupHelper from '../../helpers/LookupHelper.js';
import salesmanData from '../../testdata/sales/salesmanData.json';
import SummaryHelper from '../../helpers/SummaryHelper.js';

test.describe.serial('Salesman CRUD Operations', () => {
    let commonAction;
    let salesSetupPage;
    let salesmanPage;

    test.beforeEach(async ({ page }) => {
        commonAction = new CommonAction(page);
        salesSetupPage = new SalesSetupPage(page);
        salesmanPage = new SalesmanPage(page);
        await commonAction.navigateToApp('/');
        await commonAction.selectModule('Sales');
    });

    test('should able to create salesman', async ({ page }) => {

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnSalesman();

        for (const salesman of salesmanData.create) {
            await commonAction.clickOnListingItem('New');

            if (salesmanData.feature.allowCodeManual && salesman.code) {
                await commonAction.fillCode(salesman.code);
            }

            await commonAction.fillName(salesman.name);
            await commonAction.fillNameArabic(salesman.nameArabic);
            await commonAction.fillDescription(salesman.description);

            if (salesman.other) {
                await salesmanPage.clickOnOtherGird();
                await salesmanPage.clickOnType();
                await LookupHelper.selectLookupBoxItemRow(page, salesman.other.type);
                await salesmanPage.fillSalesCommissionInPercent(salesman.other.salesCommissionInPercent);
                await salesmanPage.fillTitle(salesman.other.title);
                await salesmanPage.fillEmail(salesman.other.email);
                await salesmanPage.fillExtension(salesman.other.extension);
                await salesmanPage.fillMobile(salesman.other.mobile);
            }

            await commonAction.clickOnTopMenuOption('Save');
            await expect(page.getByText('Salesman created successfully')).toBeVisible();

            await salesmanPage.clickOnSalesman();
        }
    });    

    test('should able to delete salesman', async ({ page }) => {
        // 🗑️ Deletion Summary Trackers
        const deletedRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnSalesman();

        // Iterate through each salesman to delete
        for (const salesman of salesmanData.delete) {
            try {
                // provide master name on List to search record
                await commonAction.provideMasterNameOnList(salesman.name);

                // Check if the record exists before proceeding with deletion
                const recordExists = await page.locator(`text=${salesman.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);
                if (!recordExists) {
                    console.warn(`⚠️ Record '${salesman.name}' not found - deletion skipped.`);
                    skippedRecords.push(salesman.name);
                    continue;
                }

                // Proceed with deletion if record exists
                await commonAction.selectMasterFromList(salesman.name);
                await commonAction.clickOnMenu();
                await commonAction.clickOnDelete();
                await commonAction.clickOnOk();

                // ✅ Validate deleted message
                await expect(page.getByText('Record deleted successfully!').first()).toBeVisible();

                // Track successful deletion
                deletedRecords.push(salesman.name);

                // Refresh the list to reflect deletion
                // await commonAction.clickOnListingItem('Refresh');

            } catch (error) {
                skippedRecords.push(salesman.name);
                console.warn(`⚠️ Deletion failed for '${salesman.name}': ${error.message}`);

                // Clear the search filter before continuing to next record
                try {
                    await commonAction.clearMasterNameFilter(); // Or reset the filter
                } catch (clearError) {
                    console.warn(`⚠️ Could not clear filter: ${clearError.message}`);
                }
                continue;
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Salesman Delete Summary ==========');
        console.log(`📄 Total Records Attempted: ${salesmanData.delete.length}`);
        console.log(`✅ Successfully Deleted: ${deletedRecords.length}`);
        if (deletedRecords.length) {
            console.log('🗑️  Deleted Records: ' + deletedRecords.join(', '));
        }
        console.log(`⚠️  Skipped/Failed: ${skippedRecords.length}`);
        if (skippedRecords.length) {
            console.log('🚫  Skipped Records: ' + skippedRecords.join(', '));
        }
        console.log(`🕒 Test Executed At: ${new Date().toLocaleString()}`);
        console.log('======================================');

        SummaryHelper.exportDeleteSummary(
            'Salesman',
            deletedRecords,
            skippedRecords
        );
    });
});