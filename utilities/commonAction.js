export class CommonAction {
    constructor(page) {
        this.page = page;
    }

    /**
       * Navigate to the application
       * @param {string} path - Optional path (default: '/')
       */
    async navigateToApp(path = '/') {
        await this.page.goto(path);
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * To Select Module
     * @param {string} moduleName - Name of the module to select
     */
    async selectModule(moduleName) {
        // Click on Change module button
        await this.page.getByTitle("Change module").click();
        // Select the specific module
        await this.page.getByRole("link", { name: moduleName, exact: true }).click();
    }

    /**
     * To Select left Menu Option
     * @param {string} optionName - select option from left menu
     */
    async clickOnLeftMenuOption(optionName) {
        await this.page.getByTitle(optionName).click();
    }

    /**
     * To Select left Menu Toolbar Option
     * @param {string} optionName - select option from left menu toolbar
     */
    async clickOnLeftMenuToolbarOption(optionName) {
        await this.page.getByTitle(optionName).click();
    }

    /**
     * Click on listing item by title
     * @param {string} itemName - Title of the item to click
     */
    async clickOnListingItem(itemName) {
        await this.page.locator(`li[title="${itemName}"]`).click();
    }

    async fillField(label, value) {
        const input = this.page.getByRole('textbox', { name: label, exact: true })
        await input.fill(value);
    }

    async clickOnTopMenuOption(optionName) {
        await this.page.getByText(optionName, { exact: true }).click();
    }

    async provideMasterNameOnList(masterName) {
        await this.page.locator('input[aria-describedby="dx-col-3"]').fill(masterName);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async selectMasterFromList(masterName) {
        // await this.page.getByText(masterName, { exact: true }).click();
        await this.page.locator('.salesman-column').filter({ hasText: masterName }).click();
    }

    async clickOnMenu(){
        await this.page.locator('img[alt="..."]').click();
        await this.page.waitForTimeout(5000);
    }

    async clickOnDelete(){
        await this.page.getByText('Delete').click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickOnOk(){
        await this.page.getByText('Ok', { exact: true }).click();
    }
}