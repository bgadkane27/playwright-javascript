export class PaymentMethodPage {
    constructor(page) {
        this.page = page;
        this.paymentMethod = page.getByRole("link", { name: "Payment Method", exact: true });
        this.type = page.getByLabel("Type");
        this.bankAccount = page.locator("[id*='BankAccountIdLookup_B']");
        this.mainAccount = page.locator("[id*='MainAccountIdLookup_B']");
    }

    async clickOnPaymentMethod() {
        await this.paymentMethod.click();
        await this.page.waitForTimeout(2000);
    }

    async clickOnType() {
        await this.type.click();
        await this.page.waitForTimeout(1000);
    }

    async clickOnBankAccount() {
        await this.bankAccount.click();
    }

    async clickOnMainAccount() {
        await this.mainAccount.click();
    }
}