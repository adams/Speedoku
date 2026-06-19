// tests/e2e/offline.spec.ts
import { expect, test } from "@playwright/test";

test("plays offline after the service worker is active and the cache is warmed", async ({
  page,
  context,
}) => {
  // 1. First online visit: register + activate the SW (clients.claim makes it control this page).
  await page.goto("/");
  await page.waitForFunction(
    () => navigator.serviceWorker?.controller != null,
    undefined,
    {
      timeout: 15000,
    },
  );

  // 2. Warm the cache: navigate every route + its chunks through the controlling SW.
  await page.goto("/play");
  await page.getByRole("button", { name: /digit 1/i }).waitFor();
  await page.goto("/daily");
  await page.goto("/");

  // 3. Go offline and cold-navigate to /play.
  await context.setOffline(true);
  await page.goto("/play");

  // 4. The shell + board render offline and a run can start.
  await page.getByRole("button", { name: /start run/i }).click();
  await expect(page.getByRole("button", { name: /digit 1/i })).toBeVisible();

  await context.setOffline(false);
});
