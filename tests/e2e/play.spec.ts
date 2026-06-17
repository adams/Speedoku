import { expect, test } from "@playwright/test";

test("start a run and place a number", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto("/play");
  await page.getByRole("button", { name: /start run/i }).click();

  // board + pad visible
  await expect(page.getByRole("button", { name: /digit 1/i })).toBeVisible();

  // place the forced 2 into the first tutorial cell: select then commit
  await page.getByRole("button", { name: /digit 2/i }).click();
  await page.getByRole("button", { name: /digit 2/i }).click();

  await expect(page.getByText(/depth/i)).toBeVisible();
  expect(errors).toEqual([]);
});
