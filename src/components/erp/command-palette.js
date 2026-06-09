"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Ship, Box, Building2, FolderOpen, Shield, Truck, Bell, BarChart3, Settings, Plus, Download, Upload, RefreshCw, } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, } from "@/components/ui/command";
import { useERPStore } from "@/lib/store";
const moduleIcons = {
    dashboard: LayoutDashboard,
    shipments: Ship,
    containers: Box,
    companies: Building2,
    documents: FolderOpen,
    customs: Shield,
    logistics: Truck,
    notifications: Bell,
    reports: BarChart3,
    admin: Settings,
};
const moduleLabels = {
    dashboard: "Dashboard",
    shipments: "Shipments",
    containers: "Containers",
    companies: "Companies",
    documents: "Documents",
    customs: "Customs",
    logistics: "Logistics",
    notifications: "Notifications",
    reports: "Reports",
    admin: "Admin",
};
const recentItems = [
    { id: "ship-0892", label: "Shipment SH-2024-0892", module: "shipments" },
    { id: "cont-0156", label: "Container CT-2024-0156", module: "containers" },
    { id: "cust-0089", label: "Customs Declaration CD-0089", module: "customs" },
];
export function CommandPalette() {
    const { searchOpen, setSearchOpen, setActiveModule } = useERPStore();
    const router = useRouter();
    // Keyboard shortcut: Cmd+K / Ctrl+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setSearchOpen(!searchOpen);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [searchOpen, setSearchOpen]);
    const handleModuleSelect = (module) => {
        router.push(`/${module}`);
        setSearchOpen(false);
    };
    const quickActions = [
        {
            id: "new-shipment",
            label: "Create New Shipment",
            icon: Plus,
            shortcut: "N",
            action: () => {
                router.push("/shipments");
                setSearchOpen(false);
            },
        },
        {
            id: "import-data",
            label: "Import Data",
            icon: Upload,
            action: () => setSearchOpen(false),
        },
        {
            id: "export-report",
            label: "Export Report",
            icon: Download,
            shortcut: "E",
            action: () => setSearchOpen(false),
        },
        {
            id: "sync-data",
            label: "Sync All Data",
            icon: RefreshCw,
            action: () => setSearchOpen(false),
        },
    ];
    return (_jsxs(CommandDialog, { open: searchOpen, onOpenChange: setSearchOpen, title: "Command Palette", description: "Search modules, navigate, or run actions", children: [_jsx(CommandInput, { placeholder: "Type a command or search..." }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: "No results found." }), _jsx(CommandGroup, { heading: "Quick Actions", children: quickActions.map((action) => (_jsxs(CommandItem, { onSelect: action.action, className: "cursor-pointer", children: [_jsx(action.icon, { className: "h-4 w-4 text-teal" }), _jsx("span", { children: action.label }), action.shortcut && (_jsx("span", { className: "ml-auto text-xs text-muted-foreground tracking-wider", children: action.shortcut }))] }, action.id))) }), _jsx(CommandSeparator, {}), _jsx(CommandGroup, { heading: "Navigation", children: Object.keys(moduleLabels).map((module) => {
                            const Icon = moduleIcons[module];
                            return (_jsxs(CommandItem, { onSelect: () => handleModuleSelect(module), className: "cursor-pointer", children: [_jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: moduleLabels[module] })] }, module));
                        }) }), _jsx(CommandSeparator, {}), _jsx(CommandGroup, { heading: "Recent", children: recentItems.map((item) => {
                            const Icon = moduleIcons[item.module];
                            return (_jsxs(CommandItem, { onSelect: () => handleModuleSelect(item.module), className: "cursor-pointer", children: [_jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: item.label })] }, item.id));
                        }) })] })] }));
}
