import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Nunito } from "next/font/google";

import { getContent } from "@/lib/content";

import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
});

// variant b
const nunito = Nunito({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: getContent("NL").copy.meta.title,
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${atkinson.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
