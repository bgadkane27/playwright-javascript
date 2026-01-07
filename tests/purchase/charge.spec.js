import { test, expect } from '../base/baseTest.js';
import { MenuAction } from '../../components/menu.action.js';
import { ListingAction } from '../../components/listing.action.js';
import { SetupAction } from '../../components/setup.action.js';
import { CommonAction } from '../../components/common.action.js';
import { MasterHeaderAction } from '../../components/master-header.action.js';
import { MasterDeleteAction } from '../../components/master-delete.action.js';
import { ValidationHelper } from '../../helpers/validationHelper.js';
import { ToastHelper } from '../../helpers/toastHelper.js';
import { SummaryHelper } from '../../helpers/summaryHelper.js';
import { ChargePage } from '../../pages/purchase/charge.page.js';
import chargeData from '../../testdata/purchase/charge.json';

test.describe('Charge CRUD Operations', () => {
    let chargePage;
    let menuAction;
    let listingAction;
    let setupAction;
    let commonAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let toastHelper;

    test.beforeEach(async ({ page }) => {
        chargePage = new ChargePage(page);
        menuAction = new MenuAction(page);
        listingAction = new ListingAction(page);
        setupAction = new SetupAction(page);
        commonAction = new CommonAction(page);
        masterHeaderAction = new MasterHeaderAction(page);
        masterDeleteAction = new MasterDeleteAction(page, listingAction, commonAction, menuAction);
        toastHelper = new ToastHelper(page);

        await menuAction.selectModule('Purchase');
    });

    test.skip('should not allow duplicate charge creation', async ({ page }) => {

        const charge = chargeData.validate;

        await test.step('Navigate to charge master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Charge');
        });

        try {
            await test.step('Open new charge creation form', async () => {
                await menuAction.clickListingMenuOptionByTitle('New');
            });

            await test.step('Attempt to save charge with duplicate name', async () => {
                await masterHeaderAction.fillName(charge.name);
                await menuAction.clickTopMenuOption('Save');
            });

            // await test.step('Validate duplicate charge name message', async () => {
            //     await expect.soft(
            //         page.getByText(
            //             `Charge with ${charge.name} name already exists.`,
            //             { exact: false }
            //         )
            //     ).toBeVisible();
            // });

            await test.step('Attempt to save charge with duplicate code', async () => {
                await masterHeaderAction.fillCodeIntoTextBox(charge.code);
                await menuAction.clickTopMenuOption('Save');
            });

            await test.step('Validate duplicate code error', async () => {
                await expect(
                    page.locator('#ValidationSummary').getByText(`Duplicate code found. Code: ${charge.code} already exists!`)
                ).toBeVisible();
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListing('Charge');
            });
        }

        await test.step('Log validation summary', async () => {
            SummaryHelper.logValidationSummary(charge.name, charge.code);
        });

    });

    test('should create charge(s) successfully', async ({ page }) => {

        // ===== Record tracking =====
        const createdRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to charge master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Charge');
        });

        // Iterate to create
        for (const charge of chargeData.create) {

            // ===== Skip conditions =====
            if (!charge?.name) {
                skippedRecords.push(charge?.name ?? 'UNKNOWN');
                console.warn(`⚠️ Creation skipped because record data missing for name: ${charge?.name}`);
                continue;
            }

            try {
                await test.step(`Open new charge form: ${charge.name}`, async () => {
                    await menuAction.clickListingMenuOptionByTitle('New');
                });

                await test.step(`Fill charge code: ${charge.code} if feature is true`, async () => {
                    if (chargeData.feature?.allowCodeManual && charge.code) {
                        await masterHeaderAction.fillCodeIntoTextBox(charge.code);
                    }
                });

                await test.step(`Fill charge name: ${charge.name}`, async () => {
                    await masterHeaderAction.fillName(charge.name);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(charge.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(charge.nameArabic);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(charge.description)) {
                        await masterHeaderAction.fillDescription(charge.description);
                    }
                });

                await test.step(`Select main account: ${charge.mainAccount}`, async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(charge.mainAccount)) {
                        await commonAction.selectMainAccount(charge.mainAccount);
                    }
                });

                await test.step(`Save charge: ${charge.name}`, async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step(`Validate charge created message`, async () => {
                    await toastHelper.assertByText('Charge', 'Create');
                });

                createdRecords.push(charge.name);

            } catch (error) {
                failedRecords.push(charge?.name);
                console.error(`🔴 Failed to create charge: ${charge?.name}\n`, error);
            } finally {
                await menuAction
                    .navigateBackToListing('Charge')
                    .catch(async () => {
                        console.warn('🔴 Navigation failed, reloading page');
                        await page.reload();
                    });
            }
        }

        await test.step('Log create summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Charge',
                action: 'Create',
                successRecords: createdRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: chargeData.create.length
            });
        });


        await test.step('Export create summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Charge',
                action: 'Create',
                successRecords: createdRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: chargeData.create.length
            });
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Test failed. Failed record(s): ${failedRecords.join(', ')}`
            );
        }

    });

    test.skip('should update charge(s) successfully', async ({ page }) => {

        // ===== Record tracking =====
        const updatedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to payment term master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Payment Term');
        });

        // ===== Iterate to update =====
        for (const paymentTerm of paymentTermData.update) {

            // ===== Skip conditions =====
            if (!paymentTerm?.name || !paymentTerm?.newName || !paymentTerm?.dueDays) {
                skippedRecords.push(paymentTerm?.name ?? 'UNKNOWN');
                console.warn(`⚠️ Updation skipped because record data missing for name, new name or dueDays: ${paymentTerm?.name}`);
                continue;
            }

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

                // updatedRecords.push(paymentTerm.newName);
                updatedRecords.push(`${paymentTerm.name} → ${paymentTerm.newName}`);

                // await test.step('Back to the listing', async () => {
                //     await paymentTermPage.clickPaymentTerm();
                // });

            } catch (error) {
                failedRecords.push(paymentTerm?.name);
                console.error(`🔴 Failed to update record: ${paymentTerm?.name} \n`, error);
            } finally {
                await test.step(`Back to listing`, async () => {
                    await menuAction
                        .navigateBackToListing('Payment Term')
                        .catch(async () => {
                            console.warn('🔴 Navigation failed, reloading page');
                            await page.reload();
                        });
                });

                await test.step(`Clear payment term filter`, async () => {
                    await listingAction.clearMasterNameColumnFilter();
                });
            }
        }

        await test.step('Log update summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Payment Term',
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: paymentTermData.update.length
            });
        });

        await test.step('Export update summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Payment Term',
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: paymentTermData.update.length
            });
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Failed payment term(s): ${failedRecords.join(', ')}`
            );
        }
    });

    test.skip('should delete charge(s) successfully', async ({ page }) => {

        const deletedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to payment term master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Payment Term');
        });

        // ===== Iterate & Delete =====
        for (const paymentTerm of paymentTermData.delete) {
            const result = await masterDeleteAction.safeDeleteByName({
                masterType: 'Payment Term',
                name: paymentTerm.name,
                retries: 1
            });

            if (result === 'deleted') {
                deletedRecords.push(paymentTerm.name);
            }

            if (result === 'skipped') {
                skippedRecords.push(paymentTerm.name);
            }

            if (result === 'failed') {
                failedRecords.push(paymentTerm.name);
            }
        }

        await test.step('Log delete summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Payment Term',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: paymentTermData.delete.length
            });
        });

        await test.step('Export delete summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Payment Term',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: paymentTermData.delete.length
            });
        });

        // ===== Fail test ONLY for real failures =====
        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Test failed. Could not delete: ${failedRecords.join(', ')}`
            );
        }
    });

});