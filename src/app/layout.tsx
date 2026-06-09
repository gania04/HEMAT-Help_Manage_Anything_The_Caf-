import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { OfflineSyncManager } from "@/components/OfflineSyncManager";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HEMAT - Dashboard & POS",
  description: "Help Manage Anything The Café",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} font-sans h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00875A" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8F9FA] text-gray-900">
        <OfflineSyncManager />
        {children}
      </body>
    </html>
  );
}
