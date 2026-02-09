import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { NetworkProvider } from "@/context/NetworkContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TxFix — Fix Stuck Bitcoin Transactions",
  description:
    "Free Bitcoin transaction diagnosis. 30-second rescue. No keys required. Paste a TXID, get a diagnosis, fix it in 3 clicks.",
  openGraph: {
    title: "TxFix — Fix Stuck Bitcoin Transactions",
    description:
      "Free Bitcoin transaction diagnosis. 30-second rescue. No keys required.",
    siteName: "TxFix",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Suspense fallback={null}>
          <NetworkProvider>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </NetworkProvider>
        </Suspense>
      </body>
    </html>
  );
}
