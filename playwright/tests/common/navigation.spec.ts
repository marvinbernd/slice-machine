import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test.describe("Navigation", () => {
  test.run()(
    "I can navigate through all menu entries",
    async ({
      sliceMachinePage,
      pageTypesTablePage,
      customTypesTablePage,
      slicesListPage,
      changesPage,
      changelogPage,
    }) => {
      await sliceMachinePage.gotoDefaultPage();

      await pageTypesTablePage.menu.pageTypesLink.click();
      await expect(pageTypesTablePage.breadcrumbLabel).toBeVisible();
      expect(await sliceMachinePage.page.title()).toContain(
        "Page types - Slice Machine",
      );

      await customTypesTablePage.menu.customTypesLink.click();
      await expect(customTypesTablePage.breadcrumbLabel).toBeVisible();
      expect(await sliceMachinePage.page.title()).toContain(
        "Custom types - Slice Machine",
      );

      await slicesListPage.menu.slicesLink.click();
      await expect(slicesListPage.breadcrumbLabel).toBeVisible();
      expect(await sliceMachinePage.page.title()).toContain(
        "Slices - Slice Machine",
      );

      await changesPage.menu.changesLink.click();
      await expect(changesPage.breadcrumbLabel).toBeVisible();
      expect(await sliceMachinePage.page.title()).toContain(
        "Changes - Slice Machine",
      );

      await changelogPage.menu.changelogLink.click();
      await expect(changelogPage.breadcrumbLabel).toBeVisible();
      expect(await sliceMachinePage.page.title()).toContain(
        "Changelog - Slice Machine",
      );
    },
  );

  // Unskip when we fix the Changelog fetching problem - DT-1794
  test
    .run()
    .skip(
      "I access the changelog from Slice Machine version",
      async ({ pageTypesTablePage, changelogPage }) => {
        await pageTypesTablePage.goto();
        await expect(pageTypesTablePage.menu.appVersion).toBeVisible();
        await pageTypesTablePage.menu.appVersion.click();

        await expect(changelogPage.breadcrumbLabel).toBeVisible();
      },
    );
});