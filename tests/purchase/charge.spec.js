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

    test('should not allow duplicate charge creation', async ({ page }) => {

        const charge = chargeData.validate;

        await test.step('Navigate to charge master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Charge');
        });

        try {

            await test.step('Check the record is present or not', async () => {
                const exists = await listingAction.isRecordExists(charge?.name);
                expect(exists).toBeTruthy();
            });

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
                    page.getByText(`Duplicate code found. Code: ${charge.code} already exists!`)
                ).toBeVisible({ timeout: 5000 });
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
                await test.step(`Open new charge creation form`, async () => {
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

                    if (ValidationHelper.isNumberGreaterThanZero(charge.defaultValue)) {
                        await chargePage.fillDefaultValue(charge.defaultValue);
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

    test('should update charge(s) successfully', async ({ page }) => {

        // ===== Record tracking =====
        const updatedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to charge master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Charge');
        });

        // ===== Iterate to update =====
        for (const charge of chargeData.update) {

            // ===== Skip conditions =====
            if (!charge?.name || !charge?.newName) {
                skippedRecords.push(charge?.name ?? 'UNKNOWN');
                console.warn(`⚠️ Updation skipped because record data missing for name or new name ${charge?.name}`);
                continue;
            }

            try {
                await test.step(`Filter charge record: ${charge.name}`, async () => {
                    await listingAction.filterMasterByName(charge.name);
                });

                const recordExists = await page.locator(`text=${charge.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);

                if (!recordExists) {
                    console.warn(`⚠️ Updation skipped because record not found: ${charge.name}.`);
                    skippedRecords.push(charge.name);
                    continue;
                }

                await listingAction.selectMasterRowByName(charge.name);
                await menuAction.clickListingMenuOptionByTitle('Edit');

                await test.step(`Fill charge code: ${charge.code} if feature is true`, async () => {
                    if (chargeData.feature?.allowCodeManual && charge.code) {
                        await masterHeaderAction.fillCodeIntoTextBox(charge.code);
                    }
                });

                await test.step(`Fill charge new name: ${charge.newName}`, async () => {
                    await masterHeaderAction.fillName(charge.newName);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(charge.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(charge.nameArabic);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(charge.description)) {
                        await masterHeaderAction.fillDescription(charge.description);
                    }

                    if (ValidationHelper.isNumberGreaterThanZero(charge.defaultValue)) {
                        await chargePage.fillDefaultValue(charge.defaultValue);
                    }
                });

                await test.step(`Select main account: ${charge.mainAccount}`, async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(charge.mainAccount)) {
                        await commonAction.selectMainAccount(charge.mainAccount);
                    }
                });

                await test.step(`Save charge: ${charge.newName}`, async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step(`Validate charge new name: ${charge.newName}`, async () => {
                    await expect(page.locator("input[name='Charge.Name']")).toHaveValue(charge.newName);
                });

                // updatedRecords.push(paymentTerm.newName);
                updatedRecords.push(`${charge.name} → ${charge.newName}`);

            } catch (error) {
                failedRecords.push(charge?.name);
                console.error(`🔴 Failed to update record: ${charge?.name} \n`, error);
            } finally {
                await test.step(`Back to listing`, async () => {
                    await menuAction
                        .navigateBackToListing('Charge')
                        .catch(async () => {
                            console.warn('🔴 Navigation failed, reloading page');
                            await page.reload();
                        });
                });

                await test.step(`Clear charge filter`, async () => {
                    await listingAction.clearMasterNameColumnFilter();
                });
            }
        }

        await test.step('Log update summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Charge',
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: chargeData.update.length
            });
        });

        await test.step('Export update summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Charge',
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: chargeData.update.length
            });
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Failed charge(s): ${failedRecords.join(', ')}`
            );
        }
    });

    test('should delete charge(s) successfully', async ({ page }) => {

        const deletedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to charge master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Charge');
        });

        // ===== Iterate & Delete =====
        for (const charge of chargeData.delete) {
            const result = await masterDeleteAction.safeDeleteByName({
                masterType: 'Charge',
                name: charge.name,
                retries: 1
            });

            if (result === 'deleted') {
                deletedRecords.push(charge.name);
            }

            if (result === 'skipped') {
                skippedRecords.push(charge.name);
            }

            if (result === 'failed') {
                failedRecords.push(charge.name);
            }
        }

        await test.step('Log delete summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Charge',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: chargeData.delete.length
            });
        });

        await test.step('Export delete summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Charge',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: chargeData.delete.length
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