import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speedoku",
  description:
    "A rogue-like speed-Sudoku — descend as deep as you can before the board becomes unsolvable.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Speedoku" },
};

export const viewport: Viewport = {
  themeColor: "#ff3d77",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
