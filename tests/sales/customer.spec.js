import { test, expect } from '@playwright/test'
import { SalesSetupPage } from '../../pages/sales/SalesSetupPage';
import { CustomerPage } from '../../pages/sales/CustomerPage.js';
import { CommonAction } from '../../utilities/CommonAction';
import customerData from '../../testdata/sales/customer-data.json';
import LookupHelper from '../../helpers/LookupHelper.js';
import StringHelper from '../../helpers/StringHelper.js';
import SuccessMessageHelper from '../../helpers/SuccessMessageHelper.js';
import SummaryHelper from '../../helpers/SummaryHelper.js';
import { getImportFile } from '../../helpers/getImportFile.js';

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

    test.skip('should able to create customer with basic detail', async ({ page }) => {

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
                console.warn(`Record creation failed: ${customer?.name}`, error.message);
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

    test.skip('should be able to create customer with key info detail', async ({ page }) => {

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

                    await customerPage.clickOnGroup();
                    await LookupHelper.selectListItem(page, customer.group);

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
                console.error(`Record creation failed: ${customer?.name}`, error.stack);
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
            'Customer With Key Info',
            createdRecords,
            skippedRecords
        );
    });

    test.skip('should be able to create customer with address detail', async ({ page }) => {

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

                    await customerPage.fillBillingCountry(customer.billingCountry);
                    await LookupHelper.selectListItem(page, customer.billingCountry);

                    await customerPage.fillBillingState(customer.billingState);
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

                        await customerPage.fillShippingCountry(customer.shippingCountry);
                        await LookupHelper.selectLookupOption(page, customer.shippingCountry);

                        await customerPage.fillShippingState(customer.shippingState);
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
        console.log(`📄 Total Records Attempted: ${customerData.addresses.length}`);
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
            'Customer With Address',
            createdRecords,
            skippedRecords
        );
    });

    test.skip('should be able to create customer with contact person detail', async ({ page }) => {

        // Track successfully created records
        const createdRecords = [];

        // Track skipped / failed records
        const skippedRecords = [];

        // ================= Navigate to Master Listing =================
        await test.step('Navigate to Customer Master', async () => {
            await commonAction.clickOnLeftMenuOption('Setups');
            await salesSetupPage.clickOnCustomer();
        });

        // Loop through each record
        for (const customer of customerData.contactPersons) {

            try {
                await test.step(`Create customer : ${customer.name}`, async () => {

                    // ================= Create Customer =================

                    // Click on New button from listing
                    await commonAction.clickOnListingItem('New');

                    // Fill record code if manual code feature is enabled
                    if (customerData.feature?.allowCodeManual && customer.code) {
                        await commonAction.fillCode(customer.code);
                    }

                    // Fill record name
                    await commonAction.fillName(customer.name);

                    // Fill record Arabic name if provided
                    if (StringHelper.isNotNullOrWhiteSpace(customer.nameArabic)) {
                        await commonAction.fillNameArabic(customer.nameArabic);
                    }

                    // Select currency if provided
                    if (StringHelper.isNotNullOrWhiteSpace(customer.currency)) {
                        await commonAction.clickOnCurrency();
                        await LookupHelper.selectListItem(page, customer.currency);
                    }

                    // Save master
                    await commonAction.clickOnTopMenuOption('Save');

                    // ================= Validation =================

                    // Validate record name is saved correctly
                    await expect(page.locator("input[name='Name']")).toHaveValue(customer.name);

                    // Navigate to Contact Person tab
                    await customerPage.clickOnContactPersonTab();

                    // ================= Add Contact Persons =================
                    for (const [index, person] of customer.persons.entries()) {

                        // Add new contact person row
                        await customerPage.clickOnAddRow();

                        // Select prefix
                        await customerPage.clickOnPrefix();
                        await LookupHelper.selectLookupOption(page, person.prefix);

                        // Fill contact person basic details
                        await customerPage.fillFirstName(person.firstName);
                        await customerPage.fillLastName(person.lastName);
                        await customerPage.fillJobTitle(person.jobTitle);

                        // Select gender
                        await customerPage.clickOnGender();
                        await LookupHelper.selectLookupOption(page, person.gender);

                        // Fill contact details
                        await customerPage.fillContactPersonEmail(person.email);
                        await customerPage.fillContactPersonMobile(person.mobile);
                        await customerPage.fillContactPersonTelephone(person.telephone);

                        // ================= Conditional Actions Based on Iteration =================

                        // First contact person → set as Default and Portal Access
                        if (index === 0) {
                            await customerPage.clickOnDefault();
                            await customerPage.clickOnPortalAccess();
                        }

                        // Second contact person → set as Freezed
                        if (index === 1) {
                            await customerPage.clickOnFreezed();
                        }

                        // Save contact person
                        await commonAction.clickOnSaveButton();

                        // ================= Validate Contact Person =================

                        // Build full name as displayed on UI
                        const fullName = `${person.firstName} ${person.lastName}`.trim();

                        // Validate contact person is displayed
                        await expect.soft(
                            page
                                .locator('tbody.dx-row.dx-data-row h2')
                                .filter({ hasText: fullName })
                        ).toContainText(person.firstName);
                    }

                    // Track successfully created record
                    createdRecords.push(customer.name);

                    // Navigate back to listing
                    await customerPage.clickOnBack();
                });

            } catch (error) {

                // Track skip/failed record
                skippedRecords.push(customer?.name);

                // Log failure details
                console.error(`Record creation failed: ${customer?.name}`, error.stack);

                // Ensure navigation back even on failure
                await customerPage.clickOnBack().catch(() => { });
            }
        }

        // ================= Execution Summary =================
        console.log('========== 🧾 Customer Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${customerData.contactPersons.length}`);
        console.log(`✅ Record created successfully: ${createdRecords.length}`);
        if (createdRecords.length) {
            console.log('✅ Created Records Name:', createdRecords.join(', '));
        }
        console.log(`⚠️ Record skipped/failed: ${skippedRecords.length}`);
        if (skippedRecords.length) {
            console.log('🚫 Skipped Records Name:', skippedRecords.join(', '));
        }
        console.log(`🕒 Test Executed At: ${new Date().toLocaleString('en-IN')}`);
        console.log('==============================================');

        // Export execution summary for reporting
        SummaryHelper.exportCreateSummary(
            'Customer With Multiple Contact Persons',
            createdRecords,
            skippedRecords
        );
    });

    test.skip('should be able to create customer with document detail', async ({ page }) => {

        // Track successfully created records
        const createdRecords = [];

        // Track skipped / failed records
        const skippedRecords = [];

        // ================= Navigate to Master Listing =================
        await test.step('Navigate to Customer Master', async () => {
            await commonAction.clickOnLeftMenuOption('Setups');
            await salesSetupPage.clickOnCustomer();
        });

        // Loop through each record
        for (const customer of customerData.documents) {

            try {
                await test.step(`Create customer : ${customer.name}`, async () => {

                    // ================= Create Customer =================

                    // Click on New button from listing
                    await commonAction.clickOnListingItem('New');

                    // Fill record code if manual code feature is enabled
                    if (customerData.feature?.allowCodeManual && customer.code) {
                        await commonAction.fillCode(customer.code);
                    }

                    // Fill record name
                    await commonAction.fillName(customer.name);

                    // Fill record Arabic name if provided
                    if (StringHelper.isNotNullOrWhiteSpace(customer.nameArabic)) {
                        await commonAction.fillNameArabic(customer.nameArabic);
                    }

                    // Select currency if provided
                    if (StringHelper.isNotNullOrWhiteSpace(customer.currency)) {
                        await commonAction.clickOnCurrency();
                        await LookupHelper.selectListItem(page, customer.currency);
                    }

                    // Save master
                    await commonAction.clickOnTopMenuOption('Save');

                    // ================= Validation =================

                    // Validate record name is saved correctly
                    await expect(page.locator("input[name='Name']")).toHaveValue(customer.name);

                    // Navigate to Documents tab
                    await customerPage.clickOnDocumentsTab();

                    // ================= Add Documents =================
                    for (const document of customer.documents) {

                        // Add new document
                        await customerPage.clickOnAddRow();

                        // Select document type
                        await commonAction.clickOnDocumentType();
                        await LookupHelper.selectListItem(page, document.documentType);

                        // Fill document details
                        await commonAction.fillDocumentNumber(document.documentNumber);
                        await commonAction.fillDateOfIssue(document.dateOfIssue);
                        await commonAction.fillPlaceOfIssue(document.placeOfIssue);
                        await commonAction.fillDateOfExpiry(document.dateOfExpiry);

                        // File Path
                        const filePath = getImportFile('Sales', 'Customer', '.pdf');

                        // Locate the file input
                        const fileInput = page.getByLabel('', { exact: true });

                        // Attach file directly (bypasses OS file dialog)
                        await fileInput.setInputFiles(filePath);
                        await expect(page.locator('.dx-fileuploader-file-status-message')).toContainText('Uploaded');

                        // Save record
                        await commonAction.clickOnSaveButton();

                        // ================= Validate Document =================

                        // Document details displayed on UI
                        const documentDetail = `${document.documentType} (${document.documentNumber})`.trim();

                        // Validate document details
                        await expect.soft(
                            page
                                .locator('tbody.dx-row.dx-data-row p')
                                .filter({ hasText: documentDetail })
                        ).toContainText(document.documentNumber);
                    }

                    // Track successfully created record
                    createdRecords.push(customer.name);

                    // Navigate back to listing
                    await customerPage.clickOnBack();
                });

            } catch (error) {

                // Track skip/failed record
                skippedRecords.push(customer?.name);

                // Log failure details
                console.error(`Record creation failed: ${customer?.name}`, error.stack);

                // Ensure navigation back even on failure
                await customerPage.clickOnBack().catch(() => { });
            }
        }

        // ================= Execution Summary =================
        console.log('========== 🧾 Customer Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${customerData.documents.length}`);
        console.log(`✅ Record created successfully: ${createdRecords.length}`);
        if (createdRecords.length) {
            console.log('✅ Created Records Name:', createdRecords.join(', '));
        }
        console.log(`⚠️ Record skipped/failed: ${skippedRecords.length}`);
        if (skippedRecords.length) {
            console.log('🚫 Skipped Records Name:', skippedRecords.join(', '));
        }
        console.log(`🕒 Test Executed At: ${new Date().toLocaleString('en-IN')}`);
        console.log('==============================================');

        // Export execution summary for reporting
        SummaryHelper.exportCreateSummary(
            'Customer With Multiple Documents',
            createdRecords,
            skippedRecords
        );
    });

    test('should not allow duplicate customer creation', async ({ page }) => {

        const customer = customerData.validate;

        await test.step('Navigate to Customer Master', async () => {
            await commonAction.clickOnLeftMenuOption('Setups');
            await salesSetupPage.clickOnCustomer();
        });

        await test.step('Open new customer creation form', async () => {
            await commonAction.clickOnListingItem('New');
        });

        await test.step('Attempt to save customer with duplicate name', async () => {
            await commonAction.fillName(customer.name);
            await commonAction.clickOnTopMenuOption('Save');
        });

        await test.step('Validate duplicate customer name message', async () => {
            await expect(
                page.getByText(
                    `Customer with ${customer.name} name already exists.`,
                    { exact: false }
                )
            ).toBeVisible();
        });

        await test.step('Attempt to save customer with duplicate code', async () => {
            if (customer?.allowCodeManual && customer.code) {
                await commonAction.fillCode(customer.code);
            }
            await commonAction.clickOnTopMenuOption('Save');
        });

        await test.step('Validate duplicate customer code message', async () => {
            await expect(
                page.getByText(
                    `Duplicate code found. Code: ${customer.code} already exists!`,
                    { exact: false }
                )
            ).toBeVisible();
        });

        await test.step('Log validation summary', async () => {
            console.log('🔎 Duplicate Customer Validation Summary');
            console.log(`✔ Customer Name Validated : ${customer.name}`);
            console.log(`✔ Customer Code Validated : ${customer?.allowCodeManual && customer.code ? customer.code : 'Not Applicable'}`);
        });
    });

    test.skip('should able to delete customer', async ({ page }) => {
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
                    console.warn(`⚠️ Deletion skipped: record '${customer.name}' not found.`);
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
                console.warn(`⚠️ Deletion failed: '${customer.name}': ${error.message}`);
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
            console.log('🗑️ Deleted Records: ' + deletedRecords.join(', '));
        }
        console.log(`⚠️ Skipped/Failed: ${skippedRecords.length}`);
        if (skippedRecords.length) {
            console.log('🚫 Skipped Records: ' + skippedRecords.join(', '));
        }
        console.log(`🕒 Test Executed At: ${new Date().toLocaleString('en-IN')}`);
        console.log('======================================');

        SummaryHelper.exportDeleteSummary(
            'Delete Customer',
            deletedRecords,
            skippedRecords
        );
    });

});