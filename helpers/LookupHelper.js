export default class LookupHelper {
  static async selectLookupBoxItemRow(page, optionText) {
    const rows = page.locator("tr.dxeListBoxItemRow_Office365");

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const text = (await row.innerText()).trim();

      if (text.includes(optionText)) {
        await row.click();
        await page.waitForTimeout(500);
        return;
      }
    }
    throw new Error(`Lookup value not found: ${optionText}`);
  }

  static async selectLookupText(page, optionText) {
    const rows = page.locator(".lookup-text");

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const text = (await row.innerText()).trim();

      if (text.includes(optionText)) {
        await row.click();
        await page.waitForTimeout(500);
        return;
      }
    }
    throw new Error(`Lookup value not found: ${optionText}`);
  }

}
