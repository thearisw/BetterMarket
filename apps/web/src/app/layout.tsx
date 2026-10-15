import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "BetterMarket",
  description: "Every local marketplace, one search.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${atkinson.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh font-sans text-[15px] leading-normal antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-5">{children}</main>
      </body>
    </html>
  );
}
