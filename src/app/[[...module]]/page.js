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
import { ERPSidebar } from "@/components/erp/sidebar";
import { ERPHeader } from "@/components/erp/header";
import { CommandPalette } from "@/components/erp/command-palette";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";

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
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal/20 to-teal/5 ring-1 ring-teal/20 text-teal shadow-lg">
          <Icon className="h-8 w-8" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
        </div>
        <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
      </motion.div>
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
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="mb-4 flex items-center gap-2.5 rounded-xl border border-amber/30 bg-amber/10 px-4 py-2.5 text-sm text-amber-dark shadow-sm backdrop-blur dark:border-amber/25 dark:bg-amber/[0.08] dark:text-amber-light"
        >
          <Eye className="h-4 w-4 shrink-0" />
          <span>
            View-only access — you can review this module but cannot create, edit, or delete records.
          </span>
        </motion.div>
      )}
      {children}
    </div>
  );
}

function HomeContent() {
  const { activeModule, sidebarOpen, setActiveModule, token, canView, user } =
    useERPStore();
  const params = useParams();
  const router = useRouter();
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
      <div className="erp-shell flex h-screen overflow-hidden text-foreground">
        <ERPSidebar />
        <motion.main
          initial={false}
          animate={{ marginLeft: sidebarOpen ? 264 : 72 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <ERPHeader />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-[1680px] mx-auto p-4 sm:p-5 lg:p-7">
              {/* Module hero */}
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="mb-6 flex items-center gap-4 rounded-lg border border-border/70 bg-card/82 p-4 sm:p-5 shadow-enterprise-md backdrop-blur-xl dark:border-white/[0.07] dark:bg-card/72"
              >
                <motion.div
                  initial={{ scale: 0.9, rotate: -6 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal/12 text-teal ring-1 ring-teal/25 shadow-sm"
                >
                  <ModuleIcon className="h-6 w-6" strokeWidth={2} />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {currentModule.title}
                  </h1>
                  <p className="mt-0.5 text-sm text-muted-foreground truncate">
                    {currentModule.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex border-teal/25 bg-teal/8 text-teal text-[10px] uppercase tracking-widest font-semibold"
                >
                  {currentModule.section}
                </Badge>
              </motion.div>

              {/* Module content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                >
                  <PermissionBoundary module={activeModule}>
                    <CurrentComponent />
                  </PermissionBoundary>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.main>
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
