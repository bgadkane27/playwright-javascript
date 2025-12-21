export class CustomerPage {
    constructor(page) {
        this.page = page;

        //Tax Details
        this.country = page.locator("input[id*='CountryId']");
        this.state = page.locator("input[id*='CountryStateId']");
        this.taxTreatment = page.locator("input[id*='TaxTreatment']");
        this.taxRegistrationNumber = page.locator("input[id*='TaxRegistrationNumber']");
        this.back = page.locator('#pre-Button');
        this.cancel = page.locator('.dx-clear-button-area');

        //Tabs
        this.keyInfoTab = page.getByRole('tab', { name: 'Key Info' });
        this.addressTab = page.getByRole('tab', { name: 'Address' });
        this.contactPersonTab = page.getByRole('tab', { name: 'Contact Person' });
        this.documentsTab = page.getByRole('tab', { name: 'Documents' });

        //Key Info
        this.group = page.locator("input[id*='CustomerGroupId']");
        this.keyInfoEmail = page.locator("input[id*='Email']");
        this.keyInfoMobile = page.locator("input[id='phone']");
        this.telephone = page.locator("input[id*='TelNumber']");
        this.receivableMainAccount = page.locator("input[id*='ReceivableMainAccountId']");
        this.restrictPaymentTerm = page.locator('#CustomRestrictPaymentTermCheck');
        this.restrictPriceList = page.locator('#CustomRestrictPriceListCheck');
        this.saveKeyInfo = page.locator('#InfoSave');

        // Credit Control
        this.enableCreditControl = page.locator('#EnableCreditControl');
        this.creditLimitAmount = page.getByLabel(/Credit Limit Amount/i);
        this.creditLimitDays = page.getByLabel(/Credit Limit Days/i);
        this.creditRating = page.locator("input[id*='CreditRating']");
        this.creditCheckMode = page.locator("input[id*='CreditCheckMode']");

        // Defaults
        this.setDefaults = page.locator('#EnableDefaults');
        this.salesman = page.getByLabel(/Salesman/i);
        this.paymentTerm = page.getByLabel(/Payment Term/i);
        this.priceList = page.getByLabel(/Price List/i);
        this.shippingTerm = page.getByLabel(/Shipping Term/i);
        this.loadingPort = page.getByLabel(/Loading Port/i);
        this.destinationPort = page.getByLabel(/Destination Port/i);
        this.shippingMethod = page.getByLabel(/Shipping Method/i);
        this.shipmentPriority = page.getByLabel(/Shipment Priority/i);

        //Address
        this.billingAddress1 = page.locator("input[id*='BillingAddress1']");
        this.billingAddress2 = page.locator("input[id*='BillingAddress2']");
        this.billingCountry = page.locator("input[id*='BillingCountry']");
        this.billingState = page.locator("input[id*='BillingState']");
        this.billingCity = page.locator("input[id*='BillingCity']");
        this.billingZipCode = page.locator("input[id*='BillingZipCode']");
        this.billingContactPerson = page.locator("input[id*='BillingContactPerson']");
        this.sameAsBillingAddress = page.getByRole('checkbox', {name: /Billing Address Same As Shipping Address/i});
        this.shippingAddress1 = page.locator("input[id*='ShippingAddress1']");
        this.shippingAddress2 = page.locator("input[id*='ShippingAddress2']");
        this.shippingCountry = page.locator("input[id*='ShippingCountry']");
        this.shippingState = page.locator("input[id*='ShippingState']");
        this.shippingCity = page.locator("input[id*='ShippingCity']");
        this.shippingZipCode = page.locator("input[id*='ShippingZipCode']");
        this.shippingContactPerson = page.locator("input[id*='ShippingContactPerson']");
        this.saveAddress = page.locator('#InfoSaveAddress');
        
        //Contact Person
        this.addRow = page.getByRole('button', { name: 'Add a row' });
        this.prefix = page.getByLabel(/Prefix/i);
        this.firstName = page.getByLabel(/First Name/i);
        this.lastName = page.getByLabel(/Last Name/i);
        this.jobTitle = page.getByLabel(/Job Title/i);
        this.gender = page.getByLabel(/Gender/i);
        this.contactMobile = page.getByLabel(/Mobile/i);
        this.telephoneNumber = page.getByLabel(/Telephone/i);
        this.contactEmail = page.getByLabel(/Email/i);
        this.isDefault = page.locator('[id*="Default"]');
        this.portalAccess = page.locator('[id*="PortalAccess"]');
        this.freezed = page.locator('[id*="Freezed"]');
    }

    async clickOnCountry(){
        await this.country.click();
    }

    async clickOnState(){
        await this.state.click();
    }

    async clickOnTaxTreatment(){
        await this.taxTreatment.click();
    }

    async fillTaxRegistrationNumber(value){
        await this.taxRegistrationNumber.fill(value);
    }

    async clickOnBack(){
        await this.back.click();
    }

    async clickOnCancel(){
        await this.cancel.click();
    }

    async clickOnKeyInfoTab(){
        await this.keyInfoTab.click();
    }

    async clickOnAddressTab(){
        await this.addressTab.click();
    }

    async clickOnContactPersonTab(){
        await this.contactPersonTab.click();
    }

    async clickOnDocumentsTab(){
        await this.documentsTab.click();
    }
}