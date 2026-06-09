'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen, Search, FileText,
  Eye, Clock, CheckCircle2, AlertTriangle, Upload,
  Ship, Building2, Loader2, X, ChevronLeft, ChevronRight,
  Settings2, Plus, Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { API_BASE_URL, cn } from '@/lib/utils';

// ─── Component ──────────────────────────────────────────────────────────

type ChecklistType = {
  id: string;
  name: string;
  isRequired: boolean;
  shipmentStage: string;
  expiryRequired: boolean;
  allowedFileTypes: string;
  isActive: boolean;
};

const shipmentStages = ['booking', 'arrival', 'clearance', 'delivery'];

const emptyChecklistType = (): ChecklistType => ({
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
  const [shipments, setShipments] = useState<any[]>([]);
  const [checklistShipment, setChecklistShipment] = useState<any | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [globalStats, setGlobalStats] = useState<any>(null);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const [shipRes, statsRes] = await Promise.all([
        fetch('/api/shipments?limit=100'),
        fetch('/api/shipment-documents/stats')
      ]);
      const shipJson = await shipRes.json();
      const statsJson = await statsRes.json();
      
      if (shipJson.data) setShipments(shipJson.data);
      if (statsJson.data) setGlobalStats(statsJson.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
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
      value: globalStats?.total || 0,
      icon: FolderOpen,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    },
    {
      title: 'Verified',
      value: globalStats?.verified || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      title: 'Pending Verification',
      value: globalStats?.uploaded || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      title: 'Rejected / Expired',
      value: (globalStats?.rejected || 0) + (globalStats?.expired || 0) || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-sm text-muted-foreground">Manage and track shipment-specific documents through the checklist</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          onClick={() => setManageOpen(true)}
        >
          <Settings2 className="h-4 w-4" />
          Manage Documents
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className={cn('rounded-lg p-2.5', stat.bgColor)}>
                    <stat.icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="pt-2">
        <div className="relative w-full max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shipments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shipments
            .filter(s => s.shipmentNumber.toLowerCase().includes(search.toLowerCase()))
            .map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:border-teal/50 transition-all group overflow-hidden">
                  <CardHeader className="pb-3 bg-muted/20">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                        <Ship className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-[9px] h-4 text-muted-foreground uppercase tracking-tight">
                          {s.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-base font-bold group-hover:text-teal-600 transition-colors">
                        {s.shipmentNumber}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{s.company?.name || 'No Importer'}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div className="space-y-1">
                        <p className="text-muted-foreground uppercase tracking-wider">Origin</p>
                        <p className="font-medium truncate">{s.originPort || '—'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground uppercase tracking-wider">Destination</p>
                        <p className="font-medium truncate">{s.destinationPort || '—'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 h-9 text-[11px] bg-teal-600 hover:bg-teal-700 shadow-sm"
                        onClick={() => {
                          setChecklistShipment(s);
                          setChecklistOpen(true);
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        Document Checklist
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      )}

      {/* Shipment Checklist Modal */}
      <ShipmentChecklistModal
        shipment={checklistShipment}
        shipments={shipments}
        open={checklistOpen}
        onOpenChange={setChecklistOpen}
        onNavigate={(s) => setChecklistShipment(s)}
        onRefresh={() => {
          fetchShipments();
        }}
      />

      <ManageChecklistTypesDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        onSaved={() => {
          fetchShipments();
        }}
      />
    </div>
  );
}

function ManageChecklistTypesDialog({ open, onOpenChange, onSaved }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<ChecklistType[]>([]);
  const [draft, setDraft] = useState<ChecklistType>(emptyChecklistType);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const normalizeChecklistType = (item: any): ChecklistType => ({
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
    } catch (error) {
      console.error('Failed to fetch document types:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Existing data loaders in this app call async fetchers from effects.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) fetchTypes();
  }, [open, fetchTypes]);

  const saveItem = async (item: ChecklistType) => {
    const name = item.name.trim();
    if (!name || savingId) return;

    setSavingId(item.id || 'new');
    try {
      const payload = {
        ...item,
        name,
        allowedFileTypes: item.allowedFileTypes.trim() || 'pdf,image',
      };
      const isNew = !item.id;
      const res = await fetch(
        isNew ? '/api/shipment-documents/checklist-types' : `/api/shipment-documents/checklist-types/${item.id}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error('Unable to save document type');

      await fetchTypes();
      setDraft(emptyChecklistType());
      onSaved();
    } catch (error) {
      console.error('Document type save error:', error);
      alert('Failed to save document type. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const updateItem = (id: string, patch: Partial<ChecklistType>) => {
    setItems(current => current.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-3 border-b bg-muted/20">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-teal-600" />
            Manage Documents
          </DialogTitle>
          <DialogDescription className="text-xs">
            Change the document checklist used for every shipment.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-5">
            <div className="rounded-lg border bg-card p-4">
              <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_auto] gap-3 items-end">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Document Name</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="e.g. Commercial Invoice"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Stage</Label>
                  <Select value={draft.shipmentStage} onValueChange={(value) => setDraft({ ...draft, shipmentStage: value })}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shipmentStages.map(stage => (
                        <SelectItem key={stage} value={stage}>{stage.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-md border px-3 h-9">
                  <Label className="text-xs">Required</Label>
                  <Switch checked={draft.isRequired} onCheckedChange={(checked) => setDraft({ ...draft, isRequired: checked })} />
                </div>
                <div className="flex items-center justify-between rounded-md border px-3 h-9">
                  <Label className="text-xs">Active</Label>
                  <Switch checked={draft.isActive} onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked })} />
                </div>
                <Button
                  className="h-9 bg-teal-600 hover:bg-teal-700"
                  disabled={!draft.name.trim() || savingId === 'new'}
                  onClick={() => saveItem(draft)}
                >
                  {savingId === 'new' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className={cn(
                    "rounded-lg border p-3 transition-colors",
                    item.isActive ? "bg-card" : "bg-muted/30"
                  )}>
                    <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr_0.8fr_0.8fr_auto] gap-3 items-center">
                      <Input
                        className="h-9 text-sm font-medium"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      />
                      <Select value={item.shipmentStage} onValueChange={(value) => updateItem(item.id, { shipmentStage: value })}>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {shipmentStages.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage.replace(/_/g, ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center justify-between rounded-md border px-3 h-9">
                        <Label className="text-xs">Required</Label>
                        <Switch checked={item.isRequired} onCheckedChange={(checked) => updateItem(item.id, { isRequired: checked })} />
                      </div>
                      <div className="flex items-center justify-between rounded-md border px-3 h-9">
                        <Label className="text-xs">Active</Label>
                        <Switch checked={item.isActive} onCheckedChange={(checked) => updateItem(item.id, { isActive: checked })} />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2"
                        disabled={!item.name.trim() || savingId === item.id}
                        onClick={() => saveItem(item)}
                      >
                        {savingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 bg-muted/10 border-t">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShipmentChecklistModal({ shipment, shipments, open, onOpenChange, onNavigate, onRefresh }: {
  shipment: any | null,
  shipments: any[],
  open: boolean,
  onOpenChange: (open: boolean) => void,
  onNavigate: (shipment: any) => void,
  onRefresh: () => void
}) {
  const currentIndex = shipments.findIndex(s => s.id === shipment?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < shipments.length - 1;
  const prevShipment = hasPrev ? shipments[currentIndex - 1] : null;
  const nextShipment = hasNext ? shipments[currentIndex + 1] : null;

  const [checklist, setChecklist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchChecklist = useCallback(async () => {
    if (!shipment) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/shipment-documents/shipment/${shipment.id}/checklist`);
      const json = await res.json();
      if (json.data) setChecklist(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [shipment]);

  useEffect(() => {
    // Existing data loaders in this app call async fetchers from effects.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) fetchChecklist();
  }, [open, fetchChecklist]);

  const handleStatusUpdate = async (docId: string, status: string, rejectedReason?: string) => {
    try {
      await fetch(`/api/shipment-documents/${docId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectedReason }),
      });
      fetchChecklist();
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async () => {
    if (!shipment || !uploadingItem || !selectedFile || submitting) return;
    
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

      if (!res.ok) throw new Error('Upload failed');

      setUploadingItem(null);
      setUploadRemarks('');
      setSelectedFile(null);
      await fetchChecklist();
      onRefresh();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!shipment) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={!hasPrev}
                    onClick={() => prevShipment && onNavigate(prevShipment)}
                    title={prevShipment ? `Previous: ${prevShipment.shipmentNumber}` : 'No previous shipment'}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={!hasNext}
                    onClick={() => nextShipment && onNavigate(nextShipment)}
                    title={nextShipment ? `Next: ${nextShipment.shipmentNumber}` : 'No next shipment'}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Ship className="h-5 w-5 text-teal-600" />
                    {shipment.shipmentNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-1">
                    Document Checklist Tracking • {shipment.company?.name}
                  </DialogDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-[10px] font-mono mb-1">
                  {checklist.filter(c => c.status === 'verified').length} / {checklist.filter(c => c.isRequired).length} Verified
                </Badge>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Required Docs</p>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {['booking', 'arrival', 'clearance', 'delivery'].map((stage) => {
                  const stageItems = checklist.filter(c => c.shipmentStage === stage);
                  if (stageItems.length === 0) return null;
                  
                  return (
                    <div key={stage} className="space-y-3">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-teal-500" />
                        {stage.replace(/_/g, ' ')}
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {stageItems.map((item) => (
                          <div 
                            key={item.checklistId} 
                            className={cn(
                              "flex items-center justify-between p-3 border rounded-xl transition-all",
                              item.status === 'verified' ? "bg-emerald-500/5 border-emerald-500/20" : 
                              item.status === 'rejected' ? "bg-red-500/5 border-red-500/20" : "bg-card"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center",
                                item.status === 'verified' ? "bg-emerald-500/20 text-emerald-600" :
                                item.status === 'uploaded' ? "bg-blue-500/20 text-blue-600" :
                                item.status === 'rejected' ? "bg-red-500/20 text-red-600" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {item.status === 'verified' ? <CheckCircle2 className="h-4 w-4" /> :
                                 item.status === 'uploaded' ? <Clock className="h-4 w-4" /> :
                                 item.status === 'rejected' ? <AlertTriangle className="h-4 w-4" /> :
                                 <FileText className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{item.name}</span>
                                  {item.isRequired && (
                                    <Badge variant="outline" className="text-[8px] h-3.5 px-1 bg-red-50 text-red-600 border-red-100 uppercase font-bold">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                  {item.document ? `Uploaded ${format(new Date(item.document.uploadedAt), 'MMM dd, HH:mm')}` : 'Not uploaded yet'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {item.status === 'pending' || item.status === 'rejected' ? (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 text-[10px] gap-1.5"
                                  onClick={() => setUploadingItem(item)}
                                >
                                  <Upload className="h-3 w-3" />
                                  {item.status === 'rejected' ? 'Re-upload' : 'Upload'}
                                </Button>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0" 
                                    title="View Document"
                                    onClick={() => {
                                      if (item.document?.fileUrl) {
                                        let url = item.document.fileUrl;
                                        // Prepend backend URL for local uploads
                                        if (url.startsWith('/uploads/')) {
                                          url = `${API_BASE_URL}${url}`;
                                        } else if (url.startsWith('/documents/')) {
                                          // Fallback for old mock data
                                          url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                                        }
                                        window.open(url, '_blank');
                                      } else {
                                        alert('Document preview not available');
                                      }
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  {item.status === 'uploaded' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        className="h-8 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => handleStatusUpdate(item.document.id, 'verified')}
                                      >
                                        Verify
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive" 
                                        className="h-8 text-[10px]"
                                        onClick={() => handleStatusUpdate(item.document.id, 'rejected', 'Document quality poor')}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {item.status === 'verified' && (
                                    <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] h-7">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-6 bg-muted/10 border-t">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Internal Upload Dialog - MOVED OUTSIDE FOR BETTER STABILITY */}
      <Dialog open={!!uploadingItem} onOpenChange={(o) => !o && !submitting && setUploadingItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Upload {uploadingItem?.name}</DialogTitle>
            <DialogDescription className="text-xs">Select a file to upload for this requirement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input 
              type="file" 
              id="file-upload-input-real" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer",
                selectedFile ? "bg-teal-50 border-teal-500/50" : "bg-muted/20 border-muted hover:bg-muted/30"
              )}
              onClick={() => document.getElementById('file-upload-input-real')?.click()}
            >
              {selectedFile ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-teal-600 mb-2" />
                  <p className="text-xs font-medium text-teal-700">{selectedFile.name}</p>
                  <p className="text-[10px] text-teal-600/70 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Click to change</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs font-medium">Click to select file</p>
                  <p className="text-[10px] text-muted-foreground mt-1">PDF or Images up to 5MB</p>
                </>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Remarks (Optional)</Label>
              <Input 
                className="h-8 text-xs" 
                placeholder="Add any notes..." 
                value={uploadRemarks}
                onChange={(e) => setUploadRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setUploadingItem(null)} disabled={submitting}>Cancel</Button>
            <Button 
              size="sm" 
              className="bg-teal-600"
              disabled={submitting || !selectedFile}
              onClick={handleUpload}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : 'Upload File'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
