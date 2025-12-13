export class LookupHelper {
    constructor(page) {
        this.page = page;
    }

    async selectLookupBoxItemRow(optionText) {
        const rows = this.page.locator("//tr[@class='dxeListBoxItemRow_Office365']");
        const count = await rows.count();

        for (let i = 0; i < count; i++) {
            const element = rows.nth(i);
            const actualValue = (await element.innerText()).trim();

            if (actualValue.includes(optionText)) {
                await element.click();
                await this.page.waitForTimeout(500);
                break;
            }
        }
    }
}