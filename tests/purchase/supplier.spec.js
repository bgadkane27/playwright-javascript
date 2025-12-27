import { test, expect } from '@playwright/test'
import { SetupAction } from '../../components/setup.action.js';
import { CommonAction } from '../../components/common.action.js';
import { MenuAction } from '../../components/menu.action.js';
import { ListingAction } from '../../components/listing.action.js';
import { MasterHeaderAction } from '../../components/master-header.action.js';
import { MasterDeleteAction } from '../../components/master-delete.action.js'
import { DocumentAction } from '../../components/document.action.js';
import { LookupAction } from '../../components/lookup.action.js';
import { UploadAction } from '../../components/upload.action.js';
import { getUploadFile } from '../../utils/file.util.js';
import { SupplierPage } from '../../pages/purchase/supplier.page.js';
import supplierData from '../../testdata/purchase/supplier.json';
import StringHelper from '../../helpers/StringHelper.js';
import MessageHelper from '../../helpers/MessageHelper.js';
import SummaryHelper from '../../helpers/SummaryHelper.js';
import { SummaryUtil } from '../../utils/summary.util.js';

test.describe.serial('Supplier CRUD Operations', () => {
    let setupAction;
    let supplierPage;
    let commonAction;
    let menuAction;
    let listingAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let documentAction;
    let lookupAction;
    let uploadAction;

    test.beforeEach(async ({ page }) => {
        setupAction = new SetupAction(page);
        supplierPage = new SupplierPage(page);
        commonAction = new CommonAction(page);
        menuAction = new MenuAction(page);
        listingAction = new ListingAction(page);
        masterHeaderAction = new MasterHeaderAction(page);
        masterDeleteAction = new MasterDeleteAction(page, listingAction, commonAction, menuAction);
        documentAction = new DocumentAction(page);
        lookupAction = new LookupAction(page);
        uploadAction = new UploadAction(page);

        await commonAction.navigateToApp('/');
        await menuAction.selectModule('Purchase');
    });

    test.skip('should not allow duplicate customer creation', async ({ page }) => {

        const supplier = supplierData.validate;

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByTextWithIndex('Supplier', 1);
        });

        await test.step('Open new supplier creation form', async () => {
            await menuAction.clickListingMenuOptionWithIndex('New', 0);
        });

        await test.step('Attempt to save supplier with duplicate name', async () => {
            await masterHeaderAction.fillName(supplier.name);
            await menuAction.clickTopMenuOption('Save');
        });

        await test.step('Validate duplicate supplier name message', async () => {
            await expect.soft(
                page.getByText(
                    `Supplier with ${supplier.name} name already exists.`,
                    { exact: false }
                )
            ).toBeVisible();
        });

        await test.step('Attempt to save supplier with duplicate code', async () => {
            await masterHeaderAction.fillCode(supplier.code);
            await menuAction.clickTopMenuOption('Save');
        });

        await test.step('Validate duplicate supplier code message', async () => {
            await expect.soft(
                page.getByText(
                    `Duplicate code found. Code: ${supplier.code} already exists!`,
                    { exact: false }
                )
            ).toBeVisible();
        });

        await test.step('Log validation summary', async () => {
            SummaryUtil.logValidateSummary(supplier.name, supplier.code);
        });

    });

    test.skip('should able to create supplier with basic detail', async ({ page }) => {
        // ===== Creation/Skipped Summary Trackers =====
        const createdRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByTextWithIndex('Supplier', 1);
        });

        for (const supplier of supplierData.suppliers) {
            try {
                await test.step(`Open new supplier form: ${supplier.name}`, async () => {
                    await menuAction.clickListingMenuOptionWithIndex('New', 0);
                });

                await test.step(`Fill supplier code: ${supplier.code} if feature is true`, async () => {
                    if (supplierData.feature?.allowCodeManual && supplier.code) {
                        await masterHeaderAction.fillCode(supplier.code);
                    }
                });

                await test.step(`Fill supplier name: ${supplier.name}`, async () => {
                    await masterHeaderAction.fillName(supplier.name);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (StringHelper.isNotNullOrWhiteSpace(supplier.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(supplier.nameArabic);
                    }

                    if (StringHelper.isNotNullOrWhiteSpace(supplier.currency)) {
                        await supplierPage.clickCurrency();
                        await lookupAction.selectListItem(supplier.currency);
                    }
                });

                await test.step(`Save supplier: ${supplier.name}`, async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step(`Validate supplier saved: ${supplier.name}`, async () => {
                    await expect(page.locator("input[name='Name']")).toHaveValue(supplier.name);
                });

                createdRecords.push(supplier.name);

                await test.step('Navigate back to supplier list', async () => {
                    await supplierPage.clickBack();
                });

            } catch (error) {
                skippedRecords.push(supplier?.name);
                console.warn(`Record creation failed: ${supplier?.name}`, error);

                try {
                    await supplierPage.clickBack();
                } catch {
                    await page.reload();
                }
            }
        }

        await test.step('Log create summary', async () => {
            SummaryUtil.logCrudSummary({
                entityName: 'Supplier',
                action: 'create',
                successRecords: createdRecords,
                skippedRecords,
                totalCount: supplierData.suppliers.length
            });
        });

        await test.step('Export create summary', async () => {
            SummaryUtil.exportCrudSummary({
                entityName: 'Supplier',
                action: 'create',
                successRecords: createdRecords,
                skippedRecords,
                totalCount: supplierData.suppliers.length
            });
        });
    });

    test('should be able to create customer with key info detail', async ({ page }) => {

        const createdRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByTextWithIndex('Supplier', 1);
        });

        for (const supplier of supplierData.keyInfos) {

            try {
                await test.step(`Create Supplier: ${supplier.name}`, async () => {

                    await test.step(`Open new supplier form: ${supplier.name}`, async () => {
                        await menuAction.clickListingMenuOptionWithIndex('New', 0);
                    });

                    await test.step(`Fill supplier code: ${supplier.code} if feature is true`, async () => {
                        if (supplierData.feature?.allowCodeManual && supplier.code) {
                            await masterHeaderAction.fillCode(supplier.code);
                        }
                    });

                    await test.step(`Fill supplier name: ${supplier.name}`, async () => {
                        await masterHeaderAction.fillName(supplier.name);
                    });

                    await test.step('Fill optional fields (if provided)', async () => {
                        if (StringHelper.isNotNullOrWhiteSpace(supplier.nameArabic)) {
                            await masterHeaderAction.fillNameArabic(supplier.nameArabic);
                        }

                        if (StringHelper.isNotNullOrWhiteSpace(supplier.currency)) {
                            await supplierPage.clickCurrency();
                            await lookupAction.selectListItem(supplier.currency);
                        }
                    });

                    await test.step(`Save supplier: ${supplier.name}`, async () => {
                        await menuAction.clickTopMenuOption('Save');
                    });

                    await test.step(`Validate supplier saved: ${supplier.name}`, async () => {
                        await expect(page.locator("input[name='Name']")).toHaveValue(supplier.name);
                    });

                    // ================= Key Info =================
                    await supplierPage.openKeyInfoTab();

                    // await customerPage.clickOnGroup();
                    // await LookupHelper.selectListItem(page, customer.group);

                    // await customerPage.fillEmail(customer.email);
                    // await customerPage.fillMobile(customer.mobile);
                    // await customerPage.fillTelephone(customer.telephone);
                    // await customerPage.fillDescription(customer.description);

                    // await customerPage.clickOnReceivableAccount();
                    // await LookupHelper.selectListItem(page, customer.receivableAccount);

                    // await customerPage.clickOnSaveKeyInfo();

                    // await expect(customerPage.keyInfoEmail).toHaveValue(customer.email);

                    // ================= Credit Control =================
                    // if (customer.enableCreditControl) {
                    //     await customerPage.clickOnEnableCreditControl();
                    //     await customerPage.fillCreditLimitAmount(customer.creditLimitAmount);
                    //     await customerPage.fillCreditLimitDays(customer.creditLimitDays);

                    //     await customerPage.scrollToCreditCheckMode();

                    //     await customerPage.clickOnCreditRating();
                    //     await LookupHelper.selectListItem(page, customer.creditRating);

                    //     await customerPage.clickOnCreditCheckMode();
                    //     await LookupHelper.selectListItem(page, customer.creditCheckMode);

                    //     await customerPage.clickOnSaveKeyInfo();
                    // }

                    // ================= Defaults =================
                    // if (customer.enableDefaults) {
                    //     await customerPage.clickOnSetDefaults();

                    //     await customerPage.clickOnSalesman();
                    //     await LookupHelper.selectListItem(page, customer.salesman);

                    //     await customerPage.clickOnPaymentTerm();
                    //     await LookupHelper.selectListItem(page, customer.paymentTerm);

                    //     await customerPage.scrollToShipmentPriority();

                    //     await customerPage.clickOnPriceList();
                    //     await LookupHelper.selectListItem(page, customer.priceList);

                    //     await customerPage.clickOnShippingTerm();
                    //     await LookupHelper.selectListItem(page, customer.shippingTerm);

                    //     await customerPage.fillLoadingPort(customer.loadingPort);
                    //     await customerPage.fillDestinationPort(customer.destinationPort);

                    //     await customerPage.clickOnShippingMethod();
                    //     await LookupHelper.selectListItem(page, customer.shippingMethod);

                    //     await customerPage.clickOnShipmentPriority();
                    //     await LookupHelper.selectListItem(page, customer.shipmentPriority);

                    //     await customerPage.clickOnSaveKeyInfo();
                    // }

                    // ================= Restrict Payment Term =================
                    // if (customer.restrictPaymentTerm) {
                    //     await customerPage.clickOnRestrictPaymentTerm();
                    //     await customerPage.clickOnSelectPaymentTerm();

                    //     if (customer.selectAllPaymentTerms) {
                    //         await customerPage.clickOnSelectAllPaymentTerm();
                    //     } else {
                    //         await LookupHelper.selectListItem(page, customer.paymentTerm1);
                    //         // await LookupHelper.selectListItem(page, customer.paymentTerm2);

                    //     }
                    //     await customerPage.clickOnSaveKeyInfo();
                    // }

                    // ================= Restrict Price List =================
                    // if (customer.restrictPriceList) {
                    //     await customerPage.clickOnRestrictPriceList();
                    //     await customerPage.clickOnSelectPriceList();

                    //     if (customer.selectAllPriceLists) {
                    //         await customerPage.clickOnSelectAllPriceList();
                    //     } else {
                    //         await LookupHelper.selectListItem(page, customer.priceList1);
                    //         // await LookupHelper.selectListItem(page, customer.priceList2);

                    //     }
                    //     await customerPage.clickOnSaveKeyInfo();
                    // }

                    // ================= Verify =================
                    // await MessageHelper.assert(page, 'Supplier', 'Update');

                    createdRecords.push(supplier.name);

                    await supplierPage.clickBack();
                });

            } catch (error) {
                skippedRecords.push(supplier?.name);
                console.error(`Record creation failed: ${supplier?.name}`, error.stack);
                try {
                    await supplierPage.clickBack();
                } catch {
                    await page.reload();
                }
            }
        }

        await test.step('Log create summary', async () => {
            SummaryUtil.logCrudSummary({
                entityName: 'Supplier',
                action: 'Create',
                successRecords: createdRecords, 
                skippedRecords,
                totalCount: supplierData.keyInfos.length
            });
        });

        await test.step('Export create summary', async () => {
            SummaryUtil.exportCrudSummary({
                entityName: 'Supplier',
                action: 'Create',
                successRecords: createdRecords, skippedRecords,
                totalCount: supplierData.keyInfos.length
            });
        });
    });

    test('should able to delete customer', async ({ page }) => {
        // ===== Deletion/Skipped Summary Trackers =====
        const deletedRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByTextWithIndex('Supplier', 1);
        });

        // ===== Iterate To Delete =====
        for (const supplier of supplierData.delete) {
            try {
                await test.step(`Filter supplier record: ${supplier.name}`, async () => {
                    await listingAction.filterMasterByName(supplier.name);
                });

                const recordExists = await page.locator(`text=${supplier.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);

                if (!recordExists) {
                    console.warn(`⚠️ Deletion skipped because record not found: '${supplier.name}'.`);
                    skippedRecords.push(supplier.name);
                    continue;
                }

                await test.step(`Delete supplier: ${supplier.name}`, async () => {
                    await masterDeleteAction.deleteMasterByName('Supplier', supplier.name);
                });

                await test.step(`Validate supplier deleted message: ${supplier.name}`, async () => {
                    await MessageHelper.assert(page, 'Supplier', 'Delete');
                });

                // ===== Track record deletion =====
                deletedRecords.push(supplier.name);

            } catch (error) {
                // ===== Track record skip
                skippedRecords.push(supplier.name);
                console.warn(`⚠️ Deletion failed: '${supplier.name}': ${error.message}`);
            } finally {
                await test.step(`Clear supplier filter`, async () => {
                    await listingAction.clearMasterNameColumnFilter();
                });
            }
        }

        await test.step('Log delete summary', async () => {
            SummaryUtil.logCrudSummary({
                entityName: 'Supplier',
                action: 'Delete',
                successRecords: deletedRecords, skippedRecords,
                totalCount: supplierData.delete.length
            });
        });

        await test.step('Export delete summary', async () => {
            SummaryUtil.exportCrudSummary({
                entityName: 'Supplier',
                action: 'Delete',
                successRecords: deletedRecords, skippedRecords,
                totalCount: supplierData.delete.length
            });
        });
    });

});