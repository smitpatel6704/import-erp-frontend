import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeRuntime } from "@/components/erp/theme-runtime";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// Freight Terminal type system:
// Space Grotesk — display / headings (mechanical, technical character)
// Inter — body / UI text
// IBM Plex Mono — figures, codes, manifest references
const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Nexport ERP — Import Operations Terminal",
  description:
    "Import operations terminal for tracking shipments, containers, documents, and customs in one live control surface.",
  keywords: [
    "ERP",
    "Import Management",
    "Supply Chain",
    "Customs",
    "Shipment Tracking",
    "Enterprise",
  ],
  authors: [{ name: "Nexport ERP Team" }],
  icons: {
    icon: "/NS%20(Nextron%20solution).png",
    shortcut: "/NS%20(Nextron%20solution).png",
    apple: "/NS%20(Nextron%20solution).png",
  },
  openGraph: {
    title: "Nexport ERP — Enterprise Import Management",
    description: "Comprehensive ERP system for import management",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <ThemeRuntime />
          <div className="blueprint-grid" aria-hidden="true" />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
