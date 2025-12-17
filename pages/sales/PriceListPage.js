export class PriceListPage {
  constructor(page) {
    this.page = page;
    // Price List link locator
    this.priceList = page.getByRole("link", { name: "Price List", exact: true }).first();
    // Price Rule tab locators
    this.percentageType = page.locator("input[id*='PercentageType']");
    this.percentage = page.locator("input[id*='Percentage']").nth(1);
    this.applyMinMaxLimit = page.getByText("Apply minimum and maximum limit");
    this.minUnitPricePercent = page.locator("input[id*='PriceRuleMinimumUnitPrice']");
    this.maxUnitPricePercent = page.locator("input[id*='PriceRuleMaximumUnitPrice']");
    this.applyDiscountPercent = page.getByText("Apply discount percent");
    this.defaultPercent= page.locator("input[id*='PriceRuleDefaultDiscountInPercent']");
    this.maxDiscountPercent = page.locator("input[id*='PriceRuleMaximumDiscountInPercent']");
    this.allItemsWithBaseUOM = page.getByText("All Items With Base UOM");
    this.selectedItems = page.getByText("Selected Items");
    this.selectedBox = page.locator("input[id*='SelectedItemIds']");
    // this.selectedBox = page.locator("div.dx-texteditor-input-container.dx-tag-container");
    this.byItemCategory = page.getByText("By Item Category");
    this.byBrand = page.getByText("By Brand");
    this.selectAll = page.getByText("Select All");
    // Items tab locators
    this.addItem = page.getByRole('button', { name: 'Add Item', exact: true });
    this.item = page.locator("input[id*='ItemId']");
    this.unitOfMeasure = page.locator("input[id*='UnitOfMeasureId']");
    this.unitPrice = page.locator("input[id*='UnitPrice']");
    this.minimumUnitPrice = page.locator("input[id*='MinimumUnitPrice']");
    this.maximumUnitPrice = page.locator("input[id*='MaximumUnitPrice']");
    this.defaultDiscountInPercent = page.locator("input[id*='DefaultDiscountInPercent']");
    this.maximumDiscountInPercent = page.locator("input[id*='MaximumDiscountInPercent']");
    this.default = page.locator("div[id*='Default']");
  }

    // Click on Price List link
    async clickOnPriceList() {  
        await this.priceList.click();
        await this.page.waitForLoadState('networkidle');
    }

    // Click on Percentage Type radio button
    async clickOnPercentageType() {
        await this.percentageType.click();
    }

    // Enter Percentage value
    async fillPercentage(value) {
        await this.percentage.fill(String(value));
    }

    // Click on Apply Minimum and Maximum limit checkbox
    async clickOnApplyMinMaxLimit() {
        await this.applyMinMaxLimit.click();
    }

    // Enter Minimum Unit Price value
    async fillMinUnitPricePercent(value) {
        await this.minUnitPricePercent.fill(String(value));
    }

    // Enter Maximum Unit Price value
    async fillMaxUnitPricePercent(value) {
        await this.maxUnitPricePercent.fill(String(value));
    }

    // Click on Apply Discount Percent checkbox
    async clickOnApplyDiscountPercent() {
        await this.applyDiscountPercent.click();
    }   

    // Enter Default Percent value
    async fillDefaultPercent(value) {
        await this.defaultPercent.fill(String(value));
    }   

    // Enter Maximum Discount Percent value
    async fillMaxDiscountPercent(value) {
        await this.maxDiscountPercent.fill(String(value));
    }

    // Click on All Items With Base UOM option
    async clickOnAllItemsWithBaseUOM() {
        await this.allItemsWithBaseUOM.click();
    }

    // Click on Selected Items option
    async clickOnSelectedItems() {
        await this.selectedItems.click();
        await this.page.waitForTimeout(1000);
    }

    // Click on Selected checkbox
    async clickOnSelectedBox() {
        await this.selectedBox.click();
        await this.page.waitForTimeout(1000);
    }   

    // Click on By Item Category option
    async clickOnByItemCategory() {
        await this.byItemCategory.click();
    }

    // Click on By Brand option
    async clickOnByBrand() {
        await this.byBrand.click();
        await this.page.waitForTimeout(1000);
    }

    // Click on Select All option
    async clickOnSelectAll() {
        await this.selectAll.click();
        await this.page.waitForTimeout(1000);
    }

    // Click on Add Item button
    async clickOnAddItem() {
        await this.addItem.click();
    }

    // Click on Item value
    async fillItem(value) {
        await this.item.fill(value);
    }

    // Enter Unit Of Measure value
    async fillUnitOfMeasure(value) {
        await this.unitOfMeasure.fill(value);
    }

    // Enter Unit Price value
    async fillUnitPrice(value) {
        await this.unitPrice.fill(value);
    }

    // Enter Minimum Unit Price value in Items tab
    async fillMinimumUnitPrice(value) {
        await this.minimumUnitPrice.fill(value);
    }

    // Enter Maximum Unit Price value in Items tab
    async fillMaximumUnitPrice(value) {
        await this.maximumUnitPrice.fill(value);
    }

    // Enter Default Discount In Percent value in Items tab
    async fillDefaultDiscountInPercent(value) {
        await this.defaultDiscountInPercent.fill(value);
    }

    // Enter Maximum Discount In Percent value in Items tab
    async fillMaximumDiscountInPercent(value) {
        await this.maximumDiscountInPercent.fill(value);
    }

    // Click on Default tab
    async clickOnDefault() {
        await this.default.click();
    }
}