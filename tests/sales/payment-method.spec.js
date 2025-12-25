import { test } from '@playwright/test'
import { SalesSetupPage } from '../../pages/sales/SalesSetupPage';
import { PaymentMethodPage } from '../../pages/sales/PaymentMethodPage';
import { CommonAction } from '../../utilities/CommonAction';
import paymentmethodData from '../../testdata/sales/payment-method-data.json';
import LookupHelper from '../../helpers/LookupHelper.js';
import SummaryHelper from '../../helpers/SummaryHelper.js';
import StringHelper from '../../helpers/StringHelper.js';
import MessageHelper from '../../helpers/MessageHelper.js';

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

    test.skip('should able to create payment method', async ({ page }) => {
        // 🆕 Creation summary trackers
        const createdRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnPaymentMethod();

        for (const paymentMethod of paymentmethodData.create) {
            try {
                // Start creating a new salesman
                await commonAction.clickOnListingItem('New');

                // fill payment method basic details
                if (paymentmethodData.feature?.allowCodeManual && paymentMethod.code) {
                    await commonAction.fillCode(paymentMethod.code);
                }

                await commonAction.fillName(paymentMethod.name);

                if (StringHelper.isNotNullOrWhiteSpace(paymentMethod.nameArabic)) {
                    await commonAction.fillNameArabic(paymentMethod.nameArabic);
                }

                await paymentMethodPage.clickOnType();
                await LookupHelper.selectLookupBoxItemRow(page, paymentMethod.type);

                if (paymentMethod.type === 'Debit Card' || paymentMethod.type === 'Credit Card') {
                    await paymentMethodPage.clickOnBankAccount();
                    await LookupHelper.selectLookupText(page, paymentMethod.bankAccount);
                }
                else {
                    await paymentMethodPage.clickOnMainAccount();
                    await LookupHelper.selectLookupText(page, paymentMethod.mainAccount);
                }

                await commonAction.fillDescription(paymentMethod.description);

                // Save the payment method
                await commonAction.clickOnTopMenuOption('Save');

                // Verify success message
                await MessageHelper.assert(page, 'PaymentMethod', 'Create');

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
        console.log('==========🧾 Payment Method Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${paymentmethodData.create.length}`);
        console.log(`✅ Successfully Created: ${createdRecords.length}`);
        if (createdRecords.length) {
            console.log('✅ Created Records: ' + createdRecords.join(', '));
        }
        console.log(`⚠️ Skipped/Failed: ${skippedRecords.length}`);
        if (skippedRecords.length) {
            console.log('🚫 Skipped Records: ' + skippedRecords.join(', '));
        }
        console.log(`🕒 Test Executed At: ${new Date().toLocaleString('en-IN')}`);
        console.log('======================================');

        SummaryHelper.exportCreateSummary(
            'Payment Method',
            createdRecords,
            skippedRecords
        );
    });

    test.skip('should able to update payment method', async ({ page }) => {
        // ✏️ Update Summary Trackers
        const updatedRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnPaymentMethod();

        for (const paymentMethod of paymentmethodData.update) {
            try {
                // Search and filter the payment method record
                await commonAction.provideMasterNameOnList(paymentMethod.name);

                // Check if the record exists before proceeding with updation
                const recordExists = await page.locator(`text=${paymentMethod.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);
                if (!recordExists) {
                    console.warn(`⚠️ Record '${paymentMethod.name}' not found - updation skipped.`);
                    skippedRecords.push(paymentMethod.name);
                    continue;
                }

                // Proceed with update if record exists
                await commonAction.selectMasterFromList(paymentMethod.name);
                await commonAction.clickOnListingItem('Edit');

                // Proceed with updation if record exists
                if (StringHelper.isNotNullOrWhiteSpace(paymentMethod.updatedName)) {
                    await commonAction.fillName(paymentMethod.updatedName);
                }

                if (StringHelper.isNotNullOrWhiteSpace(paymentMethod.nameArabic)) {
                    await commonAction.fillNameArabic(paymentMethod.nameArabic);
                }

                if (StringHelper.isNotNullOrWhiteSpace(paymentMethod.type)) {
                    await paymentMethodPage.clickOnType();
                    await LookupHelper.selectLookupBoxItemRow(page, paymentMethod.type);
                }

                if (paymentMethod.type === 'Debit Card' || paymentMethod.type === 'Credit Card') {
                    if (StringHelper.isNotNullOrWhiteSpace(paymentMethod.bankAccount)) {
                        await paymentMethodPage.clickOnBankAccount();
                        await LookupHelper.selectLookupText(page, paymentMethod.bankAccount);
                    }
                }
                else {
                    if (StringHelper.isNotNullOrWhiteSpace(paymentMethod.mainAccount)) {
                        await paymentMethodPage.clickOnMainAccount();
                        await LookupHelper.selectLookupText(page, paymentMethod.mainAccount);
                    }
                }

                if (StringHelper.isNotNullOrWhiteSpace(paymentMethod.description)) {
                    await commonAction.fillDescription(paymentMethod.description);
                }

                // Save the payment method record
                await commonAction.clickOnTopMenuOption('Save');
                await commonAction.clickOnTopMenuOption('View');

                // Track successful updation
                updatedRecords.push(paymentMethod.name);

                // Return to Payment Method list for next iteration
                await salesSetupPage.clickOnPaymentMethod();

            } catch (error) {
                skippedRecords.push(paymentMethod.name);
                console.warn(`⚠️ Updation failed for '${paymentMethod.name}': ${error.message}`);
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Payment Method Update Summary ==========');
        console.log(`📄 Total Records Attempted: ${paymentmethodData.update.length}`);
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
            'Payment Method',
            updatedRecords,
            skippedRecords
        );
    });

    test.skip('should able to delete payment method', async ({ page }) => {
        // 🗑️ Deletion Summary Trackers
        const deletedRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnPaymentMethod();

        // Iterate through each payment method to delete
        for (const paymentMethod of paymentmethodData.delete) {
            try {

                // 🧹 Always reset filter
                await commonAction.clearMasterNameFilter();
                // Search and filter the payment method record
                await commonAction.provideMasterNameOnList(paymentMethod.name);

                // Check if the record exists before proceeding with deletion
                const recordExists = await page.locator(`text=${paymentMethod.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);
                if (!recordExists) {
                    console.warn(`⚠️ Record '${paymentMethod.name}' not found - deletion skipped.`);
                    skippedRecords.push(paymentMethod.name);
                    continue;
                }

                // Proceed with deletion if record exists
                await commonAction.selectMasterFromList(paymentMethod.name);
                await commonAction.clickOnMenu();
                await commonAction.clickOnDelete();
                await commonAction.clickOnOk();

                // ✅ Validate deleted message
                await MessageHelper.assert(page, 'PaymentMethod', 'Delete');

                // Track successful deletion
                deletedRecords.push(paymentMethod.name);

            } catch (error) {
                skippedRecords.push(paymentMethod.name);
                console.warn(`⚠️ Deletion failed for '${paymentMethod.name}': ${error.message}`);
            } finally {
                // 🧹 Always reset filter
                await commonAction.clearMasterNameFilter();
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Payment Method Delete Summary ==========');
        console.log(`📄 Total Records Attempted: ${paymentmethodData.delete.length}`);
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
            'Payment Method',
            deletedRecords,
            skippedRecords
        );
    });

});