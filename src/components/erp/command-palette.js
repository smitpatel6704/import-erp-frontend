"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ship,
  Box,
  Building2,
  FolderOpen,
  Bell,
  BarChart3,
  Settings,
  Plus,
  Download,
  Upload,
  RefreshCw,
  ArrowUpRight,
  Clock,
  Zap,
  Compass,
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
import { useERPStore } from "@/lib/store";

const moduleIcons = {
  dashboard: LayoutDashboard,
  shipments: Ship,
  containers: Box,
  companies: Building2,
  documents: FolderOpen,
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
  notifications: "Notifications",
  reports: "Reports",
  admin: "Admin",
};

const recentItems = [
  { id: "ship-0892", label: "Shipment SH-2024-0892", module: "shipments" },
  { id: "cont-0156", label: "Container CT-2024-0156", module: "containers" },
];

export function CommandPalette() {
  const { searchOpen, setSearchOpen } = useERPStore();
  const router = useRouter();

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
      label: "Create new shipment",
      icon: Plus,
      shortcut: "N",
      action: () => {
        router.push("/shipments");
        setSearchOpen(false);
      },
    },
    {
      id: "import-data",
      label: "Import data",
      icon: Upload,
      action: () => setSearchOpen(false),
    },
    {
      id: "export-report",
      label: "Export report",
      icon: Download,
      shortcut: "E",
      action: () => setSearchOpen(false),
    },
    {
      id: "sync-data",
      label: "Sync all data",
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
      className="rounded-2xl border border-white/60 dark:border-white/[0.08] bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-enterprise-xl overflow-hidden sm:max-w-lg"
    >
      <div className="border-b border-border/60 px-3 py-1">
        <CommandInput
          placeholder="Search modules, actions, records..."
          className="h-11 border-0 bg-transparent px-2 text-sm placeholder:text-muted-foreground/70 focus:ring-0"
        />
      </div>
      <CommandList className="max-h-[380px] scroll-py-2 overflow-y-auto p-2">
        <CommandEmpty className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
          <Compass className="h-8 w-8 opacity-40" />
          No results found.
        </CommandEmpty>

        <CommandGroup
          heading={
            <PaletteHeading icon={Zap} label="Quick Actions" tone="text-amber-dark dark:text-amber-light" />
          }
        >
          {quickActions.map((action) => (
            <PaletteItem
              key={action.id}
              onSelect={action.action}
              icon={action.icon}
              iconTone="text-teal"
              label={action.label}
              shortcut={action.shortcut}
            />
          ))}
        </CommandGroup>

        <CommandSeparator className="my-1 bg-border/50" />

        <CommandGroup
          heading={
            <PaletteHeading icon={Compass} label="Navigation" tone="text-teal" />
          }
        >
          {Object.keys(moduleLabels).map((module) => {
            const Icon = moduleIcons[module];
            return (
              <PaletteItem
                key={module}
                onSelect={() => handleModuleSelect(module)}
                icon={Icon}
                iconTone="text-muted-foreground"
                label={moduleLabels[module]}
                trailing={<ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
              />
            );
          })}
        </CommandGroup>

        <CommandSeparator className="my-1 bg-border/50" />

        <CommandGroup
          heading={
            <PaletteHeading icon={Clock} label="Recent" tone="text-info" />
          }
        >
          {recentItems.map((item) => {
            const Icon = moduleIcons[item.module];
            return (
              <PaletteItem
                key={item.id}
                onSelect={() => handleModuleSelect(item.module)}
                icon={Icon}
                iconTone="text-muted-foreground"
                label={item.label}
              />
            );
          })}
        </CommandGroup>
      </CommandList>

      <div className="flex items-center justify-between gap-4 border-t border-border/60 bg-muted/30 px-4 py-2 text-[10.5px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Kbd>↵</Kbd> select
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
        </div>
        <span className="inline-flex items-center gap-1">
          <Kbd>Esc</Kbd> close
        </span>
      </div>
    </CommandDialog>
  );
}

function PaletteHeading({ icon: Icon, label, tone = "text-teal" }) {
  return (
    <div className="flex items-center gap-1.5 px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      <Icon className={`h-3 w-3 ${tone}`} />
      {label}
    </div>
  );
}

function PaletteItem({ icon: Icon, iconTone, label, shortcut, trailing, ...props }) {
  return (
    <CommandItem
      className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors data-[selected=true]:bg-teal/10 data-[selected=true]:text-foreground"
      {...props}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 ring-1 ring-border/60 group-data-[selected=true]:bg-teal/15 group-data-[selected=true]:ring-teal/25 transition-colors">
        <Icon className={`h-3.5 w-3.5 ${iconTone}`} />
      </div>
      <span className="flex-1 truncate">{label}</span>
      {shortcut && (
        <Kbd>{shortcut}</Kbd>
      )}
      {trailing}
    </CommandItem>
  );
}

function Kbd({ children }) {
  return (
    <kbd className="pointer-events-none inline-flex h-5 min-w-5 items-center justify-center rounded border border-border/60 bg-muted/60 px-1 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
      {children}
    </kbd>
  );
}
