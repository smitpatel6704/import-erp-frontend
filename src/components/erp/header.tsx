"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  Download,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useERPStore, type ERPModule } from "@/lib/store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const moduleSections: Record<ERPModule, string> = {
  dashboard: "Overview",
  shipments: "Operations",
  containers: "Operations",
  companies: "Operations",
  documents: "Operations",
  customs: "Compliance",
  logistics: "Compliance",
  notifications: "System",
  reports: "System",
  admin: "System",
};

export function ERPHeader() {
  const { activeModule, setSearchOpen, sidebarOpen, toggleSidebar } =
    useERPStore();
  const unreadCount = useERPStore((s) => s.unreadCount());
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 lg:px-6",
        "backdrop-blur-xl"
      )}
    >
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* Breadcrumb */}
      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" className="text-muted-foreground">
              ImportERP
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" className="text-muted-foreground">
              {moduleSections[activeModule]}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {moduleLabels[activeModule]}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Mobile breadcrumb - just the page name */}
      <span className="sm:hidden text-sm font-medium">
        {moduleLabels[activeModule]}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search Bar */}
      <Button
        variant="outline"
        className={cn(
          "hidden md:flex h-9 w-64 items-center justify-start gap-2 px-3 text-muted-foreground",
          "hover:bg-accent/50 transition-colors"
        )}
        onClick={() => setSearchOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search anything...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Mobile search */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSearchOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>

      {/* Quick Actions */}
      <div className="hidden lg:flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">New</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Download className="h-4 w-4" />
          <span className="sr-only">Export</span>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 hidden lg:block" />

      {/* Notifications */}
      <Link href="/notifications">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </Link>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {mounted && theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 h-9 hover:bg-accent/50"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-teal/15 text-teal text-[10px] font-semibold">
                JD
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:inline text-sm font-medium">
              John Doe
            </span>
            <ChevronDown className="hidden lg:inline h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">
                john.doe@importerp.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
