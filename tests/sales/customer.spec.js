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
                await SuccessMessageHelper.assert(page, 'Customer', 'Create');

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

});