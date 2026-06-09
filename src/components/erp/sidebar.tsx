"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Anchor,
} from "lucide-react";
import { useERPStore, type ERPModule } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavItem {
  id: ERPModule;
  label: string;
  icon: React.ElementType;
  section?: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { id: "shipments", label: "Shipments", icon: Ship, section: "Operations" },
  { id: "containers", label: "Containers", icon: Box, section: "Operations" },
  { id: "companies", label: "Companies", icon: Building2, section: "Operations" },
  { id: "documents", label: "Documents", icon: FolderOpen, section: "Operations" },
  { id: "customs", label: "Customs", icon: Shield, section: "Compliance" },
  { id: "logistics", label: "Logistics", icon: Truck, section: "Compliance" },
  { id: "notifications", label: "Notifications", icon: Bell, section: "System" },
  { id: "reports", label: "Reports", icon: BarChart3, section: "System" },
  { id: "admin", label: "Settings", icon: Settings, section: "System" },
];

const sections = ["Overview", "Operations", "Compliance", "System"];

export function ERPSidebar() {
  const { activeModule, sidebarOpen, toggleSidebar } = useERPStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="sidebar-gradient fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/[0.06] shadow-xl"
    >
      {/* Logo Area */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-white/[0.06]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/20 text-teal">
          <Anchor className="h-5 w-5" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-sm font-bold text-white tracking-wide">
                ImportERP
              </span>
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                Enterprise Suite
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scrollbar py-4 px-2">
        {sections.map((section) => {
          const sectionItems = navItems.filter(
            (item) => item.section === section
          );
          if (sectionItems.length === 0) return null;

          return (
            <div key={section} className="mb-2">
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-3 py-2"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">
                      {section}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-0.5">
                {sectionItems.map((item) => {
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;

                  const navButton = (
                    <Link
                      key={item.id}
                      href={`/${item.id}`}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-teal/15 text-teal"
                          : "text-white/60 hover:bg-white/[0.04] hover:text-white/90"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-teal"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}

                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-colors",
                          isActive
                            ? "text-teal"
                            : "text-white/40 group-hover:text-white/70"
                        )}
                      />

                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15 }}
                            className="flex-1 text-left truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );

                  if (!sidebarOpen) {
                    return (
                      <Tooltip key={item.id} delayDuration={0}>
                        <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return navButton;
                })}
              </div>

              {section !== "System" && (
                <Separator className="my-2 bg-white/[0.04] mx-2" />
              )}
            </div>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0 border border-white/10">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-teal/20 text-teal text-xs font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white/90 truncate">
                  John Doe
                </p>
                <p className="text-[11px] text-white/35 truncate">
                  Import Manager
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarOpen && (
            <button className="shrink-0 rounded-md p-1.5 text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-navy text-white/50 shadow-md hover:bg-navy-light hover:text-white/80 transition-colors"
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>
    </motion.aside>
  );
}
