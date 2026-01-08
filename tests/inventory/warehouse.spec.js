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
import { WarehousePage } from '../../pages/inventory/warehouse.page.js';
import warehouseData from '../../testdata/inventory/warehouse.json';

test.describe('Warehouse CRUD Operations', () => {
    let warehousePage;
    let menuAction;
    let listingAction;
    let setupAction;
    let commonAction;
    let masterHeaderAction;
    let masterDeleteAction;
    let toastHelper;

    test.beforeEach(async ({ page }) => {
        warehousePage = new WarehousePage(page);
        menuAction = new MenuAction(page);
        listingAction = new ListingAction(page);
        setupAction = new SetupAction(page);
        commonAction = new CommonAction(page);
        masterHeaderAction = new MasterHeaderAction(page);
        masterDeleteAction = new MasterDeleteAction(page, listingAction, commonAction, menuAction);
        toastHelper = new ToastHelper(page);

        await menuAction.selectModule('Inventory');
    });

    test('create warehouse: should show validation message for duplicate code', async ({ page }) => {

        const warehouse = warehouseData.validate;

        await test.step('Navigate to charge master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Warehouse');
        });

        await test.step(`Check precondition: record exists (${warehouse?.code})`, async () => {
            const exists = await listingAction.isRecordExists(warehouse?.code, 2);
            test.skip(!exists, `Precondition failed: Charge '${warehouse?.code}' does not exist`);
        });

        await test.step('Open new charge creation form', async () => {
            await menuAction.clickListingMenuOptionByTitle('New');
        });

        await test.step(`Fill name: ${warehouse.name}`, async () => {
            await masterHeaderAction.fillName(warehouse.name);
        });

        await test.step('Attempt to save charge with duplicate code', async () => {
            await masterHeaderAction.fillCodeIntoTextBox(warehouse.code);
            await menuAction.clickTopMenuOption('Save');
        });

        await test.step('Validate duplicate code error', async () => {
            await expect(
                page.getByText(`Duplicate code found. Code: ${warehouse.code} already exists!`)
            ).toBeVisible({ timeout: 5000 });
        });

        await test.step('Navigate back to listing', async () => {
            await menuAction.navigateBackToListing('Warehouse');
        });

        await test.step('Log name validation summary', async () => { 
            SummaryHelper.logCodeValidationSummary(warehouse.code); 
        });
    });

    test('create warehouse: should show validation message for duplicate name', async ({ page }) => {

        const warehouse = warehouseData.validate;

        await test.step('Navigate to charge master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Warehouse');
        });

        await test.step(`Check precondition: record exists (${warehouse?.name})`, async () => {
            const exists = await listingAction.isRecordExists(warehouse?.name, 3);
            test.skip(!exists, `Precondition failed: Charge '${warehouse?.name}' does not exist`);
        });

        await test.step('Open new charge creation form', async () => {
            await menuAction.clickListingMenuOptionByTitle('New');
        });

        await test.step('Attempt to save charge with duplicate name', async () => {
            await masterHeaderAction.fillName(warehouse.name);
            await menuAction.clickTopMenuOption('Save');
        });

        await test.step('Validate duplicate charge name message', async () => {
            await expect(
                page.getByText(
                    `Warehouse with ${warehouse.name} name already exists.`,
                    { exact: false }
                )
            ).toBeVisible();
        });

        await test.step('Navigate back to listing', async () => {
            await menuAction.navigateBackToListing('Warehouse');
        });

        await test.step('Log name validation summary', async () => { 
            SummaryHelper.logNameValidationSummary(warehouse.name); 
        });
        
    });

    test('should create warehouse(s) successfully', async ({ page }) => {

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

    test('should update warehouse(s) successfully', async ({ page }) => {

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

                const recordExists = await listingAction.isRecordExistsWithName(charge?.name);
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

    test('should delete warehouse(s) successfully', async ({ page }) => {

        const deletedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to charge master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Warehouse');
        });

        // ===== Iterate & Delete =====
        for (const warehouse of warehouseData.delete) {
            const result = await masterDeleteAction.safeDeleteByName({
                masterType: 'Warehouse',
                name: warehouse.name,
                retries: 1
            });

            if (result === 'deleted') {
                deletedRecords.push(warehouse.name);
            }

            if (result === 'skipped') {
                skippedRecords.push(warehouse.name);
            }

            if (result === 'failed') {
                failedRecords.push(warehouse.name);
            }
        }

        await test.step('Log delete summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Warehouse',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: warehouseData.delete.length
            });
        });

        await test.step('Export delete summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Warehouse',
                action: 'Delete',
                successRecords: deletedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: warehouseData.delete.length
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