import { create } from "zustand";
const defaultShipmentFilter = {
    status: "all",
    origin: "",
    destination: "",
    dateRange: { from: null, to: null },
};
const defaultContainerFilter = {
    status: "all",
    type: "all",
    port: "",
};
const defaultCompanyFilter = {
    type: "all",
    country: "",
    status: "all",
};
const defaultProductFilter = {
    category: "all",
    origin: "",
    status: "all",
};
export const useERPStore = create((set, get) => ({
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
    addNotification: (notification) => set((state) => ({
        notifications: [
            Object.assign(Object.assign({}, notification), { id: crypto.randomUUID(), timestamp: new Date() }),
            ...state.notifications,
        ],
    })),
    markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? Object.assign(Object.assign({}, n), { read: true }) : n),
    })),
    markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => (Object.assign(Object.assign({}, n), { read: true }))),
    })),
    clearNotifications: () => set({ notifications: [] }),
    unreadCount: () => get().notifications.filter((n) => !n.read).length,
    // Module Filters
    shipmentFilter: defaultShipmentFilter,
    setShipmentFilter: (filter) => set((state) => ({
        shipmentFilter: Object.assign(Object.assign({}, state.shipmentFilter), filter),
    })),
    resetShipmentFilter: () => set({ shipmentFilter: defaultShipmentFilter }),
    containerFilter: defaultContainerFilter,
    setContainerFilter: (filter) => set((state) => ({
        containerFilter: Object.assign(Object.assign({}, state.containerFilter), filter),
    })),
    resetContainerFilter: () => set({ containerFilter: defaultContainerFilter }),
    companyFilter: defaultCompanyFilter,
    setCompanyFilter: (filter) => set((state) => ({
        companyFilter: Object.assign(Object.assign({}, state.companyFilter), filter),
    })),
    resetCompanyFilter: () => set({ companyFilter: defaultCompanyFilter }),
    productFilter: defaultProductFilter,
    setProductFilter: (filter) => set((state) => ({
        productFilter: Object.assign(Object.assign({}, state.productFilter), filter),
    })),
    resetProductFilter: () => set({ productFilter: defaultProductFilter }),
}));
