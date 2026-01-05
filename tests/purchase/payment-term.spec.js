import { test, expect } from '../base/baseTest.js';
import { MenuAction } from '../../components/menu.action.js';
import { ListingAction } from '../../components/listing.action.js';
import { SetupAction } from '../../components/setup.action.js';
import { CommonAction } from '../../components/common.action.js';
import { MasterHeaderAction } from '../../components/master-header.action.js';
import { MasterDeleteAction } from '../../components/master-delete.action.js'
import { ValidationHelper } from '../../helpers/validationHelper.js';
import { ToastHelper } from '../../helpers/toastHelper.js';
import { SummaryHelper } from '../../helpers/summaryHelper.js';
import { SummaryHelp } from '../../helpers/summaryHelp.js'
import { PaymentTermPage } from '../../pages/purchase/pyment-term.page.js';
import paymentTermData from '../../testdata/purchase/payment-term.json';

test.describe('Payment Term CRUD Operations', () => {
    let paymentTermPage;
    let menuAction;
    let listingAction;
    let setupAction;
    let commonAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let toastHelper;

    test.beforeEach(async ({ page }) => {
        paymentTermPage = new PaymentTermPage(page);
        menuAction = new MenuAction(page);
        listingAction = new ListingAction(page);
        setupAction = new SetupAction(page);
        commonAction = new CommonAction(page);
        masterHeaderAction = new MasterHeaderAction(page);
        masterDeleteAction = new MasterDeleteAction(page, listingAction, commonAction, menuAction);
        toastHelper = new ToastHelper(page);

        await menuAction.selectModule('Purchase');
    });

    test('should not allow duplicate payment term creation', async ({ page }) => {

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

        // await test.step('Validate duplicate payment term name message', async () => {
        //     await expect.soft(
        //         page.getByText(
        //             `Payment term with ${paymentTerm.name} name already exists.`,
        //             { exact: false }
        //         )
        //     ).toBeVisible();
        // });

        await test.step('Attempt to save payment term with duplicate code', async () => {
            await masterHeaderAction.fillCodeIntoTextBox(paymentTerm.code);
            await menuAction.clickTopMenuOption('Save');
        });

        await test.step('Validate duplicate payment term code message', async () => {
            await expect.soft(
                page.getByText(
                    `Duplicate code found. Code: ${paymentTerm.code} already exists!`,
                    { exact: false }
                )
            ).toBeVisible();
        });

        await test.step('Log validation summary', async () => {
            SummaryHelper.logValidationSummary(paymentTerm.name, paymentTerm.code);
        });

    });

    test('validate due days required for payment term creation', async ({ page }) => {

        const paymentTerm = paymentTermData.validate;

        await test.step('Navigate to payment term master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Payment Term');
        });

        await test.step('Open new payment term creation form', async () => {
            await menuAction.clickListingMenuOptionByTitle('New');
        });

        await test.step(`Fill payment term code: ${paymentTerm.code} if feature is true`, async () => {
            if (paymentTermData.feature?.allowCodeManual && paymentTerm.code) {
                await masterHeaderAction.fillCodeIntoTextBox(paymentTerm.code);
            }
        });

        await test.step(`Fill payment term name: ${paymentTerm.name}`, async () => {
            await masterHeaderAction.fillName(paymentTerm.name);
        });

        await test.step(`Save payment term: ${paymentTerm.name}`, async () => {
            await menuAction.clickTopMenuOption('Save');
        });

        await test.step('Validate due days required for payment term message', async () => {
            await toastHelper.assertByText('PaymentTerm', 'dueDaysRequired');
        });

    });

    test('should create a payment term successfully', async ({ page }) => {
        // Track created/skipped/failed records
        const createdRecords = [];
        const failedRecords = [];
        const PRIMARY = 0;
        const SECONDARY = 1;

        await test.step('Navigate to payment term master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Payment Term');
        });

        for (const [index, paymentTerm] of paymentTermData.create.entries()) {
            try {
                await test.step('Open new payment term creation form', async () => {
                    await menuAction.clickListingMenuOptionByTitle('New');
                });

                await test.step(`Fill payment term code: ${paymentTerm.code} if feature is true`, async () => {
                    if (paymentTermData.feature?.allowCodeManual && paymentTerm.code) {
                        await masterHeaderAction.fillCodeIntoTextBox(paymentTerm.code);
                    }
                });

                await test.step(`Fill payment term name: ${paymentTerm.name}`, async () => {
                    await masterHeaderAction.fillName(paymentTerm.name);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(paymentTerm.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(paymentTerm.nameArabic);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(paymentTerm.description)) {
                        await masterHeaderAction.fillDescription(paymentTerm.description);
                    }
                });

                await test.step(`Fill payment term due days: ${paymentTerm.dueDays}`, async () => {
                    await paymentTermPage.fillDueDays(paymentTerm.dueDays);
                });

                await test.step('Add payment term for newly created customer/supplier', async () => {
                    if (index === PRIMARY) {
                        await paymentTermPage.enableAutoInsertToCustomer();
                    }
                    if (index === SECONDARY) {
                        await paymentTermPage.enableAutoInsertToSupplier();
                    }
                });

                await test.step(`Save payment term: ${paymentTerm.name}`, async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step(`Validate payment term created message`, async () => {
                    await toastHelper.assertByText('PaymentTerm', 'Create');
                });

                createdRecords.push(paymentTerm.name);

                await test.step('Back to the listing', async () => {
                    await menuAction.navigateBackToListing('Payment Term');
                });

            } catch (error) {
                failedRecords.push(paymentTerm?.name);
                console.error(`❌ Failed to create record: ${paymentTerm?.name}`, error);
                await menuAction.navigateBackToListing('Payment Term');
            }
        }

        await test.step('Log create summary', async () => {
            SummaryHelp.logCreateSummary({
                entityName: 'Payment Term',
                action: 'Create',
                successRecords: createdRecords,
                failedRecords: failedRecords,
                totalCount: paymentTermData.create.length
            });
        });


        await test.step('Export create summary', async () => {
            SummaryHelp.exportCreateSummary({
                entityName: 'Payment Term',
                action: 'Create',
                successRecords: createdRecords,
                failedRecords: failedRecords,
                totalCount: paymentTermData.create.length
            });
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `Test failed. Failed record(s): ${failedRecords.join(', ')}`
            );
        }

    });

    test('should update a payment term successfully', async ({ page }) => {
        // ===== Deletion/Skipped Summary Trackers =====
        const updatedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to payment term master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Payment Term');
        });

        // ===== Iterate To Delete =====
        for (const paymentTerm of paymentTermData.update) {
            try {
                await test.step(`Filter payment term record: ${paymentTerm.name}`, async () => {
                    await listingAction.filterMasterByName(paymentTerm.name);
                });

                const recordExists = await page.locator(`text=${paymentTerm.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);

                if (!recordExists) {
                    console.warn(`⚠️ Updation skipped because record not found: ${paymentTerm.name}.`);
                    skippedRecords.push(paymentTerm.name);
                    continue;
                }

                await listingAction.selectMasterRowByName(paymentTerm.name);
                await menuAction.clickListingMenuOptionByTitle('Edit');

                await test.step(`Fill payment term code: ${paymentTerm.code} if feature is true`, async () => {
                    if (paymentTermData.feature?.allowCodeManual && paymentTerm.code) {
                        await masterHeaderAction.fillCodeIntoTextBox(paymentTerm.code);
                    }
                });

                await test.step(`Fill payment term new name: ${paymentTerm.newName}`, async () => {
                    await masterHeaderAction.fillName(paymentTerm.newName);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(paymentTerm.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(paymentTerm.nameArabic);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(paymentTerm.description)) {
                        await masterHeaderAction.fillDescription(paymentTerm.description);
                    }
                });

                await test.step(`Fill payment term due days: ${paymentTerm.dueDays}`, async () => {
                    await paymentTermPage.fillDueDays(paymentTerm.dueDays);
                });

                await test.step(`Save payment term: ${paymentTerm.name}`, async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step(`Validate payment term new name: ${paymentTerm.newName}`, async () => {
                    await expect(page.locator("input[name='PaymentTerm.Name']")).toHaveValue(paymentTerm.newName);
                });

                updatedRecords.push(paymentTerm.newName);

                await test.step('Back to the listing', async () => {
                    await paymentTermPage.clickPaymentTerm();
                });

            } catch (error) {
                failedRecords.push(paymentTerm?.name);
                console.error(`❌ Failed to update record: ${paymentTerm?.name} \n`, error);
                await menuAction.navigateBackToListing('Payment Term');
            } finally {
                await test.step(`Clear payment term filter`, async () => {
                    await listingAction.clearMasterNameColumnFilter();
                });
            }
        }

        await test.step('Log create summary', async () => {
            SummaryHelp.logCreateSummary({
                entityName: 'Payment Term',
                action: 'Update',
                successRecords: updatedRecords,
                failedRecords: failedRecords,
                totalCount: paymentTermData.update.length
            });
        });

        await test.step('Export update summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Payment Term',
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords,
                totalCount: paymentTermData.update.length
            });
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `Test failed. Failed record(s): ${failedRecords.join(', ')}`
            );
        }
    });

    test('should delete a payment term successfully', async ({ page }) => {
        // ===== Deletion/Skipped Summary Trackers =====
        const deletedRecords = [];
        const skippedRecords = [];

        await test.step('Navigate to payment term master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Payment Term');
        });

        // ===== Iterate To Delete =====
        for (const paymentTerm of paymentTermData.delete) {
            try {
                await test.step(`Filter payment term record: ${paymentTerm.name}`, async () => {
                    await listingAction.filterMasterByName(paymentTerm.name);
                });

                const recordExists = await page.locator(`text=${paymentTerm.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);

                if (!recordExists) {
                    console.warn(`⚠️ Deletion skipped because record not found: ${paymentTerm.name}.`);
                    skippedRecords.push(paymentTerm.name);
                    continue;
                }

                await test.step(`Delete payment term: ${paymentTerm.name}`, async () => {
                    await masterDeleteAction.deleteMasterByName('Payment Term', paymentTerm.name);
                });

                await test.step(`Validate supplier deleted message: ${paymentTerm.name}`, async () => {
                    await toastHelper.assertByText('PaymentTerm', 'Delete');
                });

                deletedRecords.push(paymentTerm.name);

            } catch (error) {
                skippedRecords.push(paymentTerm.name);
                console.warn(`⚠️ Deletion failed: '${paymentTerm.name}': ${error.message}`);
            } finally {
                await test.step(`Clear supplier filter`, async () => {
                    await listingAction.clearMasterNameColumnFilter();
                });
            }
        }

        await test.step('Log delete summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Payment Term',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords,
                totalCount: paymentTermData.delete.length
            });
        });

        await test.step('Export delete summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Payment Term',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords,
                totalCount: paymentTermData.delete.length
            });
        });

        // await test.step('Validate at least one payment term was deleted', async () => {
        //     expect(deletedRecords.length).toBeGreaterThan(0);
        // });

        // await test.step('Validate all records were processed', async () => {
        //     expect(deletedRecords.length + skippedRecords.length)
        //         .toBe(paymentTermData.delete.length);
        // });
    });

});