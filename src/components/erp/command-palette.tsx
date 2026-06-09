"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ship,
  Box,
  Building2,
  FolderOpen,
  Shield,
  Truck,
  Bell,
  BarChart3,
  Settings,
  Plus,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useERPStore, type ERPModule } from "@/lib/store";

interface CommandAction {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

const moduleIcons: Record<ERPModule, React.ElementType> = {
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

const moduleLabels: Record<ERPModule, string> = {
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
  { id: "ship-0892", label: "Shipment SH-2024-0892", module: "shipments" as ERPModule },
  { id: "cont-0156", label: "Container CT-2024-0156", module: "containers" as ERPModule },
  { id: "cust-0089", label: "Customs Declaration CD-0089", module: "customs" as ERPModule },
];

export function CommandPalette() {
  const { searchOpen, setSearchOpen, setActiveModule } = useERPStore();
  const router = useRouter();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [searchOpen, setSearchOpen]);

  const handleModuleSelect = (module: ERPModule) => {
    router.push(`/${module}`);
    setSearchOpen(false);
  };

  const quickActions: CommandAction[] = [
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

  return (
    <CommandDialog
      open={searchOpen}
      onOpenChange={setSearchOpen}
      title="Command Palette"
      description="Search modules, navigate, or run actions"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.id}
              onSelect={action.action}
              className="cursor-pointer"
            >
              <action.icon className="h-4 w-4 text-teal" />
              <span>{action.label}</span>
              {action.shortcut && (
                <span className="ml-auto text-xs text-muted-foreground tracking-wider">
                  {action.shortcut}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Module Navigation */}
        <CommandGroup heading="Navigation">
          {(Object.keys(moduleLabels) as ERPModule[]).map((module) => {
            const Icon = moduleIcons[module];
            return (
              <CommandItem
                key={module}
                onSelect={() => handleModuleSelect(module)}
                className="cursor-pointer"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{moduleLabels[module]}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Recent Items */}
        <CommandGroup heading="Recent">
          {recentItems.map((item) => {
            const Icon = moduleIcons[item.module];
            return (
              <CommandItem
                key={item.id}
                onSelect={() => handleModuleSelect(item.module)}
                className="cursor-pointer"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
