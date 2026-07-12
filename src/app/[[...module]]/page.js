"use client";
import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ship,
  Box,
  Building2,
  FolderOpen,
  Bell,
  BarChart3,
  Settings,
  Eye,
} from "lucide-react";
import { useERPStore } from "@/lib/store";
import { PageHeader } from "@/components/erp/page-header";
import { ERPSidebar } from "@/components/erp/sidebar";
import { ERPHeader } from "@/components/erp/header";
import { CommandPalette } from "@/components/erp/command-palette";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

import DashboardModule from "@/components/erp/modules/dashboard";
import ShipmentsModule from "@/components/erp/modules/shipments";
import ContainersModule from "@/components/erp/modules/containers";
import CompaniesModule from "@/components/erp/modules/companies";
import { NotificationsModule } from "@/components/erp/modules/notifications";
import { ReportsModule } from "@/components/erp/modules/reports";
import { AdminModule } from "@/components/erp/modules/admin";
import { DocumentsModule } from "@/components/erp/modules/documents";
import { AuthGate } from "@/components/erp/auth-gate";
import { LoginPage, SetupPasswordPage } from "@/components/erp/auth-pages";
import { ShippingLoader } from "@/components/erp/shipping-loader";

function PlaceholderModule({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border text-muted-foreground/60">
          <Icon className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
        </div>
        <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
      </div>
    </div>
  );
}

const moduleConfig = {
  dashboard: {
    component: DashboardModule,
    title: "Dashboard",
    description: "Overview of your import operations",
    icon: LayoutDashboard,
    section: "Overview",
  },
  shipments: {
    component: ShipmentsModule,
    title: "Shipments",
    description: "Track and manage all import shipments",
    icon: Ship,
    section: "Operations",
  },
  containers: {
    component: ContainersModule,
    title: "Containers",
    description: "Manage container inventory and tracking",
    icon: Box,
    section: "Operations",
  },
  companies: {
    component: CompaniesModule,
    title: "Companies",
    description: "Manage importer and exporter companies",
    icon: Building2,
    section: "Operations",
  },
  documents: {
    component: DocumentsModule,
    title: "Documents",
    description: "Import document management",
    icon: FolderOpen,
    section: "Operations",
  },
  notifications: {
    component: NotificationsModule,
    title: "Notifications",
    description: "Alerts and notification center",
    icon: Bell,
    section: "System",
  },
  reports: {
    component: ReportsModule,
    title: "Reports",
    description: "Analytics and reporting",
    icon: BarChart3,
    section: "System",
  },
  admin: {
    component: AdminModule,
    title: "Settings",
    description: "System administration and settings",
    icon: Settings,
    section: "System",
  },
};

function PermissionBoundary({ module, children }) {
  const canEdit = useERPStore((state) => state.canEdit(module));
  const canAction = useERPStore((state) => state.canAction);

  const actionFromLabel = (label, submitType = false) =>
    /\b(delete|remove)\b/i.test(label)
      ? "delete"
      : /\b(upload)\b/i.test(label)
      ? "upload"
      : /\b(import)\b/i.test(label)
      ? "import"
      : /\b(export|download|print)\b/i.test(label)
      ? "export"
      : /\b(verify|reject)\b/i.test(label)
      ? "verify"
      : /\b(edit|save|update|send|mark|toggle)\b/i.test(label)
      ? "update"
      : submitType || /\b(add|new|create)\b/i.test(label)
      ? "create"
      : null;

  const blockWriteAction = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const label = `${button.textContent || ""} ${button.title || ""} ${
      button.getAttribute("aria-label") || ""
    }`;
    const action = actionFromLabel(label, button.type === "submit");
    if (action && !canAction(module, action)) {
      event.preventDefault();
      event.stopPropagation();
      window.alert(`You do not have ${action} permission for this module.`);
    }
  };

  return (
    <div
      onClickCapture={blockWriteAction}
      onSubmitCapture={(event) => {
        const submitter = event.nativeEvent?.submitter;
        const label = submitter
          ? `${submitter.textContent || ""} ${submitter.title || ""} ${
              submitter.getAttribute?.("aria-label") || ""
            }`
          : "";
        const action = actionFromLabel(label, true);
        if (!canEdit || !canAction(module, action)) {
          event.preventDefault();
          event.stopPropagation();
          window.alert(`You do not have ${action} permission for this module.`);
        }
      }}
    >
      {!canEdit && (
        <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-warning/20 bg-warning/8 px-4 py-2.5 text-sm text-warning shadow-xs">
          <Eye className="h-4 w-4 shrink-0" />
          <span>
            View-only access — you can review this module but cannot create, edit, or delete records.
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

function HomeContent() {
  const { activeModule, sidebarOpen, setSidebarOpen, setActiveModule, token, canView, user } =
    useERPStore();
  const params = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const routeModule = params?.module
    ? Array.isArray(params.module)
      ? params.module[0]
      : params.module
    : "dashboard";

  useEffect(() => {
    if (routeModule && moduleConfig[routeModule] && activeModule !== routeModule) {
      setActiveModule(routeModule);
    }
  }, [routeModule, activeModule, setActiveModule]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, setSidebarOpen]);

  useEffect(() => {
    if (!token || !user || routeModule === "login" || routeModule === "setup-password") return;
    if (!moduleConfig[routeModule] || !canView(routeModule)) {
      const firstAllowed = Object.keys(moduleConfig).find((m) => canView(m));
      router.replace(firstAllowed ? `/${firstAllowed}` : "/login");
    }
  }, [token, user, routeModule, canView, router]);

  if (routeModule === "login") return <LoginPage />;
  if (routeModule === "setup-password") return <SetupPasswordPage />;
  if (!token || !user || !canView(routeModule))
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Checking access...
      </div>
    );

  const currentModule = moduleConfig[activeModule];
  const CurrentComponent = currentModule.component;
  const ModuleIcon = currentModule.icon;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-[100svh] overflow-hidden bg-background text-foreground">
        {isMobile && sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <ERPSidebar />
        <main
          className="min-w-0 flex flex-1 flex-col overflow-hidden"
          style={{ marginLeft: isMobile ? 0 : sidebarOpen ? 220 : 72 }}
        >
          <ERPHeader />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  <PermissionBoundary module={activeModule}>
                    <CurrentComponent />
                  </PermissionBoundary>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
        <CommandPalette />
      </div>
    </TooltipProvider>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <ShippingLoader className="h-screen" label="Preparing cargo workspace" />
      }
    >
      <AuthGate>
        <HomeContent />
      </AuthGate>
    </Suspense>
  );
}
