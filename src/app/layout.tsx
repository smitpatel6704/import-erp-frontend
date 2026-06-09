import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
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
  title: "ImportERP - Enterprise Import Management",
  description:
    "Comprehensive enterprise resource planning system for import management. Track shipments, containers, customs, logistics, and financial operations in one unified platform.",
  keywords: [
    "ERP",
    "Import Management",
    "Supply Chain",
    "Logistics",
    "Customs",
    "Shipment Tracking",
    "Enterprise",
  ],
  authors: [{ name: "ImportERP Team" }],
  openGraph: {
    title: "ImportERP - Enterprise Import Management",
    description:
      "Comprehensive ERP system for import management and logistics",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
