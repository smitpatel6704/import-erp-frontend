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
  LogOut,
  Anchor,
  ChevronLeft,
  ChevronRight,
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
  const { activeModule, sidebarOpen, setSidebarOpen, user, canView, logout, companyName } = useERPStore();
  const [brandLogos, setBrandLogos] = useState(() => getSavedBrandLogos());
  const isMobile = useIsMobile();
  const isExpanded = sidebarOpen || isMobile;

  useEffect(() => {
    const onLogoChange = (event) => {
      setBrandLogos(event.detail || getSavedBrandLogos());
    };
    window.addEventListener("nexport-brand-logo-change", onLogoChange);
    void loadBrandLogosFromDatabase()
      .then(setBrandLogos)
      .catch(() => {});
    return () => {
      window.removeEventListener("nexport-brand-logo-change", onLogoChange);
    };
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isMobile ? 280 : sidebarOpen ? 220 : 72,
        x: isMobile && !sidebarOpen ? -288 : 0,
      }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 flex max-w-[82vw] flex-col h-screen",
        "border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      )}
    >
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-3.5">
        <div className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-lg", isExpanded && (brandLogos.light || brandLogos.collapsed) ? "h-9 w-full" : "h-8 w-8")}>
          {brandLogos.light || brandLogos.collapsed ? (
            <img
              src={isExpanded ? (brandLogos.light || brandLogos.collapsed) : (brandLogos.collapsed || brandLogos.light)}
              alt=""
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-teal-dark text-primary-foreground shadow-sm shadow-primary/20">
              <Anchor className="h-4 w-4" strokeWidth={2.2} />
            </div>
          )}
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && !(brandLogos.light || brandLogos.collapsed) && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="truncate text-sm font-bold tracking-tight text-sidebar-foreground"
            >
              {companyName || "Nexport ERP"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scrollbar px-2 py-3">
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
            <div key={section} className={cn(sIdx > 0 && "mt-5")}>
              <AnimatePresence initial={false}>
                {(sidebarOpen || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.12 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/40">
                      {section}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
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
                        "group relative flex h-9 w-full items-center rounded-lg text-sm font-medium transition-all duration-150",
                        sidebarOpen || isMobile ? "gap-2.5 px-3" : "justify-center px-0",
                        isActive
                          ? "bg-gradient-to-r from-primary/12 to-transparent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/90"
                      )}
                    >
                      {isActive && (sidebarOpen || isMobile) && (
                        <>
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-sm shadow-primary/50" />
                          <span className="absolute inset-0 rounded-lg ring-1 ring-primary/10 ring-inset" />
                        </>
                      )}
                      {isActive && !sidebarOpen && !isMobile && (
                        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm shadow-primary/50" />
                      )}
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-transform duration-150",
                          isActive && "text-primary",
                          !isActive && "group-hover:scale-105"
                        )}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                      <AnimatePresence initial={false}>
                        {(sidebarOpen || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            transition={{ duration: 0.12 }}
                            className="flex-1 truncate text-left"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );

                  if (!sidebarOpen && !isMobile) {
                    return (
                      <Tooltip key={item.id} delayDuration={200}>
                        <TooltipTrigger asChild>{btn}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                          <p className="text-xs font-medium">{item.label}</p>
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
      <div className="border-t border-sidebar-border px-2 py-2.5">
        <div className={cn("flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent/30", isExpanded ? "" : "justify-center")}>
          <Avatar className="h-7 w-7 shrink-0 ring-2 ring-sidebar-border/30">
            <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-teal-dark/20 text-primary text-[9px] font-bold">
              {(user?.name || "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name || "User"}</p>
                <p className="truncate text-[10px] capitalize text-sidebar-foreground/45">{user?.role || ""}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {isExpanded ? (
            <button
              onClick={logout}
              className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/35 hover:bg-danger/10 hover:text-danger transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/35 hover:bg-danger/10 hover:text-danger transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p className="text-xs font-medium">Log out</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
