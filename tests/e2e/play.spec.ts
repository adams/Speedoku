import { expect, test } from "@playwright/test";

test("start a run and place a number", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  // Uncaught runtime errors (e.g. React hydration mismatches) surface here, not
  // as console.error — guard them so a hydration regression fails the smoke.
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));

  await page.goto("/play");
  await page.getByRole("button", { name: /start run/i }).click();

  // board + pad visible
  await expect(page.getByRole("button", { name: /digit 1/i })).toBeVisible();

  // select a digit via the pad, then place it with Submit
  await page.getByRole("button", { name: /digit 2/i }).click();
  await page.getByRole("button", { name: /^submit$/i }).click();

  await expect(page.getByText(/depth/i)).toBeVisible();
  expect(errors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
