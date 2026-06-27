"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard, Ship, Box, Building2, FolderOpen, Bell, BarChart3, Settings, } from "lucide-react";
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
import { NotificationsModule } from "@/components/erp/modules/notifications";
import { ReportsModule } from "@/components/erp/modules/reports";
import { AdminModule } from "@/components/erp/modules/admin";
import { DocumentsModule } from "@/components/erp/modules/documents";
import { AuthGate } from "@/components/erp/auth-gate";
import { LoginPage, SetupPasswordPage } from "@/components/erp/auth-pages";
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
        description: "Manage exporter companies and export partners",
        icon: Building2,
    },
    documents: {
        component: DocumentsModule,
        title: "Documents",
        description: "Import document management",
        icon: FolderOpen,
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
function PermissionBoundary({ module, children }) {
    const canEdit = useERPStore((state) => state.canEdit(module));
    const canAction = useERPStore((state) => state.canAction);
    const actionFromLabel = (label, submitType = false) => /\b(delete|remove)\b/i.test(label)
        ? "delete"
        : /\b(upload)\b/i.test(label)
            ? "upload"
            : /\b(import)\b/i.test(label)
                ? "import"
                : /\b(export|download|print)\b/i.test(label)
                    ? "export"
                    : /\b(verify|reject)\b/i.test(label)
                        ? "verify"
                        : /\b(edit|save|update|send|mark|toggle)\b/i.test(label)
                        ? "update"
                        : submitType || /\b(add|new|create)\b/i.test(label)
                            ? "create"
                            : null;
    const blockWriteAction = (event) => {
        const button = event.target.closest("button");
        if (!button)
            return;
        const label = `${button.textContent || ""} ${button.title || ""} ${button.getAttribute("aria-label") || ""}`;
        const action = actionFromLabel(label, button.type === "submit");
        if (action && !canAction(module, action)) {
            event.preventDefault();
            event.stopPropagation();
            window.alert(`You do not have ${action} permission for this module.`);
        }
    };
    return (_jsxs("div", { onClickCapture: blockWriteAction, onSubmitCapture: (event) => {
            const submitter = event.nativeEvent?.submitter;
            const label = submitter ? `${submitter.textContent || ""} ${submitter.title || ""} ${submitter.getAttribute?.("aria-label") || ""}` : "";
            const action = actionFromLabel(label, true);
            if (!canEdit || !canAction(module, action)) {
                event.preventDefault();
                event.stopPropagation();
                window.alert(`You do not have ${action} permission for this module.`);
            }
        }, children: [!canEdit && (_jsx("div", { className: "mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300", children: "View-only access: you can review this module but cannot create, edit, or delete records." })), children] }));
}
// ─── Main App Shell ────────────────────────────────────────────────────
function HomeContent() {
    const { activeModule, sidebarOpen, setActiveModule, token, canView, user } = useERPStore();
    const params = useParams();
    const router = useRouter();
    const routeModule = (params === null || params === void 0 ? void 0 : params.module) ? (Array.isArray(params.module) ? params.module[0] : params.module) : "dashboard";
    useEffect(() => {
        const moduleParam = routeModule;
        if (moduleParam && moduleConfig[moduleParam] && activeModule !== moduleParam) {
            setActiveModule(moduleParam);
        }
    }, [routeModule, setActiveModule]);
    useEffect(() => {
        if (!token || !user || routeModule === "login" || routeModule === "setup-password")
            return;
        if (!moduleConfig[routeModule] || !canView(routeModule)) {
            const firstAllowed = Object.keys(moduleConfig).find((module) => canView(module));
            router.replace(firstAllowed ? `/${firstAllowed}` : "/login");
        }
    }, [token, user, routeModule, canView, router]);
    if (routeModule === "login")
        return _jsx(LoginPage, {});
    if (routeModule === "setup-password")
        return _jsx(SetupPasswordPage, {});
    if (!token || !user || !canView(routeModule))
        return _jsx("div", { className: "flex h-screen items-center justify-center text-sm text-muted-foreground", children: "Checking access..." });
    const currentModule = moduleConfig[activeModule];
    const CurrentComponent = currentModule.component;
    return (_jsx(TooltipProvider, { delayDuration: 0, children: _jsxs("div", { className: "erp-shell flex h-screen overflow-hidden text-foreground", children: [_jsx(ERPSidebar, {}), _jsxs(motion.main, { initial: false, animate: { marginLeft: sidebarOpen ? 260 : 72 }, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] }, className: "flex flex-1 flex-col overflow-hidden", children: [_jsx(ERPHeader, {}), _jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar", children: _jsxs("div", { className: "w-full max-w-[1680px] mx-auto p-4 sm:p-5 lg:p-7", children: [_jsx(motion.div, { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.28, ease: "easeOut" }, className: "mb-6 overflow-hidden rounded-2xl border border-white/[0.55] bg-white/[0.58] shadow-enterprise-lg backdrop-blur-2xl dark:border-white/[0.08] dark:bg-slate-950/[0.42]", children: _jsxs("div", { className: "relative p-5 sm:p-6", children: [_jsx("div", { className: "aurora-strip absolute inset-x-0 top-0 h-1" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(motion.div, { initial: { scale: 0.92, rotate: -4 }, animate: { scale: 1, rotate: 0 }, transition: { type: "spring", stiffness: 260, damping: 20 }, className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal/[0.12] text-teal ring-1 ring-teal/20 shadow-sm", children: _jsx(currentModule.icon, { className: "h-6 w-6" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: currentModule.title }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: currentModule.description })] })] })] }) }, activeModule), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, y: 14, filter: "blur(4px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, y: -10, filter: "blur(4px)" }, transition: { duration: 0.24, ease: "easeOut" }, children: _jsx(PermissionBoundary, { module: activeModule, children: _jsx(CurrentComponent, {}) }) }, activeModule) })] }) })] }), _jsx(CommandPalette, {})] }) }));
}
export default function HomePage() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "flex h-screen items-center justify-center", children: "Loading..." }), children: _jsx(AuthGate, { children: _jsx(HomeContent, {}) }) }));
}
