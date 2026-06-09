'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ship, Box, Shield, DollarSign, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, Activity, MapPin, Anchor, FileText, Truck, Globe, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { API_BASE_URL, cn } from '@/lib/utils';
import { format } from 'date-fns';
// ─── Helpers ──────────────────────────────────────────────────────────────────
const currencyFmt = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
const compactCurrency = (val) => {
    if (val >= 1000000)
        return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000)
        return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
};
const statusLabelMap = {
    draft: 'Draft',
    booking_confirmed: 'Booking Confirmed',
    at_pol: 'At POL',
    vessel_departed: 'Vessel Departed',
    in_transit: 'In Transit',
    at_pod: 'At POD',
    customs_clearance: 'Customs Clearance',
    duty_paid: 'Duty Paid',
    in_transport: 'In Transport',
    offloaded: 'Offloaded',
    delivered: 'Delivered',
    closed: 'Closed',
};
const statusColorMap = {
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    booking_confirmed: 'bg-teal/10 text-teal dark:bg-teal/20',
    at_pol: 'bg-amber/10 text-amber-dark dark:bg-amber/20',
    vessel_departed: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    in_transit: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    at_pod: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    customs_clearance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    duty_paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    in_transport: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    offloaded: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
const containerStatusColorMap = {
    at_pol: '#f59e0b',
    loaded: '#0d9488',
    in_transit: '#0ea5e9',
    at_pod: '#8b5cf6',
    customs: '#f97316',
    transport: '#ec4899',
    offloaded: '#f43f5e',
    delivered: '#22c55e',
};
const emptyDashboardData = {
    shipments: {
        total: 0,
        active: 0,
        inTransit: 0,
        customsClearance: 0,
        deliveredThisMonth: 0,
        byStatus: [],
        byPriority: [],
        totalValue: 0,
        monthlyTrend: [],
        byShippingLine: [],
        byOriginCountry: [],
    },
    financials: {
        totalExpenses: 0,
        totalExpensesBase: 0,
        expensesByCategory: [],
        expensesByPaymentStatus: [],
        pendingPayments: 0,
        overduePayments: 0,
        overdueCount: 0,
        totalInvoiceAmount: 0,
        totalPaidAmount: 0,
        invoicesByStatus: [],
        totalDutyAmount: 0,
        totalAssessmentValue: 0,
    },
    containers: {
        total: 0,
        byStatus: [],
        byType: [],
        bySize: [],
    },
    companies: {
        total: 0,
        topByValue: [],
    },
    products: { total: 0 },
    invoices: { total: 0 },
    documents: { total: 0, verified: 0, byType: [] },
    customs: { total: 0, byStatus: [] },
    logistics: { total: 0, byStatus: [] },
    notifications: { total: 0, unread: 0 },
    recentShipments: [],
    recentActivities: [],
};
const normalizeDashboardData = (payload) => {
    var _a, _b;
    return (Object.assign(Object.assign(Object.assign({}, emptyDashboardData), payload), { shipments: Object.assign(Object.assign({}, emptyDashboardData.shipments), payload.shipments), financials: Object.assign(Object.assign({}, emptyDashboardData.financials), payload.financials), containers: Object.assign(Object.assign({}, emptyDashboardData.containers), payload.containers), companies: Object.assign(Object.assign({}, emptyDashboardData.companies), payload.companies), products: Object.assign(Object.assign({}, emptyDashboardData.products), payload.products), invoices: Object.assign(Object.assign({}, emptyDashboardData.invoices), payload.invoices), documents: Object.assign(Object.assign({}, emptyDashboardData.documents), payload.documents), customs: Object.assign(Object.assign({}, emptyDashboardData.customs), payload.customs), logistics: Object.assign(Object.assign({}, emptyDashboardData.logistics), payload.logistics), notifications: Object.assign(Object.assign({}, emptyDashboardData.notifications), payload.notifications), recentShipments: (_a = payload.recentShipments) !== null && _a !== void 0 ? _a : [], recentActivities: (_b = payload.recentActivities) !== null && _b !== void 0 ? _b : [] }));
};
// ─── Animation Variants ──────────────────────────────────────────────────────
const stagger = {
    animate: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};
// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ title, value, icon: Icon, color, bgColor, trend, trendValue, subtitle, }) {
    return (_jsx(motion.div, { variants: fadeUp, children: _jsx(Card, { className: "glass hover-lift border-0 shadow-enterprise", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider", children: title }), _jsx("p", { className: "text-2xl font-bold tracking-tight", children: value })] }), _jsx("div", { className: cn('rounded-xl p-2.5', bgColor), children: _jsx(Icon, { className: cn('h-5 w-5', color) }) })] }), (trend || subtitle) && (_jsxs("div", { className: "flex items-center gap-1.5 mt-2.5", children: [trend && (_jsxs(_Fragment, { children: [trend === 'up' ? (_jsx(ArrowUpRight, { className: "h-3.5 w-3.5 text-emerald-500" })) : (_jsx(ArrowDownRight, { className: "h-3.5 w-3.5 text-red-500" })), _jsx("span", { className: cn('text-xs font-semibold', trend === 'up' ? 'text-emerald-500' : 'text-red-500'), children: trendValue })] })), subtitle && _jsx("span", { className: "text-[11px] text-muted-foreground", children: subtitle })] }))] }) }) }));
}
// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function DashboardModule() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let isMounted = true;
        fetch(`${API_BASE_URL}/api/dashboard`)
            .then(async (response) => {
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error((payload === null || payload === void 0 ? void 0 : payload.error) || 'Failed to fetch dashboard data');
            }
            if (!payload || typeof payload !== 'object' || !('shipments' in payload)) {
                throw new Error('Dashboard response is missing shipment data');
            }
            return normalizeDashboardData(payload);
        })
            .then((dashboardData) => {
            if (!isMounted)
                return;
            setData(dashboardData);
            setError(null);
        })
            .catch((err) => {
            if (!isMounted)
                return;
            console.error('Dashboard fetch error:', err);
            setData(null);
            setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        })
            .finally(() => {
            if (isMounted)
                setLoading(false);
        });
        return () => {
            isMounted = false;
        };
    }, []);
    if (loading) {
        return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: Array.from({ length: 12 }).map((_, i) => (_jsx(Card, { className: "glass border-0 shadow-enterprise animate-pulse", children: _jsxs(CardContent, { className: "p-4 h-28", children: [_jsx("div", { className: "h-3 bg-muted rounded w-2/3 mb-3" }), _jsx("div", { className: "h-7 bg-muted rounded w-1/2 mb-2" }), _jsx("div", { className: "h-2.5 bg-muted rounded w-1/3" })] }) }, i))) }));
    }
    if (error || !data) {
        return (_jsx(Card, { className: "glass border-0 shadow-enterprise", children: _jsxs(CardContent, { className: "flex items-start gap-3 p-5", children: [_jsx("div", { className: "rounded-xl bg-red-100 p-2.5 dark:bg-red-900/30", children: _jsx(AlertTriangle, { className: "h-5 w-5 text-red-500" }) }), _jsxs("div", { className: "space-y-1", children: [_jsx("h3", { className: "text-sm font-semibold", children: "Unable to load dashboard" }), _jsx("p", { className: "text-sm text-muted-foreground", children: error || 'The dashboard API returned an unexpected response.' })] })] }) }));
    }
    const { shipments, financials, containers, companies, recentShipments, recentActivities } = data;
    // Shipment KPI data
    const getStatusCount = (status) => { var _a, _b; return (_b = (_a = shipments.byStatus.find((s) => s.status === status)) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0; };
    const shipmentKPIs = [
        { title: 'Total Shipments', value: shipments.total, icon: Ship, color: 'text-teal', bgColor: 'bg-teal/10', trend: 'up', trendValue: '+12%', subtitle: 'vs last month' },
        { title: 'Active Shipments', value: shipments.active, icon: Anchor, color: 'text-sky-600', bgColor: 'bg-sky-100 dark:bg-sky-900/30', trend: 'up', trendValue: '+8%', subtitle: 'vs last month' },
        { title: 'Containers In Transit', value: containers.byStatus.filter(s => s.status === 'in_transit').reduce((a, s) => a + s.count, 0), icon: Box, color: 'text-amber-dark', bgColor: 'bg-amber/10', trend: 'up', trendValue: '+5%', subtitle: 'in progress' },
        { title: 'At POL', value: getStatusCount('at_pol'), icon: MapPin, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30', subtitle: 'awaiting departure' },
        { title: 'At POD', value: getStatusCount('at_pod'), icon: Anchor, color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-900/30', subtitle: 'awaiting clearance' },
        { title: 'Under Customs', value: shipments.customsClearance, icon: Shield, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30', subtitle: 'clearance pending' },
        { title: 'In Transport', value: getStatusCount('in_transport'), icon: Truck, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30', subtitle: 'last mile' },
        { title: 'Delivered', value: shipments.deliveredThisMonth, icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', trend: 'up', trendValue: '+15%', subtitle: 'this month' },
    ];
    // Financial KPI data
    const financialKPIs = [
        { title: 'Total Import Value', value: compactCurrency(shipments.totalValue), icon: Globe, color: 'text-teal', bgColor: 'bg-teal/10' },
        { title: 'Total Invoice Value', value: compactCurrency(financials.totalInvoiceAmount), icon: FileText, color: 'text-amber-dark', bgColor: 'bg-amber/10' },
        { title: 'Paid Amount', value: compactCurrency(financials.totalPaidAmount), icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', trend: 'up', trendValue: `${((financials.totalPaidAmount / (financials.totalInvoiceAmount || 1)) * 100).toFixed(0)}%`, subtitle: 'collected' },
        { title: 'Outstanding Balance', value: compactCurrency(financials.pendingPayments), icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    ];
    // Chart configs
    const trendChartConfig = {
        shipments: { label: 'Shipments', color: 'oklch(0.55 0.1 180)' },
        value: { label: 'Value (USD)', color: 'oklch(0.75 0.15 85)' },
    };
    const pieChartConfig = Object.fromEntries(shipments.byStatus.map((s) => [s.status, { label: statusLabelMap[s.status] || s.status }]));
    const barChartConfig = {
        count: { label: 'Containers' },
    };
    // Activity icon map
    const activityIconMap = {
        shipment: Ship,
        container: Box,
        customs: Shield,
        invoice: FileText,
        document: FileText,
        payment: DollarSign,
        transport: Truck,
        default: Activity,
    };
    const getActivityIcon = (entity) => activityIconMap[entity] || activityIconMap.default;
    const activityColorMap = {
        created: 'text-teal',
        updated: 'text-amber',
        deleted: 'text-red-500',
        approved: 'text-emerald-500',
        completed: 'text-emerald-600',
        default: 'text-muted-foreground',
    };
    const getActivityColor = (action) => {
        const lower = action.toLowerCase();
        if (lower.includes('creat'))
            return activityColorMap.created;
        if (lower.includes('updat'))
            return activityColorMap.updated;
        if (lower.includes('delet'))
            return activityColorMap.deleted;
        if (lower.includes('approv'))
            return activityColorMap.approved;
        if (lower.includes('complet') || lower.includes('deliver'))
            return activityColorMap.completed;
        return activityColorMap.default;
    };
    // Donut chart colors
    const PIE_COLORS = [
        'oklch(0.55 0.1 180)', // teal
        'oklch(0.75 0.15 85)', // amber
        'oklch(0.6 0.15 150)', // emerald
        'oklch(0.6 0.2 30)', // orange
        'oklch(0.65 0.18 280)', // violet
        'oklch(0.7 0.15 200)', // cyan
        'oklch(0.6 0.15 250)', // blue
        'oklch(0.65 0.2 350)', // rose
        'oklch(0.7 0.12 60)', // yellow
        'oklch(0.55 0.1 160)', // teal-dark
        'oklch(0.7 0.1 150)', // green
        'oklch(0.5 0.05 260)', // gray
    ];
    return (_jsxs(motion.div, { variants: stagger, initial: "initial", animate: "animate", className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider", children: "Shipment Overview" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: shipmentKPIs.map((kpi) => (_jsx(KPICard, Object.assign({}, kpi), kpi.title))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider", children: "Financial Overview" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: financialKPIs.map((kpi) => (_jsx(KPICard, Object.assign({}, kpi), kpi.title))) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx(motion.div, { variants: fadeUp, className: "lg:col-span-2", children: _jsxs(Card, { className: "glass border-0 shadow-enterprise", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Monthly Import Trend" }), _jsx(CardDescription, { className: "text-xs", children: "Shipment count and value over 6 months" })] }), _jsx(CardContent, { className: "pt-0", children: _jsx(ChartContainer, { config: trendChartConfig, className: "h-[280px] w-full", children: _jsxs(AreaChart, { data: shipments.monthlyTrend, margin: { top: 10, right: 10, left: 0, bottom: 0 }, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "fillShipments", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "oklch(0.55 0.1 180)", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "oklch(0.55 0.1 180)", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "fillValue", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "oklch(0.75 0.15 85)", stopOpacity: 0.2 }), _jsx("stop", { offset: "95%", stopColor: "oklch(0.75 0.15 85)", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", opacity: 0.3 }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 }, stroke: "var(--muted-foreground)" }), _jsx(YAxis, { tick: { fontSize: 11 }, stroke: "var(--muted-foreground)" }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, {}) }), _jsx(Area, { type: "monotone", dataKey: "shipments", stroke: "oklch(0.55 0.1 180)", fill: "url(#fillShipments)", strokeWidth: 2, name: "Shipments" }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: "oklch(0.75 0.15 85)", fill: "url(#fillValue)", strokeWidth: 2, name: "Value" })] }) }) })] }) }), _jsx(motion.div, { variants: fadeUp, children: _jsxs(Card, { className: "glass border-0 shadow-enterprise h-full", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Status Distribution" }), _jsx(CardDescription, { className: "text-xs", children: "Shipments by current status" })] }), _jsx(CardContent, { className: "pt-0", children: _jsx(ChartContainer, { config: pieChartConfig, className: "h-[280px] w-full", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: shipments.byStatus.map((s) => ({
                                                        name: statusLabelMap[s.status] || s.status,
                                                        value: s.count,
                                                        status: s.status,
                                                    })), cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 90, paddingAngle: 2, dataKey: "value", children: shipments.byStatus.map((_entry, index) => (_jsx(Cell, { fill: PIE_COLORS[index % PIE_COLORS.length] }, `cell-${index}`))) }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { nameKey: "name" }) })] }) }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx(motion.div, { variants: fadeUp, children: _jsxs(Card, { className: "glass border-0 shadow-enterprise h-full", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Container Status" }), _jsxs(CardDescription, { className: "text-xs", children: [containers.total, " total containers"] })] }), _jsx(CardContent, { className: "pt-0", children: _jsx(ChartContainer, { config: barChartConfig, className: "h-[220px] w-full", children: _jsxs(BarChart, { data: containers.byStatus.map((s) => ({
                                                name: (statusLabelMap[s.status] || s.status).replace(/([A-Z])/g, ' $1').trim(),
                                                count: s.count,
                                                fill: containerStatusColorMap[s.status] || 'oklch(0.5 0.1 180)',
                                            })), margin: { top: 5, right: 5, left: -10, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", opacity: 0.3 }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: 10 }, stroke: "var(--muted-foreground)" }), _jsx(YAxis, { tick: { fontSize: 10 }, stroke: "var(--muted-foreground)" }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, {}) }), _jsx(Bar, { dataKey: "count", radius: [4, 4, 0, 0] })] }) }) })] }) }), _jsx(motion.div, { variants: fadeUp, children: _jsxs(Card, { className: "glass border-0 shadow-enterprise h-full", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Top Origin Countries" }), _jsx(CardDescription, { className: "text-xs", children: "By shipment volume" })] }), _jsx(CardContent, { className: "pt-0 space-y-3 max-h-[260px] overflow-y-auto custom-scrollbar", children: shipments.byOriginCountry.slice(0, 6).map((country, i) => {
                                        var _a;
                                        const maxCount = ((_a = shipments.byOriginCountry[0]) === null || _a === void 0 ? void 0 : _a.count) || 1;
                                        return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xs font-bold text-muted-foreground w-5 text-right", children: i + 1 }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-sm font-medium truncate", children: country.country || 'Unknown' }), _jsxs("span", { className: "text-xs text-muted-foreground ml-2", children: [country.count, " shipments"] })] }), _jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${(country.count / maxCount) * 100}%` }, transition: { delay: 0.3 + i * 0.1, duration: 0.6 }, className: "h-full rounded-full bg-teal" }) })] })] }, country.country || i));
                                    }) })] }) }), _jsx(motion.div, { variants: fadeUp, children: _jsxs(Card, { className: "glass border-0 shadow-enterprise h-full", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Destination Ports" }), _jsx(CardDescription, { className: "text-xs", children: "Port activity metrics" })] }), _jsx(CardContent, { className: "pt-0 space-y-3", children: ['Nhava Sheva', 'Mundra', 'Chennai', 'Kolkata'].map((port, i) => {
                                        const throughput = Math.floor(Math.random() * 50) + 10;
                                        const avgClearance = Math.floor(Math.random() * 3) + 1;
                                        return (_jsxs("div", { className: "flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 shrink-0", children: _jsx(Anchor, { className: "h-4 w-4 text-teal" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium", children: port }), _jsxs("p", { className: "text-[11px] text-muted-foreground", children: [throughput, " containers \u00B7 ", avgClearance, "d avg clearance"] })] }), _jsx(Badge, { variant: "outline", className: "text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800", children: "Active" })] }, port));
                                    }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx(motion.div, { variants: fadeUp, className: "lg:col-span-2", children: _jsxs(Card, { className: "glass border-0 shadow-enterprise", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Recent Shipments" }), _jsx(CardDescription, { className: "text-xs mt-0.5", children: "Latest shipment activities" })] }), _jsxs(Badge, { variant: "secondary", className: "text-[10px]", children: [shipments.total, " total"] })] }) }), _jsx(CardContent, { className: "p-0", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border", children: [_jsx("th", { className: "px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Shipment" }), _jsx("th", { className: "px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Route" }), _jsx("th", { className: "px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell", children: "ETA" }), _jsx("th", { className: "px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Value" })] }) }), _jsx("tbody", { children: recentShipments.slice(0, 6).map((shipment, i) => (_jsxs(motion.tr, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.2 + i * 0.05, duration: 0.3 }, className: "border-b border-border/50 hover:bg-accent/30 transition-colors", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10", children: _jsx(Ship, { className: "h-4 w-4 text-teal" }) }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: shipment.shipmentNumber }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: shipment.shippingLine || '—' })] })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("p", { className: "text-sm text-muted-foreground", children: [shipment.originCountry || '—', " \u2192 ", shipment.destinationPort || '—'] }) }), _jsx("td", { className: "px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell", children: shipment.eta ? format(new Date(shipment.eta), 'MMM d') : '—' }), _jsx("td", { className: "px-4 py-3", children: _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', statusColorMap[shipment.status] || 'bg-gray-100 text-gray-600'), children: statusLabelMap[shipment.status] || shipment.status }) }), _jsx("td", { className: "px-4 py-3 text-right text-sm font-medium", children: compactCurrency(shipment.shipmentValue) })] }, shipment.id))) })] }) }) })] }) }), _jsx(motion.div, { variants: fadeUp, children: _jsxs(Card, { className: "glass border-0 shadow-enterprise h-full", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Activity Feed" }), _jsx(CardDescription, { className: "text-xs mt-0.5", children: "Recent system events" })] }), _jsxs(Badge, { variant: "secondary", className: "text-[10px]", children: [data.notifications.unread, " new"] })] }) }), _jsx(CardContent, { className: "p-0 max-h-[340px] overflow-y-auto custom-scrollbar", children: _jsx("div", { className: "divide-y divide-border", children: recentActivities.map((activity, i) => {
                                            var _a;
                                            const Icon = getActivityIcon(activity.entity);
                                            const color = getActivityColor(activity.action);
                                            return (_jsxs(motion.div, { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.3 + i * 0.04, duration: 0.25 }, className: "flex items-start gap-3 px-4 py-3", children: [_jsx(Icon, { className: cn('h-4 w-4 mt-0.5 shrink-0', color) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("p", { className: "text-xs leading-relaxed", children: [activity.action, " ", activity.entity, activity.details ? ` — ${activity.details}` : ''] }), _jsxs("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: [((_a = activity.user) === null || _a === void 0 ? void 0 : _a.name) || 'System', " \u00B7 ", format(new Date(activity.createdAt), 'MMM d, h:mm a')] })] })] }, activity.id));
                                        }) }) })] }) })] }), _jsx(motion.div, { variants: fadeUp, children: _jsxs(Card, { className: "glass border-0 shadow-enterprise", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Top Companies by Value" }), _jsx(CardDescription, { className: "text-xs mt-0.5", children: "Highest import value partners" })] }), _jsx(CardContent, { className: "pt-0", children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", children: companies.topByValue.map((company, i) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.4 + i * 0.06, duration: 0.3 }, className: "p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/20 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 text-teal font-bold text-sm", children: i + 1 }), _jsx("span", { className: "text-sm font-medium truncate", children: company.companyName })] }), _jsx("p", { className: "text-lg font-bold text-teal", children: compactCurrency(company.totalValue) }), _jsxs("p", { className: "text-[11px] text-muted-foreground", children: [company.shipmentCount, " shipments"] })] }, company.companyId || i))) }) })] }) })] }));
}
