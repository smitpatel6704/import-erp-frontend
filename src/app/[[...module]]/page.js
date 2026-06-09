"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard, Ship, Box, Building2, FolderOpen, Shield, Truck, Bell, BarChart3, Settings, } from "lucide-react";
import { useERPStore } from "@/lib/store";
import { ERPSidebar } from "@/components/erp/sidebar";
import { ERPHeader } from "@/components/erp/header";
import { CommandPalette } from "@/components/erp/command-palette";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, } from "@/components/ui/tooltip";
// ─── Module Imports ──────────────────────────────────────────────────────
import DashboardModule from "@/components/erp/modules/dashboard";
import ShipmentsModule from "@/components/erp/modules/shipments";
import ContainersModule from "@/components/erp/modules/containers";
import CompaniesModule from "@/components/erp/modules/companies";
import { CustomsModule } from "@/components/erp/modules/customs";
import { LogisticsModule } from "@/components/erp/modules/logistics";
import { NotificationsModule } from "@/components/erp/modules/notifications";
import { ReportsModule } from "@/components/erp/modules/reports";
import { AdminModule } from "@/components/erp/modules/admin";
import { DocumentsModule } from "@/components/erp/modules/documents";
// ─── Placeholder for unbuilt modules ─────────────────────────────────────
function PlaceholderModule({ icon: Icon, title, description, }) {
    return (_jsx("div", { className: "flex flex-col items-center justify-center py-20", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3 }, className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10", children: _jsx(Icon, { className: "h-8 w-8 text-teal" }) }), _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-xl font-semibold", children: title }), _jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-md", children: description })] }), _jsx(Badge, { variant: "secondary", className: "mt-2", children: "Coming Soon" })] }) }));
}
// ─── Module Configuration ────────────────────────────────────────────────
const moduleConfig = {
    dashboard: {
        component: DashboardModule,
        title: "Dashboard",
        description: "Overview of your import operations",
        icon: LayoutDashboard,
    },
    shipments: {
        component: ShipmentsModule,
        title: "Shipments",
        description: "Track and manage all import shipments",
        icon: Ship,
    },
    containers: {
        component: ContainersModule,
        title: "Containers",
        description: "Manage container inventory and tracking",
        icon: Box,
    },
    companies: {
        component: CompaniesModule,
        title: "Companies",
        description: "Manage suppliers and business partners",
        icon: Building2,
    },
    documents: {
        component: DocumentsModule,
        title: "Documents",
        description: "Import document management",
        icon: FolderOpen,
    },
    customs: {
        component: CustomsModule,
        title: "Customs",
        description: "Customs and compliance management",
        icon: Shield,
    },
    logistics: {
        component: LogisticsModule,
        title: "Logistics",
        description: "Logistics and distribution management",
        icon: Truck,
    },
    notifications: {
        component: NotificationsModule,
        title: "Notifications",
        description: "Alerts and notification center",
        icon: Bell,
    },
    reports: {
        component: ReportsModule,
        title: "Reports",
        description: "Analytics and reporting",
        icon: BarChart3,
    },
    admin: {
        component: AdminModule,
        title: "Settings",
        description: "System administration and settings",
        icon: Settings,
    },
};
// ─── Main App Shell ────────────────────────────────────────────────────
function HomeContent() {
    const { activeModule, sidebarOpen, setActiveModule } = useERPStore();
    const params = useParams();
    const router = useRouter();
    useEffect(() => {
        const routeModule = (params === null || params === void 0 ? void 0 : params.module) ? (Array.isArray(params.module) ? params.module[0] : params.module) : "dashboard";
        const moduleParam = routeModule;
        if (moduleParam && moduleConfig[moduleParam] && activeModule !== moduleParam) {
            setActiveModule(moduleParam);
        }
    }, [params, setActiveModule]); // activeModule intentionally omitted to prevent loop, it will check the latest value from store anyway
    const currentModule = moduleConfig[activeModule];
    const CurrentComponent = currentModule.component;
    return (_jsx(TooltipProvider, { delayDuration: 0, children: _jsxs("div", { className: "flex h-screen overflow-hidden bg-background", children: [_jsx(ERPSidebar, {}), _jsxs(motion.main, { initial: false, animate: { marginLeft: sidebarOpen ? 260 : 72 }, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, className: "flex flex-1 flex-col overflow-hidden", children: [_jsx(ERPHeader, {}), _jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar", children: _jsxs("div", { className: "p-4 lg:p-6 max-w-[1600px] mx-auto", children: [_jsx(motion.div, { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 }, className: "mb-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10", children: _jsx(currentModule.icon, { className: "h-5 w-5 text-teal" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight", children: currentModule.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: currentModule.description })] })] }) }, activeModule), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2, ease: "easeOut" }, children: _jsx(CurrentComponent, {}) }, activeModule) })] }) })] }), _jsx(CommandPalette, {})] }) }));
}
export default function HomePage() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "flex h-screen items-center justify-center", children: "Loading..." }), children: _jsx(HomeContent, {}) }));
}
