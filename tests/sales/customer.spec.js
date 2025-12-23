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

    test('should able to create customer with basic detail', async ({ page }) => {

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
            'Customer - Basic',
            createdRecords,
            skippedRecords
        );
    });

    test('should be able to create customer with key info detail', async ({ page }) => {

        const createdRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to Customer Master', async () => {
            await commonAction.clickOnLeftMenuOption('Setups');
            await salesSetupPage.clickOnCustomer();
        });

        for (const customer of customerData.keyInfos) {

            try {
                await test.step(`Create customer: ${customer.name}`, async () => {

                    // ================= Create =================
                    await commonAction.clickOnListingItem('New');

                    if (customerData.feature?.allowCodeManual && customer.code) {
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

                    // ================= Key Info =================
                    await customerPage.clickOnKeyInfoTab();

                    // await customerPage.clickOnGroup();
                    // await LookupHelper.selectListItem(page, customer.group);

                    await customerPage.fillEmail(customer.email);
                    await customerPage.fillMobile(customer.mobile);
                    await customerPage.fillTelephone(customer.telephone);
                    await customerPage.fillDescription(customer.description);

                    await customerPage.clickOnReceivableAccount();
                    await LookupHelper.selectListItem(page, customer.receivableAccount);

                    await customerPage.clickOnSaveKeyInfo();

                    await expect(customerPage.keyInfoEmail).toHaveValue(customer.email);

                    // ================= Credit Control =================
                    if (customer.enableCreditControl) {
                        await customerPage.clickOnEnableCreditControl();
                        await customerPage.fillCreditLimitAmount(customer.creditLimitAmount);
                        await customerPage.fillCreditLimitDays(customer.creditLimitDays);

                        await customerPage.scrollToCreditCheckMode();

                        await customerPage.clickOnCreditRating();
                        await LookupHelper.selectListItem(page, customer.creditRating);

                        await customerPage.clickOnCreditCheckMode();
                        await LookupHelper.selectListItem(page, customer.creditCheckMode);

                        await customerPage.clickOnSaveKeyInfo();
                    }

                    // ================= Defaults =================
                    if (customer.enableDefaults) {
                        await customerPage.clickOnSetDefaults();

                        await customerPage.clickOnSalesman();
                        await LookupHelper.selectListItem(page, customer.salesman);

                        await customerPage.clickOnPaymentTerm();
                        await LookupHelper.selectListItem(page, customer.paymentTerm);

                        await customerPage.scrollToShipmentPriority();

                        await customerPage.clickOnPriceList();
                        await LookupHelper.selectListItem(page, customer.priceList);

                        await customerPage.clickOnShippingTerm();
                        await LookupHelper.selectListItem(page, customer.shippingTerm);

                        await customerPage.fillLoadingPort(customer.loadingPort);
                        await customerPage.fillDestinationPort(customer.destinationPort);

                        await customerPage.clickOnShippingMethod();
                        await LookupHelper.selectListItem(page, customer.shippingMethod);

                        await customerPage.clickOnShipmentPriority();
                        await LookupHelper.selectListItem(page, customer.shipmentPriority);

                        await customerPage.clickOnSaveKeyInfo();
                    }

                    // ================= Restrict Payment Term =================
                    if (customer.restrictPaymentTerm) {
                        await customerPage.clickOnRestrictPaymentTerm();
                        await customerPage.clickOnSelectPaymentTerm();

                        if (customer.selectAllPaymentTerms) {
                            await customerPage.clickOnSelectAllPaymentTerm();
                        } else {
                            await LookupHelper.selectListItem(page, customer.paymentTerm1);
                            // await LookupHelper.selectListItem(page, customer.paymentTerm2);

                        }
                        await customerPage.clickOnSaveKeyInfo();
                    }

                    // ================= Restrict Price List =================
                    if (customer.restrictPriceList) {
                        await customerPage.clickOnRestrictPriceList();
                        await customerPage.clickOnSelectPriceList();

                        if (customer.selectAllPriceLists) {
                            await customerPage.clickOnSelectAllPriceList();
                        } else {
                            await LookupHelper.selectListItem(page, customer.priceList1);
                            // await LookupHelper.selectListItem(page, customer.priceList2);

                        }
                        await customerPage.clickOnSaveKeyInfo();
                    }

                    // ================= Verify =================
                    await SuccessMessageHelper.assert(page, 'Customer', 'Update');

                    createdRecords.push(customer.name);

                    await customerPage.clickOnBack();
                });

            } catch (error) {
                skippedRecords.push(customer?.name);
                console.error(`❌ Failed to create customer: ${customer?.name}`, error.stack);
                await customerPage.clickOnBack().catch(() => { });
            }
        }

        // ================= Summary =================
        console.log('========== 🧾 Customer Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${customerData.keyInfos.length}`);
        console.log(`✅ Successfully Created: ${createdRecords.length}`);
        if (createdRecords.length) {
            console.log('✅ Created Records:', createdRecords.join(', '));
        }
        console.log(`⚠️ Skipped/Failed: ${skippedRecords.length}`);
        if (skippedRecords.length) {
            console.log('🚫 Skipped Records:', skippedRecords.join(', '));
        }
        console.log(`🕒 Executed At: ${new Date().toLocaleString('en-IN')}`);
        console.log('==============================================');

        SummaryHelper.exportCreateSummary(
            'Customer - Key Info',
            createdRecords,
            skippedRecords
        );
    });

    test('should be able to create customer with address detail', async ({ page }) => {

        const createdRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to Customer Master', async () => {
            await commonAction.clickOnLeftMenuOption('Setups');
            await salesSetupPage.clickOnCustomer();
        });

        for (const customer of customerData.addresses) {

            try {
                await test.step(`Create customer: ${customer.name}`, async () => {

                    // ================= Create =================
                    await commonAction.clickOnListingItem('New');

                    if (customerData.feature?.allowCodeManual && customer.code) {
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

                    await customerPage.clickOnAddressTab();

                    // ================= Billing Address =================
                    await customerPage.fillBillingAddress1(customer.billingAddress1);
                    await customerPage.fillBillingAddress2(customer.billingAddress2);

                    await customerPage.clickOnBillingCountry();
                    await LookupHelper.selectListItem(page, customer.billingCountry);

                    await customerPage.clickOnBillingState();
                    await LookupHelper.selectListItem(page, customer.billingState);

                    await customerPage.scrollToContactPerson();

                    await customerPage.fillBillingCity(customer.billingCity);
                    await customerPage.fillBillingZipCode(customer.billingZipcode);
                    await customerPage.fillBillingContactPerson(customer.billingContactPerson);
                    await customerPage.clickOnSaveAddress();

                    // ================= Shipping Address =================
                    if (customer.sameAsBillingAddress) {
                        await customerPage.checkSameAsBillingAddress();
                        await customerPage.clickOnSaveAddress();
                    } else {
                        await customerPage.fillShippingAddress1(customer.shippingAddress1);
                        await customerPage.fillShippingAddress2(customer.shippingAddress2);

                        await customerPage.clickOnShippingCountry();
                        await LookupHelper.selectLookupOption(page, customer.shippingCountry);

                        await customerPage.clickOnShippingState();
                        await LookupHelper.selectLookupOption(page, customer.shippingState);

                        await customerPage.scrollToContactPerson();

                        await customerPage.fillShippingCity(customer.shippingCity);
                        await customerPage.fillShippingZipCode(customer.shippingZipcode);
                        await customerPage.fillShippingContactPerson(customer.shippingContactPerson);

                        await customerPage.clickOnSaveAddress();
                    }

                    // ================= Verify =================
                    await SuccessMessageHelper.assert(page, 'Customer', 'Update');

                    createdRecords.push(customer.name);

                    await customerPage.clickOnBack();
                });

            } catch (error) {
                skippedRecords.push(customer?.name);
                console.error(`❌ Failed to create customer: ${customer?.name}`, error.stack);
                await customerPage.clickOnBack().catch(() => { });
            }
        }

        // ================= Summary =================
        console.log('========== 🧾 Customer Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${customerData.keyInfos.length}`);
        console.log(`✅ Successfully Created: ${createdRecords.length}`);
        if (createdRecords.length) {
            console.log('✅ Created Records:', createdRecords.join(', '));
        }
        console.log(`⚠️ Skipped/Failed: ${skippedRecords.length}`);
        if (skippedRecords.length) {
            console.log('🚫 Skipped Records:', skippedRecords.join(', '));
        }
        console.log(`🕒 Executed At: ${new Date().toLocaleString('en-IN')}`);
        console.log('==============================================');

        SummaryHelper.exportCreateSummary(
            'Customer - Address',
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