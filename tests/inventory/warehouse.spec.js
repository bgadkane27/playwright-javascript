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

        await commonAction.navigateToApp('/');
        await menuAction.selectModule('Inventory');
    });

    test('should show validation message for duplicate code', async ({ page }) => {

        const warehouse = warehouseData.validate;

        await test.step('Navigate to warehouse master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Warehouse');
        });

        // ===== Precondition (SAFE skip) =====
        const exists = await listingAction.isRecordExists(warehouse?.code, 2);

        test.skip(
            !exists,
            `Precondition failed: Warehouse '${warehouse?.code}' not found.`
        );

        await test.step('Open new warehouse creation form', async () => {
            await menuAction.clickListingMenuOptionByTitle('New');
        });

        try {
            await test.step(`Fill name: ${warehouse.name}`, async () => {
                await masterHeaderAction.fillName(warehouse.name);
            });

            await test.step('Attempt to save warehouse with duplicate code', async () => {
                await masterHeaderAction.fillCodeIntoTextBox(warehouse.code);
                await menuAction.clickTopMenuOption('Save');
            });

            await test.step('Validate duplicate code error message', async () => {
                await expect(
                    page.getByText(/duplicate code.*already exists/i)
                ).toBeVisible({ timeout: 5000 });
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListing('Warehouse');
            });
        }

        await test.step('Log code validation summary', async () => {
            SummaryHelper.logCodeValidationSummary(warehouse.code);
        });
    });

    test('should show validation message for duplicate name', async ({ page }) => {

        const warehouse = warehouseData.validate;

        await test.step('Navigate to warehouse master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Warehouse');
        });

        // ===== Precondition (SAFE skip) =====
        const exists = await listingAction.isRecordExists(warehouse?.name, 3);

        test.skip(
            !exists,
            `Precondition failed: Warehouse '${warehouse?.name}' not found.`
        );

        await test.step('Open new warehouse creation form', async () => {
            await menuAction.clickListingMenuOptionByTitle('New');
        });

        try {
            await test.step('Attempt to save warehouse with duplicate name', async () => {
                await masterHeaderAction.fillName(warehouse.name);
                await menuAction.clickTopMenuOption('Save');
            });

            await test.step('Validate duplicate warehouse name message', async () => {
                await expect(
                    page.getByText(/warehouse.*already exists/i)
                ).toBeVisible({ timeout: 5000 });
            });
        } finally {
            await test.step('Navigate back to listing', async () => {
                await menuAction.navigateBackToListing('Warehouse');
            });
        }

        await test.step('Log name validation summary', async () => {
            SummaryHelper.logNameValidationSummary(warehouse.name);
        });

    });

    test('should create warehouse(s) successfully', async ({ page }) => {

        // ===== Record tracking =====
        const createdRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to warehouse master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Warehouse');
        });

        // ===== Iterate to create =====
        for (const warehouse of warehouseData.create) {

            // ===== Skip invalid test data =====
            if (!warehouse?.name || (warehouseData.feature?.allowCodeManual && !warehouse.code)) {
                skippedRecords.push(warehouse?.name ?? 'UNKNOWN');
                console.warn(`⚠️ Create skipped due to missing required data`, warehouse);
                continue;
            }

            // ===== Skip if already exists =====
            const exists = await listingAction.isRecordExists(warehouse.name, 3);
            if (exists) {
                skippedRecords.push(warehouse.name);
                console.warn(`⚠️ Skipped: Warehouse already exists → ${warehouse.name}`);
                continue;
            }

            try {

                await test.step(`Open new warehouse creation form`, async () => {
                    await menuAction.clickListingMenuOptionByTitle('New');
                });

                await test.step(`Fill warehouse code: ${warehouse.code} if feature is true`, async () => {
                    if (warehouseData.feature?.allowCodeManual && warehouse.code) {
                        await masterHeaderAction.fillCodeIntoTextBox(warehouse.code);
                    }
                });

                await test.step(`Fill warehouse name: ${warehouse.name}`, async () => {
                    await masterHeaderAction.fillName(warehouse.name);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(warehouse.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(warehouse.nameArabic);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(warehouse.description)) {
                        await masterHeaderAction.fillDescription(warehouse.description);
                    }

                    await warehousePage.enableSkipNegativeStockCheck();

                });

                await test.step(`Save warehouse: ${warehouse.name}`, async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step(`Validate warehouse created message`, async () => {
                    await toastHelper.assertByText('Warehouse', 'Create');
                });

                createdRecords.push(warehouse.name);

            } catch (error) {
                failedRecords.push(warehouse?.name);
                console.error(`🔴 Failed warehouse creation: ${warehouse?.name}\n`, error);
            } finally {
                await menuAction
                    .navigateBackToListing('Warehouse')
                    .catch(async () => {
                        console.warn('🔴 Navigation failed, reloading page');
                        await page.reload();
                    });
            }
        }

        await test.step('Log create summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Warehouse',
                action: 'Create',
                successRecords: createdRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: warehouseData.create.length
            });
        });


        await test.step('Export create summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Warehouse',
                action: 'Create',
                successRecords: createdRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: warehouseData.create.length
            });
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Failed warehouse creation for: ${failedRecords.join(', ')}`
            );
        }

    });

    test('should update warehouse(s) successfully', async ({ page }) => {

        // ===== Record tracking =====
        const updatedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to warehouse master', async () => {
            await menuAction.clickLeftMenuOption('Setups');
            await setupAction.navigateToMasterByText('Warehouse');
        });

        // ===== Iterate to update =====
        for (const warehouse of warehouseData.update) {

            // ===== Skip invalid data =====
            if (
                !warehouse?.name ||
                !warehouse?.newName ||
                (warehouseData.feature?.allowCodeManual && !warehouse.code)
            ) {
                skippedRecords.push(warehouse?.name ?? 'UNKNOWN');
                console.warn(`⚠️ Update skipped due to missing required data`, warehouse);
                continue;
            }

            // ===== Skip if record does NOT exist =====
            const exists = await listingAction.isRecordExists(warehouse.name, 3);
            if (!exists) {
                skippedRecords.push(warehouse.name);
                console.warn(`⚠️ Skipped: Warehouse does not exist → ${warehouse.name}`);
                continue;
            }

            try {

                await test.step(`Select the record: ${warehouse.name}`, async () => {
                await listingAction.selectRecordByText(warehouse.name);
                });

                await test.step(`Open warehouse in edit mode`, async () => {
                await menuAction.clickListingMenuOptionByTitle('Edit');
                });

                await test.step(`Fill warehouse code: ${warehouse.code} if feature is true`, async () => {
                    if (warehouseData.feature?.allowCodeManual && warehouse.code) {
                        await masterHeaderAction.fillCodeIntoTextBox(warehouse.code);
                    }
                });

                await test.step(`Fill warehouse new name: ${warehouse.newName}`, async () => {
                    await masterHeaderAction.fillName(warehouse.newName);
                });

                await test.step('Fill optional fields (if provided)', async () => {
                    if (ValidationHelper.isNotNullOrWhiteSpace(warehouse.nameArabic)) {
                        await masterHeaderAction.fillNameArabic(warehouse.nameArabic);
                    }

                    if (ValidationHelper.isNotNullOrWhiteSpace(warehouse.description)) {
                        await masterHeaderAction.fillDescription(warehouse.description);
                    }

                });

                await test.step(`Save warehouse: ${warehouse.newName}`, async () => {
                    await menuAction.clickTopMenuOption('Save');
                });

                await test.step(`Validate updated name: ${warehouse.newName}`, async () => {
                    await expect(page.locator("input[name='Warehouse.Name']")).toHaveValue(warehouse.newName);
                });

                updatedRecords.push(`${warehouse.name} → ${warehouse.newName}`);

            } catch (error) {
                failedRecords.push(warehouse?.name);
                console.error(`🔴 Failed warehouse update: ${warehouse?.name} \n`, error);
            } finally {
                await test.step(`Back to listing`, async () => {
                    await menuAction
                        .navigateBackToListing('Warehouse')
                        .catch(async () => {
                            console.warn('🔴 Navigation failed, reloading page');
                            await page.reload();
                        });
                });

                await test.step(`Clear warehouse filter`, async () => {
                    await listingAction.clearFilterDataFromColumnIndex(3);
                });
            }
        }

        await test.step('Log update summary', async () => {
            SummaryHelper.logCrudSummary({
                entityName: 'Warehouse',
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: warehouseData.update.length
            });
        });

        await test.step('Export update summary', async () => {
            SummaryHelper.exportCrudSummary({
                entityName: 'Warehouse',
                action: 'Update',
                successRecords: updatedRecords,
                skippedRecords: skippedRecords,
                failedRecords: failedRecords,
                totalCount: warehouseData.update.length
            });
        });

        if (failedRecords.length > 0) {
            throw new Error(
                `🔴 Warehouse update failed for: ${failedRecords.join(', ')}`
            );
        }
    });

    test('should delete warehouse(s) successfully', async ({ page }) => {

        // ===== Record tracking =====
        const deletedRecords = [];
        const skippedRecords = [];
        const failedRecords = [];

        await test.step('Navigate to warehouse master', async () => {
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
                `🔴 Warehouse delete failed for: ${failedRecords.join(', ')}`
            );
        }
    });

});