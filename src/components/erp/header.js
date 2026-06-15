"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Search, Bell, Sun, Moon, Plus, Download, User, Settings, LogOut, ChevronDown, Menu, } from "lucide-react";
import { useERPStore } from "@/lib/store";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
const moduleLabels = {
    dashboard: "Dashboard",
    shipments: "Shipments",
    containers: "Containers",
    companies: "Companies",
    documents: "Documents",
    logistics: "Logistics",
    notifications: "Notifications",
    reports: "Reports",
    admin: "Admin",
};
const moduleSections = {
    dashboard: "Overview",
    shipments: "Operations",
    containers: "Operations",
    companies: "Operations",
    documents: "Operations",
    logistics: "Compliance",
    notifications: "System",
    reports: "System",
    admin: "System",
};
export function ERPHeader() {
    const { activeModule, setSearchOpen, sidebarOpen, toggleSidebar, user, logout, canView } = useERPStore();
    const unreadCount = useERPStore((s) => s.unreadCount());
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);
    const initials = (user?.name || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    return (_jsxs("header", { className: cn("sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 lg:px-6", "backdrop-blur-xl"), children: [_jsxs(Button, { variant: "ghost", size: "icon", className: "lg:hidden shrink-0", onClick: toggleSidebar, children: [_jsx(Menu, { className: "h-5 w-5" }), _jsx("span", { className: "sr-only", children: "Toggle sidebar" })] }), _jsx(Breadcrumb, { className: "hidden sm:flex", children: _jsxs(BreadcrumbList, { children: [_jsx(BreadcrumbItem, { children: _jsx(BreadcrumbLink, { href: "#", className: "text-muted-foreground", children: "Nexport ERP" }) }), _jsx(BreadcrumbSeparator, {}), _jsx(BreadcrumbItem, { children: _jsx(BreadcrumbLink, { href: "#", className: "text-muted-foreground", children: moduleSections[activeModule] }) }), _jsx(BreadcrumbSeparator, {}), _jsx(BreadcrumbItem, { children: _jsx(BreadcrumbPage, { className: "font-medium", children: moduleLabels[activeModule] }) })] }) }), _jsx("span", { className: "sm:hidden text-sm font-medium", children: moduleLabels[activeModule] }), _jsx("div", { className: "flex-1" }), _jsxs(Button, { variant: "outline", className: cn("hidden md:flex h-9 w-64 items-center justify-start gap-2 px-3 text-muted-foreground", "hover:bg-accent/50 transition-colors"), onClick: () => setSearchOpen(true), children: [_jsx(Search, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm", children: "Search anything..." }), _jsxs("kbd", { className: "pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground", children: [_jsx("span", { className: "text-xs", children: "\u2318" }), "K"] })] }), _jsxs(Button, { variant: "ghost", size: "icon", className: "md:hidden", onClick: () => setSearchOpen(true), children: [_jsx(Search, { className: "h-5 w-5" }), _jsx("span", { className: "sr-only", children: "Search" })] }), _jsx(Separator, { orientation: "vertical", className: "h-6 hidden lg:block" }), canView("notifications") && _jsx(Link, { href: "/notifications", children: _jsxs(Button, { variant: "ghost", size: "icon", className: "relative h-9 w-9 text-muted-foreground hover:text-foreground", children: [_jsx(Bell, { className: "h-4 w-4" }), unreadCount > 0 && (_jsx("span", { className: "absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white", children: unreadCount > 9 ? "9+" : unreadCount })), _jsx("span", { className: "sr-only", children: "Notifications" })] }) }), _jsxs(Button, { variant: "ghost", size: "icon", className: "h-9 w-9 text-muted-foreground hover:text-foreground", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), children: [mounted && theme === "dark" ? (_jsx(Sun, { className: "h-4 w-4" })) : (_jsx(Moon, { className: "h-4 w-4" })), _jsx("span", { className: "sr-only", children: "Toggle theme" })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", className: "flex items-center gap-2 px-2 h-9 hover:bg-accent/50", children: [_jsxs(Avatar, { className: "h-7 w-7", children: [_jsx(AvatarImage, { src: user?.avatar || "", alt: user?.name || "User" }), _jsx(AvatarFallback, { className: "bg-teal/15 text-teal text-[10px] font-semibold", children: initials })] }), _jsx("span", { className: "hidden lg:inline text-sm font-medium", children: user?.name || "User" }), _jsx(ChevronDown, { className: "hidden lg:inline h-3 w-3 text-muted-foreground" })] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [_jsx(DropdownMenuLabel, { className: "font-normal", children: _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsx("p", { className: "text-sm font-medium", children: user?.name || "User" }), _jsx("p", { className: "text-xs text-muted-foreground", children: user?.email || "" })] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuGroup, { children: [_jsxs(DropdownMenuItem, { children: [_jsx(User, { className: "mr-2 h-4 w-4" }), "Profile"] }), ['admin', 'super_admin'].includes(user?.role) && _jsxs(DropdownMenuItem, { children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), "Settings"] })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { variant: "destructive", onClick: logout, children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), "Log out"] })] })] })] }));
}
