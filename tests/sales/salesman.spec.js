import { test, expect } from '@playwright/test'
import { CommonAction } from '../../utilities/commonAction';
import { SalesSetupPage } from '../../pages/sales/salessetupPage';
import { SalesmanPage } from '../../pages/sales/salesmanPage';
import { LookupHelper } from '../../helpers/lookupHelpers';
import salesmanData from '../../testdata/sales/salesman.json';

test.describe.serial('Salesman CRUD Operations', () => {
    let commonAction;
    let salesSetupPage;
    let salesmanPage;
    let lookupHelper;

    test.beforeEach(async ({ page }) => {
        commonAction = new CommonAction(page);
        salesSetupPage = new SalesSetupPage(page);
        salesmanPage = new SalesmanPage(page);
        lookupHelper = new LookupHelper(page);
        await commonAction.navigateToApp('/');
        await commonAction.selectModule('Sales');
    });

    test('create salesman', async ({ page }) => {

        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnSalesman();

        for (const salesman of salesmanData.Info) {
            await commonAction.clickOnListingItem('New');

            if (salesmanData.Feature.AllowCodeManual && salesman.Code) {
                await commonAction.fillField('Code', salesman.Code);
            }

            await commonAction.fillField('Name', salesman.Name);
            await commonAction.fillField('Name (Arabic)', salesman.NameArabic);
            await commonAction.fillField('Description', salesman.Description);

            if (salesman.Other) {
                await salesmanPage.clickOnOtherGird();
                await salesmanPage.clickOnType();
                await lookupHelper.selectLookupBoxItemRow(salesman.Other.Type);
                await salesmanPage.fillSalesCommissionInPercent(salesman.Other.SalesCommissionInPercent);
                await salesmanPage.fillTitle(salesman.Other.Title);
                await salesmanPage.fillEmail(salesman.Other.Email);
                await salesmanPage.fillExtension(salesman.Other.Extension);
                await salesmanPage.fillMobile(salesman.Other.Mobile);
            }

            await commonAction.clickOnTopMenuOption('Save');
            await expect(page.getByText('Salesman created successfully')).toBeVisible();

            await salesmanPage.clickOnSalesman();
        }
    });

    test('delete salesman', async ({ page }) => {
        await commonAction.clickOnLeftMenuOption('Setups');
        await salesSetupPage.clickOnSalesman();

        for (const salesman of salesmanData.Delete) {
            await commonAction.provideMasterNameOnList(salesman.Name);
            await commonAction.selectMasterFromList(salesman.Name);

            await commonAction.clickOnMenu();
            await commonAction.clickOnDelete();
            await commonAction.clickOnOk();

            await commonAction.clickOnListingItem('Refresh');
        }
    });
});