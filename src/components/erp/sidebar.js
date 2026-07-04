"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Ship,
  Box,
  Building2,
  FolderOpen,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Anchor,
} from "lucide-react";
import { useERPStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { applyBrandLogo, getSavedBrandLogos, loadBrandLogosFromDatabase } from "@/components/erp/theme-runtime";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { id: "shipments", label: "Shipments", icon: Ship, section: "Operations" },
  { id: "containers", label: "Containers", icon: Box, section: "Operations" },
  { id: "companies", label: "Companies", icon: Building2, section: "Operations" },
  { id: "documents", label: "Documents", icon: FolderOpen, section: "Operations" },
  { id: "notifications", label: "Notifications", icon: Bell, section: "System" },
  { id: "reports", label: "Reports", icon: BarChart3, section: "System" },
  { id: "admin", label: "Settings", icon: Settings, section: "System" },
];

const sections = ["Overview", "Operations", "System"];

export function ERPSidebar() {
  const { activeModule, sidebarOpen, setSidebarOpen, user, canView, logout } = useERPStore();
  const [brandLogos, setBrandLogos] = useState(() => getSavedBrandLogos());
  const isMobile = useIsMobile();
  const isExpanded = sidebarOpen || isMobile;
  const brandLogo = isExpanded
    ? brandLogos.light || brandLogos.collapsed || ""
    : brandLogos.collapsed || brandLogos.light || "";
  const brandLogoMode = isExpanded
    ? brandLogos.light ? "light" : "collapsed"
    : brandLogos.collapsed ? "collapsed" : "light";

  useEffect(() => {
    const onLogoChange = (event) => {
      setBrandLogos(event.detail || getSavedBrandLogos());
    };
    window.addEventListener("nexport-brand-logo-change", onLogoChange);
    void loadBrandLogosFromDatabase()
      .then(setBrandLogos)
      .catch((error) => {
        console.error("Brand logos could not be loaded:", error);
      });
    return () => {
      window.removeEventListener("nexport-brand-logo-change", onLogoChange);
    };
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isMobile ? 280 : sidebarOpen ? 264 : 72,
        x: isMobile && !sidebarOpen ? -288 : 0,
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed z-40 flex max-w-[82vw] flex-col transition-colors",
        "left-0 top-0 h-screen border-r border-border/70 shadow-sm text-foreground",
        "bg-card/84 backdrop-blur-xl dark:border-white/[0.07] dark:bg-card/70"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-20 items-center px-4",
          brandLogo && isExpanded ? "gap-0" : "gap-3",
          "border-b border-border/30"
        )}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden",
            brandLogo && isExpanded ? "h-14 w-full rounded-lg" : "h-12 w-12 rounded-xl",
            brandLogo
              ? "bg-transparent shadow-none ring-0"
              : "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
          )}
        >
          {brandLogo ? (
            <img
              src={brandLogo}
              alt="Nexport ERP logo"
              className={cn("h-full w-full object-contain", isExpanded ? "p-0.5" : "p-0.5")}
              onError={() => applyBrandLogo(brandLogoMode, "")}
            />
          ) : (
            <Anchor className="h-5 w-5" strokeWidth={2.2} />
          )}
        </motion.div>
        <AnimatePresence initial={false}>
          {isExpanded && !brandLogo && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-sm font-bold tracking-tight text-foreground">
                Nexport ERP
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Enterprise Suite
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scrollbar px-3 py-5">
        {sections.map((section, sIdx) => {
          const items = navItems.filter(
            (item) =>
              item.section === section &&
              (item.id === "admin"
                ? ["admin", "super_admin"].includes(user?.role)
                : canView(item.id))
          );
          if (items.length === 0) return null;

          return (
            <div key={section} className={cn("mb-6", sIdx > 0 && "pt-2")}>
              {(sidebarOpen || isMobile) && (
                <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {section}
                </div>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;

                  const btn = (
                    <Link
                      href={`/${item.id}`}
                      onClick={() => {
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className={cn(
                        "group relative flex h-10 w-full items-center overflow-hidden rounded-xl text-sm font-medium transition-all duration-200",
                        sidebarOpen || isMobile ? "gap-3 px-3" : "justify-center px-0",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "relative h-[18px] w-[18px] shrink-0 transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                        strokeWidth={2}
                      />
                      <AnimatePresence initial={false}>
                        {(sidebarOpen || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.15 }}
                            className="relative flex-1 truncate text-left"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );

                  if (!sidebarOpen && !isMobile) {
                    return (
                      <Tooltip key={item.id} delayDuration={0}>
                        <TooltipTrigger asChild>{btn}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={16} className="bg-popover/90 backdrop-blur">
                          <p className="font-semibold">{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return <div key={item.id}>{btn}</div>;
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-4 border-t border-border/30">
        <div
          className={cn(
            "flex min-h-[52px] items-center gap-3 rounded-2xl p-2 transition-colors",
            sidebarOpen || isMobile ? "bg-muted/30" : ""
          )}
        >
          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/50 shadow-sm">
            <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {(user?.name || "User")
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence initial={false}>
            {(sidebarOpen || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                className="flex-1 min-w-0"
              >
                <p className="truncate text-sm font-semibold text-foreground">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-[11px] capitalize text-muted-foreground">
                  {user?.role || ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {(sidebarOpen || isMobile) && (
            <button
              onClick={logout}
              className="shrink-0 rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

    </motion.aside>
  );
}
