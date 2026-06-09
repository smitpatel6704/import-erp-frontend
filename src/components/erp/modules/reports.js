'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, Ship, Shield, FileSpreadsheet, FileText, Anchor, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, } from 'recharts';
const CHART_COLORS = ['#0d9488', '#f59e0b', '#10b981', '#f97316', '#6b7280', '#14b8a6', '#ef4444', '#8b5cf6'];
const emptyReportData = {
    shipments: [],
    containers: [],
    expenses: [],
    customs: [],
};
const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });
function labelize(value) {
    if (!value)
        return 'Unknown';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
}
function numberValue(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}
function recordDate(record) {
    return new Date(record.actualArrival || record.eta || record.createdAt || Date.now());
}
function lastSixMonthKeys() {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
        return {
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            month: monthFormatter.format(date),
        };
    });
}
function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function isDelayed(shipment) {
    const eta = shipment.eta ? new Date(shipment.eta) : null;
    const actual = shipment.actualArrival ? new Date(shipment.actualArrival) : null;
    if (eta && actual)
        return actual.getTime() > eta.getTime();
    return Boolean(eta && shipment.status !== 'delivered' && shipment.status !== 'closed' && eta.getTime() < Date.now());
}
function exportCsv(filename, rows) {
    if (!rows.length)
        return;
    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(','),
        ...rows.map((row) => headers
            .map((header) => {
            var _a;
            const value = (_a = row[header]) !== null && _a !== void 0 ? _a : '';
            return `"${String(value).replace(/"/g, '""')}"`;
        })
            .join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
function exportPrintableReport(title, rows) {
    const win = window.open('', '_blank');
    if (!win)
        return;
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const tableRows = rows
        .map((row) => `<tr>${headers.map((header) => { var _a; return `<td>${(_a = row[header]) !== null && _a !== void 0 ? _a : ''}</td>`; }).join('')}</tr>`)
        .join('');
    win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 16px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated ${new Date().toLocaleString()}</p>
        <table>
          <thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `);
    win.document.close();
    win.print();
}
async function fetchReportEndpoint(endpoint) {
    const res = await fetch(`${API_BASE_URL}/api/${endpoint}?limit=1000&isActive=true`, { cache: 'no-store' });
    if (!res.ok)
        throw new Error(`Failed to fetch ${endpoint}`);
    const json = await res.json();
    return json.data || [];
}
function useReportData() {
    const [data, setData] = useState(emptyReportData);
    const [loading, setLoading] = useState(true);
    const refresh = useCallback(async () => {
        try {
            const [shipments, containers, expenses, customs] = await Promise.all([
                fetchReportEndpoint('shipments'),
                fetchReportEndpoint('containers'),
                fetchReportEndpoint('expenses'),
                fetchReportEndpoint('customs'),
            ]);
            setData({ shipments, containers, expenses, customs });
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        refresh();
        const interval = window.setInterval(refresh, 15000);
        return () => window.clearInterval(interval);
    }, [refresh]);
    return { data, loading };
}
export function ReportsModule() {
    const [activeTab, setActiveTab] = useState('operational');
    const { data, loading } = useReportData();
    return (_jsx("div", { className: "space-y-6", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "h-9", children: [_jsxs(TabsTrigger, { value: "operational", className: "text-xs px-4", children: [_jsx(Ship, { className: "h-3.5 w-3.5 mr-1.5" }), " Operational"] }), _jsxs(TabsTrigger, { value: "financial", className: "text-xs px-4", children: [_jsx(DollarSign, { className: "h-3.5 w-3.5 mr-1.5" }), " Financial"] }), _jsxs(TabsTrigger, { value: "customs", className: "text-xs px-4", children: [_jsx(Shield, { className: "h-3.5 w-3.5 mr-1.5" }), " Customs"] }), _jsxs(TabsTrigger, { value: "analytics", className: "text-xs px-4", children: [_jsx(BarChart3, { className: "h-3.5 w-3.5 mr-1.5" }), " Analytics"] })] }), _jsx(TabsContent, { value: "operational", className: "mt-4", children: _jsx(OperationalReports, { data: data, loading: loading }) }), _jsx(TabsContent, { value: "financial", className: "mt-4", children: _jsx(FinancialReports, { data: data, loading: loading }) }), _jsx(TabsContent, { value: "customs", className: "mt-4", children: _jsx(CustomsReports, { data: data, loading: loading }) }), _jsx(TabsContent, { value: "analytics", className: "mt-4", children: _jsx(AnalyticsReports, { data: data, loading: loading }) })] }) }) }));
}
function ReportLoading() {
    return (_jsx("div", { className: "h-[250px] flex items-center justify-center", children: _jsx("div", { className: "animate-spin h-6 w-6 border-2 border-teal border-t-transparent rounded-full" }) }));
}
function EmptyReport({ label = 'No live data available' }) {
    return _jsx("div", { className: "h-[250px] flex items-center justify-center text-sm text-muted-foreground", children: label });
}
function ReportCard({ title, description, children, onExportExcel, onExportPdf, }) {
    return (_jsxs(Card, { className: "shadow-sm", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-sm font-semibold", children: title }), description && _jsx(CardDescription, { className: "text-xs mt-0.5", children: description })] }), _jsxs("div", { className: "flex items-center gap-1", children: [onExportExcel && (_jsxs(Button, { variant: "outline", size: "sm", className: "h-7 text-[10px] gap-1", onClick: onExportExcel, children: [_jsx(FileSpreadsheet, { className: "h-3 w-3" }), " Excel"] })), onExportPdf && (_jsxs(Button, { variant: "outline", size: "sm", className: "h-7 text-[10px] gap-1", onClick: onExportPdf, children: [_jsx(FileText, { className: "h-3 w-3" }), " PDF"] }))] })] }) }), _jsx(CardContent, { children: children })] }));
}
function buildOperationalReports(data) {
    const months = lastSixMonthKeys();
    const shipmentSummaryData = months.map(({ key, month }) => {
        const shipments = data.shipments.filter((shipment) => monthKey(recordDate(shipment)) === key);
        return {
            month,
            shipped: shipments.length,
            delivered: shipments.filter((shipment) => shipment.status === 'delivered' || shipment.status === 'closed').length,
            delayed: shipments.filter(isDelayed).length,
        };
    });
    const delayAnalysisData = shipmentSummaryData.map((row) => {
        const onTime = row.shipped ? Math.round(((row.shipped - row.delayed) / row.shipped) * 100) : 0;
        return { month: row.month, onTime, delayed: row.shipped ? 100 - onTime : 0 };
    });
    const deliveryPerformanceData = shipmentSummaryData.map((row) => ({
        month: row.month,
        target: 95,
        actual: row.shipped ? Math.round((row.delivered / row.shipped) * 100) : 0,
    }));
    const containerStatusData = Object.entries(data.containers.reduce((acc, container) => {
        const status = labelize(container.status);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {})).map(([status, count]) => ({ status, count }));
    return { shipmentSummaryData, containerStatusData, delayAnalysisData, deliveryPerformanceData };
}
function OperationalReports({ data, loading }) {
    const { shipmentSummaryData, containerStatusData, delayAnalysisData, deliveryPerformanceData } = buildOperationalReports(data);
    const shipmentRows = shipmentSummaryData.map(({ month, shipped, delivered, delayed }) => ({ month, shipped, delivered, delayed }));
    const hasShipments = shipmentSummaryData.some((row) => row.shipped > 0);
    const hasContainers = containerStatusData.length > 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: _jsx(ReportCard, { title: "Shipment Summary", description: "Monthly shipment overview", onExportExcel: () => exportCsv('shipment-summary', shipmentRows), onExportPdf: () => exportPrintableReport('Shipment Summary', shipmentRows), children: loading ? _jsx(ReportLoading, {}) : hasShipments ? (_jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(BarChart, { data: shipmentSummaryData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }), _jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }), _jsx(Tooltip, { contentStyle: { fontSize: 12 } }), _jsx(Legend, { wrapperStyle: { fontSize: 11 } }), _jsx(Bar, { dataKey: "shipped", fill: "#0d9488", radius: [4, 4, 0, 0] }), _jsx(Bar, { dataKey: "delivered", fill: "#10b981", radius: [4, 4, 0, 0] }), _jsx(Bar, { dataKey: "delayed", fill: "#f59e0b", radius: [4, 4, 0, 0] })] }) })) : _jsx(EmptyReport, {}) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, children: _jsx(ReportCard, { title: "Container Status Report", description: "Current container distribution", onExportExcel: () => exportCsv('container-status-report', containerStatusData), onExportPdf: () => exportPrintableReport('Container Status Report', containerStatusData), children: loading ? _jsx(ReportLoading, {}) : hasContainers ? (_jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(BarChart, { data: containerStatusData, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }), _jsx(XAxis, { type: "number", tick: { fontSize: 11 }, allowDecimals: false }), _jsx(YAxis, { dataKey: "status", type: "category", tick: { fontSize: 11 }, width: 90 }), _jsx(Tooltip, { contentStyle: { fontSize: 12 } }), _jsx(Bar, { dataKey: "count", fill: "#0d9488", radius: [0, 4, 4, 0] })] }) })) : _jsx(EmptyReport, {}) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: _jsx(ReportCard, { title: "Delay Analysis", description: "On-time vs delayed shipments", onExportExcel: () => exportCsv('delay-analysis', delayAnalysisData), onExportPdf: () => exportPrintableReport('Delay Analysis', delayAnalysisData), children: loading ? _jsx(ReportLoading, {}) : hasShipments ? (_jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(BarChart, { data: delayAnalysisData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }), _jsx(YAxis, { tick: { fontSize: 11 }, domain: [0, 100] }), _jsx(Tooltip, { contentStyle: { fontSize: 12 } }), _jsx(Legend, { wrapperStyle: { fontSize: 11 } }), _jsx(Bar, { dataKey: "onTime", fill: "#10b981", name: "On Time %", radius: [4, 4, 0, 0] }), _jsx(Bar, { dataKey: "delayed", fill: "#f97316", name: "Delayed %", radius: [4, 4, 0, 0] })] }) })) : _jsx(EmptyReport, {}) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.25 }, children: _jsx(ReportCard, { title: "Delivery Performance", description: "Target vs actual delivery rate", onExportExcel: () => exportCsv('delivery-performance', deliveryPerformanceData), onExportPdf: () => exportPrintableReport('Delivery Performance', deliveryPerformanceData), children: loading ? _jsx(ReportLoading, {}) : hasShipments ? (_jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(LineChart, { data: deliveryPerformanceData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }), _jsx(YAxis, { tick: { fontSize: 11 }, domain: [0, 100] }), _jsx(Tooltip, { contentStyle: { fontSize: 12 } }), _jsx(Legend, { wrapperStyle: { fontSize: 11 } }), _jsx(Line, { type: "monotone", dataKey: "target", stroke: "#6b7280", strokeDasharray: "5 5", name: "Target %" }), _jsx(Line, { type: "monotone", dataKey: "actual", stroke: "#0d9488", strokeWidth: 2, name: "Actual %" })] }) })) : _jsx(EmptyReport, {}) }) })] })] }));
}
function buildFinancialReports(data) {
    const months = lastSixMonthKeys();
    const normalizeCategory = (category) => {
        if (category.includes('freight'))
            return 'freight';
        if (category.includes('custom'))
            return 'customs';
        if (category.includes('port'))
            return 'port';
        if (category.includes('transport') || category.includes('delivery'))
            return 'transport';
        return 'other';
    };
    const importCostData = months.map(({ key, month }) => {
        const row = { month, freight: 0, customs: 0, port: 0, transport: 0, other: 0 };
        data.expenses
            .filter((expense) => monthKey(new Date(expense.createdAt || Date.now())) === key)
            .forEach((expense) => {
            row[normalizeCategory(expense.category || '')] += numberValue(expense.amountBase);
        });
        return row;
    });
    const expenseBreakdownData = Object.entries(data.expenses.reduce((acc, expense) => {
        const category = labelize(expense.category);
        acc[category] = (acc[category] || 0) + numberValue(expense.amountBase);
        return acc;
    }, {})).map(([name, value], index) => ({ name, value, color: CHART_COLORS[index % CHART_COLORS.length] }));
    const outstandingPaymentsData = data.expenses
        .filter((expense) => expense.paymentStatus !== 'paid')
        .map((expense) => {
        const due = expense.dueDate ? new Date(expense.dueDate) : null;
        const days = due ? Math.ceil((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return {
            vendor: expense.vendorName || 'Unknown Vendor',
            amount: numberValue(expense.amountBase),
            due: due ? due.toISOString().slice(0, 10) : '-',
            aging: due ? (days > 0 ? `${days} days` : 'Current') : '-',
            status: due && days > 0 ? 'overdue' : expense.paymentStatus || 'pending',
        };
    })
        .sort((a, b) => b.amount - a.amount);
    const vendorPaymentData = Object.values(data.expenses.reduce((acc, expense) => {
        const vendor = expense.vendorName || 'Unknown';
        acc[vendor] || (acc[vendor] = { vendor, paid: 0, pending: 0 });
        if (expense.paymentStatus === 'paid') {
            acc[vendor].paid += numberValue(expense.amountBase);
        }
        else {
            acc[vendor].pending += numberValue(expense.amountBase);
        }
        return acc;
    }, {}))
        .sort((a, b) => b.paid + b.pending - (a.paid + a.pending))
        .slice(0, 8);
    return { importCostData, expenseBreakdownData, outstandingPaymentsData, vendorPaymentData };
}
function FinancialReports({ data, loading }) {
    const { importCostData, expenseBreakdownData, outstandingPaymentsData, vendorPaymentData } = buildFinancialReports(data);
    const hasExpenses = data.expenses.length > 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: _jsx(ReportCard, { title: "Import Cost Summary", description: "Monthly cost breakdown by category", onExportExcel: () => exportCsv('import-cost-summary', importCostData), onExportPdf: () => exportPrintableReport('Import Cost Summary', importCostData), children: loading ? _jsx(ReportLoading, {}) : hasExpenses ? (_jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(BarChart, { data: importCostData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }), _jsx(YAxis, { tick: { fontSize: 11 } }), _jsx(Tooltip, { contentStyle: { fontSize: 12 }, formatter: (value) => `$${value.toLocaleString()}` }), _jsx(Legend, { wrapperStyle: { fontSize: 11 } }), _jsx(Bar, { dataKey: "freight", stackId: "a", fill: "#0d9488", name: "Freight" }), _jsx(Bar, { dataKey: "customs", stackId: "a", fill: "#f59e0b", name: "Customs" }), _jsx(Bar, { dataKey: "port", stackId: "a", fill: "#10b981", name: "Port" }), _jsx(Bar, { dataKey: "transport", stackId: "a", fill: "#f97316", name: "Transport" }), _jsx(Bar, { dataKey: "other", stackId: "a", fill: "#6b7280", name: "Other" })] }) })) : _jsx(EmptyReport, {}) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, children: _jsx(ReportCard, { title: "Expense Breakdown", description: "Overall cost distribution", onExportExcel: () => exportCsv('expense-breakdown', expenseBreakdownData), onExportPdf: () => exportPrintableReport('Expense Breakdown', expenseBreakdownData), children: loading ? _jsx(ReportLoading, {}) : expenseBreakdownData.length ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex items-center gap-4", children: _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: expenseBreakdownData, cx: "50%", cy: "50%", innerRadius: 55, outerRadius: 90, dataKey: "value", paddingAngle: 2, children: expenseBreakdownData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { fontSize: 12 }, formatter: (value) => `$${value.toLocaleString()}` })] }) }) }), _jsx("div", { className: "grid grid-cols-2 gap-2 mt-2", children: expenseBreakdownData.map((item) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-2.5 w-2.5 rounded-full shrink-0", style: { backgroundColor: item.color } }), _jsx("span", { className: "text-[11px] text-muted-foreground", children: item.name }), _jsxs("span", { className: "text-[11px] font-medium ml-auto", children: ["$", (item.value / 1000).toFixed(0), "K"] })] }, item.name))) })] })) : _jsx(EmptyReport, {}) }) })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: _jsx(ReportCard, { title: "Outstanding Payments", description: "Aging analysis of unpaid invoices", onExportExcel: () => exportCsv('outstanding-payments', outstandingPaymentsData), onExportPdf: () => exportPrintableReport('Outstanding Payments', outstandingPaymentsData), children: loading ? _jsx(ReportLoading, {}) : outstandingPaymentsData.length ? _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-xs", children: "Vendor" }), _jsx(TableHead, { className: "text-xs", children: "Amount" }), _jsx(TableHead, { className: "text-xs", children: "Due Date" }), _jsx(TableHead, { className: "text-xs", children: "Aging" }), _jsx(TableHead, { className: "text-xs", children: "Status" })] }) }), _jsx(TableBody, { children: outstandingPaymentsData.slice(0, 12).map((row, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "text-xs font-medium", children: row.vendor }), _jsxs(TableCell, { className: "text-xs", children: ["$", row.amount.toLocaleString()] }), _jsx(TableCell, { className: "text-xs text-muted-foreground", children: row.due }), _jsx(TableCell, { className: "text-xs", children: row.aging }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px]', row.status === 'overdue'
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : row.status === 'pending'
                                                        ? 'bg-amber/10 text-amber border-amber/20'
                                                        : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'), children: row.status.charAt(0).toUpperCase() + row.status.slice(1) }) })] }, `${row.vendor}-${index}`))) })] }) : _jsx(EmptyReport, { label: "No outstanding payments" }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.25 }, children: _jsx(ReportCard, { title: "Vendor Payment Summary", description: "Total payments by vendor", onExportExcel: () => exportCsv('vendor-payment-summary', vendorPaymentData), onExportPdf: () => exportPrintableReport('Vendor Payment Summary', vendorPaymentData), children: loading ? _jsx(ReportLoading, {}) : vendorPaymentData.length ? (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(BarChart, { data: vendorPaymentData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }), _jsx(XAxis, { dataKey: "vendor", tick: { fontSize: 11 } }), _jsx(YAxis, { tick: { fontSize: 11 } }), _jsx(Tooltip, { contentStyle: { fontSize: 12 }, formatter: (value) => `$${value.toLocaleString()}` }), _jsx(Legend, { wrapperStyle: { fontSize: 11 } }), _jsx(Bar, { dataKey: "paid", fill: "#10b981", name: "Paid", radius: [4, 4, 0, 0] }), _jsx(Bar, { dataKey: "pending", fill: "#f59e0b", name: "Pending", radius: [4, 4, 0, 0] })] }) })) : _jsx(EmptyReport, {}) }) })] }));
}
function CustomsReports({ data, loading }) {
    const customsData = data.customs;
    const clearanceByStatus = customsData.reduce((acc, c) => {
        const status = labelize(c.clearanceStatus);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
    const dutyByStatus = customsData.reduce((acc, c) => {
        const status = labelize(c.dutyStatus);
        acc[status] = (acc[status] || 0) + numberValue(c.dutyAmount);
        return acc;
    }, {});
    const pendingClearances = customsData.filter((c) => c.clearanceStatus !== 'clearance_approved');
    const clearanceRows = Object.entries(clearanceByStatus).map(([status, count]) => ({ status, count }));
    const dutyRows = Object.entries(dutyByStatus).map(([status, amount]) => ({ status, amount }));
    const pendingRows = pendingClearances.map((c) => {
        var _a;
        return ({
            shipment: ((_a = c.shipment) === null || _a === void 0 ? void 0 : _a.shipmentNumber) || '-',
            assessmentValue: numberValue(c.assessmentValue),
            dutyAmount: numberValue(c.dutyAmount),
            clearanceStatus: labelize(c.clearanceStatus),
        });
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: _jsx(ReportCard, { title: "Clearance Timeline", description: "Shipments by clearance stage", onExportExcel: () => exportCsv('clearance-timeline', clearanceRows), onExportPdf: () => exportPrintableReport('Clearance Timeline', clearanceRows), children: loading ? (_jsx(ReportLoading, {})) : Object.keys(clearanceByStatus).length === 0 ? (_jsx(EmptyReport, {})) : (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(BarChart, { data: Object.entries(clearanceByStatus).map(([status, count]) => ({
                                        status,
                                        count,
                                    })), layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }), _jsx(XAxis, { type: "number", tick: { fontSize: 11 } }), _jsx(YAxis, { dataKey: "status", type: "category", tick: { fontSize: 11 }, width: 120 }), _jsx(Tooltip, { contentStyle: { fontSize: 12 } }), _jsx(Bar, { dataKey: "count", fill: "#0d9488", radius: [0, 4, 4, 0] })] }) })) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, children: _jsx(ReportCard, { title: "Duty Summary", description: "Total duty amount by status", onExportExcel: () => exportCsv('duty-summary', dutyRows), onExportPdf: () => exportPrintableReport('Duty Summary', dutyRows), children: loading ? (_jsx(ReportLoading, {})) : Object.keys(dutyByStatus).length === 0 ? (_jsx(EmptyReport, {})) : (_jsxs(_Fragment, { children: [_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: Object.entries(dutyByStatus).map(([status, amount]) => ({
                                                        name: status,
                                                        value: amount,
                                                    })), cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 80, dataKey: "value", paddingAngle: 2, children: Object.entries(dutyByStatus).map((_, index) => (_jsx(Cell, { fill: CHART_COLORS[index % CHART_COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { fontSize: 12 }, formatter: (value) => `$${value.toLocaleString()}` })] }) }), _jsx("div", { className: "flex flex-wrap gap-3 mt-2 justify-center", children: Object.entries(dutyByStatus).map(([status, amount], index) => (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "h-2.5 w-2.5 rounded-full", style: { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] } }), _jsxs("span", { className: "text-[11px]", children: [status, ": $", amount.toLocaleString()] })] }, status))) })] })) }) })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: _jsx(ReportCard, { title: "Pending Clearances", description: `${pendingClearances.length} shipments pending full clearance`, onExportExcel: () => exportCsv('pending-clearances', pendingRows), onExportPdf: () => exportPrintableReport('Pending Clearances', pendingRows), children: pendingClearances.length === 0 ? (_jsx("div", { className: "py-8 text-center text-sm text-muted-foreground", children: "No pending clearances" })) : (_jsx("div", { className: "space-y-2", children: pendingClearances.slice(0, 10).map((c, i) => {
                            var _a;
                            const statusMap = {
                                document_submission: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                                duty_assessment: 'bg-amber/10 text-amber border-amber/20',
                                verification: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                                duty_payment: 'bg-teal/10 text-teal border-teal/20',
                            };
                            return (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10", children: _jsx(Shield, { className: "h-4 w-4 text-orange-500" }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-xs font-medium", children: ["Assessment: $", c.assessmentValue.toLocaleString()] }), _jsxs("p", { className: "text-[10px] text-muted-foreground", children: ["Duty: $", c.dutyAmount.toLocaleString()] }), ((_a = c.shipment) === null || _a === void 0 ? void 0 : _a.shipmentNumber) && (_jsxs("p", { className: "text-[10px] text-muted-foreground", children: ["Shipment: ", c.shipment.shipmentNumber] }))] })] }), _jsx(Badge, { variant: "outline", className: cn('text-[10px]', statusMap[c.clearanceStatus] || ''), children: labelize(c.clearanceStatus) })] }, i));
                        }) })) }) })] }));
}
function buildAnalyticsReports(data) {
    const countryImportsData = Object.values(data.shipments.reduce((acc, shipment) => {
        const country = shipment.originCountry || 'Unknown';
        acc[country] || (acc[country] = { country, value: 0, shipments: 0 });
        acc[country].value += numberValue(shipment.shipmentValue);
        acc[country].shipments += 1;
        return acc;
    }, {}))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    const portPerformanceData = Object.values(data.shipments.reduce((acc, shipment) => {
        const port = shipment.destinationPort || 'Unknown';
        acc[port] || (acc[port] = { port, volume: 0, delivered: 0, delayed: 0, clearanceDays: [] });
        acc[port].volume += 1;
        if (shipment.status === 'delivered' || shipment.status === 'closed')
            acc[port].delivered += 1;
        if (isDelayed(shipment))
            acc[port].delayed += 1;
        return acc;
    }, {}))
        .map((port) => {
        const relatedCustoms = data.customs.filter((c) => { var _a; return ((_a = c.shipment) === null || _a === void 0 ? void 0 : _a.destinationPort) === port.port; });
        relatedCustoms.forEach((c) => {
            if (c.clearanceDate && c.createdAt) {
                const days = Math.max(0, (new Date(c.clearanceDate).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                port.clearanceDays.push(days);
            }
        });
        const deliveryScore = port.volume ? (port.delivered / port.volume) * 70 : 0;
        const delayPenalty = port.volume ? (port.delayed / port.volume) * 30 : 0;
        const efficiency = Math.max(0, Math.round(deliveryScore + 30 - delayPenalty));
        const avgDays = port.clearanceDays.length
            ? `${(port.clearanceDays.reduce((sum, days) => sum + days, 0) / port.clearanceDays.length).toFixed(1)} days`
            : '-';
        return Object.assign(Object.assign({}, port), { efficiency, avgClearance: avgDays });
    })
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 5)
        .map((port, index) => (Object.assign(Object.assign({}, port), { rank: index + 1 })));
    const months = lastSixMonthKeys();
    const monthlyTrendsData = months.map(({ key, month }) => {
        const monthShipments = data.shipments.filter((shipment) => monthKey(recordDate(shipment)) === key);
        const monthExpenses = data.expenses.filter((expense) => monthKey(new Date(expense.createdAt || Date.now())) === key);
        return {
            month,
            shipments: monthShipments.length,
            revenue: monthShipments.reduce((sum, shipment) => sum + numberValue(shipment.shipmentValue), 0),
            costs: monthExpenses.reduce((sum, expense) => sum + numberValue(expense.amountBase), 0),
        };
    });
    const totalShipments = Math.max(data.shipments.length, 1);
    const costPerShipmentData = Object.entries(data.expenses.reduce((acc, expense) => {
        const category = labelize(expense.category);
        acc[category] = (acc[category] || 0) + numberValue(expense.amountBase);
        return acc;
    }, {}))
        .map(([category, total], index) => ({
        category,
        amount: Math.round(total / totalShipments),
        pct: 0,
        color: ['bg-teal', 'bg-amber', 'bg-emerald-500', 'bg-orange-500', 'bg-cyan-500', 'bg-slate-500', 'bg-gray-400'][index % 7],
    }))
        .sort((a, b) => b.amount - a.amount);
    const totalPerShipment = costPerShipmentData.reduce((sum, item) => sum + item.amount, 0);
    const costPerShipmentWithPct = costPerShipmentData.map((item) => (Object.assign(Object.assign({}, item), { pct: totalPerShipment ? Math.round((item.amount / totalPerShipment) * 100) : 0 })));
    return { countryImportsData, portPerformanceData, monthlyTrendsData, costPerShipmentData: costPerShipmentWithPct, totalPerShipment };
}
function AnalyticsReports({ data, loading }) {
    const { countryImportsData, portPerformanceData, monthlyTrendsData, costPerShipmentData, totalPerShipment } = buildAnalyticsReports(data);
    const hasShipments = data.shipments.length > 0;
    const hasTrends = monthlyTrendsData.some((row) => row.shipments > 0 || row.revenue > 0 || row.costs > 0);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: _jsx(ReportCard, { title: "Country-wise Imports", description: "Import value by country of origin", onExportExcel: () => exportCsv('country-wise-imports', countryImportsData), onExportPdf: () => exportPrintableReport('Country-wise Imports', countryImportsData), children: loading ? _jsx(ReportLoading, {}) : countryImportsData.length ? (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: countryImportsData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }), _jsx(XAxis, { dataKey: "country", tick: { fontSize: 10 } }), _jsx(YAxis, { tick: { fontSize: 11 } }), _jsx(Tooltip, { contentStyle: { fontSize: 12 }, formatter: (value) => `$${(value / 1000000).toFixed(1)}M` }), _jsx(Bar, { dataKey: "value", fill: "#0d9488", radius: [4, 4, 0, 0], name: "Import Value" })] }) })) : _jsx(EmptyReport, {}) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, children: _jsx(ReportCard, { title: "Port Performance", description: "Ranked by efficiency", onExportExcel: () => exportCsv('port-performance', portPerformanceData), onExportPdf: () => exportPrintableReport('Port Performance', portPerformanceData), children: loading ? _jsx(ReportLoading, {}) : portPerformanceData.length ? _jsx("div", { className: "space-y-3", children: portPerformanceData.map((port, i) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: cn('flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold', i === 0
                                                ? 'bg-teal/10 text-teal'
                                                : i === 1
                                                    ? 'bg-amber/10 text-amber'
                                                    : i === 2
                                                        ? 'bg-orange-500/10 text-orange-500'
                                                        : 'bg-muted text-muted-foreground'), children: port.rank }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Anchor, { className: "h-3 w-3 text-muted-foreground" }), _jsx("span", { className: "text-xs font-medium", children: port.port })] }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [port.volume, " shipments"] })] }), _jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${port.efficiency}%` }, transition: { delay: 0.3 + i * 0.1, duration: 0.5 }, className: "h-full rounded-full bg-teal" }) })] }), _jsxs("div", { className: "text-right shrink-0", children: [_jsxs("p", { className: "text-xs font-semibold", children: [port.efficiency, "%"] }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: port.avgClearance })] })] }, port.port))) }) : _jsx(EmptyReport, {}) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: _jsx(ReportCard, { title: "Monthly Trends", description: "Revenue vs costs trend", onExportExcel: () => exportCsv('monthly-trends', monthlyTrendsData), onExportPdf: () => exportPrintableReport('Monthly Trends', monthlyTrendsData), children: loading ? _jsx(ReportLoading, {}) : hasTrends ? (_jsx(ResponsiveContainer, { width: "100%", height: 280, children: _jsxs(LineChart, { data: monthlyTrendsData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }), _jsx(YAxis, { tick: { fontSize: 11 } }), _jsx(Tooltip, { contentStyle: { fontSize: 12 }, formatter: (value) => `$${(value / 1000000).toFixed(2)}M` }), _jsx(Legend, { wrapperStyle: { fontSize: 11 } }), _jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "#0d9488", strokeWidth: 2, name: "Revenue" }), _jsx(Line, { type: "monotone", dataKey: "costs", stroke: "#f97316", strokeWidth: 2, name: "Costs" })] }) })) : _jsx(EmptyReport, {}) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.25 }, children: _jsx(ReportCard, { title: "Cost per Shipment Analysis", description: "Average cost breakdown per shipment", onExportExcel: () => exportCsv('cost-per-shipment', costPerShipmentData), onExportPdf: () => exportPrintableReport('Cost per Shipment Analysis', costPerShipmentData), children: loading ? _jsx(ReportLoading, {}) : hasShipments && costPerShipmentData.length ? (_jsxs("div", { className: "space-y-4 mt-2", children: [costPerShipmentData.map((item) => (_jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs", children: item.category }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs font-medium", children: ["$", item.amount.toLocaleString()] }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["(", item.pct, "%)"] })] })] }), _jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${item.pct}%` }, transition: { delay: 0.5, duration: 0.5 }, className: cn('h-full rounded-full', item.color) }) })] }, item.category))), _jsx(Separator, {}), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-semibold", children: "Total per Shipment" }), _jsxs("span", { className: "text-sm font-bold text-teal", children: ["$", totalPerShipment.toLocaleString()] })] })] })) : _jsx(EmptyReport, {}) }) })] })] }));
}
