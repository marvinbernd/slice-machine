import { expect, Locator, Page } from "@playwright/test";

import { BuilderPage } from "./shared/BuilderPage";
import { SlicesListPage } from "./SlicesListPage";

export class SliceBuilderPage extends BuilderPage {
  readonly slicesListPage: SlicesListPage;
  readonly savedMessage: Locator;
  readonly staticZone: Locator;
  readonly staticZonePlaceholder: Locator;
  readonly staticZoneListItem: Locator;
  readonly repeatableZone: Locator;
  readonly repeatableZonePlaceholder: Locator;
  readonly repeatableZoneListItem: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    this.slicesListPage = new SlicesListPage(page);

    /**
     * Static locators
     */
    // Global
    this.savedMessage = page.getByText("Slice saved successfully", {
      exact: false,
    });
    // Static zone
    this.staticZone = page.getByTestId("slice-non-repeatable-zone");
    this.staticZonePlaceholder = page.getByText(
      "Add a field to your Static Zone",
      { exact: true },
    );
    this.staticZoneListItem = this.staticZone.getByRole("listitem");
    // Repeatable zone
    this.repeatableZone = page.getByTestId("slice-repeatable-zone");
    this.repeatableZonePlaceholder = page.getByText(
      "Add a field to your Repeatable Zone",
      { exact: true },
    );
    this.repeatableZoneListItem = this.repeatableZone.getByRole("listitem");
  }

  /**
   * Dynamic locators
   */
  override getBreadcrumbLabel(sliceName: string) {
    return this.breadcrumb.getByText(`Slices / ${sliceName}`, { exact: true });
  }

  /**
   * Actions
   */
  async goto(sliceName: string) {
    await this.slicesListPage.goto();
    await this.slicesListPage.page
      .getByText(sliceName, { exact: true })
      .click();
    await expect(this.getBreadcrumbLabel(sliceName)).toBeVisible();
  }

  /**
   * Assertions
   */
  async checkSavedMessage() {
    await expect(this.savedMessage).toBeVisible();
    await expect(this.savedMessage).not.toBeVisible();
  }
}
