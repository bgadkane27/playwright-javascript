export class SalesSetupPage {
    constructor(page) {
        this.page = page;

        this.customerLink = page.getByRole("link", { name: "Customer", exact: true }).first();
        this.paymentTermLink = page.getByRole("link", { name: "Payment Term", exact: true });
        this.salesmanLink = page.getByRole("link", { name: "Salesman", exact: true });
        this.priceListLink = page.getByRole("link", { name: "Price List", exact: true }).first();
        this.paymentMethodLink = page.getByRole("link", { name: "Payment Method", exact: true });
    }

    async clickOnCustomer() {
        await this.customerLink.click();
    }

    async clickOnPaymentTerm() {
        await this.paymentTermLink.click();
    }

    async clickOnSalesman() {
        await this.salesmanLink.click();
    }       

    async clickOnPriceList() {
        await this.priceListLink.click();
    }   
    async clickOnPaymentMethod() {
        await this.paymentMethodLink.click();
    }   
}