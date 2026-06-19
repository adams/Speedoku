import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Speedoku",
    short_name: "Speedoku",
    description:
      "A rogue-like speed-Sudoku — descend as deep as you can before the board becomes unsolvable.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#eef1fb",
    theme_color: "#ff3d77",
    categories: ["games"],
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
