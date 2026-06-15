"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Ship, Box, Building2, FolderOpen, Truck, Bell, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut, Anchor, } from "lucide-react";
import { useERPStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
    { id: "shipments", label: "Shipments", icon: Ship, section: "Operations" },
    { id: "containers", label: "Containers", icon: Box, section: "Operations" },
    { id: "companies", label: "Companies", icon: Building2, section: "Operations" },
    { id: "documents", label: "Documents", icon: FolderOpen, section: "Operations" },
    { id: "logistics", label: "Logistics", icon: Truck, section: "Compliance" },
    { id: "notifications", label: "Notifications", icon: Bell, section: "System" },
    { id: "reports", label: "Reports", icon: BarChart3, section: "System" },
    { id: "admin", label: "Settings", icon: Settings, section: "System" },
];
const sections = ["Overview", "Operations", "Compliance", "System"];
export function ERPSidebar() {
    const { activeModule, sidebarOpen, toggleSidebar, user, canView, logout } = useERPStore();
    return (_jsxs(motion.aside, { initial: false, animate: { width: sidebarOpen ? 260 : 72 }, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, className: "sidebar-gradient fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/[0.06] shadow-xl", children: [_jsxs("div", { className: "flex h-16 items-center gap-3 px-4 border-b border-white/[0.06]", children: [_jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/20 text-teal", children: _jsx(Anchor, { className: "h-5 w-5" }) }), _jsx(AnimatePresence, { children: sidebarOpen && (_jsxs(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 }, transition: { duration: 0.2 }, className: "flex flex-col overflow-hidden", children: [_jsx("span", { className: "text-sm font-bold text-white tracking-wide", children: "Nexport ERP" }), _jsx("span", { className: "text-[10px] font-medium text-white/40 uppercase tracking-widest", children: "Enterprise Suite" })] })) })] }), _jsx("nav", { className: "flex-1 overflow-y-auto sidebar-scrollbar py-4 px-2", children: sections.map((section) => {
                    const sectionItems = navItems.filter((item) => item.section === section && (item.id === "admin" ? ['admin', 'super_admin'].includes(user?.role) : canView(item.id)));
                    if (sectionItems.length === 0)
                        return null;
                    return (_jsxs("div", { className: "mb-2", children: [_jsx(AnimatePresence, { children: sidebarOpen && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 }, className: "px-3 py-2", children: _jsx("span", { className: "text-[10px] font-semibold uppercase tracking-widest text-white/25", children: section }) })) }), _jsx("div", { className: "space-y-0.5", children: sectionItems.map((item) => {
                                    const isActive = activeModule === item.id;
                                    const Icon = item.icon;
                                    const navButton = (_jsxs(Link, { href: `/${item.id}`, className: cn("group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200", isActive
                                            ? "bg-teal/15 text-teal"
                                            : "text-white/60 hover:bg-white/[0.04] hover:text-white/90"), children: [isActive && (_jsx(motion.div, { layoutId: "activeIndicator", className: "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-teal", transition: {
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 30,
                                                } })), _jsx(Icon, { className: cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive
                                                    ? "text-teal"
                                                    : "text-white/40 group-hover:text-white/70") }), _jsx(AnimatePresence, { children: sidebarOpen && (_jsx(motion.span, { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -8 }, transition: { duration: 0.15 }, className: "flex-1 text-left truncate", children: item.label })) })] }, item.id));
                                    if (!sidebarOpen) {
                                        return (_jsxs(Tooltip, { delayDuration: 0, children: [_jsx(TooltipTrigger, { asChild: true, children: navButton }), _jsx(TooltipContent, { side: "right", sideOffset: 8, children: _jsx("p", { children: item.label }) })] }, item.id));
                                    }
                                    return navButton;
                                }) }), section !== "System" && (_jsx(Separator, { className: "my-2 bg-white/[0.04] mx-2" }))] }, section));
                }) }), _jsx("div", { className: "border-t border-white/[0.06] p-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { className: "h-8 w-8 shrink-0 border border-white/10", children: [_jsx(AvatarImage, { src: user?.avatar || "", alt: user?.name || "User" }), _jsx(AvatarFallback, { className: "bg-teal/20 text-teal text-xs font-semibold", children: (user?.name || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() })] }), _jsx(AnimatePresence, { children: sidebarOpen && (_jsxs(motion.div, { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -8 }, transition: { duration: 0.2 }, className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-white/90 truncate", children: user?.name || "User" }), _jsx("p", { className: "text-[11px] text-white/35 truncate capitalize", children: user?.role || "" })] })) }), sidebarOpen && (_jsx("button", { onClick: logout, className: "shrink-0 rounded-md p-1.5 text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-colors", children: _jsx(LogOut, { className: "h-4 w-4" }) }))] }) }), _jsx("button", { onClick: toggleSidebar, className: "absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-navy text-white/50 shadow-md hover:bg-navy-light hover:text-white/80 transition-colors", children: sidebarOpen ? (_jsx(ChevronLeft, { className: "h-3.5 w-3.5" })) : (_jsx(ChevronRight, { className: "h-3.5 w-3.5" })) })] }));
}
