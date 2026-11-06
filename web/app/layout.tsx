import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";

import { getContent } from "@/lib/content";

import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: getContent("NL").copy.meta.title,
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={atkinson.variable}>
      <body>{children}</body>
    </html>
  );
}
