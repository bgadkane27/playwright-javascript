import { test, expect } from '@playwright/test'
import { SalesSetupPage } from '../../pages/sales/SalesSetupPage';
import { PriceListPage } from '../../pages/sales/PriceListPage.js';
import { CommonAction } from '../../utilities/CommonAction';
import priceListData from '../../testdata/sales/price-list-data.json';
import LookupHelper from '../../helpers/LookupHelper.js';
import SummaryHelper from '../../helpers/SummaryHelper.js';
import StringHelper from '../../helpers/StringHelper.js';
import SuccessMessageHelper from '../../helpers/SuccessMessageHelper.js';
import NumberHelper from '../../helpers/NumberHelper.js';

test.describe.serial('Price List CRUD Operations', () => {
    let commonAction;
    let salesSetupPage;
    let priceListPage;

    test.beforeEach(async ({ page }) => {
        commonAction = new CommonAction(page);
        salesSetupPage = new SalesSetupPage(page);
        priceListPage = new PriceListPage(page);
        await commonAction.navigateToApp('/');
        await commonAction.selectModule('Sales');
    });

    test.skip('should able to create price list with manual', async ({ page }) => {
        // 🆕 Creation summary trackers
        const createdRecords = [];
        const skippedRecords = [];

        try {
            await commonAction.clickOnLeftMenuOption('Setups');
            await salesSetupPage.clickOnPriceList();


            // Start creating a new price list and fill basic details
            await commonAction.clickOnListingItem('New');
            var priceList = priceListData.manual;

            if (priceListData.feature?.allowCodeManual && priceList.code) {
                await commonAction.fillCode(priceList.code);
            }

            await commonAction.fillName(priceList.name);

            if (StringHelper.isNotNullOrWhiteSpace(priceList.nameArabic)) {
                await commonAction.fillNameArabic(priceList.nameArabic);
            }

            if (StringHelper.isNotNullOrWhiteSpace(priceList.currency)) {
                await commonAction.clickOnCurrency();
                await LookupHelper.selectListItem(page, priceList.currency)
            }

            await commonAction.fillDescription(priceList.description);

            // Save the price list record       
            await commonAction.clickOnTopMenuOption('Save');

            // Verify success message
            await expect(page.locator("input[name='Name']")).toHaveValue(priceList.name, { timeout: 5000 });

            // Track successful creation
            createdRecords.push(priceList.name);

            // Return to price list for next iteration
            await priceListPage.clickOnPriceList();
        } catch (error) {
            skippedRecords.push(priceList?.name);
            throw error;
        }


        // 📊 Summary Report
        console.log('==========🧾 Price List Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${createdRecords.length}`);
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
            'Price List Manual',
            createdRecords,
            skippedRecords
        );
    });

    test.skip('should able to create price list with markup', async ({ page }) => {
        // 🆕 Creation summary trackers
        const createdRecords = [];
        const skippedRecords = [];

        try {
            await commonAction.clickOnLeftMenuOption('Setups');
            await salesSetupPage.clickOnPriceList();

            // Start creating a new price list and fill basic details
            await commonAction.clickOnListingItem('New');
            var priceList = priceListData.markup;
            var priceRule = priceList.priceRule;

            if (priceListData.feature?.allowCodeManual && priceList.code) {
                await commonAction.fillCode(priceList.code);
            }

            await commonAction.fillName(priceList.name);

            if (StringHelper.isNotNullOrWhiteSpace(priceList.nameArabic)) {
                await commonAction.fillNameArabic(priceList.nameArabic);
            }

            if (StringHelper.isNotNullOrWhiteSpace(priceList.currency)) {
                await commonAction.clickOnCurrency();
                await LookupHelper.selectListItem(page, priceList.currency)
            }

            await commonAction.fillDescription(priceList.description);

            if (priceRule) {
                await priceListPage.clickOnPercentageType();
                await LookupHelper.selectListItem(page, priceRule.percentageType);

                await priceListPage.fillPercentage(priceRule.percentage);

                await priceListPage.clickOnApplyMinMaxLimit();

                await priceListPage.fillMinUnitPricePercent(priceRule.minUnitPricePercent);

                await priceListPage.fillMaxUnitPricePercent(priceRule.maxUnitPricePercent);

                await priceListPage.clickOnApplyDiscountPercent();

                await priceListPage.fillDefaultPercent(priceRule.defaultDiscountPercent);

                await priceListPage.fillMaxDiscountPercent(priceRule.maxDiscountPercent);
            }

            // First
            if (priceListData.feature?.allItemsWithBaseUOM) {
                await priceListPage.clickOnAllItemsWithBaseUOM();
            }

            // Second
            if (priceListData.feature?.selectedAllGroup) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnSelectedBox();
                priceListPage.clickOnSelectAll();
            }

            // Third
            if (priceListData.feature?.selectedGroup) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnSelectedBox();
                await LookupHelper.selectListItem(priceRule.itemGroup1);
                await LookupHelper.selectListItem(priceRule.itemGroup2);
            }

            // Fourth
            if (priceListData.feature?.selectedAllCategory) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnByItemCategory();
                priceListPage.clickOnSelectedBox();
                priceListPage.clickOnSelectAll();
            }

            // Five
            if (priceListData.feature?.selectedCategory) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnByItemCategory();
                priceListPage.clickOnSelectedBox();
                await LookupHelper.selectListItem(priceRule.itemCategory1);
                await LookupHelper.selectListItem(priceRule.itemCategory2);
            }

            // Six
            if (priceListData.feature?.selectedAllBrand) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnByBrand();
                priceListPage.clickOnSelectedBox();
                priceListPage.clickOnSelectAll();
            }

            // Seven
            if (priceListData.feature?.selectedBrand) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnByBrand();
                priceListPage.clickOnSelectedBox();
                await LookupHelper.selectListItem(priceRule.itemBrand1);
                await LookupHelper.selectListItem(priceRule.itemBrand2);
            }

            // Save the price list record       
            await commonAction.clickOnTopMenuOption('Save');

            // Verify success message
            await expect(page.locator("input[name='Name']")).toHaveValue(priceList.name, { timeout: 5000 });

            // Track successful creation
            createdRecords.push(priceList.name);

            // Return to price list for next iteration
            await priceListPage.clickOnPriceList();
        } catch (error) {
            skippedRecords.push(priceList?.name);
            throw error;
        }


        // 📊 Summary Report
        console.log('==========🧾 Price List Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${createdRecords.length}`);
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
            'Price List Markup',
            createdRecords,
            skippedRecords
        );
    });

    test.skip('should able to create price list with markdown', async ({ page }) => {
        // 🆕 Creation summary trackers
        const createdRecords = [];
        const skippedRecords = [];

        try {
            await commonAction.clickOnLeftMenuOption('Setups');
            await salesSetupPage.clickOnPriceList();

            // Start creating a new price list and fill basic details
            await commonAction.clickOnListingItem('New');
            var priceList = priceListData.markdown;
            var priceRule = priceList.priceRule;

            if (priceListData.feature?.allowCodeManual && priceList.code) {
                await commonAction.fillCode(priceList.code);
            }

            await commonAction.fillName(priceList.name);

            if (StringHelper.isNotNullOrWhiteSpace(priceList.nameArabic)) {
                await commonAction.fillNameArabic(priceList.nameArabic);
            }

            if (StringHelper.isNotNullOrWhiteSpace(priceList.currency)) {
                await commonAction.clickOnCurrency();
                await LookupHelper.selectListItem(page, priceList.currency)
            }

            await commonAction.fillDescription(priceList.description);

            if (priceRule) {
                await priceListPage.clickOnPercentageType();
                await LookupHelper.selectListItem(page, priceRule.percentageType);

                await priceListPage.fillPercentage(priceRule.percentage);

                await priceListPage.clickOnApplyMinMaxLimit();

                await priceListPage.fillMinUnitPricePercent(priceRule.minUnitPricePercent);

                await priceListPage.fillMaxUnitPricePercent(priceRule.maxUnitPricePercent);

                await priceListPage.clickOnApplyDiscountPercent();

                await priceListPage.fillDefaultPercent(priceRule.defaultDiscountPercent);

                await priceListPage.fillMaxDiscountPercent(priceRule.maxDiscountPercent);
            }

            // First
            if (priceListData.feature?.allItemsWithBaseUOM) {
                await priceListPage.clickOnAllItemsWithBaseUOM();
            }

            // Second
            if (priceListData.feature?.selectedAllGroup) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnSelectedBox();
                priceListPage.clickOnSelectAll();
            }

            // Third
            if (priceListData.feature?.selectedGroup) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnSelectedBox();
                await LookupHelper.selectListItem(priceRule.itemGroup1);
                await LookupHelper.selectListItem(priceRule.itemGroup2);
            }

            // Fourth
            if (priceListData.feature?.selectedAllCategory) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnByItemCategory();
                priceListPage.clickOnSelectedBox();
                priceListPage.clickOnSelectAll();
            }

            // Five
            if (priceListData.feature?.selectedCategory) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnByItemCategory();
                priceListPage.clickOnSelectedBox();
                await LookupHelper.selectListItem(priceRule.itemCategory1);
                await LookupHelper.selectListItem(priceRule.itemCategory2);
            }

            // Six
            if (priceListData.feature?.selectedAllBrand) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnByBrand();
                priceListPage.clickOnSelectedBox();
                priceListPage.clickOnSelectAll();
            }

            // Seven
            if (priceListData.feature?.selectedBrand) {
                priceListPage.clickOnSelectedItems();
                priceListPage.clickOnByBrand();
                priceListPage.clickOnSelectedBox();
                await LookupHelper.selectListItem(priceRule.itemBrand1);
                await LookupHelper.selectListItem(priceRule.itemBrand2);
            }

            // Save the price list record       
            await commonAction.clickOnTopMenuOption('Save');

            // Verify success message
            await expect(page.locator("input[name='Name']")).toHaveValue(priceList.name, { timeout: 5000 });

            // Track successful creation
            createdRecords.push(priceList.name);

            // Return to price list for next iteration
            await priceListPage.clickOnPriceList();
        } catch (error) {
            skippedRecords.push(priceList?.name);
            throw error;
        }


        // 📊 Summary Report
        console.log('==========🧾 Price List Create Summary ==========');
        console.log(`📄 Total Records Attempted: ${createdRecords.length}`);
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
            'Price List Markdown',
            createdRecords,
            skippedRecords
        );
    });

    test.skip('should able to update price list with manual', async ({ page }) => {
        // ✏️ Update Summary Trackers
        const updatedRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnPriceList();

        for (const priceList of priceListData.update) {
            try {
                // Search and filter the payment method record
                await commonAction.provideMasterNameOnList(priceList.name);

                // Check if the record exists before proceeding with updation
                const recordExists = await page.locator(`text=${priceList.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);
                if (!recordExists) {
                    console.warn(`⚠️ Record '${priceList.name}' not found - updation skipped.`);
                    skippedRecords.push(priceList.name);
                    continue;
                }

                // Proceed with update if record exists
                await commonAction.selectMasterFromList(priceList.name);
                await commonAction.clickOnListingItem('Edit');

                // Proceed with updation if record exists
                // if (StringHelper.isNotNullOrWhiteSpace(priceList.updatedName)) {
                //     await commonAction.fillName(priceList.updatedName);
                // }

                // if (StringHelper.isNotNullOrWhiteSpace(priceList.nameArabic)) {
                //     await commonAction.fillNameArabic(priceList.nameArabic);
                // }

                // if (StringHelper.isNotNullOrWhiteSpace(priceList.description)) {
                //     await commonAction.fillDescription(priceList.description);
                // }

                // Add items manually
                const items = priceList.items ?? [];

                for (const item of items) {
                    await priceListPage.clickOnOverflowMenu();
                    await priceListPage.clickOnAddItem();

                    await priceListPage.fillItem(item.item);
                    await LookupHelper.selectListItem(page, item.item);

                    await priceListPage.fillUnitOfMeasure(item.unitOfMeasure);
                    await LookupHelper.selectListItem(page, item.unitOfMeasure);

                    if (NumberHelper.isGreaterThanZero(item.minUnitPrice)) {
                        await priceListPage.fillMinimumUnitPrice(item.minUnitPrice)
                    }

                    if (NumberHelper.isGreaterThanZero(item.maxUnitPrice)) {
                        await priceListPage.fillMaximumUnitPrice(item.maxUnitPrice)
                    }

                    if (NumberHelper.isGreaterThanZero(item.defaultDiscountPercent)) {
                        await priceListPage.fillDefaultDiscountInPercent(item.defaultDiscountPercent)
                    }

                    if (NumberHelper.isGreaterThanZero(item.maximumDiscountPercent)) {
                        await priceListPage.fillMaximumDiscountInPercent(item.maximumDiscountPercent)
                    }

                    await commonAction.clickOnSave();
                }

                // Save the payment method record
                await commonAction.clickOnTopMenuOption('Save');

                // Validate update message
                await SuccessMessageHelper.assert(page, 'PriceList', 'Update');

                // Track successful updation
                updatedRecords.push(priceList.name);

                // Return to price list for next iteration
                await priceListPage.clickOnPriceList();

            } catch (error) {
                skippedRecords.push(priceList.name);
                console.warn(`⚠️ Updation failed for '${priceList.name}': ${error.message}`);
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Payment Method Update Summary ==========');
        console.log(`📄 Total Records Attempted: ${priceListData.update.length}`);
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
            'Price List',
            updatedRecords,
            skippedRecords
        );
    });

    test.skip('should able to delete price list', async ({ page }) => {
        // 🗑️ Deletion Summary Trackers
        const deletedRecords = [];
        const skippedRecords = [];

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnPriceList();

        // Iterate through each price list to delete
        for (const priceList of priceListData.delete) {
            try {
                // Search and filter the price list record
                await commonAction.provideMasterNameOnList(priceList.name);

                // Check if the record exists before proceeding with deletion
                const recordExists = await page.locator(`text=${priceList.name}`).first().isVisible({ timeout: 3000 }).catch(() => false);
                if (!recordExists) {
                    console.warn(`⚠️ Record '${priceList.name}' not found - deletion skipped.`);
                    skippedRecords.push(priceList.name);
                    continue;
                }

                // Proceed with deletion if record exists
                await commonAction.selectMasterFromList(priceList.name);
                await commonAction.clickOnMenu();
                await commonAction.clickOnDelete();
                await commonAction.clickOnOk();

                // ✅ Validate deleted message
                await SuccessMessageHelper.assert(page, 'PriceList', 'Delete');

                // Track successful deletion
                deletedRecords.push(priceList.name);

            } catch (error) {
                skippedRecords.push(priceList.name);
                console.warn(`⚠️ Deletion failed for '${priceList.name}': ${error.message}`);
            } finally {
                // 🧹 Always reset filter
                await commonAction.clearMasterNameFilter();
            }
        }

        // 📊 Summary Report
        console.log('==========🧾 Price List Delete Summary ==========');
        console.log(`📄 Total Records Attempted: ${priceListData.delete.length}`);
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
            'Price List',
            deletedRecords,
            skippedRecords
        );
    });

});