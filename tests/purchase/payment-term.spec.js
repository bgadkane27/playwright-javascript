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
import { FileHelper } from '../../helpers/fileHelper.js';
import { ValidationHelper } from '../../helpers/validationHelper.js';
import { ToastHelper } from '../../helpers/toastHelper.js';
import { SummaryHelper } from '../../helpers/summaryHelper.js';
import { PaymentTermPage } from '../../pages/purchase/pyment-term.page.js';
import paymentTermData from '../../testdata/purchase/payment-term.json';

test.describe.serial('Payment Term CRUD Operations', () => {
    let setupAction;
    let paymentTermPage;
    let commonAction;
    let menuAction;
    let listingAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let documentAction;
    let lookupAction;
    let uploadAction;
    let toastHelper;

    test.beforeEach(async ({ page }) => {
        setupAction = new SetupAction(page);
        paymentTermPage = new PaymentTermPage(page);
        commonAction = new CommonAction(page);
        menuAction = new MenuAction(page);
        listingAction = new ListingAction(page);
        masterHeaderAction = new MasterHeaderAction(page);
        masterDeleteAction = new MasterDeleteAction(page, listingAction, commonAction, menuAction);
        documentAction = new DocumentAction(page);
        lookupAction = new LookupAction(page);
        uploadAction = new UploadAction(page);
        toastHelper = new ToastHelper(page);

        await commonAction.navigateToApp('/');
        await menuAction.selectModule('Purchase');
    });

    test.only('should not allow duplicate payment term creation', async ({ page }) => {

        const paymentTerm = paymentTermData.validate;

        await test.step('Navigate to payment term master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Payment Term');
        });

        await test.step('Open new payment term creation form', async () => {
            await menuAction.clickListingMenuOptionByTitle('New');
        });

        await test.step('Attempt to save payment term with duplicate name', async () => {
            await masterHeaderAction.fillName(paymentTerm.name);
            await paymentTermPage.fillDueDays(paymentTerm.dueDays);
            await menuAction.clickTopMenuOption('Save');
        });

        await test.step('Validate duplicate payment term name message', async () => {
            await expect.soft(
                page.getByText(
                    `Payment term with ${paymentTerm.name} name already exists.`,
                    { exact: false }
                )
            ).toBeVisible();
        });

        // await test.step('Attempt to save payment term with duplicate code', async () => {
        //     await masterHeaderAction.fillCode(paymentTerm.code);
        //     await menuAction.clickTopMenuOption('Save');
        // });

        // await test.step('Validate duplicate payment term code message', async () => {
        //     await expect.soft(
        //         page.getByText(
        //             `Duplicate code found. Code: ${paymentTerm.code} already exists!`,
        //             { exact: false }
        //         )
        //     ).toBeVisible();
        // });

        // await test.step('Log validation summary', async () => {
        //     SummaryHelper.logValidationSummary(paymentTerm.name, paymentTerm.code);
        // });

    });

    test('should be able to create payment term', async ({ page }) => {
        // ===== Creation/Skipped Summary Trackers =====
        const createdRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Supplier');
            // await menuAction.clickLeftMenuOption('Setups');
            // await setupAction.navigateToMasterByTextWithIndex('Supplier', 1);
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
                    if (ValidationHelper.isNotNullOrWhiteSpace(supplier.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(supplier.nameArabic);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(supplier.currency)) {
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
                await menuAction.clickListingMenuOptionByTitle('Refresh');
            }
        }

        await test.step('Log create summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Supplier With Basic Details',
                action: 'Create',
                successRecords: createdRecords,
                skippedRecords,
                totalCount: supplierData.suppliers.length
            });
        });

        await test.step('Export create summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Supplier With Basic Details',
                action: 'Create',
                successRecords: createdRecords,
                skippedRecords,
                totalCount: supplierData.suppliers.length
            });
        });
    });

    test('should be able to delete supplier', async ({ page }) => {
        // ===== Deletion/Skipped Summary Trackers =====
        const deletedRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to supplier master', async () => {
            await menuAction.clickLeftMenuOption('Supplier');
            // await menuAction.clickLeftMenuOption('Setups');
            // await setupAction.navigateToMasterByTextWithIndex('Supplier', 1);
        });

        // ===== Iterate To Delete =====
        for (const supplier of supplierData.delete) {
            try {
                await test.step(`Filter supplier record: ${supplier.name}`, async () => {
                    await listingAction.filterMasterByName(supplier.name);
                });

                const recordExists = await page.locator(`text=${supplier.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);

                if (!recordExists) {
                    console.warn(`⚠️ Deletion skipped because record not found: ${supplier.name}.`);
                    skippedRecords.push(supplier.name);
                    continue;
                }

                await test.step(`Delete supplier: ${supplier.name}`, async () => {
                    await masterDeleteAction.deleteMasterByName('Supplier', supplier.name);
                });

                await test.step(`Validate supplier deleted message: ${supplier.name}`, async () => {
                    await toastHelper.assertByText('Supplier', 'Delete');
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
            SummaryHelper.logCrudSummary({
                entityName: 'Supplier',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords,
                totalCount: supplierData.delete.length
            });
        });

        await test.step('Export delete summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Supplier',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords,
                totalCount: supplierData.delete.length
            });
        });
    });

});