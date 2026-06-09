import { create } from "zustand";

export type ERPModule =
  | "dashboard"
  | "shipments"
  | "containers"
  | "companies"
  | "documents"
  | "customs"
  | "logistics"
  | "notifications"
  | "reports"
  | "admin";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  timestamp: Date;
  module?: ERPModule;
}

export interface ShipmentFilter {
  status: string;
  origin: string;
  destination: string;
  dateRange: { from: Date | null; to: Date | null };
}

export interface ContainerFilter {
  status: string;
  type: string;
  port: string;
}

export interface CompanyFilter {
  type: string;
  country: string;
  status: string;
}

export interface ProductFilter {
  category: string;
  origin: string;
  status: string;
}

interface ERPStore {
  // Navigation
  activeModule: ERPModule;
  setActiveModule: (module: ERPModule) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Command Palette
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  unreadCount: () => number;

  // Module Filters
  shipmentFilter: ShipmentFilter;
  setShipmentFilter: (filter: Partial<ShipmentFilter>) => void;
  resetShipmentFilter: () => void;

  containerFilter: ContainerFilter;
  setContainerFilter: (filter: Partial<ContainerFilter>) => void;
  resetContainerFilter: () => void;

  companyFilter: CompanyFilter;
  setCompanyFilter: (filter: Partial<CompanyFilter>) => void;
  resetCompanyFilter: () => void;

  productFilter: ProductFilter;
  setProductFilter: (filter: Partial<ProductFilter>) => void;
  resetProductFilter: () => void;
}

const defaultShipmentFilter: ShipmentFilter = {
  status: "all",
  origin: "",
  destination: "",
  dateRange: { from: null, to: null },
};

const defaultContainerFilter: ContainerFilter = {
  status: "all",
  type: "all",
  port: "",
};

const defaultCompanyFilter: CompanyFilter = {
  type: "all",
  country: "",
  status: "all",
};

const defaultProductFilter: ProductFilter = {
  category: "all",
  origin: "",
  status: "all",
};

export const useERPStore = create<ERPStore>((set, get) => ({
  // Navigation
  activeModule: "dashboard",
  setActiveModule: (module) => set({ activeModule: module }),

  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Theme
  theme: "system",
  setTheme: (theme) => set({ theme }),

  // Command Palette
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  // Notifications
  notifications: [
    {
      id: "1",
      title: "Shipment Arrived",
      message: "Container SH-2024-0892 has arrived at Shanghai port",
      type: "success",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      module: "shipments",
    },
    {
      id: "2",
      title: "Customs Hold",
      message: "Container CT-2024-0156 is under customs review",
      type: "warning",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      module: "customs",
    },
    {
      id: "4",
      title: "New Document",
      message: "Bill of Lading uploaded for shipment SH-2024-0890",
      type: "info",
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      module: "documents",
    },
  ],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
        ...state.notifications,
      ],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  clearNotifications: () => set({ notifications: [] }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  // Module Filters
  shipmentFilter: defaultShipmentFilter,
  setShipmentFilter: (filter) =>
    set((state) => ({
      shipmentFilter: { ...state.shipmentFilter, ...filter },
    })),
  resetShipmentFilter: () => set({ shipmentFilter: defaultShipmentFilter }),

  containerFilter: defaultContainerFilter,
  setContainerFilter: (filter) =>
    set((state) => ({
      containerFilter: { ...state.containerFilter, ...filter },
    })),
  resetContainerFilter: () => set({ containerFilter: defaultContainerFilter }),

  companyFilter: defaultCompanyFilter,
  setCompanyFilter: (filter) =>
    set((state) => ({
      companyFilter: { ...state.companyFilter, ...filter },
    })),
  resetCompanyFilter: () => set({ companyFilter: defaultCompanyFilter }),

  productFilter: defaultProductFilter,
  setProductFilter: (filter) =>
    set((state) => ({
      productFilter: { ...state.productFilter, ...filter },
    })),
  resetProductFilter: () => set({ productFilter: defaultProductFilter }),
}));
