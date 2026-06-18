import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export const metadata = {
    title: "Nexport ERP - Enterprise Import Management",
    description: "Comprehensive enterprise resource planning system for import management. Track shipments, containers, documents, and financial operations in one unified platform.",
    keywords: [
        "ERP",
        "Import Management",
        "Supply Chain",
        "Customs",
        "Shipment Tracking",
        "Enterprise",
    ],
    authors: [{ name: "Nexport ERP Team" }],
    openGraph: {
        title: "Nexport ERP - Enterprise Import Management",
        description: "Comprehensive ERP system for import management",
        type: "website",
    },
};
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "en", suppressHydrationWarning: true, children: _jsx("body", { className: `${geistSans.variable} ${geistMono.variable} antialiased`, children: _jsxs(ThemeProvider, { attribute: "class", defaultTheme: "system", enableSystem: true, disableTransitionOnChange: true, children: [children, _jsx(Toaster, {})] }) }) }));
}
