import { describe, expect, test } from "vitest";
import manifest from "@/app/manifest";

describe("PWA manifest", () => {
  test("exposes installable standalone fields", () => {
    const m = manifest();
    expect(m.name).toBe("Speedoku");
    expect(m.short_name).toBe("Speedoku");
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.orientation).toBe("portrait");
    expect(m.theme_color).toBe("#ff3d77");
    expect(m.background_color).toBe("#eef1fb");
  });

  test("declares 192, 512, and a maskable icon at the contract URLs", () => {
    const m = manifest();
    const icons = m.icons ?? [];
    expect(icons).toContainEqual(
      expect.objectContaining({
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png",
      }),
    );
    expect(icons).toContainEqual(
      expect.objectContaining({
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
      }),
    );
    expect(icons).toContainEqual(
      expect.objectContaining({ src: "/icons/maskable", purpose: "maskable" }),
    );
  });
});
