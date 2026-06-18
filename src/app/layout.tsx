import type { Metadata } from "next";
import "./globals.css";
import { OfflineSyncManager } from "@/components/OfflineSyncManager";

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
      className="font-sans h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
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
