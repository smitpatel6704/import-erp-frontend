"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useERPStore } from "@/lib/store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThemeSelector } from "@/components/layout/theme-selector";

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

const moduleSections = {
  dashboard: "Overview",
  shipments: "Operations",
  containers: "Operations",
  companies: "Operations",
  documents: "Operations",
  notifications: "System",
  reports: "System",
  admin: "System",
};

export function ERPHeader() {
  const {
    activeModule,
    setSearchOpen,
    toggleSidebar,
    user,
    logout,
    canView,
    token,
    refreshNotificationUnreadCount,
  } = useERPStore();
  const unreadCount = useERPStore((s) => s.notificationUnreadCount);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  React.useEffect(() => {
    if (!token || !canView("notifications")) return;
    void refreshNotificationUnreadCount();
    const interval = window.setInterval(() => {
      void refreshNotificationUnreadCount();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [token, canView, refreshNotificationUnreadCount]);

  const initials = (user?.name || "User")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-card/84 px-4 shadow-sm backdrop-blur-xl lg:px-6",
        "dark:border-white/[0.07] dark:bg-card/70"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0 rounded-xl"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Nexport ERP
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {moduleSections[activeModule]}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">
              {moduleLabels[activeModule]}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <span className="sm:hidden text-sm font-semibold">
        {moduleLabels[activeModule]}
      </span>

      <div className="flex-1" />

      {/* Search trigger */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setSearchOpen(true)}
        className={cn(
          "hidden md:flex h-10 w-72 items-center gap-2.5 rounded-lg border border-border/70 bg-background/70 px-3.5 text-muted-foreground shadow-sm backdrop-blur transition-colors",
          "hover:border-teal/40 hover:bg-card hover:text-foreground",
          "dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
        )}
      >
        <Search className="h-4 w-4 text-teal" />
        <span className="text-sm">Search anything...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded-md border border-border/70 bg-muted/70 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </motion.button>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden rounded-xl"
        onClick={() => setSearchOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>

      <Separator orientation="vertical" className="h-6 hidden lg:block bg-border/60" />

      {canView("notifications") && (
        <Link href="/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-xl text-muted-foreground hover:bg-white/60 hover:text-foreground dark:hover:bg-white/[0.06]"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white/70 dark:ring-slate-950/70"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </Link>
      )}

      <ThemeSelector />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-10 items-center gap-2 rounded-xl px-2 hover:bg-white/60 dark:hover:bg-white/[0.06]"
          >
            <Avatar className="h-8 w-8 ring-1 ring-teal/25">
              <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
              <AvatarFallback className="bg-teal/15 text-teal text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:inline text-sm font-semibold">
              {user?.name || "User"}
            </span>
            <ChevronDown className="hidden lg:inline h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-xl border-white/40 bg-popover/95 shadow-enterprise-lg backdrop-blur-xl dark:border-white/[0.08]"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            {["admin", "super_admin"].includes(user?.role) && (
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
