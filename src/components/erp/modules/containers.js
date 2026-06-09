'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Box, Search, Plus, Eye, Package, MapPin, Ship, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import { format } from 'date-fns';
// ─── Constants ────────────────────────────────────────────────────────────────
const CONTAINER_STATUSES = [
    { value: 'all', label: 'All Statuses' },
    { value: 'at_pol', label: 'At POL' },
    { value: 'loaded', label: 'Loaded' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'at_pod', label: 'At POD' },
    { value: 'customs', label: 'Customs' },
    { value: 'transport', label: 'Transport' },
    { value: 'offloaded', label: 'Offloaded' },
    { value: 'delivered', label: 'Delivered' },
];
// Types and sizes are now fetched dynamically from the db API
const statusLabelMap = Object.fromEntries(CONTAINER_STATUSES.map(s => [s.value, s.label]));
const statusColorMap = {
    at_pol: 'bg-amber/10 text-amber-dark border-amber/20 dark:bg-amber/20 dark:text-amber-light',
    loaded: 'bg-teal/10 text-teal-dark border-teal/20 dark:bg-teal/20 dark:text-teal-light',
    in_transit: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
    at_pod: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
    customs: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    transport: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
    offloaded: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
    delivered: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
};
const statusDotMap = {
    at_pol: 'bg-amber',
    loaded: 'bg-teal',
    in_transit: 'bg-sky-500',
    at_pod: 'bg-violet-500',
    customs: 'bg-orange-500',
    transport: 'bg-pink-500',
    offloaded: 'bg-rose-500',
    delivered: 'bg-green-500',
};
const typeIconMap = {
    standard: Box,
    reefer: Package,
    open_top: Box,
    flat_rack: Box,
    tank: Box,
};
// ─── Main Component ───────────────────────────────────────────────────────────
export default function ContainersModule() {
    var _a;
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sizeFilter, setSizeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    // Detail dialog
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedContainer, setSelectedContainer] = useState(null);
    // New container dialog
    const [newContainerOpen, setNewContainerOpen] = useState(false);
    const [newForm, setNewForm] = useState({
        containerNumber: '', containerType: '', containerSize: '',
        sealNumber: '', stuffingType: 'fcl', weightCapacity: '', currentWeight: '',
        status: 'at_pol', currentLocation: '', shipmentId: '',
    });
    const [containerTypes, setContainerTypes] = useState([{ value: 'all', label: 'All Types' }]);
    const [containerSizes, setContainerSizes] = useState([{ value: 'all', label: 'All Sizes' }]);
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [sizes, types] = await Promise.all([
                    fetch('/api/settings/options?category=container_size').then(r => r.json()),
                    fetch('/api/settings/options?category=container_type').then(r => r.json()),
                ]);
                if (sizes.data) {
                    setContainerSizes([
                        { value: 'all', label: 'All Sizes' },
                        ...sizes.data.map((d) => ({ value: d.value, label: d.label }))
                    ]);
                }
                if (types.data) {
                    setContainerTypes([
                        { value: 'all', label: 'All Types' },
                        ...types.data.map((d) => ({ value: d.value, label: d.label }))
                    ]);
                }
            }
            catch (err) {
                console.error('Failed to fetch settings options:', err);
            }
        };
        fetchOptions();
    }, []);
    const fetchContainers = useCallback(async () => {
        var _a;
        setLoading(true);
        try {
            const params = new URLSearchParams(Object.assign(Object.assign(Object.assign(Object.assign({ page: String(page), limit: '20' }, (statusFilter !== 'all' && { status: statusFilter })), (typeFilter !== 'all' && { containerType: typeFilter })), (sizeFilter !== 'all' && { containerSize: sizeFilter })), (searchQuery && { search: searchQuery })));
            const res = await fetch(`/api/containers?${params}`);
            const json = await res.json();
            setContainers(json.data || []);
            setTotalCount(((_a = json.pagination) === null || _a === void 0 ? void 0 : _a.total) || 0);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    }, [page, statusFilter, typeFilter, sizeFilter, searchQuery]);
    useEffect(() => { fetchContainers(); }, [fetchContainers]);
    const createContainer = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/containers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign(Object.assign({}, newForm), { weightCapacity: parseFloat(newForm.weightCapacity) || 0, currentWeight: parseFloat(newForm.currentWeight) || 0 })),
            });
            setNewContainerOpen(false);
            setNewForm({
                containerNumber: '', containerType: 'standard', containerSize: '20ft',
                sealNumber: '', stuffingType: 'fcl', weightCapacity: '', currentWeight: '',
                status: 'at_pol', currentLocation: '', shipmentId: '',
            });
            fetchContainers();
        }
        catch (e) {
            console.error(e);
        }
    };
    // Status counts for stats
    const statusCounts = React.useMemo(() => {
        const counts = {};
        containers.forEach((c) => {
            counts[c.status] = (counts[c.status] || 0) + 1;
        });
        return counts;
    }, [containers]);
    // Group by location for status map
    const locationGroups = React.useMemo(() => {
        const groups = {};
        containers.forEach((c) => {
            const loc = c.currentLocation || 'Unknown';
            if (!groups[loc])
                groups[loc] = [];
            groups[loc].push(c);
        });
        return groups;
    }, [containers]);
    const containerTypeLabel = (type) => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, className: "space-y-4", children: [_jsx(Card, { className: "glass border-0 shadow-enterprise", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-3", children: [_jsxs("div", { className: "relative flex-1 w-full sm:max-w-xs", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search container, seal, location...", value: searchQuery, onChange: (e) => { setSearchQuery(e.target.value); setPage(1); }, className: "pl-9 h-9 text-sm" })] }), _jsxs(Select, { value: statusFilter, onValueChange: (v) => { setStatusFilter(v); setPage(1); }, children: [_jsx(SelectTrigger, { className: "w-full sm:w-[160px] h-9 text-sm", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: CONTAINER_STATUSES.map((s) => (_jsx(SelectItem, { value: s.value, children: s.label }, s.value))) })] }), _jsxs(Select, { value: typeFilter, onValueChange: (v) => { setTypeFilter(v); setPage(1); }, children: [_jsx(SelectTrigger, { className: "w-full sm:w-[140px] h-9 text-sm", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: containerTypes.map((t) => (_jsx(SelectItem, { value: t.value, children: t.label }, t.value))) })] }), _jsxs(Select, { value: sizeFilter, onValueChange: (v) => { setSizeFilter(v); setPage(1); }, children: [_jsx(SelectTrigger, { className: "w-full sm:w-[120px] h-9 text-sm", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: containerSizes.map((s) => (_jsx(SelectItem, { value: s.value, children: s.label }, s.value))) })] }), _jsxs(Button, { size: "sm", className: "h-9 text-xs ml-auto", onClick: () => setNewContainerOpen(true), children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), " New Container"] })] }) }) }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3", children: CONTAINER_STATUSES.filter(s => s.value !== 'all').map((status, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04, duration: 0.25 }, children: _jsx(Card, { className: cn('glass border-0 shadow-enterprise cursor-pointer hover-lift transition-colors', statusFilter === status.value && 'ring-2 ring-teal/30'), onClick: () => { setStatusFilter(statusFilter === status.value ? 'all' : status.value); setPage(1); }, children: _jsxs(CardContent, { className: "p-3 text-center", children: [_jsx("div", { className: cn('h-2 w-2 rounded-full mx-auto mb-2', statusDotMap[status.value]) }), _jsx("p", { className: "text-xl font-bold", children: statusCounts[status.value] || 0 }), _jsx("p", { className: "text-[10px] text-muted-foreground font-medium mt-0.5", children: status.label })] }) }) }, status.value))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: "lg:col-span-3", children: _jsx(Card, { className: "glass border-0 shadow-enterprise", children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-[11px] font-semibold", children: "Container" }), _jsx(TableHead, { className: "text-[11px] font-semibold hidden sm:table-cell", children: "Type / Size" }), _jsx(TableHead, { className: "text-[11px] font-semibold hidden md:table-cell", children: "Seal" }), _jsx(TableHead, { className: "text-[11px] font-semibold", children: "Shipment" }), _jsx(TableHead, { className: "text-[11px] font-semibold hidden lg:table-cell", children: "Weight" }), _jsx(TableHead, { className: "text-[11px] font-semibold", children: "Status" }), _jsx(TableHead, { className: "text-[11px] font-semibold hidden md:table-cell", children: "Location" }), _jsx(TableHead, { className: "text-[11px] font-semibold w-10" })] }) }), _jsx(TableBody, { children: loading ? (Array.from({ length: 5 }).map((_, i) => (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, children: _jsx("div", { className: "h-8 bg-muted rounded animate-pulse" }) }) }, i)))) : containers.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-12 text-muted-foreground", children: "No containers found" }) })) : (containers.map((c, i) => (_jsxs(motion.tr, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.03, duration: 0.2 }, className: "group cursor-pointer hover:bg-accent/30 transition-colors", onClick: () => { setSelectedContainer(c); setDetailOpen(true); }, children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10 shrink-0", children: _jsx(Box, { className: "h-4 w-4 text-amber-dark" }) }), _jsx("span", { className: "text-sm font-medium", children: c.containerNumber })] }) }), _jsxs(TableCell, { className: "hidden sm:table-cell", children: [_jsx("p", { className: "text-xs", children: containerTypeLabel(c.containerType) }), _jsx("p", { className: "text-[11px] text-muted-foreground", children: c.containerSize })] }), _jsx(TableCell, { className: "hidden md:table-cell text-xs", children: c.sealNumber || '—' }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Ship, { className: "h-3 w-3 text-muted-foreground" }), _jsx("span", { className: "text-xs", children: c.shipment.shipmentNumber })] }) }), _jsx(TableCell, { className: "hidden lg:table-cell", children: _jsxs("div", { className: "space-y-1", children: [_jsxs("p", { className: "text-xs", children: [c.currentWeight, "/", c.weightCapacity, " kg"] }), _jsx(Progress, { value: c.weightCapacity ? (c.currentWeight / c.weightCapacity) * 100 : 0, className: "h-1.5" })] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', statusColorMap[c.status] || ''), children: statusLabelMap[c.status] || c.status }) }), _jsx(TableCell, { className: "hidden md:table-cell", children: _jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(MapPin, { className: "h-3 w-3" }), c.currentLocation || '—'] }) }), _jsx(TableCell, { children: _jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(Eye, { className: "h-3.5 w-3.5" }) }) })] }, c.id)))) })] }) }), totalCount > 20 && (_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t", children: [_jsxs("p", { className: "text-xs text-muted-foreground", children: ["Showing ", (page - 1) * 20 + 1, "\u2013", Math.min(page * 20, totalCount), " of ", totalCount] }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage(page - 1), className: "h-7 text-xs", children: "Prev" }), _jsx(Button, { variant: "outline", size: "sm", disabled: page * 20 >= totalCount, onClick: () => setPage(page + 1), className: "h-7 text-xs", children: "Next" })] })] }))] }) }) }), _jsxs(Card, { className: "glass border-0 shadow-enterprise", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: "text-sm font-semibold", children: "By Location" }), _jsxs(CardDescription, { className: "text-[11px]", children: [Object.keys(locationGroups).length, " locations"] })] }), _jsx(CardContent, { className: "pt-0", children: _jsx(ScrollArea, { className: "h-[400px]", children: _jsx("div", { className: "space-y-3", children: Object.entries(locationGroups).map(([loc, items]) => (_jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(MapPin, { className: "h-3 w-3 text-muted-foreground" }), _jsx("span", { className: "text-xs font-medium truncate max-w-[120px]", children: loc })] }), _jsx(Badge, { variant: "secondary", className: "text-[10px] h-4 px-1.5", children: items.length })] }), _jsx("div", { className: "space-y-1 pl-5", children: items.map((c) => (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: cn('h-1.5 w-1.5 rounded-full shrink-0', statusDotMap[c.status]) }), _jsx("span", { className: "text-[10px] text-muted-foreground truncate", children: c.containerNumber })] }, c.id))) })] }, loc))) }) }) })] })] }), _jsx(Dialog, { open: detailOpen, onOpenChange: setDetailOpen, children: _jsxs(DialogContent, { className: "max-w-lg max-h-[75vh] overflow-hidden p-0", children: [_jsx(DialogHeader, { className: "px-6 pt-6 pb-4 border-b", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-amber/10", children: _jsx(Box, { className: "h-5 w-5 text-amber-dark" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { children: (selectedContainer === null || selectedContainer === void 0 ? void 0 : selectedContainer.containerNumber) || 'Loading...' }), _jsx(DialogDescription, { className: "text-xs mt-0.5", children: selectedContainer ? `${containerTypeLabel(selectedContainer.containerType)} — ${selectedContainer.containerSize}` : '' })] }), selectedContainer && (_jsx(Badge, { variant: "outline", className: cn('ml-auto text-[10px] font-semibold', statusColorMap[selectedContainer.status]), children: statusLabelMap[selectedContainer.status] || selectedContainer.status }))] }) }), selectedContainer && (_jsx(ScrollArea, { className: "h-[55vh] px-6 pb-6", children: _jsxs("div", { className: "space-y-4 pt-4", children: [_jsx("div", { className: "grid grid-cols-2 gap-4", children: [
                                            { label: 'Container Number', value: selectedContainer.containerNumber },
                                            { label: 'Type', value: containerTypeLabel(selectedContainer.containerType) },
                                            { label: 'Size', value: selectedContainer.containerSize },
                                            { label: 'Seal Number', value: selectedContainer.sealNumber },
                                            { label: 'Stuffing Type', value: (_a = selectedContainer.stuffingType) === null || _a === void 0 ? void 0 : _a.toUpperCase() },
                                            { label: 'Status', value: statusLabelMap[selectedContainer.status] || selectedContainer.status },
                                            { label: 'Current Location', value: selectedContainer.currentLocation },
                                            { label: 'Current Weight', value: `${selectedContainer.currentWeight} kg` },
                                            { label: 'Weight Capacity', value: `${selectedContainer.weightCapacity} kg` },
                                            { label: 'Created', value: format(new Date(selectedContainer.createdAt), 'MMM d, yyyy') },
                                        ].map((field) => (_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider", children: field.label }), _jsx("p", { className: "text-sm mt-0.5", children: field.value || '—' })] }, field.label))) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("span", { className: "text-xs font-medium", children: "Weight Utilization" }), _jsx("span", { className: "text-xs text-muted-foreground", children: selectedContainer.weightCapacity
                                                            ? `${((selectedContainer.currentWeight / selectedContainer.weightCapacity) * 100).toFixed(0)}%`
                                                            : 'N/A' })] }), _jsx(Progress, { value: selectedContainer.weightCapacity
                                                    ? (selectedContainer.currentWeight / selectedContainer.weightCapacity) * 100
                                                    : 0, className: "h-2" })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2", children: "Linked Shipment" }), _jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 shrink-0", children: _jsx(Ship, { className: "h-4 w-4 text-teal" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: selectedContainer.shipment.shipmentNumber }), _jsxs("p", { className: "text-[11px] text-muted-foreground", children: [selectedContainer.shipment.originPort || '?', " \u2192 ", selectedContainer.shipment.destinationPort || '?'] })] }), selectedContainer.shipment.company && (_jsx("span", { className: "text-xs text-muted-foreground", children: selectedContainer.shipment.company.name }))] })] })] }) }))] }) }), _jsx(Dialog, { open: newContainerOpen, onOpenChange: setNewContainerOpen, children: _jsxs(DialogContent, { className: "max-w-lg max-h-[80vh] overflow-hidden p-0", children: [_jsxs(DialogHeader, { className: "px-6 pt-6 pb-4 border-b", children: [_jsx(DialogTitle, { children: "Create New Container" }), _jsx(DialogDescription, { children: "Enter container details" })] }), _jsx(ScrollArea, { className: "h-[60vh] px-6 pb-6", children: _jsxs("div", { className: "space-y-4 pt-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Container Number *" }), _jsx(Input, { value: newForm.containerNumber, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { containerNumber: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "MSKU-1234567" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Type" }), _jsxs(Select, { value: newForm.containerType, onValueChange: (v) => setNewForm(Object.assign(Object.assign({}, newForm), { containerType: v })), children: [_jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: containerTypes.filter(t => t.value !== 'all').map((t) => (_jsx(SelectItem, { value: t.value, children: t.label }, t.value))) })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Size" }), _jsxs(Select, { value: newForm.containerSize, onValueChange: (v) => setNewForm(Object.assign(Object.assign({}, newForm), { containerSize: v })), children: [_jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: containerSizes.filter(s => s.value !== 'all').map((s) => (_jsx(SelectItem, { value: s.value, children: s.label }, s.value))) })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Seal Number" }), _jsx(Input, { value: newForm.sealNumber, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { sealNumber: e.target.value })), className: "h-8 text-sm mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Stuffing Type" }), _jsxs(Select, { value: newForm.stuffingType, onValueChange: (v) => setNewForm(Object.assign(Object.assign({}, newForm), { stuffingType: v })), children: [_jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "fcl", children: "FCL" }), _jsx(SelectItem, { value: "lcl", children: "LCL" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Weight Capacity (kg)" }), _jsx(Input, { type: "number", value: newForm.weightCapacity, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { weightCapacity: e.target.value })), className: "h-8 text-sm mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Current Weight (kg)" }), _jsx(Input, { type: "number", value: newForm.currentWeight, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { currentWeight: e.target.value })), className: "h-8 text-sm mt-1" })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Current Location" }), _jsx(Input, { value: newForm.currentLocation, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { currentLocation: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "Shanghai Port" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Shipment ID" }), _jsx(Input, { value: newForm.shipmentId, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { shipmentId: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "Enter shipment ID" })] })] }) }), _jsxs(DialogFooter, { className: "px-6 py-4 border-t", children: [_jsx(Button, { variant: "outline", onClick: () => setNewContainerOpen(false), className: "h-8 text-xs", children: "Cancel" }), _jsx(Button, { onClick: createContainer, className: "h-8 text-xs", disabled: !newForm.containerNumber || !newForm.shipmentId, children: "Create Container" })] })] }) })] }));
}
