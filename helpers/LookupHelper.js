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

  static async selectListItem(page, optionText) {
    const option = page
      .locator('div.dx-item.dx-list-item')
      .filter({ hasText: optionText })
      .first();

    await option.waitFor({ state: 'visible', timeout: 5000 });
    const isSelected = await option.getAttribute('aria-selected');
    if (isSelected === 'true') {
      return;
    }
    await option.scrollIntoViewIfNeeded();
    await option.click();
  }

  static async selectOption(page, optionText) {
    const option = page
      .locator('[role="option"]')
      .filter({ hasText: optionText })
      .first();

    await option.waitFor({ state: 'visible', timeout: 5000 });
    const isSelected = await option.getAttribute('aria-selected');
    if (isSelected === 'true') {
      return;
    }
    await option.scrollIntoViewIfNeeded();
    await option.click();
  }  

  static async selectLookupOption(page, optionText) {

    // Locate the lookup list container
    // const list = page.locator('div.dx-list-items').nth(1);
    const list = page.getByRole("listbox", { name: 'Items' }).nth(0);

    // Locate all lookup list items
    const items = page.locator('div.dx-item.dx-list-item');

    // Maximum number of scroll attempts to load virtual items
    const maxScrolls = 10;

    // Loop through the list multiple times
    for (let scroll = 0; scroll < maxScrolls; scroll++) {

      // Get the count of currently rendered items
      const count = await items.count();

      // Iterate through each visible item
      for (let i = 0; i < count; i++) {

        // Get the individual lookup item
        const item = items.nth(i);

        // Get the text content container inside the item
        const content = item.locator('.dx-item-content');

        // Skip the item if it is not visible
        if (!(await content.isVisible())) continue;

        // Read and trim the displayed text
        const text = (await content.innerText()).trim();

        // Check if the item text matches
        if (text.includes(optionText)) {

          // Ensure the matched item is inside the viewport
          await content.scrollIntoViewIfNeeded();

          // Hover over the item
          await content.hover();

          // Click the matched lookup value
          await content.click();

          // Exit once the option is selected
          return;
        }
      }

      // Scroll the lookup list to load more items
      await list.evaluate(el => el.scrollBy(0, 300));

      // Small wait to allow new items to render
      await page.waitForTimeout(300);
    }

    // Throw error if lookup value is not found after all scroll attempts
    throw new Error(`Lookup value not found: ${optionText}`);
  }

}


