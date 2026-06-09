"use client";

import React, { useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import { useERPStore, type ERPModule } from "@/lib/store";
import { ERPSidebar } from "@/components/erp/sidebar";
import { ERPHeader } from "@/components/erp/header";
import { CommandPalette } from "@/components/erp/command-palette";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// ─── Module Imports ──────────────────────────────────────────────────────

import DashboardModule from "@/components/erp/modules/dashboard";
import ShipmentsModule from "@/components/erp/modules/shipments";
import ContainersModule from "@/components/erp/modules/containers";
import CompaniesModule from "@/components/erp/modules/companies";
import { CustomsModule } from "@/components/erp/modules/customs";
import { LogisticsModule } from "@/components/erp/modules/logistics";
import { NotificationsModule } from "@/components/erp/modules/notifications";
import { ReportsModule } from "@/components/erp/modules/reports";
import { AdminModule } from "@/components/erp/modules/admin";
import { DocumentsModule } from "@/components/erp/modules/documents";

// ─── Placeholder for unbuilt modules ─────────────────────────────────────

function PlaceholderModule({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10">
          <Icon className="h-8 w-8 text-teal" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {description}
          </p>
        </div>
        <Badge variant="secondary" className="mt-2">
          Coming Soon
        </Badge>
      </motion.div>
    </div>
  );
}

// ─── Module Configuration ────────────────────────────────────────────────

const moduleConfig: Record<
  ERPModule,
  {
    component: React.ComponentType<object>;
    title: string;
    description: string;
    icon: React.ElementType;
  }
> = {
  dashboard: {
    component: DashboardModule,
    title: "Dashboard",
    description: "Overview of your import operations",
    icon: LayoutDashboard,
  },
  shipments: {
    component: ShipmentsModule,
    title: "Shipments",
    description: "Track and manage all import shipments",
    icon: Ship,
  },
  containers: {
    component: ContainersModule,
    title: "Containers",
    description: "Manage container inventory and tracking",
    icon: Box,
  },
  companies: {
    component: CompaniesModule,
    title: "Companies",
    description: "Manage suppliers and business partners",
    icon: Building2,
  },
  documents: {
    component: DocumentsModule,
    title: "Documents",
    description: "Import document management",
    icon: FolderOpen,
  },
  customs: {
    component: CustomsModule,
    title: "Customs",
    description: "Customs and compliance management",
    icon: Shield,
  },
  logistics: {
    component: LogisticsModule,
    title: "Logistics",
    description: "Logistics and distribution management",
    icon: Truck,
  },
  notifications: {
    component: NotificationsModule,
    title: "Notifications",
    description: "Alerts and notification center",
    icon: Bell,
  },
  reports: {
    component: ReportsModule,
    title: "Reports",
    description: "Analytics and reporting",
    icon: BarChart3,
  },
  admin: {
    component: AdminModule,
    title: "Settings",
    description: "System administration and settings",
    icon: Settings,
  },
};

// ─── Main App Shell ────────────────────────────────────────────────────

function HomeContent() {
  const { activeModule, sidebarOpen, setActiveModule } = useERPStore();
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const routeModule = params?.module ? (Array.isArray(params.module) ? params.module[0] : params.module) : "dashboard";
    const moduleParam = routeModule as ERPModule;
    
    if (moduleParam && moduleConfig[moduleParam] && activeModule !== moduleParam) {
      setActiveModule(moduleParam);
    }
  }, [params, setActiveModule]); // activeModule intentionally omitted to prevent loop, it will check the latest value from store anyway

  const currentModule = moduleConfig[activeModule];
  const CurrentComponent = currentModule.component;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <ERPSidebar />

        {/* Main Content Area */}
        <motion.main
          initial={false}
          animate={{ marginLeft: sidebarOpen ? 260 : 72 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          {/* Header */}
          <ERPHeader />

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
              {/* Page Title */}
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
                    <currentModule.icon className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">
                      {currentModule.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {currentModule.description}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Module Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <CurrentComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.main>

        {/* Command Palette */}
        <CommandPalette />
      </div>
    </TooltipProvider>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
