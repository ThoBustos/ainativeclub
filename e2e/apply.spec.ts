import { test, expect } from "@playwright/test";

test.describe("Apply wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:4015/apply");
  });

  test("shows validation error on empty step 0", async ({ page }) => {
    await page.click("button:has-text('Continue')");
    await expect(page.locator(".text-destructive")).toBeVisible();
  });

  test("keyboard navigation: Enter advances step", async ({ page }) => {
    await page.fill("textarea", "AI-native CRM");
    await page.keyboard.press("Enter");
    await expect(page.locator("input[placeholder='First name']")).toBeVisible();
  });

  test("Back button goes to previous step", async ({ page }) => {
    await page.fill("textarea", "AI-native CRM");
    await page.click("button:has-text('Continue')");
    await page.click("button:has-text('← Back')");
    await expect(page.locator("textarea")).toBeVisible();
  });
});
