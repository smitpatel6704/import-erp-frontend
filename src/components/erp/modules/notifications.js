'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Info, AlertTriangle, AlertCircle, CheckCircle2, Ship, DollarSign, Shield, FolderOpen, Settings, Eye, Trash2, CheckCheck, Filter, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { cn, API_BASE_URL } from '@/lib/utils';
import { formatDistanceToNow, isToday, isYesterday, subDays, isAfter } from 'date-fns';
const typeColors = {
    info: { bg: 'bg-teal/10', text: 'text-teal', icon: Info },
    warning: { bg: 'bg-amber/10', text: 'text-amber', icon: AlertTriangle },
    error: { bg: 'bg-red-500/10', text: 'text-red-500', icon: AlertCircle },
    success: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle2 },
};
const categoryIcons = {
    shipment: Ship,
    payment: DollarSign,
    customs: Shield,
    document: FolderOpen,
    system: Settings,
};
function formatCategory(cat) {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
export function NotificationsModule() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ limit: '100' });
            if (filterType !== 'all')
                params.set('type', filterType);
            if (filterCategory !== 'all')
                params.set('category', filterCategory);
            const res = await fetch(`/api/notifications?${params}`);
            const json = await res.json();
            if (json.data) {
                setNotifications(json.data);
            }
        }
        catch (_a) {
            // silent
        }
        finally {
            setLoading(false);
        }
    }, [filterType, filterCategory]);
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);
    const handleMarkRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true }),
            });
            setNotifications((prev) => prev.map((n) => (n.id === id ? Object.assign(Object.assign({}, n), { isRead: true }) : n)));
        }
        catch (_a) {
            // silent
        }
    };
    const handleMarkAllRead = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/notifications`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true }),
            });
            setNotifications((prev) => prev.map((n) => (Object.assign(Object.assign({}, n), { isRead: true }))));
        }
        catch (_a) {
            // silent
        }
    };
    const handleDismiss = async (id) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }
        catch (_a) {
            // silent
        }
    };
    const totalNotifications = notifications.length;
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const readCount = notifications.filter((n) => n.isRead).length;
    const criticalCount = notifications.filter((n) => n.type === 'error').length;
    const stats = [
        {
            title: 'Total Notifications',
            value: totalNotifications,
            icon: Bell,
            color: 'text-teal',
            bgColor: 'bg-teal/10',
        },
        {
            title: 'Unread',
            value: unreadCount,
            icon: BellOff,
            color: 'text-amber',
            bgColor: 'bg-amber/10',
        },
        {
            title: 'Read',
            value: readCount,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-500/10',
        },
        {
            title: 'Critical',
            value: criticalCount,
            icon: AlertCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
    ];
    // Group notifications by date
    const grouped = groupNotifications(notifications);
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.3 }, children: _jsx(Card, { className: "shadow-sm hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider", children: stat.title }), _jsx("p", { className: "text-2xl font-bold tracking-tight", children: stat.value })] }), _jsx("div", { className: cn('rounded-lg p-2', stat.bgColor), children: _jsx(stat.icon, { className: cn('h-4 w-4', stat.color) }) })] }) }) }) }, stat.title))) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3, duration: 0.3 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "h-4 w-4 text-muted-foreground" }), _jsx(CardTitle, { className: "text-base font-semibold", children: "Notifications" })] }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [_jsx(SelectTrigger, { className: "h-8 w-32 text-xs", children: _jsx(SelectValue, { placeholder: "Type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), _jsx(SelectItem, { value: "info", children: "Info" }), _jsx(SelectItem, { value: "warning", children: "Warning" }), _jsx(SelectItem, { value: "error", children: "Error" }), _jsx(SelectItem, { value: "success", children: "Success" })] })] }), _jsxs(Select, { value: filterCategory, onValueChange: setFilterCategory, children: [_jsx(SelectTrigger, { className: "h-8 w-36 text-xs", children: _jsx(SelectValue, { placeholder: "Category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), _jsx(SelectItem, { value: "shipment", children: "Shipment" }), _jsx(SelectItem, { value: "payment", children: "Payment" }), _jsx(SelectItem, { value: "customs", children: "Customs" }), _jsx(SelectItem, { value: "document", children: "Document" }), _jsx(SelectItem, { value: "system", children: "System" })] })] }), _jsxs(Button, { variant: "outline", size: "sm", className: "h-8 text-xs", onClick: handleMarkAllRead, disabled: unreadCount === 0, children: [_jsx(CheckCheck, { className: "h-3.5 w-3.5 mr-1" }), " Mark All Read"] })] })] }) }), _jsx(CardContent, { className: "p-0", children: _jsx(ScrollArea, { className: "max-h-[600px]", children: loading ? (_jsx("div", { className: "p-4 space-y-3", children: Array.from({ length: 6 }).map((_, i) => (_jsxs("div", { className: "flex items-start gap-3 p-3", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-muted animate-pulse" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 w-48 bg-muted animate-pulse rounded" }), _jsx("div", { className: "h-3 w-72 bg-muted animate-pulse rounded" })] })] }, i))) })) : notifications.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [_jsx(BellOff, { className: "h-10 w-10 text-muted-foreground mb-3" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No notifications found" })] })) : (Object.entries(grouped).map(([group, items]) => (_jsxs("div", { children: [_jsx("div", { className: "px-5 py-2 bg-muted/40 sticky top-0 z-10", children: _jsx("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: group }) }), _jsx(AnimatePresence, { children: items.map((notification, i) => {
                                                const typeConfig = typeColors[notification.type] || typeColors.info;
                                                const TypeIcon = typeConfig.icon;
                                                const CategoryIcon = categoryIcons[notification.category] || Settings;
                                                return (_jsxs(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 10, height: 0 }, transition: { delay: i * 0.03, duration: 0.2 }, className: cn('flex items-start gap-3 px-5 py-3.5 hover:bg-accent/30 transition-colors border-b border-border/50', !notification.isRead && 'bg-teal/[0.03]'), children: [_jsx("div", { className: cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', typeConfig.bg), children: _jsx(TypeIcon, { className: cn('h-4 w-4', typeConfig.text) }) }), _jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: cn('text-sm truncate', !notification.isRead ? 'font-semibold' : 'font-medium'), children: notification.title }), !notification.isRead && (_jsx("div", { className: "h-2 w-2 rounded-full bg-teal shrink-0" }))] }), _jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: notification.message }), _jsxs("div", { className: "flex items-center gap-2 mt-1.5", children: [_jsxs(Badge, { variant: "outline", className: "text-[9px] h-5 gap-1 px-1.5", children: [_jsx(CategoryIcon, { className: "h-2.5 w-2.5" }), formatCategory(notification.category)] }), _jsx("span", { className: "text-[10px] text-muted-foreground", children: formatDistanceToNow(new Date(notification.createdAt), {
                                                                                addSuffix: true,
                                                                            }) })] })] }), _jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [!notification.isRead && (_jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: () => handleMarkRead(notification.id), title: "Mark as read", children: _jsx(Eye, { className: "h-3.5 w-3.5 text-muted-foreground" }) })), _jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: () => handleDismiss(notification.id), title: "Dismiss", children: _jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground" }) })] })] }, notification.id));
                                            }) })] }, group)))) }) })] }) })] }));
}
function groupNotifications(notifications) {
    const groups = {};
    const now = new Date();
    const thisWeekStart = subDays(now, 7);
    notifications.forEach((n) => {
        const date = new Date(n.createdAt);
        let group;
        if (isToday(date)) {
            group = 'Today';
        }
        else if (isYesterday(date)) {
            group = 'Yesterday';
        }
        else if (isAfter(date, thisWeekStart)) {
            group = 'This Week';
        }
        else {
            group = 'Earlier';
        }
        if (!groups[group])
            groups[group] = [];
        groups[group].push(n);
    });
    const orderedGroups = {};
    const order = ['Today', 'Yesterday', 'This Week', 'Earlier'];
    order.forEach((key) => {
        if (groups[key])
            orderedGroups[key] = groups[key];
    });
    return orderedGroups;
}
