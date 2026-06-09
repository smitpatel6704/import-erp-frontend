'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Truck, Warehouse, MapPin, Clock, CheckCircle2, Package, Eye, Plus, Search, Navigation, } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
const statusColors = {
    scheduled: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    dispatched: 'bg-teal/10 text-teal border-teal/20',
    in_transit: 'bg-amber/10 text-amber border-amber/20',
    delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
};
const podStatusColors = {
    pending: 'bg-amber/10 text-amber border-amber/20',
    delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
};
function formatStatus(status) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
export function LogisticsModule() {
    var _a, _b, _c, _d;
    const [logistics, setLogistics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('transport');
    const [search, setSearch] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [newDialogOpen, setNewDialogOpen] = useState(false);
    const fetchLogistics = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/logistics?limit=100`);
            const json = await res.json();
            if (json.data) {
                setLogistics(json.data);
            }
        }
        catch (_a) {
            // silent
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchLogistics();
    }, [fetchLogistics]);
    const transportRecords = logistics.filter((l) => l.type === 'transport');
    const warehouseRecords = logistics.filter((l) => l.type === 'warehouse');
    const stats = [
        {
            title: 'Total Operations',
            value: logistics.length,
            icon: Navigation,
            color: 'text-teal',
            bgColor: 'bg-teal/10',
        },
        {
            title: 'Transport Active',
            value: transportRecords.filter((t) => ['dispatched', 'in_transit'].includes(t.status)).length,
            icon: Truck,
            color: 'text-amber',
            bgColor: 'bg-amber/10',
        },
        {
            title: 'Warehouse Active',
            value: warehouseRecords.length,
            icon: Warehouse,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            title: 'Delivered',
            value: logistics.filter((l) => l.status === 'delivered').length,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-500/10',
        },
        {
            title: 'Pending Dispatch',
            value: logistics.filter((l) => l.status === 'scheduled').length,
            icon: Clock,
            color: 'text-slate-500',
            bgColor: 'bg-slate-500/10',
        },
    ];
    const currentRecords = activeTab === 'transport' ? transportRecords : warehouseRecords;
    const filteredRecords = currentRecords.filter((r) => {
        var _a, _b, _c, _d, _e;
        return ((_b = (_a = r.shipment) === null || _a === void 0 ? void 0 : _a.shipmentNumber) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) ||
            ((_c = r.driverName) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase())) ||
            ((_d = r.transportVendor) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase())) ||
            ((_e = r.vehicleNumber) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(search.toLowerCase()));
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", children: stats.map((stat, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.3 }, children: _jsx(Card, { className: "shadow-sm hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider", children: stat.title }), _jsx("p", { className: "text-2xl font-bold tracking-tight", children: stat.value })] }), _jsx("div", { className: cn('rounded-lg p-2', stat.bgColor), children: _jsx(stat.icon, { className: cn('h-4 w-4', stat.color) }) })] }) }) }) }, stat.title))) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3, duration: 0.3 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsx("div", { className: "flex items-center gap-3", children: _jsx(Tabs, { value: activeTab, onValueChange: setActiveTab, children: _jsxs(TabsList, { className: "h-8", children: [_jsxs(TabsTrigger, { value: "transport", className: "text-xs h-6 px-3", children: [_jsx(Truck, { className: "h-3.5 w-3.5 mr-1" }), " Transport"] }), _jsxs(TabsTrigger, { value: "warehouse", className: "text-xs h-6 px-3", children: [_jsx(Warehouse, { className: "h-3.5 w-3.5 mr-1" }), " Warehouse"] })] }) }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }), _jsx(Input, { placeholder: "Search...", value: search, onChange: (e) => setSearch(e.target.value), className: "h-8 w-48 pl-8 text-xs" })] }), _jsxs(Button, { size: "sm", className: "h-8 text-xs", onClick: () => setNewDialogOpen(true), children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), " New"] })] })] }) }), _jsx(CardContent, { className: "p-0", children: _jsx("div", { className: "overflow-x-auto max-h-[500px] overflow-y-auto", children: activeTab === 'transport' ? (_jsx(TransportTable, { records: filteredRecords, loading: loading, onView: (r) => {
                                        setSelectedRecord(r);
                                        setDetailOpen(true);
                                    } })) : (_jsx(WarehouseTable, { records: filteredRecords, loading: loading, onView: (r) => {
                                        setSelectedRecord(r);
                                        setDetailOpen(true);
                                    } })) }) })] }) }), _jsx(Dialog, { open: detailOpen, onOpenChange: setDetailOpen, children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [(selectedRecord === null || selectedRecord === void 0 ? void 0 : selectedRecord.type) === 'transport' ? (_jsx(Truck, { className: "h-5 w-5 text-teal" })) : (_jsx(Warehouse, { className: "h-5 w-5 text-orange-500" })), "Logistics Details"] }), _jsxs(DialogDescription, { children: ["Shipment: ", ((_a = selectedRecord === null || selectedRecord === void 0 ? void 0 : selectedRecord.shipment) === null || _a === void 0 ? void 0 : _a.shipmentNumber) || '-'] })] }), selectedRecord && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Type" }), _jsx(Badge, { variant: "outline", className: "text-xs mt-1", children: formatStatus(selectedRecord.type) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Status" }), _jsx(Badge, { variant: "outline", className: cn('text-xs mt-1', statusColors[selectedRecord.status] || ''), children: formatStatus(selectedRecord.status) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Company" }), _jsx("p", { className: "text-sm font-medium", children: ((_c = (_b = selectedRecord.shipment) === null || _b === void 0 ? void 0 : _b.company) === null || _c === void 0 ? void 0 : _c.name) || '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Destination Port" }), _jsx("p", { className: "text-sm font-medium", children: ((_d = selectedRecord.shipment) === null || _d === void 0 ? void 0 : _d.destinationPort) || '-' })] })] }), _jsx(Separator, {}), selectedRecord.type === 'transport' ? (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Driver Name" }), _jsx("p", { className: "text-sm font-medium", children: selectedRecord.driverName || '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Driver Phone" }), _jsx("p", { className: "text-sm font-medium", children: selectedRecord.driverPhone || '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Vehicle Number" }), _jsx("p", { className: "text-sm font-medium", children: selectedRecord.vehicleNumber || '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Transport Vendor" }), _jsx("p", { className: "text-sm font-medium", children: selectedRecord.transportVendor || '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Route" }), _jsxs("p", { className: "text-sm font-medium", children: [selectedRecord.routeFrom || '?', " \u2192 ", selectedRecord.routeTo || '?'] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "POD Status" }), _jsx(Badge, { variant: "outline", className: cn('text-xs', podStatusColors[selectedRecord.podStatus] || ''), children: formatStatus(selectedRecord.podStatus) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Dispatch Date" }), _jsx("p", { className: "text-sm", children: selectedRecord.dispatchDate
                                                        ? format(new Date(selectedRecord.dispatchDate), 'MMM dd, yyyy HH:mm')
                                                        : '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Delivery Date" }), _jsx("p", { className: "text-sm", children: selectedRecord.deliveryDate
                                                        ? format(new Date(selectedRecord.deliveryDate), 'MMM dd, yyyy HH:mm')
                                                        : '-' })] })] })) : (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Warehouse Entry" }), _jsx("p", { className: "text-sm", children: selectedRecord.warehouseEntry
                                                        ? format(new Date(selectedRecord.warehouseEntry), 'MMM dd, yyyy HH:mm')
                                                        : '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Offload Date" }), _jsx("p", { className: "text-sm", children: selectedRecord.offloadDate
                                                        ? format(new Date(selectedRecord.offloadDate), 'MMM dd, yyyy HH:mm')
                                                        : '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Storage Days" }), _jsxs("p", { className: "text-sm font-medium", children: [selectedRecord.storageDays, " days"] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Transport Vendor" }), _jsx("p", { className: "text-sm font-medium", children: selectedRecord.transportVendor || '-' })] })] })), selectedRecord.notes && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Notes" }), _jsx("p", { className: "text-sm mt-1 p-3 bg-muted/50 rounded-lg", children: selectedRecord.notes })] })] })), _jsx(Separator, {}), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Timeline" }), _jsx("div", { className: "mt-2 space-y-2", children: [
                                                { label: 'Record Created', date: selectedRecord.createdAt },
                                                { label: 'Dispatched', date: selectedRecord.dispatchDate },
                                                { label: 'Warehouse Entry', date: selectedRecord.warehouseEntry },
                                                { label: 'Offloaded', date: selectedRecord.offloadDate },
                                                { label: 'Delivered', date: selectedRecord.deliveryDate },
                                            ]
                                                .filter((e) => e.date)
                                                .map((event, i) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-teal shrink-0" }), _jsx("span", { className: "text-xs text-muted-foreground", children: event.label }), _jsx("span", { className: "text-xs ml-auto", children: formatDistanceToNow(new Date(event.date), { addSuffix: true }) })] }, i))) })] })] }))] }) }), _jsx(Dialog, { open: newDialogOpen, onOpenChange: setNewDialogOpen, children: _jsxs(DialogContent, { className: "max-w-lg", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "New Logistics Record" }), _jsx(DialogDescription, { children: "Create a new transport or warehouse entry" })] }), _jsx(NewLogisticsForm, { onClose: () => setNewDialogOpen(false), onCreated: fetchLogistics })] }) })] }));
}
function TransportTable({ records, loading, onView, }) {
    return (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-xs", children: "Shipment" }), _jsx(TableHead, { className: "text-xs", children: "Driver" }), _jsx(TableHead, { className: "text-xs", children: "Vehicle" }), _jsx(TableHead, { className: "text-xs", children: "Vendor" }), _jsx(TableHead, { className: "text-xs", children: "Route" }), _jsx(TableHead, { className: "text-xs", children: "Dispatch Date" }), _jsx(TableHead, { className: "text-xs", children: "Delivery Date" }), _jsx(TableHead, { className: "text-xs", children: "POD Status" }), _jsx(TableHead, { className: "text-xs", children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (Array.from({ length: 5 }).map((_, i) => (_jsx(TableRow, { children: Array.from({ length: 9 }).map((_, j) => (_jsx(TableCell, { children: _jsx("div", { className: "h-4 w-20 bg-muted animate-pulse rounded" }) }, j))) }, i)))) : records.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, className: "text-center py-8 text-muted-foreground text-sm", children: "No transport records found" }) })) : (records.map((record) => {
                    var _a;
                    return (_jsxs(TableRow, { className: "hover:bg-accent/30 transition-colors", children: [_jsx(TableCell, { className: "text-xs font-medium", children: ((_a = record.shipment) === null || _a === void 0 ? void 0 : _a.shipmentNumber) || '-' }), _jsx(TableCell, { className: "text-xs", children: record.driverName || '-' }), _jsx(TableCell, { className: "text-xs", children: record.vehicleNumber || '-' }), _jsx(TableCell, { className: "text-xs", children: record.transportVendor || '-' }), _jsx(TableCell, { className: "text-xs", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "h-3 w-3 text-muted-foreground" }), _jsx("span", { children: record.routeFrom || '?' }), _jsx("span", { className: "text-muted-foreground", children: "\u2192" }), _jsx("span", { children: record.routeTo || '?' })] }) }), _jsx(TableCell, { className: "text-xs text-muted-foreground", children: record.dispatchDate
                                    ? format(new Date(record.dispatchDate), 'MMM dd, yyyy')
                                    : '-' }), _jsx(TableCell, { className: "text-xs text-muted-foreground", children: record.deliveryDate
                                    ? format(new Date(record.deliveryDate), 'MMM dd, yyyy')
                                    : '-' }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', podStatusColors[record.podStatus] || ''), children: formatStatus(record.podStatus) }) }), _jsx(TableCell, { children: _jsxs(Button, { variant: "ghost", size: "sm", className: "h-7 text-xs", onClick: () => onView(record), children: [_jsx(Eye, { className: "h-3.5 w-3.5 mr-1" }), " View"] }) })] }, record.id));
                })) })] }));
}
function WarehouseTable({ records, loading, onView, }) {
    return (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-xs", children: "Shipment" }), _jsx(TableHead, { className: "text-xs", children: "Entry Date" }), _jsx(TableHead, { className: "text-xs", children: "Offload Date" }), _jsx(TableHead, { className: "text-xs", children: "Storage Days" }), _jsx(TableHead, { className: "text-xs", children: "Status" }), _jsx(TableHead, { className: "text-xs", children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (Array.from({ length: 5 }).map((_, i) => (_jsx(TableRow, { children: Array.from({ length: 6 }).map((_, j) => (_jsx(TableCell, { children: _jsx("div", { className: "h-4 w-20 bg-muted animate-pulse rounded" }) }, j))) }, i)))) : records.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground text-sm", children: "No warehouse records found" }) })) : (records.map((record) => {
                    var _a;
                    return (_jsxs(TableRow, { className: "hover:bg-accent/30 transition-colors", children: [_jsx(TableCell, { className: "text-xs font-medium", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Package, { className: "h-3.5 w-3.5 text-orange-500" }), ((_a = record.shipment) === null || _a === void 0 ? void 0 : _a.shipmentNumber) || '-'] }) }), _jsx(TableCell, { className: "text-xs text-muted-foreground", children: record.warehouseEntry
                                    ? format(new Date(record.warehouseEntry), 'MMM dd, yyyy')
                                    : '-' }), _jsx(TableCell, { className: "text-xs text-muted-foreground", children: record.offloadDate
                                    ? format(new Date(record.offloadDate), 'MMM dd, yyyy')
                                    : '-' }), _jsx(TableCell, { children: _jsxs(Badge, { variant: "secondary", className: "text-[10px]", children: [record.storageDays, " days"] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', statusColors[record.status] || ''), children: formatStatus(record.status) }) }), _jsx(TableCell, { children: _jsxs(Button, { variant: "ghost", size: "sm", className: "h-7 text-xs", onClick: () => onView(record), children: [_jsx(Eye, { className: "h-3.5 w-3.5 mr-1" }), " View"] }) })] }, record.id));
                })) })] }));
}
function NewLogisticsForm({ onClose, onCreated }) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        shipmentId: '',
        type: 'transport',
        driverName: '',
        driverPhone: '',
        vehicleNumber: '',
        transportVendor: '',
        routeFrom: '',
        routeTo: '',
        status: 'scheduled',
        notes: '',
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/logistics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                onCreated();
                onClose();
            }
        }
        catch (_a) {
            // silent
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "col-span-2", children: [_jsx(Label, { className: "text-xs", children: "Shipment ID" }), _jsx(Input, { value: form.shipmentId, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { shipmentId: e.target.value })), placeholder: "Enter shipment ID", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Type" }), _jsxs("select", { value: form.type, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { type: e.target.value })), className: "mt-1 flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs", children: [_jsx("option", { value: "transport", children: "Transport" }), _jsx("option", { value: "warehouse", children: "Warehouse" })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Driver Name" }), _jsx(Input, { value: form.driverName, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { driverName: e.target.value })), placeholder: "Driver name", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Vehicle Number" }), _jsx(Input, { value: form.vehicleNumber, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { vehicleNumber: e.target.value })), placeholder: "Vehicle number", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Transport Vendor" }), _jsx(Input, { value: form.transportVendor, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { transportVendor: e.target.value })), placeholder: "Vendor name", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Route From" }), _jsx(Input, { value: form.routeFrom, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { routeFrom: e.target.value })), placeholder: "Origin", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Route To" }), _jsx(Input, { value: form.routeTo, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { routeTo: e.target.value })), placeholder: "Destination", className: "h-8 text-xs mt-1" })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Notes" }), _jsx(Input, { value: form.notes, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { notes: e.target.value })), placeholder: "Any notes...", className: "h-8 text-xs mt-1" })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "submit", size: "sm", disabled: submitting, children: submitting ? 'Creating...' : 'Create Record' })] })] }));
}
