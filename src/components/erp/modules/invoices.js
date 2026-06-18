'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Plus, Eye, Printer, Download, CheckCircle2, Clock, AlertTriangle, X, Loader2, DollarSign, Receipt, PlusCircle, Trash2, } from 'lucide-react';
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
import { format } from 'date-fns';
// ─── Constants ──────────────────────────────────────────────────────────
const INVOICE_TYPES = [
    'purchase',
    'freight',
    'customs',
    'transport',
    'commercial',
    'proforma',
];
const TYPE_LABELS = {
    purchase: 'Purchase',
    freight: 'Freight',
    customs: 'Customs',
    transport: 'Transport',
    commercial: 'Commercial',
    proforma: 'Proforma',
};
const STATUS_CONFIG = {
    draft: {
        label: 'Draft',
        color: 'text-slate-700',
        bgColor: 'bg-slate-50 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-700',
    },
    sent: {
        label: 'Sent',
        color: 'text-teal-700',
        bgColor: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800',
    },
    approved: {
        label: 'Approved',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
    },
    partial: {
        label: 'Partial',
        color: 'text-amber-700',
        bgColor: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    },
    paid: {
        label: 'Paid',
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
    },
    overdue: {
        label: 'Overdue',
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
    },
    cancelled: {
        label: 'Cancelled',
        color: 'text-gray-700',
        bgColor: 'bg-gray-50 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-700',
    },
};
const formatCurrency = (value, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
// ─── Component ──────────────────────────────────────────────────────────
export function InvoicesModule() {
    var _a, _b, _c, _d, _e;
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [companies, setCompanies] = useState([]);
    // New invoice form state
    const [newInvoice, setNewInvoice] = useState({
        invoiceType: 'commercial',
        companyId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        currency: 'USD',
        notes: '',
        terms: '',
    });
    const [lineItems, setLineItems] = useState([
        { description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 },
    ]);
    // Fetch invoices
    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', '1');
            params.set('limit', '50');
            if (search)
                params.set('search', search);
            if (filterType && filterType !== 'all')
                params.set('invoiceType', filterType);
            if (filterStatus && filterStatus !== 'all')
                params.set('status', filterStatus);
            const res = await fetch(`/api/invoices?${params.toString()}`);
            const json = await res.json();
            setInvoices(json.data || []);
            setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
        }
        catch (err) {
            console.error('Failed to fetch invoices:', err);
        }
        finally {
            setLoading(false);
        }
    }, [search, filterType, filterStatus]);
    // Fetch companies
    const fetchCompanies = useCallback(async () => {
        try {
            const res = await fetch('/api/companies?limit=50');
            const json = await res.json();
            setCompanies((json.data || []).map((c) => ({ id: c.id, name: c.name })));
        }
        catch (_a) {
            // silent
        }
    }, []);
    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);
    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);
    // Stats
    const stats = useMemo(() => {
        const total = invoices.length;
        const paid = invoices.filter((i) => i.status === 'paid').length;
        const pending = invoices.filter((i) => i.status === 'sent' || i.status === 'draft' || i.status === 'approved').length;
        const overdue = invoices.filter((i) => i.status === 'overdue').length;
        const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
        const outstandingAmount = invoices
            .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
            .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
        return { total, paid, pending, overdue, totalAmount, outstandingAmount };
    }, [invoices]);
    // Fetch invoice detail with items
    const openInvoiceDetail = async (invoice) => {
        try {
            const res = await fetch(`/api/invoices/${invoice.id}`);
            const json = await res.json();
            setSelectedInvoice(json.data || invoice);
            setDetailOpen(true);
        }
        catch (_a) {
            setSelectedInvoice(invoice);
            setDetailOpen(true);
        }
    };
    // Line item calculations
    const updateLineItem = (index, field, value) => {
        const updated = [...lineItems];
        updated[index][field] = value;
        const item = updated[index];
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        const disc = Number(item.discount) || 0;
        const tax = Number(item.taxRate) || 0;
        item.total = qty * price - disc + (qty * price - disc) * (tax / 100);
        setLineItems(updated);
    };
    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            { description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 },
        ]);
    };
    const removeLineItem = (index) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter((_, i) => i !== index));
        }
    };
    const lineItemsSubtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) - Number(item.discount)), 0);
    const lineItemsTax = lineItems.reduce((sum, item) => {
        const base = Number(item.quantity) * Number(item.unitPrice) - Number(item.discount);
        return sum + base * (Number(item.taxRate) / 100);
    }, 0);
    const lineItemsTotal = lineItemsSubtotal + lineItemsTax;
    // Create invoice
    const handleCreateInvoice = async () => {
        setSubmitting(true);
        try {
            await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign(Object.assign({}, newInvoice), { subtotal: lineItemsSubtotal, taxAmount: lineItemsTax, totalAmount: lineItemsTotal, items: lineItems.filter((item) => item.description.trim()), issueDate: newInvoice.issueDate || new Date().toISOString(), dueDate: newInvoice.dueDate || null })),
            });
            setNewInvoiceOpen(false);
            setNewInvoice({
                invoiceType: 'commercial',
                companyId: '',
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: '',
                currency: 'USD',
                notes: '',
                terms: '',
            });
            setLineItems([{ description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 }]);
            fetchInvoices();
        }
        catch (err) {
            console.error('Failed to create invoice:', err);
        }
        finally {
            setSubmitting(false);
        }
    };
    const statCards = [
        {
            title: 'Total Invoices',
            value: stats.total,
            icon: FileText,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50 dark:bg-teal-950/30',
        },
        {
            title: 'Paid',
            value: stats.paid,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/30',
        },
        {
            title: 'Pending',
            value: stats.pending,
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        },
        {
            title: 'Overdue',
            value: stats.overdue,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-950/30',
        },
        {
            title: 'Total Amount',
            value: formatCurrency(stats.totalAmount),
            icon: DollarSign,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        },
        {
            title: 'Outstanding',
            value: formatCurrency(stats.outstandingAmount),
            icon: Receipt,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4", children: statCards.map((stat, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.3 }, children: _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col items-center text-center gap-2", children: [_jsx("div", { className: cn('rounded-lg p-2', stat.bgColor), children: _jsx(stat.icon, { className: cn('h-4 w-4', stat.color) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-bold tracking-tight", children: stat.value }), _jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wider", children: stat.title })] })] }) }) }) }, stat.title))) }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.35 }, children: _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search invoices...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })] }), _jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [_jsx(SelectTrigger, { className: "w-full sm:w-[170px]", children: _jsx(SelectValue, { placeholder: "Invoice Type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), INVOICE_TYPES.map((type) => (_jsx(SelectItem, { value: type, children: TYPE_LABELS[type] }, type)))] })] }), _jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [_jsx(SelectTrigger, { className: "w-full sm:w-[150px]", children: _jsx(SelectValue, { placeholder: "Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), Object.entries(STATUS_CONFIG).map(([key, config]) => (_jsx(SelectItem, { value: key, children: config.label }, key)))] })] }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => {
                                        setFilterType('all');
                                        setFilterStatus('all');
                                        setSearch('');
                                    }, title: "Reset filters", children: _jsx(X, { className: "h-4 w-4" }) }), _jsxs(Button, { onClick: () => setNewInvoiceOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Invoice"] })] }) }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, children: _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Invoices" }), _jsxs(CardDescription, { className: "text-xs mt-1", children: [pagination.total, " invoices found"] })] }) }) }), _jsx(CardContent, { className: "p-0", children: loading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-teal-600" }) })) : invoices.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [_jsx(FileText, { className: "h-12 w-12 mb-3 opacity-30" }), _jsx("p", { className: "text-sm", children: "No invoices found" })] })) : (_jsx(ScrollArea, { className: "max-h-[500px]", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Invoice #" }), _jsx(TableHead, { children: "Type" }), _jsx(TableHead, { className: "hidden lg:table-cell", children: "Company" }), _jsx(TableHead, { className: "hidden xl:table-cell", children: "Shipment" }), _jsx(TableHead, { className: "hidden md:table-cell", children: "Issue Date" }), _jsx(TableHead, { className: "hidden md:table-cell", children: "Due Date" }), _jsx(TableHead, { children: "Total Amount" }), _jsx(TableHead, { className: "hidden lg:table-cell", children: "Paid" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: invoices.map((invoice, i) => {
                                                var _a, _b;
                                                const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
                                                return (_jsxs(motion.tr, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.03, duration: 0.2 }, className: "hover:bg-accent/30 transition-colors", children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/30", children: _jsx(FileText, { className: "h-4 w-4 text-teal-600" }) }), _jsx("span", { className: "text-sm font-semibold font-mono", children: invoice.invoiceNumber })] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: "text-[10px]", children: TYPE_LABELS[invoice.invoiceType] || invoice.invoiceType }) }), _jsx(TableCell, { className: "hidden lg:table-cell", children: _jsx("span", { className: "text-xs", children: ((_a = invoice.company) === null || _a === void 0 ? void 0 : _a.name) || '—' }) }), _jsx(TableCell, { className: "hidden xl:table-cell", children: _jsx("span", { className: "text-xs font-mono", children: ((_b = invoice.shipment) === null || _b === void 0 ? void 0 : _b.shipmentNumber) || '—' }) }), _jsx(TableCell, { className: "hidden md:table-cell", children: _jsx("span", { className: "text-xs", children: format(new Date(invoice.issueDate), 'MMM dd, yyyy') }) }), _jsx(TableCell, { className: "hidden md:table-cell", children: _jsx("span", { className: "text-xs", children: invoice.dueDate
                                                                    ? format(new Date(invoice.dueDate), 'MMM dd, yyyy')
                                                                    : '—' }) }), _jsx(TableCell, { children: _jsx("span", { className: "text-sm font-semibold", children: formatCurrency(invoice.totalAmount, invoice.currency) }) }), _jsx(TableCell, { className: "hidden lg:table-cell", children: _jsx("span", { className: "text-xs", children: formatCurrency(invoice.paidAmount, invoice.currency) }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', statusCfg.bgColor, statusCfg.color), children: statusCfg.label }) }), _jsx(TableCell, { className: "text-right", children: _jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => openInvoiceDetail(invoice), children: _jsx(Eye, { className: "h-4 w-4" }) }) })] }, invoice.id));
                                            }) })] }) })) })] }) }), _jsx(Dialog, { open: detailOpen, onOpenChange: setDetailOpen, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5 text-teal-600" }), "Invoice ", selectedInvoice === null || selectedInvoice === void 0 ? void 0 : selectedInvoice.invoiceNumber] }), _jsx(DialogDescription, { children: "Complete invoice information" })] }), selectedInvoice && (_jsx(ScrollArea, { className: "max-h-[70vh]", children: _jsxs("div", { className: "space-y-5 pr-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Invoice Number" }), _jsx("p", { className: "text-sm font-semibold font-mono", children: selectedInvoice.invoiceNumber })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Type" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: TYPE_LABELS[selectedInvoice.invoiceType] || selectedInvoice.invoiceType })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Company" }), _jsx("p", { className: "text-sm", children: ((_a = selectedInvoice.company) === null || _a === void 0 ? void 0 : _a.name) || '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Shipment" }), _jsx("p", { className: "text-sm font-mono", children: ((_b = selectedInvoice.shipment) === null || _b === void 0 ? void 0 : _b.shipmentNumber) || '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Issue Date" }), _jsx("p", { className: "text-sm", children: format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy') })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Due Date" }), _jsx("p", { className: "text-sm", children: selectedInvoice.dueDate
                                                            ? format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')
                                                            : '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Status" }), _jsx(Badge, { variant: "outline", className: cn('text-xs font-semibold', (_c = STATUS_CONFIG[selectedInvoice.status]) === null || _c === void 0 ? void 0 : _c.bgColor, (_d = STATUS_CONFIG[selectedInvoice.status]) === null || _d === void 0 ? void 0 : _d.color), children: ((_e = STATUS_CONFIG[selectedInvoice.status]) === null || _e === void 0 ? void 0 : _e.label) || selectedInvoice.status })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Currency" }), _jsx("p", { className: "text-sm", children: selectedInvoice.currency })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Subtotal" }), _jsx("p", { className: "text-sm font-semibold", children: formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency) })] }), _jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Tax" }), _jsx("p", { className: "text-sm font-semibold", children: formatCurrency(selectedInvoice.taxAmount, selectedInvoice.currency) })] }), _jsxs("div", { className: "rounded-lg bg-teal-50 dark:bg-teal-950/30 p-3 text-center", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Total" }), _jsx("p", { className: "text-sm font-bold text-teal-700 dark:text-teal-400", children: formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Paid" }), _jsx("p", { className: "text-sm font-semibold text-emerald-700 dark:text-emerald-400", children: formatCurrency(selectedInvoice.paidAmount, selectedInvoice.currency) })] }), _jsxs("div", { className: "rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-center", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Outstanding" }), _jsx("p", { className: "text-sm font-semibold text-amber-700 dark:text-amber-400", children: formatCurrency(selectedInvoice.totalAmount - selectedInvoice.paidAmount, selectedInvoice.currency) })] })] }), selectedInvoice.items && selectedInvoice.items.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground mb-2 block", children: "Line Items" }), _jsx("div", { className: "rounded-lg border overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-xs", children: "Description" }), _jsx(TableHead, { className: "text-xs text-right", children: "Qty" }), _jsx(TableHead, { className: "text-xs text-right", children: "Unit Price" }), _jsx(TableHead, { className: "text-xs text-right hidden sm:table-cell", children: "Tax %" }), _jsx(TableHead, { className: "text-xs text-right", children: "Total" })] }) }), _jsx(TableBody, { children: selectedInvoice.items.map((item) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "text-xs", children: item.description }), _jsx(TableCell, { className: "text-xs text-right", children: item.quantity }), _jsx(TableCell, { className: "text-xs text-right", children: formatCurrency(item.unitPrice, selectedInvoice.currency) }), _jsxs(TableCell, { className: "text-xs text-right hidden sm:table-cell", children: [item.taxRate, "%"] }), _jsx(TableCell, { className: "text-xs text-right font-semibold", children: formatCurrency(item.total, selectedInvoice.currency) })] }, item.id))) })] }) })] })] })), _jsx(Separator, {}), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground mb-2 block", children: "Payment History" }), _jsx("div", { className: "rounded-lg bg-muted/30 p-4 text-center", children: selectedInvoice.paidAmount > 0 ? (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Payment Received" }), _jsx("span", { className: "font-semibold text-emerald-600", children: formatCurrency(selectedInvoice.paidAmount, selectedInvoice.currency) })] }), _jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: _jsx("div", { className: "h-full rounded-full bg-emerald-500", style: {
                                                                    width: `${Math.min(100, (selectedInvoice.paidAmount / selectedInvoice.totalAmount) * 100)}%`,
                                                                } }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [Math.round((selectedInvoice.paidAmount / selectedInvoice.totalAmount) * 100), "% paid"] })] })) : (_jsx("p", { className: "text-xs text-muted-foreground", children: "No payments recorded yet" })) })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(CheckCircle2, { className: "h-4 w-4 mr-2" }), "Mark as Paid"] })), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Printer, { className: "h-4 w-4 mr-2" }), "Print"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download PDF"] })] }), (selectedInvoice.notes || selectedInvoice.terms) && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [selectedInvoice.notes && (_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Notes" }), _jsx("p", { className: "text-xs", children: selectedInvoice.notes })] })), selectedInvoice.terms && (_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Terms" }), _jsx("p", { className: "text-xs", children: selectedInvoice.terms })] }))] })] }))] }) }))] }) }), _jsx(Dialog, { open: newInvoiceOpen, onOpenChange: setNewInvoiceOpen, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-5 w-5 text-teal-600" }), "New Invoice"] }), _jsx(DialogDescription, { children: "Create a new invoice" })] }), _jsx(ScrollArea, { className: "max-h-[65vh]", children: _jsxs("div", { className: "space-y-4 pr-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Invoice Type" }), _jsxs(Select, { value: newInvoice.invoiceType, onValueChange: (v) => setNewInvoice(Object.assign(Object.assign({}, newInvoice), { invoiceType: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: INVOICE_TYPES.map((type) => (_jsx(SelectItem, { value: type, children: TYPE_LABELS[type] }, type))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Company" }), _jsxs(Select, { value: newInvoice.companyId, onValueChange: (v) => setNewInvoice(Object.assign(Object.assign({}, newInvoice), { companyId: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsx(SelectContent, { children: companies.map((c) => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id))) })] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Issue Date" }), _jsx(Input, { type: "date", value: newInvoice.issueDate, onChange: (e) => setNewInvoice(Object.assign(Object.assign({}, newInvoice), { issueDate: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Due Date" }), _jsx(Input, { type: "date", value: newInvoice.dueDate, onChange: (e) => setNewInvoice(Object.assign(Object.assign({}, newInvoice), { dueDate: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Currency" }), _jsxs(Select, { value: newInvoice.currency, onValueChange: (v) => setNewInvoice(Object.assign(Object.assign({}, newInvoice), { currency: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" }), _jsx(SelectItem, { value: "CNY", children: "CNY" })] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx(Label, { className: "text-sm font-medium", children: "Line Items" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: addLineItem, children: [_jsx(PlusCircle, { className: "h-3.5 w-3.5 mr-1" }), "Add Item"] })] }), _jsx("div", { className: "space-y-3", children: lineItems.map((item, index) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 items-end border rounded-lg p-3", children: [_jsxs("div", { className: "col-span-4 space-y-1", children: [_jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Description" }), _jsx(Input, { placeholder: "Item description", value: item.description, onChange: (e) => updateLineItem(index, 'description', e.target.value), className: "h-8 text-xs" })] }), _jsxs("div", { className: "col-span-2 space-y-1", children: [_jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Qty" }), _jsx(Input, { type: "number", value: item.quantity, onChange: (e) => updateLineItem(index, 'quantity', e.target.value), className: "h-8 text-xs" })] }), _jsxs("div", { className: "col-span-2 space-y-1", children: [_jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Unit Price" }), _jsx(Input, { type: "number", value: item.unitPrice, onChange: (e) => updateLineItem(index, 'unitPrice', e.target.value), className: "h-8 text-xs" })] }), _jsxs("div", { className: "col-span-1 space-y-1", children: [_jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Tax%" }), _jsx(Input, { type: "number", value: item.taxRate, onChange: (e) => updateLineItem(index, 'taxRate', e.target.value), className: "h-8 text-xs" })] }), _jsxs("div", { className: "col-span-2 space-y-1", children: [_jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Total" }), _jsx("p", { className: "text-xs font-semibold h-8 flex items-center", children: formatCurrency(item.total) })] }), _jsx("div", { className: "col-span-1", children: _jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => removeLineItem(index), disabled: lineItems.length <= 1, children: _jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground" }) }) })] }, index))) }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsxs("div", { className: "w-64 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Subtotal:" }), _jsx("span", { children: formatCurrency(lineItemsSubtotal) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Tax:" }), _jsx("span", { children: formatCurrency(lineItemsTax) })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between text-sm font-bold", children: [_jsx("span", { children: "Total:" }), _jsx("span", { className: "text-teal-600", children: formatCurrency(lineItemsTotal) })] })] }) })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Notes" }), _jsx(Textarea, { placeholder: "Invoice notes", value: newInvoice.notes, onChange: (e) => setNewInvoice(Object.assign(Object.assign({}, newInvoice), { notes: e.target.value })), rows: 2 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Terms" }), _jsx(Textarea, { placeholder: "Payment terms", value: newInvoice.terms, onChange: (e) => setNewInvoice(Object.assign(Object.assign({}, newInvoice), { terms: e.target.value })), rows: 2 })] })] }) }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setNewInvoiceOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleCreateInvoice, disabled: submitting, children: [submitting ? (_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(Plus, { className: "h-4 w-4 mr-2" })), "Create Invoice"] })] })] }) })] }));
}
