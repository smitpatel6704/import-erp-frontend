'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FolderOpen, Search, FileText, Eye, Clock, CheckCircle2, AlertTriangle, Upload, Ship, Building2, Loader2, ChevronLeft, ChevronRight, Settings2, Plus, Save, Download, Merge, GripVertical, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { format } from 'date-fns';
import { API_BASE_URL, cn } from '@/lib/utils';
import { useERPStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
const shipmentStages = ['booking', 'arrival', 'clearance', 'delivery'];
const emptyChecklistType = () => ({
    id: '',
    name: '',
    isRequired: true,
    shipmentStage: 'clearance',
    expiryRequired: false,
    allowedFileTypes: 'pdf,image',
    isActive: true,
});
export function DocumentsModule() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [shipments, setShipments] = useState([]);
    const [checklistShipment, setChecklistShipment] = useState(null);
    const [checklistOpen, setChecklistOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [globalStats, setGlobalStats] = useState(null);
    const fetchShipments = useCallback(async () => {
        setLoading(true);
        try {
            const [shipRes, statsRes] = await Promise.all([
                fetch('/api/shipments?limit=100'),
                fetch('/api/shipment-documents/stats')
            ]);
            const shipJson = await shipRes.json();
            const statsJson = await statsRes.json();
            if (shipJson.data)
                setShipments(shipJson.data);
            if (statsJson.data)
                setGlobalStats(statsJson.data);
        }
        catch (err) {
            console.error('Failed to fetch data:', err);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        // Existing data loaders in this app call async fetchers from effects.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchShipments();
    }, [fetchShipments]);
    const statCards = [
        {
            title: 'Total Documents',
            value: (globalStats === null || globalStats === void 0 ? void 0 : globalStats.total) || 0,
            icon: FolderOpen,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50 dark:bg-teal-950/30',
        },
        {
            title: 'Verified',
            value: (globalStats === null || globalStats === void 0 ? void 0 : globalStats.verified) || 0,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        },
        {
            title: 'Pending Verification',
            value: (globalStats === null || globalStats === void 0 ? void 0 : globalStats.uploaded) || 0,
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        },
        {
            title: 'Rejected / Expired',
            value: ((globalStats === null || globalStats === void 0 ? void 0 : globalStats.rejected) || 0) + ((globalStats === null || globalStats === void 0 ? void 0 : globalStats.expired) || 0) || 0,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-950/30',
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight", children: "Documents" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Manage and track shipment-specific documents through the checklist" })] }), _jsxs(Button, { variant: "outline", size: "sm", className: "h-9 gap-2", onClick: () => setManageOpen(true), children: [_jsx(Settings2, { className: "h-4 w-4" }), "Manage Documents"] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: statCards.map((stat, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1, duration: 0.3 }, children: _jsx(Card, { children: _jsx(CardContent, { className: "p-5", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: stat.title }), _jsx("p", { className: "text-2xl font-bold tracking-tight", children: stat.value })] }), _jsx("div", { className: cn('rounded-lg p-2.5', stat.bgColor), children: _jsx(stat.icon, { className: cn('h-5 w-5', stat.color) }) })] }) }) }) }, stat.title))) }), _jsx("div", { className: "pt-2", children: _jsxs("div", { className: "relative w-full max-w-sm mb-6", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search shipments...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-10" })] }) }), loading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-teal-600" }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: shipments
                    .filter(s => s.shipmentNumber.toLowerCase().includes(search.toLowerCase()))
                    .map((s, i) => {
                    var _a;
                    return (_jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: i * 0.05 }, children: _jsxs(Card, { className: "hover:border-teal/50 transition-all group overflow-hidden", children: [_jsxs(CardHeader, { className: "pb-3 bg-muted/20", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600", children: _jsx(Ship, { className: "h-5 w-5" }) }), _jsx("div", { className: "flex flex-col items-end gap-1", children: _jsx(Badge, { variant: "outline", className: "text-[9px] h-4 text-muted-foreground uppercase tracking-tight", children: s.status.replace(/_/g, ' ') }) })] }), _jsxs("div", { className: "mt-3", children: [_jsx(CardTitle, { className: "text-base font-bold group-hover:text-teal-600 transition-colors", children: s.shipmentNumber }), _jsxs("div", { className: "flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground", children: [_jsx(Building2, { className: "h-3 w-3" }), _jsx("span", { className: "truncate", children: ((_a = s.company) === null || _a === void 0 ? void 0 : _a.name) || 'No Importer' })] })] })] }), _jsxs(CardContent, { className: "pt-4 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3 text-[10px]", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-muted-foreground uppercase tracking-wider", children: "Origin" }), _jsx("p", { className: "font-medium truncate", children: s.originPort || '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-muted-foreground uppercase tracking-wider", children: "Destination" }), _jsx("p", { className: "font-medium truncate", children: s.destinationPort || '—' })] })] }), _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { className: "flex-1 h-9 text-[11px] bg-teal-600 hover:bg-teal-700 shadow-sm", onClick: () => {
                                                    setChecklistShipment(s);
                                                    setChecklistOpen(true);
                                                }, children: [_jsx(FileText, { className: "h-3.5 w-3.5 mr-1.5" }), "Document Checklist"] }) })] })] }) }, s.id));
                }) })), _jsx(ShipmentChecklistModal, { shipment: checklistShipment, shipments: shipments, open: checklistOpen, onOpenChange: setChecklistOpen, onNavigate: (s) => setChecklistShipment(s), onRefresh: () => {
                    fetchShipments();
                } }), _jsx(ManageChecklistTypesDialog, { open: manageOpen, onOpenChange: setManageOpen, onSaved: () => {
                    fetchShipments();
                } })] }));
}
function SortableMergeDocument({ item, index, selected, onSelectedChange }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.document.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
    };
    return (
        <div ref={setNodeRef} style={style} className={cn("flex items-center gap-3 rounded-lg border bg-background p-3 shadow-sm transition-colors", isDragging && "border-teal-500 bg-teal-50 shadow-lg")}>
            <button type="button" className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing" aria-label={`Move ${item.name}`} {...attributes} {...listeners}>
                <GripVertical className="h-4 w-4" />
            </button>
            <Checkbox checked={selected} onCheckedChange={(checked) => onSelectedChange(checked === true)} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{item.name}</span>
                    <Badge variant="outline" className="h-5 text-[10px]">#{index + 1}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{item.document.fileUrl}</p>
            </div>
        </div>
    );
}
function ManageChecklistTypesDialog({ open, onOpenChange, onSaved }) {
    const [items, setItems] = useState([]);
    const [draft, setDraft] = useState(emptyChecklistType);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const normalizeChecklistType = (item) => ({
        id: item.id,
        name: item.name || '',
        isRequired: Boolean(item.isRequired),
        shipmentStage: item.shipmentStage || 'clearance',
        expiryRequired: Boolean(item.expiryRequired),
        allowedFileTypes: item.allowedFileTypes || 'pdf,image',
        isActive: Boolean(item.isActive),
    });
    const fetchTypes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/shipment-documents/checklist-types');
            const json = await res.json();
            if (json.data) {
                setItems(json.data.map(normalizeChecklistType));
            }
        }
        catch (error) {
            console.error('Failed to fetch document types:', error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (open) {
            // Existing data loaders in this app call async fetchers from effects.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchTypes();
        }
    }, [open, fetchTypes]);
    const saveItem = async (item) => {
        const name = item.name.trim();
        if (!name || savingId)
            return;
        setSavingId(item.id || 'new');
        try {
            const payload = Object.assign(Object.assign({}, item), { name, allowedFileTypes: item.allowedFileTypes.trim() || 'pdf,image' });
            const isNew = !item.id;
            const res = await fetch(isNew ? '/api/shipment-documents/checklist-types' : `/api/shipment-documents/checklist-types/${item.id}`, {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok)
                throw new Error('Unable to save document type');
            await fetchTypes();
            setDraft(emptyChecklistType());
            onSaved();
            toast({
                title: isNew ? 'Document requirement added' : 'Document requirement saved',
                description: `${name} is now updated in the checklist.`,
            });
        }
        catch (error) {
            console.error('Document type save error:', error);
            toast({
                title: 'Document requirement could not be saved',
                description: error.message || 'Please try again.',
                variant: 'destructive',
            });
        }
        finally {
            setSavingId(null);
        }
    };
    const updateItem = (id, patch) => {
        setItems(current => current.map(item => item.id === id ? Object.assign(Object.assign({}, item), patch) : item));
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden", children: [_jsxs(DialogHeader, { className: "p-6 pb-3 border-b bg-muted/20", children: [_jsxs(DialogTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Settings2, { className: "h-5 w-5 text-teal-600" }), "Manage Documents"] }), _jsx(DialogDescription, { className: "text-xs", children: "Change the document checklist used for every shipment." })] }), _jsx(ScrollArea, { className: "flex-1 p-6", children: _jsxs("div", { className: "space-y-5", children: [_jsx("div", { className: "rounded-lg border bg-card p-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_auto] gap-3 items-end", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-bold", children: "Document Name" }), _jsx(Input, { className: "h-9 text-sm", placeholder: "e.g. Commercial Invoice", value: draft.name, onChange: (e) => setDraft(Object.assign(Object.assign({}, draft), { name: e.target.value })) })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-bold", children: "Stage" }), _jsxs(Select, { value: draft.shipmentStage, onValueChange: (value) => setDraft(Object.assign(Object.assign({}, draft), { shipmentStage: value })), children: [_jsx(SelectTrigger, { className: "h-9 w-full", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: shipmentStages.map(stage => (_jsx(SelectItem, { value: stage, children: stage.replace(/_/g, ' ') }, stage))) })] })] }), _jsxs("div", { className: "flex items-center justify-between rounded-md border px-3 h-9", children: [_jsx(Label, { className: "text-xs", children: "Required" }), _jsx(Switch, { checked: draft.isRequired, onCheckedChange: (checked) => setDraft(Object.assign(Object.assign({}, draft), { isRequired: checked })) })] }), _jsxs("div", { className: "flex items-center justify-between rounded-md border px-3 h-9", children: [_jsx(Label, { className: "text-xs", children: "Active" }), _jsx(Switch, { checked: draft.isActive, onCheckedChange: (checked) => setDraft(Object.assign(Object.assign({}, draft), { isActive: checked })) })] }), _jsxs(Button, { className: "h-9 bg-teal-600 hover:bg-teal-700", disabled: !draft.name.trim() || savingId === 'new', onClick: () => saveItem(draft), children: [savingId === 'new' ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(Plus, { className: "h-4 w-4" }), "Add"] })] }) }), loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "h-7 w-7 animate-spin text-teal-600" }) })) : (_jsx("div", { className: "space-y-2", children: items.map((item) => (_jsx("div", { className: cn("rounded-lg border p-3 transition-colors", item.isActive ? "bg-card" : "bg-muted/30"), children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr_0.8fr_0.8fr_auto] gap-3 items-center", children: [_jsx(Input, { className: "h-9 text-sm font-medium", value: item.name, onChange: (e) => updateItem(item.id, { name: e.target.value }) }), _jsxs(Select, { value: item.shipmentStage, onValueChange: (value) => updateItem(item.id, { shipmentStage: value }), children: [_jsx(SelectTrigger, { className: "h-9 w-full", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: shipmentStages.map(stage => (_jsx(SelectItem, { value: stage, children: stage.replace(/_/g, ' ') }, stage))) })] }), _jsxs("div", { className: "flex items-center justify-between rounded-md border px-3 h-9", children: [_jsx(Label, { className: "text-xs", children: "Required" }), _jsx(Switch, { checked: item.isRequired, onCheckedChange: (checked) => updateItem(item.id, { isRequired: checked }) })] }), _jsxs("div", { className: "flex items-center justify-between rounded-md border px-3 h-9", children: [_jsx(Label, { className: "text-xs", children: "Active" }), _jsx(Switch, { checked: item.isActive, onCheckedChange: (checked) => updateItem(item.id, { isActive: checked }) })] }), _jsxs(Button, { variant: "outline", size: "sm", className: "h-9 gap-2", disabled: !item.name.trim() || savingId === item.id, onClick: () => saveItem(item), children: [savingId === item.id ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(Save, { className: "h-4 w-4" }), "Save"] })] }) }, item.id))) }))] }) }), _jsx(DialogFooter, { className: "p-6 bg-muted/10 border-t", children: _jsx(Button, { variant: "outline", size: "sm", onClick: () => onOpenChange(false), children: "Close" }) })] }) }));
}
function ShipmentChecklistModal({ shipment, shipments, open, onOpenChange, onNavigate, onRefresh }) {
    var _a;
    const currentIndex = shipments.findIndex(s => s.id === (shipment === null || shipment === void 0 ? void 0 : shipment.id));
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < shipments.length - 1;
    const prevShipment = hasPrev ? shipments[currentIndex - 1] : null;
    const nextShipment = hasNext ? shipments[currentIndex + 1] : null;
    const [checklist, setChecklist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadingItem, setUploadingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploadRemarks, setUploadRemarks] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [exportOpen, setExportOpen] = useState(false);
    const [selectedMergeIds, setSelectedMergeIds] = useState([]);
    const [mergeOrderIds, setMergeOrderIds] = useState([]);
    const [merging, setMerging] = useState(false);
    const canUploadDocuments = useERPStore((state) => state.canAction('documents', 'upload'));
    const canVerifyDocuments = useERPStore((state) => state.canAction('documents', 'verify'));
    const mergeSensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const fetchChecklist = useCallback(async () => {
        if (!shipment)
            return;
        setLoading(true);
        try {
            const res = await fetch(`/api/shipment-documents/shipment/${shipment.id}/checklist`);
            const json = await res.json();
            if (json.data)
                setChecklist(json.data);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    }, [shipment]);
    useEffect(() => {
        if (open) {
            // Existing data loaders in this app call async fetchers from effects.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchChecklist();
        }
    }, [open, fetchChecklist]);
    const handleStatusUpdate = async (docId, status, rejectedReason) => {
        try {
            const res = await fetch(`/api/shipment-documents/${docId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, rejectedReason }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok)
                throw new Error(json.error || 'Failed to update document status');
            fetchChecklist();
            onRefresh();
            toast({
                title: status === 'verified' ? 'Document verified' : 'Document rejected',
                description: 'Document checklist was updated successfully.',
            });
        }
        catch (error) {
            console.error(error);
            toast({
                title: 'Document status could not be updated',
                description: error.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    };
    const handleUpload = async () => {
        if (!shipment || !uploadingItem || !selectedFile || submitting)
            return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('checklistId', uploadingItem.checklistId);
            formData.append('remarks', uploadRemarks);
            const res = await fetch(`/api/shipment-documents/shipment/${shipment.id}/upload`, {
                method: 'POST',
                body: formData,
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok)
                throw new Error(json.error || 'Upload failed');
            setUploadingItem(null);
            setUploadRemarks('');
            setSelectedFile(null);
            await fetchChecklist();
            onRefresh();
            toast({
                title: 'Document uploaded',
                description: `${uploadingItem.name} was uploaded successfully.`,
            });
        }
        catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Document upload failed',
                description: error.message || 'Please try again.',
                variant: 'destructive',
            });
        }
        finally {
            setSubmitting(false);
        }
    };
    const openDocumentUrl = (fileUrl) => {
        if (!fileUrl) {
            toast({
                title: 'Preview not available',
                description: 'This document does not have a file URL.',
                variant: 'destructive',
            });
            return;
        }
        let url = fileUrl;
        if (url.startsWith('/uploads/')) {
            url = `${API_BASE_URL}${url}`;
        }
        else if (url.startsWith('/documents/')) {
            url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        }
        window.open(url, '_blank');
    };
    const downloadFile = async (fileUrl, fileName = 'shipment-documents.pdf') => {
        if (!fileUrl) {
            toast({
                title: 'Download not available',
                description: 'Merged PDF file URL is missing.',
                variant: 'destructive',
            });
            return;
        }
        let url = fileUrl;
        if (url.startsWith('/')) {
            url = `${API_BASE_URL}${url}`;
        }
        const res = await fetch(url);
        if (!res.ok)
            throw new Error('Failed to download merged PDF');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
    };
    const mergeableDocuments = checklist.filter(item => {
        var _a, _b;
        const fileUrl = ((_a = item.document) === null || _a === void 0 ? void 0 : _a.fileUrl) || '';
        const fileType = ((_b = item.document) === null || _b === void 0 ? void 0 : _b.fileType) || '';
        return item.document && (fileType === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf'));
    });
    const orderedMergeDocuments = useMemo(() => {
        const byId = new Map(mergeableDocuments.map(item => [item.document.id, item]));
        const ordered = mergeOrderIds.map(id => byId.get(id)).filter(Boolean);
        const remaining = mergeableDocuments.filter(item => !mergeOrderIds.includes(item.document.id));
        return [...ordered, ...remaining];
    }, [mergeOrderIds, mergeableDocuments]);
    const openExportDialog = () => {
        const documentIds = mergeableDocuments.map(item => item.document.id);
        setSelectedMergeIds(documentIds);
        setMergeOrderIds(documentIds);
        setExportOpen(true);
    };
    const toggleMergeDocument = (documentId, checked) => {
        setSelectedMergeIds(current => checked
            ? [...current, documentId]
            : current.filter(id => id !== documentId));
    };
    const handleMergeDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id)
            return;
        setMergeOrderIds(current => {
            const activeIndex = current.indexOf(active.id);
            const overIndex = current.indexOf(over.id);
            if (activeIndex < 0 || overIndex < 0)
                return current;
            return arrayMove(current, activeIndex, overIndex);
        });
    };
    const handleMergeDocuments = async () => {
        if (!shipment || selectedMergeIds.length < 2 || merging)
            return;
        setMerging(true);
        try {
            const orderedDocumentIds = orderedMergeDocuments
                .map(item => item.document.id)
                .filter(id => selectedMergeIds.includes(id));
            const res = await fetch(`/api/shipment-documents/shipment/${shipment.id}/merge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentIds: orderedDocumentIds,
                    name: `${shipment.shipmentNumber} export documents`,
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok)
                throw new Error(json.error || 'Failed to merge documents');
            setExportOpen(false);
            await downloadFile(json.data?.downloadUrl || json.data?.fileUrl, json.data?.fileName || `${shipment.shipmentNumber} export documents.pdf`);
            toast({
                title: 'Merged PDF downloaded',
                description: 'Export documents were merged and downloaded.',
            });
        }
        catch (error) {
            console.error('Document merge error:', error);
            toast({
                title: 'PDF merge failed',
                description: error.message || 'Please try again.',
                variant: 'destructive',
            });
        }
        finally {
            setMerging(false);
        }
    };
    const exportDialog = (
        <Dialog open={exportOpen} onOpenChange={(o) => !o && !merging && setExportOpen(false)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold flex items-center gap-2">
                        <Merge className="h-4 w-4 text-teal-600" />
                        Export Documents
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Select PDFs and set the merge sequence.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-3">
                    {mergeableDocuments.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-5 text-center text-xs text-muted-foreground">
                            No uploaded PDF documents available.
                        </div>
                    ) : (
                        <DndContext sensors={mergeSensors} collisionDetection={closestCenter} onDragEnd={handleMergeDragEnd}>
                            <SortableContext items={orderedMergeDocuments.map(item => item.document.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                    {orderedMergeDocuments.map((item, index) => (
                                        <SortableMergeDocument
                                            key={item.document.id}
                                            item={item}
                                            index={index}
                                            selected={selectedMergeIds.includes(item.document.id)}
                                            onSelectedChange={(checked) => toggleMergeDocument(item.document.id, checked)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setExportOpen(false)} disabled={merging}>
                        Cancel
                    </Button>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700" disabled={merging || selectedMergeIds.length < 2} onClick={handleMergeDocuments}>
                        {merging ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Merge className="h-3 w-3 mr-2" />}
                        Download PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
    if (!shipment)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-2xl h-[85vh] max-h-[760px] flex flex-col p-0 overflow-hidden", children: [_jsx(DialogHeader, { className: "shrink-0 p-6 pb-2 border-b bg-muted/20", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", disabled: !hasPrev, onClick: () => prevShipment && onNavigate(prevShipment), title: prevShipment ? `Previous: ${prevShipment.shipmentNumber}` : 'No previous shipment', children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", disabled: !hasNext, onClick: () => nextShipment && onNavigate(nextShipment), title: nextShipment ? `Next: ${nextShipment.shipmentNumber}` : 'No next shipment', children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] }), _jsxs("div", { children: [_jsxs(DialogTitle, { className: "text-xl flex items-center gap-2", children: [_jsx(Ship, { className: "h-5 w-5 text-teal-600" }), shipment.shipmentNumber] }), _jsxs(DialogDescription, { className: "text-xs mt-1", children: ["Document Checklist Tracking \u2022 ", (_a = shipment.company) === null || _a === void 0 ? void 0 : _a.name] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs(Badge, { variant: "outline", className: "text-[10px] font-mono mb-1", children: [checklist.filter(c => c.status === 'verified').length, " / ", checklist.filter(c => c.isRequired).length, " Verified"] }), _jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-tighter", children: "Required Docs" })] })] }) }), _jsx(ScrollArea, { className: "flex-1 min-h-0 p-6", children: loading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-teal-600" }) })) : (_jsx("div", { className: "space-y-4", children: ['booking', 'arrival', 'clearance', 'delivery'].map((stage) => {
                                    const stageItems = checklist.filter(c => c.shipmentStage === stage);
                                    if (stageItems.length === 0)
                                        return null;
                                    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("h3", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2", children: [_jsx("span", { className: "h-1 w-1 rounded-full bg-teal-500" }), stage.replace(/_/g, ' ')] }), _jsx("div", { className: "grid grid-cols-1 gap-2", children: stageItems.map((item) => (_jsxs("div", { className: cn("flex items-center justify-between p-3 border rounded-xl transition-all", item.status === 'verified' ? "bg-emerald-500/5 border-emerald-500/20" :
                                                        item.status === 'rejected' ? "bg-red-500/5 border-red-500/20" : "bg-card"), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: cn("h-8 w-8 rounded-lg flex items-center justify-center", item.status === 'verified' ? "bg-emerald-500/20 text-emerald-600" :
                                                                        item.status === 'uploaded' ? "bg-blue-500/20 text-blue-600" :
                                                                            item.status === 'rejected' ? "bg-red-500/20 text-red-600" :
                                                                                "bg-muted text-muted-foreground"), children: item.status === 'verified' ? _jsx(CheckCircle2, { className: "h-4 w-4" }) :
                                                                        item.status === 'uploaded' ? _jsx(Clock, { className: "h-4 w-4" }) :
                                                                            item.status === 'rejected' ? _jsx(AlertTriangle, { className: "h-4 w-4" }) :
                                                                        _jsx(FileText, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium", children: item.name }), item.isRequired && (_jsx(Badge, { variant: "outline", className: "text-[8px] h-3.5 px-1 bg-red-50 text-red-600 border-red-100 uppercase font-bold", children: "Required" }))] }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: item.document ? `Uploaded ${format(new Date(item.document.uploadedAt), 'MMM dd, HH:mm')}` : 'Not uploaded yet' })] })] }), _jsx("div", { className: "flex items-center gap-2", children: item.status === 'pending' || item.status === 'rejected' ? (canUploadDocuments && _jsxs(Button, { size: "sm", variant: "outline", className: "h-8 text-[10px] gap-1.5", onClick: () => setUploadingItem(item), children: [_jsx(Upload, { className: "h-3 w-3" }), item.status === 'rejected' ? 'Re-upload' : 'Upload'] })) : (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", title: "View Document", onClick: () => {
                                                                            var _a;
                                                                            if ((_a = item.document) === null || _a === void 0 ? void 0 : _a.fileUrl) {
                                                                                openDocumentUrl(item.document.fileUrl);
                                                                            }
                                                                            else {
                                                                                toast({
                                                                                    title: 'Preview not available',
                                                                                    description: 'This document does not have a file URL.',
                                                                                    variant: 'destructive',
                                                                                });
                                                                            }
                                                                        }, children: _jsx(Eye, { className: "h-3.5 w-3.5" }) }), item.status === 'uploaded' && canVerifyDocuments && (_jsxs(_Fragment, { children: [_jsx(Button, { size: "sm", className: "h-8 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white", onClick: () => handleStatusUpdate(item.document.id, 'verified'), children: "Verify" }), _jsx(Button, { size: "sm", variant: "destructive", className: "h-8 text-[10px]", onClick: () => handleStatusUpdate(item.document.id, 'rejected', 'Document quality poor'), children: "Reject" })] })), item.status === 'verified' && (_jsx(Badge, { className: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] h-7", children: "Verified" }))] })) })] }, item.checklistId))) })] }, stage));
                                }) })) }), _jsxs(DialogFooter, { className: "shrink-0 p-6 bg-muted/10 border-t", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "gap-2", disabled: mergeableDocuments.length < 2, onClick: openExportDialog, children: [_jsx(Download, { className: "h-3.5 w-3.5" }), "Export Documents"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => onOpenChange(false), children: "Close" })] })] }) }), exportDialog, _jsx(Dialog, { open: !!uploadingItem, onOpenChange: (o) => !o && !submitting && setUploadingItem(null), children: _jsxs(DialogContent, { className: "max-w-sm", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "text-sm font-bold", children: ["Upload ", uploadingItem === null || uploadingItem === void 0 ? void 0 : uploadingItem.name] }), _jsx(DialogDescription, { className: "text-xs", children: "Select a file to upload for this requirement" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsx("input", { type: "file", id: "file-upload-input-real", className: "hidden", onChange: (e) => {
                                        var _a;
                                        if ((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) {
                                            setSelectedFile(e.target.files[0]);
                                        }
                                    } }), _jsx("div", { className: cn("border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer", selectedFile ? "bg-teal-50 border-teal-500/50" : "bg-muted/20 border-muted hover:bg-muted/30"), onClick: () => { var _a; return (_a = document.getElementById('file-upload-input-real')) === null || _a === void 0 ? void 0 : _a.click(); }, children: selectedFile ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "h-8 w-8 text-teal-600 mb-2" }), _jsx("p", { className: "text-xs font-medium text-teal-700", children: selectedFile.name }), _jsxs("p", { className: "text-[10px] text-teal-600/70 mt-1", children: [(selectedFile.size / 1024 / 1024).toFixed(2), " MB \u2022 Click to change"] })] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "h-8 w-8 text-muted-foreground/50 mb-2" }), _jsx("p", { className: "text-xs font-medium", children: "Click to select file" }), _jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "PDF or Images up to 5MB" })] })) }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-bold", children: "Remarks (Optional)" }), _jsx(Input, { className: "h-8 text-xs", placeholder: "Add any notes...", value: uploadRemarks, onChange: (e) => setUploadRemarks(e.target.value) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setUploadingItem(null), disabled: submitting, children: "Cancel" }), _jsx(Button, { size: "sm", className: "bg-teal-600", disabled: submitting || !selectedFile, onClick: handleUpload, children: submitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-3 w-3 mr-2 animate-spin" }), "Uploading..."] })) : 'Upload File' })] })] }) })] }));
}
