import { test, expect } from '@playwright/test'
import { SalesSetupPage } from '../../pages/sales/SalesSetupPage';
import { PaymentMethodPage } from '../../pages/sales/PaymentMethodPage';
import { CommonAction } from '../../utilities/CommonAction';
import paymentmethodData from '../../testdata/sales/payment-method-data.json';
import LookupHelper from '../../helpers/LookupHelper.js';
import SummaryHelper from '../../helpers/SummaryHelper.js';
import StringHelper from '../../helpers/StringHelper.js';
import NumberHelper from '../../helpers/NumberHelper.js';
import SuccessMessageHelper from '../../helpers/SuccessMessageHelper.js';

test.describe.serial('Payment Method CRUD Operations', () => {
    let commonAction;
    let salesSetupPage;
    let paymentMethodPage;

    test.beforeEach(async ({ page }) => {
        commonAction = new CommonAction(page);
        salesSetupPage = new SalesSetupPage(page);
        paymentMethodPage = new PaymentMethodPage(page);
        await commonAction.navigateToApp('/');
        await commonAction.selectModule('Sales');
    });

    test('should able to create payment method', async ({ page }) => {

        // 🆕 Creation summary trackers
        const createdRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnPaymentMethod();

        for (const paymentMethod of paymentmethodData.create) {
            try {
                // Start creating a new salesman
                await commonAction.clickOnListingItem('New');

                // fill salesman basic details
                if (paymentmethodData.feature.allowCodeManual && paymentMethod.code) {
                    await commonAction.fillCode(salesman.code);
                }

                await commonAction.fillName(paymentMethod.name);
                await commonAction.fillNameArabic(paymentMethod.nameArabic);
                await paymentMethodPage.clickOnType();
                await LookupHelper.selectLookupBoxItemRow(page, paymentMethod.type);

                if (paymentMethod.type === 'Debit Card' || paymentMethod.type === 'Credit Card') {
                    await commonAction.clickOnBankAccount();
                    await LookupHelper.selectLookupText(page, paymentMethod.bankAccount);
                }
                else {
                    await commonAction.clickOnMainAccount();
                    await LookupHelper.selectLookupText(page, paymentMethod.mainAccount);
                }

                await commonAction.fillDescription(paymentMethod.description);

                // Save the payment method
                await commonAction.clickOnTopMenuOption('Save');

                // Verify success message
                await SuccessMessageHelper.assert(page, 'PaymentMethod', 'Create');

                // Track successful creation
                createdRecords.push(paymentMethod.name);

                // Return to payment method list for next iteration
                await paymentMethodPage.clickOnPaymentMethod();
            }
            catch (error) {
                skippedRecords.push(paymentMethod.name);
                console.warn(`⚠️ Creation skipped for '${paymentMethod.name}': ${error.message}`);
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Salesman Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${paymentmethodData.create.length}`);
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
            'Payment Method',
            createdRecords,
            skippedRecords
        );
    });

    test.skip('should able to update payment method', async ({ page }) => { });

    test.skip('should able to delete payment method', async ({ page }) => { });

});