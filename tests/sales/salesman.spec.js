import { test, expect } from '@playwright/test'
import { CommonAction } from '../../utilities/CommonAction';
import { SalesSetupPage } from '../../pages/sales/SalesSetupPage';
import { SalesmanPage } from '../../pages/sales/SalesmanPage';
import LookupHelper from '../../helpers/LookupHelper.js';
import salesmanData from '../../testdata/sales/salesmanData.json';

test.describe.serial('Salesman CRUD Operations', () => {
    let commonAction;
    let salesSetupPage;
    let salesmanPage;

    test.beforeEach(async ({ page }) => {
        commonAction = new CommonAction(page);
        salesSetupPage = new SalesSetupPage(page);
        salesmanPage = new SalesmanPage(page);
        await commonAction.navigateToApp('/');
        await commonAction.selectModule('Sales');
    });

    test('should able to create new salesman', async ({ page }) => {

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnSalesman();

        for (const salesman of salesmanData.create) {
            await commonAction.clickOnListingItem('New');

            if (salesmanData.feature.allowCodeManual && salesman.code) {
                await commonAction.fillCode(salesman.code);
            }

            await commonAction.fillName(salesman.name);
            await commonAction.fillNameArabic(salesman.nameArabic);
            await commonAction.fillDescription(salesman.description);

            if (salesman.other) {
                await salesmanPage.clickOnOtherGird();
                await salesmanPage.clickOnType();
                await LookupHelper.selectLookupBoxItemRow(page, salesman.other.type);
                await salesmanPage.fillSalesCommissionInPercent(salesman.other.salesCommissionInPercent);
                await salesmanPage.fillTitle(salesman.other.title);
                await salesmanPage.fillEmail(salesman.other.email);
                await salesmanPage.fillExtension(salesman.other.extension);
                await salesmanPage.fillMobile(salesman.other.mobile);
            }

            await commonAction.clickOnTopMenuOption('Save');
            await expect(page.getByText('Salesman created successfully')).toBeVisible();

            await salesmanPage.clickOnSalesman();
        }
    });

    test('should able to delete salesman', async ({ page }) => {
        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnSalesman();

        for (const salesman of salesmanData.delete) {
            await commonAction.provideMasterNameOnList(salesman.name);
            await commonAction.selectMasterFromList(salesman.name);

            await commonAction.clickOnMenu();
            await commonAction.clickOnDelete();
            await commonAction.clickOnOk();

            await commonAction.clickOnListingItem('Refresh');
        }
    });
});