import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Motora — Premium Car Marketplace Ethiopia",
    template: "%s | Motora",
  },
  description:
    "Find your next car. Explore new and used vehicles from trusted sellers across Ethiopia. Prices in ETB.",
  openGraph: {
    title: "Motora — Premium Car Marketplace Ethiopia",
    description:
      "Explore new and used vehicles from trusted sellers across Ethiopia.",
    locale: "en_ET",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="so" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="flex min-h-screen flex-col font-body">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
