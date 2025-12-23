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
    const list = page.locator('div.dx-list-items');
    const items = page.locator('div.dx-item.dx-list-item');

    const maxScrolls = 15;
    for (let scroll = 0; scroll < maxScrolls; scroll++) {
      const count = await items.count();

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const content = item.locator('.dx-item-content');

        if (!(await content.isVisible())) continue;
        const text = (await content.innerText()).trim();
        if (text.includes(optionText)) {
          await content.hover();
          await content.click();
          return;
        }
      }
      // 🔽 Scroll the list container down (virtual scroll trigger)
      await list.evaluate(el => el.scrollBy(0, 300));
      await page.waitForTimeout(300);
    }
    throw new Error(`Lookup value not found: ${optionText}`);
  }

  static async selectListItem(page, optionText) {
    const option = page
      .locator('[role="option"]')
      .filter({ hasText: optionText })
      .first();

    await option.waitFor({ state: 'visible', timeout: 5000 });
    const isSelected = await option.getAttribute('aria-selected');
    if (isSelected === 'true') {
      return;
    }
    // await option.scrollIntoViewIfNeeded();
    await option.click({ force: true });
  }

  static async selectItem(page, optionText) {
    const option = page
      .locator('div.dx-item.dx-list-item')
      .filter({ hasText: optionText })
    // .first();

    await option.scrollIntoViewIfNeeded();
    await option.waitFor({ state: 'visible' });
    await option.click();
  }

}


