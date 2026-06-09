'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileCheck, DollarSign, CheckCircle2, Clock, AlertTriangle, ChevronRight, Eye, Plus, Search, ArrowRight, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
const dutyStatusColors = {
    pending: 'bg-amber/10 text-amber border-amber/20',
    assessed: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    waived: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};
const clearanceStatusColors = {
    document_submission: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    duty_assessment: 'bg-amber/10 text-amber border-amber/20',
    verification: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    duty_payment: 'bg-teal/10 text-teal border-teal/20',
    clearance_approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};
const clearanceStages = [
    { key: 'document_submission', label: 'Document Submission', icon: FileCheck },
    { key: 'duty_assessment', label: 'Duty Assessment', icon: Search },
    { key: 'verification', label: 'Verification', icon: Shield },
    { key: 'duty_payment', label: 'Duty Payment', icon: DollarSign },
    { key: 'clearance_approved', label: 'Clearance Approved', icon: CheckCircle2 },
];
function formatStatus(status) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
export function CustomsModule() {
    var _a, _b, _c, _d, _e;
    const [customs, setCustoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [newDialogOpen, setNewDialogOpen] = useState(false);
    const [stageCounts, setStageCounts] = useState({});
    const fetchCustoms = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/customs?limit=50`);
            const json = await res.json();
            if (json.data) {
                setCustoms(json.data);
                const counts = {};
                clearanceStages.forEach((s) => (counts[s.key] = 0));
                json.data.forEach((r) => {
                    if (counts[r.clearanceStatus] !== undefined)
                        counts[r.clearanceStatus]++;
                });
                setStageCounts(counts);
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
        fetchCustoms();
    }, [fetchCustoms]);
    const stats = [
        {
            title: 'Total Clearances',
            value: customs.length,
            icon: Shield,
            color: 'text-teal',
            bgColor: 'bg-teal/10',
        },
        {
            title: 'Pending Assessment',
            value: customs.filter((c) => c.dutyStatus === 'pending').length,
            icon: Clock,
            color: 'text-amber',
            bgColor: 'bg-amber/10',
        },
        {
            title: 'Duty Paid',
            value: customs.filter((c) => c.dutyStatus === 'paid').length,
            icon: DollarSign,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-500/10',
        },
        {
            title: 'Clearance Approved',
            value: customs.filter((c) => c.clearanceStatus === 'clearance_approved').length,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-500/10',
        },
        {
            title: 'Pending Duty Payment',
            value: customs.filter((c) => c.clearanceStatus === 'duty_payment').length,
            icon: AlertTriangle,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
    ];
    const filteredCustoms = customs.filter((c) => {
        var _a, _b, _c;
        return ((_b = (_a = c.shipment) === null || _a === void 0 ? void 0 : _a.shipmentNumber) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) ||
            ((_c = c.chaName) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase()));
    });
    const totalDuty = customs.reduce((sum, c) => sum + c.dutyAmount, 0);
    const totalAssessed = customs.reduce((sum, c) => sum + c.assessmentValue, 0);
    const currentStageIndex = (status) => {
        const idx = clearanceStages.findIndex((s) => s.key === status);
        return idx >= 0 ? idx : 0;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", children: stats.map((stat, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.3 }, children: _jsx(Card, { className: "shadow-sm hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider", children: stat.title }), _jsx("p", { className: "text-2xl font-bold tracking-tight", children: stat.value })] }), _jsx("div", { className: cn('rounded-lg p-2', stat.bgColor), children: _jsx(stat.icon, { className: cn('h-4 w-4', stat.color) }) })] }) }) }) }, stat.title))) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3, duration: 0.3 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Customs Workflow Pipeline" }), _jsxs(CardDescription, { className: "text-xs", children: ["Clearance stages overview \u2014 Total Assessed: $", totalAssessed.toLocaleString(), " | Total Duty: $", totalDuty.toLocaleString()] })] }), _jsx(CardContent, { className: "px-6 pb-6", children: _jsx("div", { className: "flex items-center justify-between gap-2 overflow-x-auto pb-2", children: clearanceStages.map((stage, i) => {
                                    const StageIcon = stage.icon;
                                    return (_jsxs(React.Fragment, { children: [_jsxs("div", { className: "flex flex-col items-center gap-2 min-w-[120px]", children: [_jsx("div", { className: cn('flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors', stageCounts[stage.key] > 0
                                                            ? clearanceStatusColors[stage.key].replace('border-', 'border-').replace('/20', '/40')
                                                            : 'border-muted bg-muted/30'), children: _jsx(StageIcon, { className: cn('h-5 w-5', stageCounts[stage.key] > 0
                                                                ? clearanceStatusColors[stage.key].split(' ')[1]
                                                                : 'text-muted-foreground') }) }), _jsx("span", { className: "text-xs font-medium text-center", children: stage.label }), _jsx(Badge, { variant: "secondary", className: cn('text-xs', stageCounts[stage.key] > 0
                                                            ? clearanceStatusColors[stage.key]
                                                            : 'bg-muted text-muted-foreground'), children: stageCounts[stage.key] })] }), i < clearanceStages.length - 1 && (_jsx(ArrowRight, { className: "h-4 w-4 text-muted-foreground shrink-0" }))] }, stage.key));
                                }) }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4, duration: 0.3 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Customs Records" }), _jsxs(CardDescription, { className: "text-xs", children: [filteredCustoms.length, " clearance records"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }), _jsx(Input, { placeholder: "Search shipment, CHA...", value: search, onChange: (e) => setSearch(e.target.value), className: "h-8 w-48 pl-8 text-xs" })] }), _jsxs(Button, { size: "sm", className: "h-8 text-xs", onClick: () => setNewDialogOpen(true), children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), " New Record"] })] })] }) }), _jsx(CardContent, { className: "p-0", children: _jsx("div", { className: "overflow-x-auto max-h-[500px] overflow-y-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-xs", children: "Shipment" }), _jsx(TableHead, { className: "text-xs", children: "CHA Name" }), _jsx(TableHead, { className: "text-xs", children: "Assessment Value" }), _jsx(TableHead, { className: "text-xs", children: "Duty Amount" }), _jsx(TableHead, { className: "text-xs", children: "Duty Status" }), _jsx(TableHead, { className: "text-xs", children: "Clearance Status" }), _jsx(TableHead, { className: "text-xs", children: "Assessment Date" }), _jsx(TableHead, { className: "text-xs", children: "Payment Date" }), _jsx(TableHead, { className: "text-xs", children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (Array.from({ length: 5 }).map((_, i) => (_jsx(TableRow, { children: Array.from({ length: 9 }).map((_, j) => (_jsx(TableCell, { children: _jsx("div", { className: "h-4 w-20 bg-muted animate-pulse rounded" }) }, j))) }, i)))) : filteredCustoms.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, className: "text-center py-8 text-muted-foreground text-sm", children: "No customs records found" }) })) : (filteredCustoms.map((record) => {
                                                var _a;
                                                return (_jsxs(TableRow, { className: "hover:bg-accent/30 transition-colors", children: [_jsx(TableCell, { className: "text-xs font-medium", children: ((_a = record.shipment) === null || _a === void 0 ? void 0 : _a.shipmentNumber) || '-' }), _jsx(TableCell, { className: "text-xs", children: record.chaName || '-' }), _jsxs(TableCell, { className: "text-xs", children: ["$", record.assessmentValue.toLocaleString()] }), _jsxs(TableCell, { className: "text-xs", children: ["$", record.dutyAmount.toLocaleString()] }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', dutyStatusColors[record.dutyStatus] || ''), children: formatStatus(record.dutyStatus) }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', clearanceStatusColors[record.clearanceStatus] || ''), children: formatStatus(record.clearanceStatus) }) }), _jsx(TableCell, { className: "text-xs text-muted-foreground", children: record.assessmentDate
                                                                ? format(new Date(record.assessmentDate), 'MMM dd, yyyy')
                                                                : '-' }), _jsx(TableCell, { className: "text-xs text-muted-foreground", children: record.paymentDate
                                                                ? format(new Date(record.paymentDate), 'MMM dd, yyyy')
                                                                : '-' }), _jsx(TableCell, { children: _jsxs(Button, { variant: "ghost", size: "sm", className: "h-7 text-xs", onClick: () => {
                                                                    setSelectedRecord(record);
                                                                    setDetailOpen(true);
                                                                }, children: [_jsx(Eye, { className: "h-3.5 w-3.5 mr-1" }), " View"] }) })] }, record.id));
                                            })) })] }) }) })] }) }), _jsx(Dialog, { open: detailOpen, onOpenChange: setDetailOpen, children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5 text-teal" }), "Customs Clearance Details"] }), _jsxs(DialogDescription, { children: ["Shipment: ", ((_a = selectedRecord === null || selectedRecord === void 0 ? void 0 : selectedRecord.shipment) === null || _a === void 0 ? void 0 : _a.shipmentNumber) || '-'] })] }), selectedRecord && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center gap-1 overflow-x-auto pb-2", children: clearanceStages.map((stage, i) => {
                                        const stageIdx = currentStageIndex(selectedRecord.clearanceStatus);
                                        const isCompleted = i <= stageIdx;
                                        const isCurrent = i === stageIdx;
                                        const StageIcon = stage.icon;
                                        return (_jsxs(React.Fragment, { children: [_jsxs("div", { className: "flex flex-col items-center gap-1 min-w-[90px]", children: [_jsx("div", { className: cn('flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs', isCompleted
                                                                ? isCurrent
                                                                    ? clearanceStatusColors[stage.key]
                                                                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                                                : 'border-muted bg-muted/30 text-muted-foreground'), children: _jsx(StageIcon, { className: "h-3.5 w-3.5" }) }), _jsx("span", { className: "text-[10px] text-center leading-tight", children: stage.label })] }), i < clearanceStages.length - 1 && (_jsx(ChevronRight, { className: cn('h-3 w-3 shrink-0', i < stageIdx ? 'text-emerald-500' : 'text-muted-foreground') }))] }, stage.key));
                                    }) }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Shipment Number" }), _jsx("p", { className: "text-sm font-medium", children: (_b = selectedRecord.shipment) === null || _b === void 0 ? void 0 : _b.shipmentNumber })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Company" }), _jsx("p", { className: "text-sm font-medium", children: ((_d = (_c = selectedRecord.shipment) === null || _c === void 0 ? void 0 : _c.company) === null || _d === void 0 ? void 0 : _d.name) || '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "CHA Name" }), _jsx("p", { className: "text-sm font-medium", children: selectedRecord.chaName || '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "CHA Contact" }), _jsx("p", { className: "text-sm font-medium", children: selectedRecord.chaContact || '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Assessment Value" }), _jsxs("p", { className: "text-sm font-medium", children: ["$", selectedRecord.assessmentValue.toLocaleString()] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Duty Amount" }), _jsxs("p", { className: "text-sm font-medium", children: ["$", selectedRecord.dutyAmount.toLocaleString()] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Duty Status" }), _jsx(Badge, { variant: "outline", className: cn('text-xs', dutyStatusColors[selectedRecord.dutyStatus]), children: formatStatus(selectedRecord.dutyStatus) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Clearance Status" }), _jsx(Badge, { variant: "outline", className: cn('text-xs', clearanceStatusColors[selectedRecord.clearanceStatus]), children: formatStatus(selectedRecord.clearanceStatus) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Assessment Date" }), _jsx("p", { className: "text-sm", children: selectedRecord.assessmentDate
                                                        ? format(new Date(selectedRecord.assessmentDate), 'MMM dd, yyyy HH:mm')
                                                        : '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Payment Date" }), _jsx("p", { className: "text-sm", children: selectedRecord.paymentDate
                                                        ? format(new Date(selectedRecord.paymentDate), 'MMM dd, yyyy HH:mm')
                                                        : '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Clearance Date" }), _jsx("p", { className: "text-sm", children: selectedRecord.clearanceDate
                                                        ? format(new Date(selectedRecord.clearanceDate), 'MMM dd, yyyy HH:mm')
                                                        : '-' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Origin Country" }), _jsx("p", { className: "text-sm", children: ((_e = selectedRecord.shipment) === null || _e === void 0 ? void 0 : _e.originCountry) || '-' })] })] }), selectedRecord.customsRemarks && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Customs Remarks" }), _jsx("p", { className: "text-sm mt-1 p-3 bg-muted/50 rounded-lg", children: selectedRecord.customsRemarks })] })] })), _jsx(Separator, {}), _jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Timeline" }), _jsx("div", { className: "mt-2 space-y-2", children: [
                                                { label: 'Record Created', date: selectedRecord.createdAt },
                                                { label: 'Assessment Completed', date: selectedRecord.assessmentDate },
                                                { label: 'Duty Paid', date: selectedRecord.paymentDate },
                                                { label: 'Clearance Approved', date: selectedRecord.clearanceDate },
                                            ]
                                                .filter((e) => e.date)
                                                .map((event, i) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-teal shrink-0" }), _jsx("span", { className: "text-xs text-muted-foreground", children: event.label }), _jsx("span", { className: "text-xs ml-auto", children: formatDistanceToNow(new Date(event.date), { addSuffix: true }) })] }, i))) })] })] }))] }) }), _jsx(Dialog, { open: newDialogOpen, onOpenChange: setNewDialogOpen, children: _jsxs(DialogContent, { className: "max-w-lg", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "New Customs Record" }), _jsx(DialogDescription, { children: "Create a new customs clearance entry" })] }), _jsx(NewCustomsForm, { onClose: () => setNewDialogOpen(false), onCreated: fetchCustoms })] }) })] }));
}
function NewCustomsForm({ onClose, onCreated }) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        shipmentId: '',
        chaName: '',
        chaContact: '',
        assessmentValue: '',
        dutyAmount: '',
        dutyStatus: 'pending',
        clearanceStatus: 'document_submission',
        customsRemarks: '',
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/customs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign(Object.assign({}, form), { assessmentValue: parseFloat(form.assessmentValue) || 0, dutyAmount: parseFloat(form.dutyAmount) || 0 })),
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
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "col-span-2", children: [_jsx(Label, { className: "text-xs", children: "Shipment ID" }), _jsx(Input, { value: form.shipmentId, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { shipmentId: e.target.value })), placeholder: "Enter shipment ID", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "CHA Name" }), _jsx(Input, { value: form.chaName, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { chaName: e.target.value })), placeholder: "CHA name", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "CHA Contact" }), _jsx(Input, { value: form.chaContact, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { chaContact: e.target.value })), placeholder: "Contact info", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Assessment Value" }), _jsx(Input, { type: "number", value: form.assessmentValue, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { assessmentValue: e.target.value })), placeholder: "0.00", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Duty Amount" }), _jsx(Input, { type: "number", value: form.dutyAmount, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { dutyAmount: e.target.value })), placeholder: "0.00", className: "h-8 text-xs mt-1" })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Customs Remarks" }), _jsx(Input, { value: form.customsRemarks, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { customsRemarks: e.target.value })), placeholder: "Any remarks...", className: "h-8 text-xs mt-1" })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "submit", size: "sm", disabled: submitting, children: submitting ? 'Creating...' : 'Create Record' })] })] }));
}
