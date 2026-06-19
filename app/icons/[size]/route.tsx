import { ImageResponse } from "next/og";
import { IconArt, iconSpec } from "@/lib/pwa/icon-art";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }, { size: "maskable" }];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  const spec = iconSpec(size);
  if (!spec) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    <IconArt size={spec.size} maskable={spec.maskable} />,
    {
      width: spec.size,
      height: spec.size,
    },
  );
}
