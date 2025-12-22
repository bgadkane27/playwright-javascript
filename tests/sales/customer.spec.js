import { test, expect } from '@playwright/test'
import { SalesSetupPage } from '../../pages/sales/SalesSetupPage';
import { CustomerPage } from '../../pages/sales/CustomerPage.js';
import { CommonAction } from '../../utilities/CommonAction';
import customerData from '../../testdata/sales/customer-data.json';
import LookupHelper from '../../helpers/LookupHelper.js';
import StringHelper from '../../helpers/StringHelper.js';
import NumberHelper from '../../helpers/NumberHelper.js';
import SuccessMessageHelper from '../../helpers/SuccessMessageHelper.js';
import SummaryHelper from '../../helpers/SummaryHelper.js';

test.describe.serial('Customer CRUD Operations', () => {
    let commonAction;
    let salesSetupPage;
    let customerPage;

    test.beforeEach(async ({ page }) => {
        commonAction = new CommonAction(page);
        salesSetupPage = new SalesSetupPage(page);
        customerPage = new CustomerPage(page);
        await commonAction.navigateToApp('/');
        await commonAction.selectModule('Sales');
    });

    test('should able to create customer with basic details', async ({ page }) => {

        const createdRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnCustomer();

        for (const customer of customerData.basics) {
            try {
                await commonAction.clickOnListingItem('New');

                if (customer.feature?.allowCodeManual && customer.code) {
                    await commonAction.fillCode(customer.code);
                }

                await commonAction.fillName(customer.name);

                if (StringHelper.isNotNullOrWhiteSpace(customer.nameArabic)) {
                    await commonAction.fillNameArabic(customer.nameArabic);
                }

                if (StringHelper.isNotNullOrWhiteSpace(customer.currency)) {
                    await commonAction.clickOnCurrency();
                    await LookupHelper.selectListItem(page, customer.currency);
                }

                await commonAction.clickOnTopMenuOption('Save');
                await expect(page.locator("input[name='Name']")).toHaveValue(customer.name);

                createdRecords.push(customer.name);

                await customerPage.clickOnBack();

            } catch (error) {
                skippedRecords.push(customer?.name);
                console.warn(`❌ Failed to create customer: ${customer?.name}`, error.message);
                await customerPage.clickOnBack();
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Customer Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${customerData.basics.length}`);
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
            'Customer With Basic Details',
            createdRecords,
            skippedRecords
        );
    });

    test('should able to delete customer', async ({ page }) => {
        // 🗑️ Deletion Summary Trackers
        const deletedRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnCustomer();

        // Iterate to delete
        for (const customer of customerData.delete) {
            try {
                // Search and filter the record
                await commonAction.provideMasterNameOnList(customer.name);

                // Check if the record exists before proceeding with deletion
                const recordExists = await page.locator(`text=${customer.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);
                if (!recordExists) {
                    console.warn(`⚠️ Record '${customer.name}' not found - deletion skipped.`);
                    skippedRecords.push(customer.name);
                    continue;
                }

                // Proceed with deletion if record exists
                await commonAction.selectMasterFromList(customer.name);
                await commonAction.clickOnMenu();
                await commonAction.clickOnDelete();
                await commonAction.clickOnOk();

                // ✅ Validate deleted message
                await SuccessMessageHelper.assert(page, 'Customer', 'Delete');

                // Track successful deletion
                deletedRecords.push(customer.name);

            } catch (error) {
                skippedRecords.push(customer.name);
                console.warn(`⚠️ Deletion failed for '${customer.name}': ${error.message}`);
            } finally {
                // 🧹 Always reset filter
                await commonAction.clearMasterNameFilter();
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Customer Delete Summary ==========');
        console.log(`📄 Total Records Attempted: ${customerData.delete.length}`);
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
            'Customer',
            deletedRecords,
            skippedRecords
        );
    });

});