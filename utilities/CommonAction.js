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
        await this.page.waitForTimeout(3000);
    }

    async fillField(label, value) {
        const input = this.page.getByRole('textbox', { name: label, exact: true })
        await input.fill(value);
    }

    async fillCode(value) {
        // const input = this.page.getByRole('textbox', { name: 'Code', exact: true })
        // await input.fill(value);
        await this.page.locator('input[id*="Code"]').fill(value);
    }

    async fillName(value) {
        // const input = this.page.getByRole('textbox', { name: 'Name', exact: true })
        // await input.fill(value);
        await this.page.locator('input[id*="Name"]').first().fill(value);
    }

    async fillNameArabic(value) {
        // const input = this.page.getByRole('textbox', { name: 'Name (Arabic)', exact: true })
        // await input.fill(value);
        await this.page.locator('input[id*="NameL2"]').fill(value);
    }

    async fillDescription(value) {
        // const input = this.page.getByRole('textbox', { name: 'Description', exact: true })
        // await input.fill(value);
        await this.page.locator('textarea[id*="Description"]').fill(value);
    }

    async clickOnTopMenuOption(optionName) {
        // await this.page.getByText(optionName, { exact: true }).first().click();
        const optionButton = this.page.locator('div.dxm-hasText', { hasText: optionName }).first();
        await optionButton.waitFor({ state: 'visible' });
        await optionButton.click();
    }

    async provideMasterNameOnList(masterName) {
        await this.page.locator('input[aria-describedby="dx-col-3"]').fill(masterName);
        // ⏳ Small wait for grid refresh (if required)
        await this.page.waitForTimeout(2000);
    }

    async selectMasterFromList(masterName) {
        const row = this.page.getByRole('row').filter({ hasText: masterName });
        await row.focus();
        await row.click({ position: { x: 10, y: 10 } });
        await this.page.waitForTimeout(500);
    }

    async clearMasterNameFilter() {
        // Option 1: Clear the search input
        await this.page.locator('input[aria-describedby="dx-col-3"]').clear();
        await this.page.waitForTimeout(500);
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
        await this.page.locator('.dxm-popOut:has(img[alt="..."])').click();
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

    async clickOnBankAccount() {
        await this.page.locator("[id*='BankAccountIdLookup_B']").click();
    }

    async clickOnCurrency() {
        await this.page.locator("[id*='CurrencyId']").click();
        await this.page.waitForTimeout(500);
    }

    async clickOnSave() {
        // await this.page.getByRole('button', { name: 'Save', exact: true }).click();
        await this.page.locator('span.dx-button-text', { hasText: 'Save' }).click();
        await this.page.waitForTimeout(2000);
    }

    async clickOnCancel() {
        await this.page.getByRole('button', { name: 'Cancel', exact: true }).click();
    }

    async clickOnAdd() {
        await this.page.getByRole('button', { name: 'Add a row' }).click();
    }
}
