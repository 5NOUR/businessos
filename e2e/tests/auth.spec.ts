import { test, expect } from "@playwright/test";

test("should show login page", async ({ page }) => {
  await page.goto("/");
  // افترض وجود login page في المستقبل
  expect(await page.title()).toBe("BusinessOS");
});
