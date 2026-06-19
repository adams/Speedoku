import type { ReactElement } from "react";

/** Parse the dynamic /icons/[size] segment into a render spec, or null if unknown. */
export function iconSpec(
  param: string,
): { size: number; maskable: boolean } | null {
  switch (param) {
    case "192":
      return { size: 192, maskable: false };
    case "512":
      return { size: 512, maskable: false };
    case "maskable":
      return { size: 512, maskable: true };
    default:
      return null;
  }
}

/** The Speedoku app-icon glyph: a bold mint "S" on a coral field. */
export function IconArt({
  size,
  maskable,
}: {
  size: number;
  maskable: boolean;
}): ReactElement {
  const pad = maskable ? Math.round(size * 0.1) : 0; // maskable safe-zone
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ff3d77",
        padding: pad,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: size * 0.6,
          fontWeight: 800,
          color: "#06ce96",
          lineHeight: 1,
        }}
      >
        S
      </div>
    </div>
  );
}
