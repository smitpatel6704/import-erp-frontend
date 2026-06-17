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
const authStorage = () => typeof window === "undefined" ? null : window.sessionStorage;
const clearPersistentAuthStorage = () => {
    if (typeof window === "undefined")
        return;
    window.localStorage.removeItem("nexport_token");
    window.localStorage.removeItem("nexport_user");
};
export const useERPStore = create((set, get) => ({
    // Authentication
    user: null,
    token: null,
    authReady: false,
    setAuth: (user, token) => {
        const storage = authStorage();
        if (storage) {
            clearPersistentAuthStorage();
            storage.setItem("nexport_token", token);
            storage.setItem("nexport_user", JSON.stringify(user));
        }
        set({ user, token, authReady: true });
    },
    setCurrentUser: (user) => {
        const storage = authStorage();
        if (storage)
            storage.setItem("nexport_user", JSON.stringify(user));
        set({ user });
    },
    refreshCurrentUser: async () => {
        if (typeof window === "undefined" || !get().token)
            return null;
        const response = await window.fetch("/api/auth/me", {
            cache: "no-store",
        });
        if (!response.ok)
            return null;
        const json = await response.json();
        if (json.data)
            get().setCurrentUser(json.data);
        return json.data || null;
    },
    initializeAuth: () => {
        if (typeof window === "undefined")
            return;
        clearPersistentAuthStorage();
        const storage = authStorage();
        const token = storage?.getItem("nexport_token") || null;
        const storedUser = storage?.getItem("nexport_user") || null;
        let user = null;
        try {
            user = storedUser ? JSON.parse(storedUser) : null;
        }
        catch (_a) {
            user = null;
        }
        set({ token, user, authReady: true });
    },
    logout: () => {
        if (typeof window !== "undefined") {
            clearPersistentAuthStorage();
            sessionStorage.removeItem("nexport_token");
            sessionStorage.removeItem("nexport_user");
        }
        set({ user: null, token: null, authReady: true });
    },
    permissionFor: (module) => {
        const user = get().user;
        if (!user)
            return null;
        if (user.role === "admin" || user.role === "super_admin")
            return "edit";
        return (user.permissions || []).find((item) => item.module === module)?.access || null;
    },
    canView: (module) => Boolean(get().permissionFor(module)),
    canEdit: (module) => get().permissionFor(module) === "edit",
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
