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

  static async selectLookupOption(page, optionText) {
    // Wait until lookup list is visible
    const listItems = page.locator('.dx-list-items .dx-item.dx-list-item');

    await listItems.first().waitFor({ state: 'attached', timeout: 5000 });

    const count = await listItems.count();

    for (let i = 0; i < count; i++) {
        const item = listItems.nth(i);
        const text = (await item.textContent())?.trim();

        if (text && text.includes(optionText)) {
            await item.scrollIntoViewIfNeeded();
            await item.click();
            await page.waitForTimeout(500);
            return;
        }
    }
}


  static async selectListItem(page, optionText) {
    const option = page
      .locator('[role="option"]')
      .filter({ hasText: optionText })
      .first();

    await option.waitFor({ state: 'attached', timeout: 5000 });
    const isSelected = await option.getAttribute('aria-selected');
    if (isSelected === 'true') {
      return;
    }
    // await option.scrollIntoViewIfNeeded();
    await option.click({ force: true });
  }

}
