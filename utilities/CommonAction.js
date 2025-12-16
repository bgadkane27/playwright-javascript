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
        await this.page.waitForTimeout(2000);
    }

    async fillField(label, value) {
        const input = this.page.getByRole('textbox', { name: label, exact: true })
        await input.fill(value);
    }

    async fillCode(value) {
        const input = this.page.getByRole('textbox', { name: 'Code', exact: true })
        await input.fill(value);
    }

    async fillName(value) {
        const input = this.page.getByRole('textbox', { name: 'Name', exact: true })
        await input.fill(value);
    }

    async fillNameArabic(value) {
        const input = this.page.getByRole('textbox', { name: 'Name (Arabic)', exact: true })
        await input.fill(value);
    }

    async fillDescription(value) {
        const input = this.page.getByRole('textbox', { name: 'Description', exact: true })
        await input.fill(value);
    }

    async clickOnTopMenuOption(optionName) {
        await this.page.getByText(optionName, { exact: true }).click();
    }
    
    async provideMasterNameOnList(masterName) {
        await this.page.locator('input[aria-describedby="dx-col-3"]').fill(masterName);
        // ⏳ Small wait for grid refresh (if required)
        await this.page.waitForTimeout(1000);
    }

    async selectMasterFromList(masterName) {
        // await this.page.getByText(masterName, { exact: true }).click();
        await this.page.locator('.salesman-column').filter({ hasText: masterName }).click();
        await this.page.waitForTimeout(500);
    }

    async clearMasterNameFilter() {
    // Option 1: Clear the search input
    await this.page.locator('input[aria-describedby="dx-col-3"]').clear(); 
}

    /**
 * Select grid row by any identifying text
 * @param {string} identifier - Any text in the row to identify it
 */
    async selectGridRow(identifier) {
        const row = this.page.getByRole('row').filter({ hasText: identifier });
        await row.hover();
        await row.click();
    }

    async clickOnMenu() {
        await this.page.locator('img[alt="..."]').click();
        await this.page.waitForTimeout(500);
    }

    async clickOnDelete() {
        await this.page.getByText('Delete', { exact: true }).click();
        await this.page.waitForTimeout(500);
    }

    async clickOnOk() {
        await this.page.getByText('Ok', { exact: true }).click();
        await this.page.waitForTimeout(500);
    }
}
