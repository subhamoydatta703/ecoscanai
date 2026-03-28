import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "EcoScan AI | Sustainable Code Audits",
  description: "Identify energy-hungry patterns and suggest sustainable 'green' refactoring in seconds.",
};

import { Sidebar } from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <div className="flex h-screen bg-charcoal-950 font-sans text-foreground overflow-hidden">
          <Sidebar />
          <main className="scrollbar-hidden flex-1 overflow-y-auto overflow-x-hidden relative p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
