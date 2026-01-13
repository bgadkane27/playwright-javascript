export class DocumentTypePage {
  constructor(page) {
    this.page = page;

    // Locators
    this.expiryNotificationInput = page.getByLabel('Expiry Notification Before Days');
    this.applicableCompaniesSelect = page.locator('[name="DocumentType.CompanyIds"]');
    // If it's a multi-select dropdown, you might also want:
    // this.companyOption = (companyName) => page.getByRole('option', { name: companyName });
  }

  /**
   * Fills the expiry notification days input field
   * @param {string} value - Number of days (as string)
   */
  async fillExpiryNotificationBeforeDays(value) {
    await this.expiryNotificationInput.fill(value);
    // Optional: await this.expiryNotificationInput.press('Tab');
  }

  /**
   * Opens/clicks the applicable companies multi-select field
   */
  async openApplicableCompaniesDropdown() {
    await this.applicableCompaniesSelect.click();
  }

  /**
   * Selects one or multiple companies in the dropdown
   * @param {string|string[]} companyNames 
   */
  async selectCompanies(companyNames) {
    const names = Array.isArray(companyNames) ? companyNames : [companyNames];

    await this.openApplicableCompaniesDropdown();

    for (const name of names) {
      await this.page.getByRole('option', { name }).click();
    }

    // Optional: close dropdown if needed
    // await this.page.keyboard.press('Escape');
  }
}