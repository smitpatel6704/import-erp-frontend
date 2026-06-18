'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Search, Plus, Eye, Ship, Warehouse, Truck, Shield, Anchor, Package, CreditCard, Clock, AlertTriangle, CheckCircle2, X, Loader2, ArrowUpRight, ArrowDownRight, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, } from 'recharts';
import { format } from 'date-fns';
// ─── Constants ──────────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
    'freight',
    'customs_duty',
    'port_charges',
    'warehouse',
    'transport',
    'clearance',
    'insurance',
    'miscellaneous',
];
const CATEGORY_LABELS = {
    freight: 'Freight Charges',
    customs_duty: 'Customs Duty',
    port_charges: 'Port Charges',
    warehouse: 'Warehouse',
    transport: 'Transport',
    clearance: 'Clearance',
    insurance: 'Insurance',
    miscellaneous: 'Miscellaneous',
};
const CATEGORY_ICONS = {
    freight: Ship,
    customs_duty: Shield,
    port_charges: Anchor,
    warehouse: Warehouse,
    transport: Truck,
    clearance: Shield,
    insurance: Package,
    miscellaneous: DollarSign,
};
const PIE_COLORS = [
    '#0d9488', // teal
    '#d97706', // amber
    '#059669', // emerald
    '#ea580c', // orange
    '#6366f1', // indigo
    '#ec4899', // pink
    '#8b5cf6', // violet
    '#64748b', // slate
];
const PAYMENT_STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        color: 'text-amber-700',
        bgColor: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    },
    paid: {
        label: 'Paid',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
    },
    partial: {
        label: 'Partial',
        color: 'text-teal-700',
        bgColor: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800',
    },
    overdue: {
        label: 'Overdue',
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
    },
};
const formatCurrency = (value, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
// ─── Component ──────────────────────────────────────────────────────────
export function FinanceModule() {
    var _a, _b, _c;
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [newExpenseOpen, setNewExpenseOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newExpense, setNewExpense] = useState({
        category: 'freight',
        description: '',
        amount: '',
        currency: 'USD',
        vendorName: '',
        paymentStatus: 'pending',
        dueDate: '',
    });
    // Fetch expenses
    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', '1');
            params.set('limit', '100');
            if (search)
                params.set('search', search);
            if (filterCategory && filterCategory !== 'all')
                params.set('category', filterCategory);
            if (filterPaymentStatus && filterPaymentStatus !== 'all')
                params.set('paymentStatus', filterPaymentStatus);
            const res = await fetch(`/api/expenses?${params.toString()}`);
            const json = await res.json();
            setExpenses(json.data || []);
            setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
        }
        catch (err) {
            console.error('Failed to fetch expenses:', err);
        }
        finally {
            setLoading(false);
        }
    }, [search, filterCategory, filterPaymentStatus]);
    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);
    // KPI calculations
    const kpis = useMemo(() => {
        const total = expenses.reduce((sum, e) => sum + e.amountBase, 0);
        const freight = expenses
            .filter((e) => e.category === 'freight')
            .reduce((sum, e) => sum + e.amountBase, 0);
        const customs = expenses
            .filter((e) => e.category === 'customs_duty')
            .reduce((sum, e) => sum + e.amountBase, 0);
        const port = expenses
            .filter((e) => e.category === 'port_charges')
            .reduce((sum, e) => sum + e.amountBase, 0);
        const warehouse = expenses
            .filter((e) => e.category === 'warehouse')
            .reduce((sum, e) => sum + e.amountBase, 0);
        const transport = expenses
            .filter((e) => e.category === 'transport')
            .reduce((sum, e) => sum + e.amountBase, 0);
        return { total, freight, customs, port, warehouse, transport };
    }, [expenses]);
    // Payment status counts
    const paymentStatusCounts = useMemo(() => {
        const counts = {
            pending: { count: 0, amount: 0 },
            paid: { count: 0, amount: 0 },
            partial: { count: 0, amount: 0 },
            overdue: { count: 0, amount: 0 },
        };
        expenses.forEach((e) => {
            if (counts[e.paymentStatus]) {
                counts[e.paymentStatus].count++;
                counts[e.paymentStatus].amount += e.amountBase;
            }
        });
        return counts;
    }, [expenses]);
    // Pie chart data
    const pieData = useMemo(() => {
        const categoryTotals = {};
        expenses.forEach((e) => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amountBase;
        });
        return Object.entries(categoryTotals)
            .map(([name, value]) => ({
            name: CATEGORY_LABELS[name] || name,
            value: Math.round(value),
        }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);
    // Monthly trend data
    const monthlyTrend = useMemo(() => {
        const monthMap = {};
        expenses.forEach((e) => {
            const month = format(new Date(e.createdAt), 'MMM yyyy');
            monthMap[month] = (monthMap[month] || 0) + e.amountBase;
        });
        return Object.entries(monthMap)
            .map(([month, amount]) => ({ month, amount: Math.round(amount) }))
            .slice(-6);
    }, [expenses]);
    // Create new expense
    const handleCreateExpense = async () => {
        if (!newExpense.amount || !newExpense.category)
            return;
        setSubmitting(true);
        try {
            await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign(Object.assign({}, newExpense), { amount: parseFloat(newExpense.amount), exchangeRate: 1 })),
            });
            setNewExpenseOpen(false);
            setNewExpense({
                category: 'freight',
                description: '',
                amount: '',
                currency: 'USD',
                vendorName: '',
                paymentStatus: 'pending',
                dueDate: '',
            });
            fetchExpenses();
        }
        catch (err) {
            console.error('Failed to create expense:', err);
        }
        finally {
            setSubmitting(false);
        }
    };
    const kpiCards = [
        {
            title: 'Total Expenses',
            value: formatCurrency(kpis.total),
            icon: DollarSign,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50 dark:bg-teal-950/30',
            trend: '+12.5%',
            trendUp: true,
        },
        {
            title: 'Freight Charges',
            value: formatCurrency(kpis.freight),
            icon: Ship,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-950/30',
            trend: '+8.3%',
            trendUp: true,
        },
        {
            title: 'Customs Duty',
            value: formatCurrency(kpis.customs),
            icon: Shield,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
            trend: '-2.1%',
            trendUp: false,
        },
        {
            title: 'Port Charges',
            value: formatCurrency(kpis.port),
            icon: Anchor,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/30',
            trend: '+5.7%',
            trendUp: true,
        },
        {
            title: 'Warehouse Charges',
            value: formatCurrency(kpis.warehouse),
            icon: Warehouse,
            color: 'text-violet-600',
            bgColor: 'bg-violet-50 dark:bg-violet-950/30',
            trend: '-1.4%',
            trendUp: false,
        },
        {
            title: 'Transport Charges',
            value: formatCurrency(kpis.transport),
            icon: Truck,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50 dark:bg-rose-950/30',
            trend: '+3.2%',
            trendUp: true,
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: kpiCards.map((stat, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.3 }, children: _jsx(Card, { children: _jsxs(CardContent, { className: "p-5", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: stat.title }), _jsx("p", { className: "text-2xl font-bold tracking-tight", children: stat.value })] }), _jsx("div", { className: cn('rounded-lg p-2.5', stat.bgColor), children: _jsx(stat.icon, { className: cn('h-5 w-5', stat.color) }) })] }), _jsxs("div", { className: "flex items-center gap-1.5 mt-3", children: [stat.trendUp ? (_jsx(ArrowUpRight, { className: "h-3.5 w-3.5 text-emerald-500" })) : (_jsx(ArrowDownRight, { className: "h-3.5 w-3.5 text-red-500" })), _jsx("span", { className: cn('text-xs font-semibold', stat.trendUp ? 'text-emerald-500' : 'text-red-500'), children: stat.trend }), _jsx("span", { className: "text-xs text-muted-foreground", children: "vs last month" })] })] }) }) }, stat.title))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Expense Breakdown" }), _jsx(CardDescription, { className: "text-xs", children: "By category" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-[280px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: pieData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, paddingAngle: 3, dataKey: "value", children: pieData.map((_, index) => (_jsx(Cell, { fill: PIE_COLORS[index % PIE_COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => formatCurrency(value) }), _jsx(Legend, { layout: "vertical", align: "right", verticalAlign: "middle", iconType: "circle", iconSize: 8, wrapperStyle: { fontSize: '12px' } })] }) }) }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 }, children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Monthly Expense Trend" }), _jsx(CardDescription, { className: "text-xs", children: "Last 6 months" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-[280px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: monthlyTrend, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 12 }, stroke: "hsl(var(--muted-foreground))" }), _jsx(YAxis, { tick: { fontSize: 12 }, stroke: "hsl(var(--muted-foreground))", tickFormatter: (v) => `$${(v / 1000).toFixed(0)}k` }), _jsx(Tooltip, { formatter: (value) => formatCurrency(value) }), _jsx(Bar, { dataKey: "amount", fill: "#0d9488", radius: [4, 4, 0, 0] })] }) }) }) })] }) })] }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.55 }, children: _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-base font-semibold", children: "Payment Status Overview" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(paymentStatusCounts).map(([status, data]) => {
                                    const config = PAYMENT_STATUS_CONFIG[status];
                                    const Icon = status === 'paid'
                                        ? CheckCircle2
                                        : status === 'overdue'
                                            ? AlertTriangle
                                            : status === 'partial'
                                                ? CreditCard
                                                : Clock;
                                    return (_jsxs("div", { className: cn('rounded-lg border p-4', config.bgColor), children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Icon, { className: cn('h-4 w-4', config.color) }), _jsx("span", { className: cn('text-sm font-medium', config.color), children: config.label })] }), _jsx("p", { className: "text-xl font-bold", children: data.count }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: formatCurrency(data.amount) })] }, status));
                                }) }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6 }, children: _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search expenses...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })] }), _jsxs(Select, { value: filterCategory, onValueChange: setFilterCategory, children: [_jsx(SelectTrigger, { className: "w-full sm:w-[180px]", children: _jsx(SelectValue, { placeholder: "Category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), EXPENSE_CATEGORIES.map((cat) => (_jsx(SelectItem, { value: cat, children: CATEGORY_LABELS[cat] }, cat)))] })] }), _jsxs(Select, { value: filterPaymentStatus, onValueChange: setFilterPaymentStatus, children: [_jsx(SelectTrigger, { className: "w-full sm:w-[160px]", children: _jsx(SelectValue, { placeholder: "Payment" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "paid", children: "Paid" }), _jsx(SelectItem, { value: "partial", children: "Partial" }), _jsx(SelectItem, { value: "overdue", children: "Overdue" })] })] }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => {
                                        setFilterCategory('all');
                                        setFilterPaymentStatus('all');
                                        setSearch('');
                                    }, title: "Reset filters", children: _jsx(X, { className: "h-4 w-4" }) }), _jsxs(Button, { onClick: () => setNewExpenseOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Expense"] })] }) }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.65 }, children: _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Expenses" }), _jsxs(CardDescription, { className: "text-xs mt-1", children: [pagination.total, " expenses found"] })] }) }) }), _jsx(CardContent, { className: "p-0", children: loading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-teal-600" }) })) : expenses.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [_jsx(DollarSign, { className: "h-12 w-12 mb-3 opacity-30" }), _jsx("p", { className: "text-sm", children: "No expenses found" })] })) : (_jsx(ScrollArea, { className: "max-h-[500px]", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Category" }), _jsx(TableHead, { children: "Description" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { className: "hidden md:table-cell", children: "Currency" }), _jsx(TableHead, { className: "hidden lg:table-cell", children: "Vendor" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { className: "hidden md:table-cell", children: "Due Date" }), _jsx(TableHead, { className: "hidden xl:table-cell", children: "Shipment" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: expenses.map((expense, i) => {
                                                var _a;
                                                const CategoryIcon = CATEGORY_ICONS[expense.category] || DollarSign;
                                                const statusConfig = PAYMENT_STATUS_CONFIG[expense.paymentStatus] || PAYMENT_STATUS_CONFIG.pending;
                                                return (_jsxs(motion.tr, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.03, duration: 0.2 }, className: "hover:bg-accent/30 transition-colors", children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/30", children: _jsx(CategoryIcon, { className: "h-3.5 w-3.5 text-teal-600" }) }), _jsx("span", { className: "text-xs font-medium", children: CATEGORY_LABELS[expense.category] || expense.category })] }) }), _jsx(TableCell, { className: "max-w-[200px] truncate", children: _jsx("span", { className: "text-xs", children: expense.description || '—' }) }), _jsx(TableCell, { children: _jsx("span", { className: "text-sm font-semibold", children: formatCurrency(expense.amount, expense.currency) }) }), _jsx(TableCell, { className: "hidden md:table-cell", children: _jsx(Badge, { variant: "secondary", className: "text-[10px]", children: expense.currency }) }), _jsx(TableCell, { className: "hidden lg:table-cell", children: _jsx("span", { className: "text-xs", children: expense.vendorName || '—' }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', statusConfig.bgColor, statusConfig.color), children: statusConfig.label }) }), _jsx(TableCell, { className: "hidden md:table-cell", children: _jsx("span", { className: "text-xs", children: expense.dueDate
                                                                    ? format(new Date(expense.dueDate), 'MMM dd, yyyy')
                                                                    : '—' }) }), _jsx(TableCell, { className: "hidden xl:table-cell", children: _jsx("span", { className: "text-xs", children: ((_a = expense.shipment) === null || _a === void 0 ? void 0 : _a.shipmentNumber) || '—' }) }), _jsx(TableCell, { className: "text-right", children: _jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => {
                                                                    setSelectedExpense(expense);
                                                                    setDetailOpen(true);
                                                                }, children: _jsx(Eye, { className: "h-4 w-4" }) }) })] }, expense.id));
                                            }) })] }) })) })] }) }), _jsx(Dialog, { open: detailOpen, onOpenChange: setDetailOpen, children: _jsxs(DialogContent, { className: "max-w-lg", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "h-5 w-5 text-teal-600" }), "Expense Details"] }), _jsx(DialogDescription, { children: "Complete expense information" })] }), selectedExpense && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Category" }), _jsx("p", { className: "text-sm font-medium", children: CATEGORY_LABELS[selectedExpense.category] || selectedExpense.category })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Amount" }), _jsx("p", { className: "text-sm font-bold", children: formatCurrency(selectedExpense.amount, selectedExpense.currency) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Base Amount (USD)" }), _jsx("p", { className: "text-sm", children: formatCurrency(selectedExpense.amountBase) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Exchange Rate" }), _jsx("p", { className: "text-sm", children: selectedExpense.exchangeRate })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Vendor" }), _jsx("p", { className: "text-sm", children: selectedExpense.vendorName || '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Payment Status" }), _jsx(Badge, { variant: "outline", className: cn('text-xs font-semibold', (_a = PAYMENT_STATUS_CONFIG[selectedExpense.paymentStatus]) === null || _a === void 0 ? void 0 : _a.bgColor, (_b = PAYMENT_STATUS_CONFIG[selectedExpense.paymentStatus]) === null || _b === void 0 ? void 0 : _b.color), children: ((_c = PAYMENT_STATUS_CONFIG[selectedExpense.paymentStatus]) === null || _c === void 0 ? void 0 : _c.label) || selectedExpense.paymentStatus })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Due Date" }), _jsx("p", { className: "text-sm", children: selectedExpense.dueDate
                                                        ? format(new Date(selectedExpense.dueDate), 'MMM dd, yyyy')
                                                        : '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Payment Date" }), _jsx("p", { className: "text-sm", children: selectedExpense.paymentDate
                                                        ? format(new Date(selectedExpense.paymentDate), 'MMM dd, yyyy')
                                                        : '—' })] })] }), selectedExpense.description && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Description" }), _jsx("p", { className: "text-sm", children: selectedExpense.description })] })] })), (selectedExpense.shipment || selectedExpense.container) && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [selectedExpense.shipment && (_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Shipment" }), _jsx("p", { className: "text-sm", children: selectedExpense.shipment.shipmentNumber })] })), selectedExpense.container && (_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Container" }), _jsx("p", { className: "text-sm", children: selectedExpense.container.containerNumber })] }))] })] }))] }))] }) }), _jsx(Dialog, { open: newExpenseOpen, onOpenChange: setNewExpenseOpen, children: _jsxs(DialogContent, { className: "max-w-lg", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-5 w-5 text-teal-600" }), "New Expense"] }), _jsx(DialogDescription, { children: "Record a new expense" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Category *" }), _jsxs(Select, { value: newExpense.category, onValueChange: (v) => setNewExpense(Object.assign(Object.assign({}, newExpense), { category: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: EXPENSE_CATEGORIES.map((cat) => (_jsx(SelectItem, { value: cat, children: CATEGORY_LABELS[cat] }, cat))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Amount *" }), _jsx(Input, { type: "number", placeholder: "0.00", value: newExpense.amount, onChange: (e) => setNewExpense(Object.assign(Object.assign({}, newExpense), { amount: e.target.value })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Currency" }), _jsxs(Select, { value: newExpense.currency, onValueChange: (v) => setNewExpense(Object.assign(Object.assign({}, newExpense), { currency: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" }), _jsx(SelectItem, { value: "CNY", children: "CNY" }), _jsx(SelectItem, { value: "JPY", children: "JPY" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Payment Status" }), _jsxs(Select, { value: newExpense.paymentStatus, onValueChange: (v) => setNewExpense(Object.assign(Object.assign({}, newExpense), { paymentStatus: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "paid", children: "Paid" }), _jsx(SelectItem, { value: "partial", children: "Partial" }), _jsx(SelectItem, { value: "overdue", children: "Overdue" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Vendor Name" }), _jsx(Input, { placeholder: "Enter vendor name", value: newExpense.vendorName, onChange: (e) => setNewExpense(Object.assign(Object.assign({}, newExpense), { vendorName: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Description" }), _jsx(Textarea, { placeholder: "Enter expense description", value: newExpense.description, onChange: (e) => setNewExpense(Object.assign(Object.assign({}, newExpense), { description: e.target.value })), rows: 3 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Due Date" }), _jsx(Input, { type: "date", value: newExpense.dueDate, onChange: (e) => setNewExpense(Object.assign(Object.assign({}, newExpense), { dueDate: e.target.value })) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setNewExpenseOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleCreateExpense, disabled: !newExpense.amount || !newExpense.category || submitting, children: [submitting ? (_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(Plus, { className: "h-4 w-4 mr-2" })), "Create Expense"] })] })] }) })] }));
}
