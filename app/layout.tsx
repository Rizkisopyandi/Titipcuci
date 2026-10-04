import type { Metadata, Viewport } from "next";

import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/manrope";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TitipCuci — Laundry terasa lebih tenang",
    template: "%s · TitipCuci",
  },
  description:
    "Fondasi TitipCuci untuk pengalaman laundry antar-jemput yang tenang, transparan, dan terjaga.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f6f2e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
