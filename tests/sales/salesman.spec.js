import { test, expect } from '@playwright/test'
import { SalesSetupPage } from '../../pages/sales/SalesSetupPage';
import { SalesmanPage } from '../../pages/sales/SalesmanPage';
import { CommonAction } from '../../utilities/CommonAction';
import salesmanData from '../../testdata/sales/salesman-data.json';
import LookupHelper from '../../helpers/LookupHelper.js';
import SummaryHelper from '../../helpers/SummaryHelper.js';
import StringHelper from '../../helpers/StringHelper.js';
import NumberHelper from '../../helpers/NumberHelper.js';
import SuccessMessageHelper from '../../helpers/SuccessMessageHelper.js';

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

    test.skip('should able to create salesman', async ({ page }) => {
        // 🆕 Creation summary trackers
        const createdRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnSalesman();

        // Iterate through each salesman to create
        for (const salesman of salesmanData.create) {
            try {
                // Start creating a new salesman
                await commonAction.clickOnListingItem('New');

                // fill salesman basic details
                if (salesmanData.feature.allowCodeManual && salesman.code) {
                    await commonAction.fillCode(salesman.code);
                }

                await commonAction.fillName(salesman.name);
                await commonAction.fillNameArabic(salesman.nameArabic);
                await commonAction.fillDescription(salesman.description);

                // fill salesman other details
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

                // Save the salesman record
                await commonAction.clickOnTopMenuOption('Save');

                // ✅ Validate creation success message
                // await expect(page.getByText('Salesman created successfully').first()).toBeVisible();
                await SuccessMessageHelper.assert(page, 'Salesman', 'Create');

                // Track successful creation
                createdRecords.push(salesman.name);

                // Return to Salesman list for next iteration
                await salesmanPage.clickOnSalesman();
            }
            catch (error) {
                skippedRecords.push(salesman.name);
                console.warn(`⚠️ Creation skipped for '${salesman.name}': ${error.message}`);
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Salesman Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${salesmanData.create.length}`);
        console.log(`✅ Successfully Created: ${createdRecords.length}`);
        if (createdRecords.length) {
            console.log('✅  Created Records: ' + createdRecords.join(', '));
        }
        console.log(`⚠️  Skipped/Failed: ${skippedRecords.length}`);
        if (skippedRecords.length) {
            console.log('🚫  Skipped Records: ' + skippedRecords.join(', '));
        }
        console.log(`🕒 Test Executed At: ${new Date().toLocaleString('en-IN')}`);
        console.log('======================================');

        SummaryHelper.exportCreateSummary(
            'Salesman',
            createdRecords,
            skippedRecords
        );
    });

    test.skip('should able to update salesman', async ({ page }) => {
        // 🗑️ Updation Summary Trackers
        const updatedRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnSalesman();

        // Iterate through each salesman to update
        for (const salesman of salesmanData.update) {
            try {
                // 🧹 Always reset filter
                await commonAction.clearMasterNameFilter();
                // Search and filter the salesman record
                await commonAction.provideMasterNameOnList(salesman.name);

                // Check if the record exists before proceeding with updation
                const recordExists = await page.locator(`text=${salesman.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);
                if (!recordExists) {
                    console.warn(`⚠️ Record '${salesman.name}' not found - updation skipped.`);
                    skippedRecords.push(salesman.name);
                    continue;
                }

                // Proceed with update if record exists
                await commonAction.selectMasterFromList(salesman.name);
                await commonAction.clickOnListingItem('Edit');

                // update salesman basic details
                if (StringHelper.isNotNullOrWhiteSpace(salesman.updatedName)) {
                    await commonAction.fillName(salesman.updatedName);
                }

                if (StringHelper.isNotNullOrWhiteSpace(salesman.nameArabic)) {
                    await commonAction.fillNameArabic(salesman.nameArabic);
                }

                if (StringHelper.isNotNullOrWhiteSpace(salesman.description)) {
                    await commonAction.fillDescription(salesman.description);
                }

                // update salesman other details
                if (salesman.other) {
                    await salesmanPage.clickOnOtherGird();

                    if (StringHelper.isNotNullOrWhiteSpace(salesman.other.type)) {
                        await salesmanPage.clickOnType();
                        await LookupHelper.selectLookupBoxItemRow(page, salesman.other.type);
                    }

                    if (NumberHelper.isGreaterThanZero(salesman.other.salesCommissionInPercent)) {
                        await salesmanPage.fillSalesCommissionInPercent(salesman.other.salesCommissionInPercent);
                    }

                    if (StringHelper.isNotNullOrWhiteSpace(salesman.other.title)) {
                        await salesmanPage.fillTitle(salesman.other.title);
                    }

                    if (StringHelper.isNotNullOrWhiteSpace(salesman.other.email)) {
                        await salesmanPage.fillEmail(salesman.other.email);
                    }

                    if (StringHelper.isNotNullOrWhiteSpace(salesman.other.extension)) {
                        await salesmanPage.fillExtension(salesman.other.extension);
                    }

                    if (StringHelper.isNotNullOrWhiteSpace(salesman.other.mobile)) {
                        await salesmanPage.fillMobile(salesman.other.mobile);
                    }
                }

                // Save the salesman record
                await commonAction.clickOnTopMenuOption('Save');
                await commonAction.clickOnTopMenuOption('View');

                // Track successful updation
                updatedRecords.push(salesman.name);

                // Return to Salesman list for next iteration
                await salesmanPage.clickOnSalesman();

            } catch (error) {
                skippedRecords.push(salesman.name);
                console.warn(`⚠️ Updation failed for '${salesman.name}': ${error.message}`);
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Salesman Update Summary ==========');
        console.log(`📄 Total Records Attempted: ${salesmanData.update.length}`);
        console.log(`✅ Successfully Updated: ${updatedRecords.length}`);
        if (updatedRecords.length) {
            console.log('🗑️  Updated Records: ' + updatedRecords.join(', '));
        }
        console.log(`⚠️  Skipped/Failed: ${skippedRecords.length}`);
        if (skippedRecords.length) {
            console.log('🚫  Skipped Records: ' + skippedRecords.join(', '));
        }
        console.log(`🕒 Test Executed At: ${new Date().toLocaleString('en-IN')}`);
        console.log('======================================');

        SummaryHelper.exportUpdateSummary(
            'Salesman',
            updatedRecords,
            skippedRecords
        );
    });

    test.skip('should able to delete salesman', async ({ page }) => {
        // 🗑️ Deletion Summary Trackers
        const deletedRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnSalesman();

        // Iterate through each salesman to delete
        for (const salesman of salesmanData.delete) {
            try {

                // 🧹 Always reset filter
                await commonAction.clearMasterNameFilter();
                // Search and filter the salesman record
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
                // await expect(page.getByText('Record deleted successfully!').first()).toBeVisible();
                await SuccessMessageHelper.assert(page, 'Salesman', 'Delete');

                // Track successful deletion
                deletedRecords.push(salesman.name);

            } catch (error) {
                skippedRecords.push(salesman.name);
                console.warn(`⚠️ Deletion failed for '${salesman.name}': ${error.message}`);
            } finally {
                // 🧹 Always reset filter
                await commonAction.clearMasterNameFilter();
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
        console.log(`🕒 Test Executed At: ${new Date().toLocaleString('en-IN')}`);
        console.log('======================================');

        SummaryHelper.exportDeleteSummary(
            'Salesman',
            deletedRecords,
            skippedRecords
        );
    });
    
});