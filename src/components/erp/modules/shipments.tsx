'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship, Search, Filter, Plus, Eye, LayoutGrid, List,
  Anchor, MapPin, Clock, Package, FileText, DollarSign,
  ArrowRight, X, ChevronRight, Globe, Calendar, Pencil, Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Shipment {
  id: string;
  shipmentNumber: string;
  bookingNumber: string | null;
  blNumber: string | null;
  shippingLine: string | null;
  freightForwarder: string | null;
  vesselName: string | null;
  voyageNumber: string | null;
  etd: string | null;
  eta: string | null;
  actualArrival: string | null;
  originCountry: string | null;
  originPort: string | null;
  destinationPort: string | null;
  warehouseLocation: string | null;
  deliveryAddress: string | null;
  priority: string;
  status: string;
  shipmentValue: number;
  currency: string;
  companyId: string | null;
  exporterCompanyId: string | null;
  tags: string | null;
  internalNotes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string; contactPerson: string | null } | null;
  exporterCompany: { id: string; name: string; contactPerson: string | null } | null;
  containers: { id: string; containerNumber: string; containerSize: string; containerType: string; status: string }[];
  _count: { containers: number; documents: number; expenses: number; timelineEvents: number; shipmentItems: number };
}

interface ShipmentDetail extends Shipment {
  documents: { id: string; name: string; documentType: string; fileUrl: string; isVerified: boolean; createdAt: string }[];
  expenses: { id: string; category: string; description: string | null; amount: number; currency: string; paymentStatus: string; createdAt: string }[];
  timelineEvents: { id: string; event: string; description: string | null; location: string | null; timestamp: string }[];
  invoices: { id: string; invoiceNumber: string; invoiceType: string; totalAmount: number; status: string }[];
  customsClearance: {
    id: string; chaName: string | null; assessmentValue: number; dutyAmount: number; dutyStatus: string; clearanceStatus: string; clearanceDate: string | null;
  } | null;
  logistics: { id: string; type: string; status: string; transportVendor: string | null; vehicleNumber: string | null; dispatchDate: string | null; deliveryDate: string | null }[];
  shipmentItems: { id: string; description: string | null; quantity: number; unitPrice: number; grossWeight: number; product: { id: string; name: string; sku: string | null } | null }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'booking_confirmed', label: 'Booking Confirmed' },
  { value: 'at_pol', label: 'At POL' },
  { value: 'vessel_departed', label: 'Vessel Departed' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'at_pod', label: 'At POD' },
  { value: 'customs_clearance', label: 'Customs Clearance' },
  { value: 'duty_paid', label: 'Duty Paid' },
  { value: 'in_transport', label: 'In Transport' },
  { value: 'offloaded', label: 'Offloaded' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITIES = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

// Options fetched from database API now

const statusLabelMap: Record<string, string> = Object.fromEntries(STATUSES.map(s => [s.value, s.label]));

const statusColorMap: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  booking_confirmed: 'bg-teal/10 text-teal-dark border-teal/20 dark:bg-teal/20 dark:text-teal-light',
  at_pol: 'bg-amber/10 text-amber-dark border-amber/20 dark:bg-amber/20 dark:text-amber-light',
  vessel_departed: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
  in_transit: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  at_pod: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
  customs_clearance: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  duty_paid: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  in_transport: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
  offloaded: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
  delivered: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  closed: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

const statusDotMap: Record<string, string> = {
  draft: 'bg-slate-400',
  booking_confirmed: 'bg-teal',
  at_pol: 'bg-amber',
  vessel_departed: 'bg-cyan-500',
  in_transit: 'bg-sky-500',
  at_pod: 'bg-violet-500',
  customs_clearance: 'bg-orange-500',
  duty_paid: 'bg-emerald-500',
  in_transport: 'bg-pink-500',
  offloaded: 'bg-rose-500',
  delivered: 'bg-green-500',
  closed: 'bg-gray-500',
};

const priorityColorMap: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  high: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  normal: 'bg-teal/10 text-teal-dark border-teal/20 dark:bg-teal/20 dark:text-teal-light',
  low: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

const currencyFmt = (val: number, cur = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ShipmentsModule() {
  const [shippingLines, setShippingLines] = useState<string[]>([]);
  const [containerSizes, setContainerSizes] = useState<string[]>([]);
  const [containerTypes, setContainerTypes] = useState<string[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [exporterCompanies, setExporterCompanies] = useState<any[]>([]);

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Detail dialog
  const [selectedShipment, setSelectedShipment] = useState<ShipmentDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // New / Edit shipment dialog
  const [newShipmentOpen, setNewShipmentOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({
    blNumber: '', shippingLine: '', freightForwarder: '',
    vesselName: '', voyageNumber: '', etd: '', eta: '', originCountry: '',
    originPort: '', destinationPort: '', priority: 'normal', status: 'draft', shipmentValue: '',
    currency: 'USD', companyId: '', exporterCompanyId: '', internalNotes: '', containers: [] as Array<{ containerNumber: string; size: string; type: string }>,
  });

  // Document upload state
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    name: '',
    documentType: '',
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [lines, sizes, types, docs, comps, exps] = await Promise.all([
          fetch('/api/settings/options?category=shipping_line').then(r => r.json()),
          fetch('/api/settings/options?category=container_size').then(r => r.json()),
          fetch('/api/settings/options?category=container_type').then(r => r.json()),
          fetch('/api/settings/options?category=document_type').then(r => r.json()),
          fetch('/api/companies').then(r => r.json()),
          fetch('/api/exporter-companies').then(r => r.json()),
        ]);
        if (lines.data) setShippingLines(lines.data.map((d: any) => d.label));
        if (sizes.data) setContainerSizes(sizes.data.map((d: any) => d.label));
        if (types.data) setContainerTypes(types.data.map((d: any) => d.label));
        if (docs.data) setDocumentTypes(docs.data.map((d: any) => d.label));
        if (comps.data) setCompanies(comps.data);
        if (exps.data) setExporterCompanies(exps.data);
      } catch (err) {
        console.error('Failed to fetch settings options:', err);
      }
    };
    fetchOptions();
  }, []);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await fetch(`/api/shipments?${params}`);
      const json = await res.json();
      setShipments(json.data || []);
      setTotalCount(json.pagination?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter, searchQuery]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const res = await fetch(`/api/shipments/${id}`);
      const json = await res.json();
      setSelectedShipment(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedShipment || !newDocForm.name || !newDocForm.documentType) return;
    
    setDocUploading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDocForm,
          shipmentId: selectedShipment.id,
          fileUrl: `https://storage.example.com/docs/${Date.now()}.pdf`,
          fileType: 'application/pdf',
          fileSize: 1024 * 1024,
        }),
      });
      
      if (res.ok) {
        // Refresh detail
        await openDetail(selectedShipment.id);
        setUploadDocOpen(false);
        setNewDocForm({ name: '', documentType: '' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDocUploading(false);
    }
  };

  const openEdit = (shipment: ShipmentDetail) => {
    setEditingId(shipment.id);
    setNewForm({
      blNumber: shipment.blNumber || '',
      shippingLine: shipment.shippingLine || '',
      freightForwarder: shipment.freightForwarder || '',
      vesselName: shipment.vesselName || '',
      voyageNumber: shipment.voyageNumber || '',
      etd: shipment.etd ? new Date(shipment.etd).toISOString().slice(0, 10) : '',
      eta: shipment.eta ? new Date(shipment.eta).toISOString().slice(0, 10) : '',
      originCountry: shipment.originCountry || '',
      originPort: shipment.originPort || '',
      destinationPort: shipment.destinationPort || '',
      priority: shipment.priority || 'normal',
      status: shipment.status || 'draft',
      shipmentValue: shipment.shipmentValue ? String(shipment.shipmentValue) : '',
      currency: shipment.currency || 'USD',
      companyId: shipment.company?.id || '',
      exporterCompanyId: shipment.exporterCompany?.id || '',
      internalNotes: shipment.internalNotes || '',
      containers: [] // Handle existing containers if needed
    });
    setNewShipmentOpen(true);
    setDetailOpen(false);
  };

  const saveShipment = async () => {
    try {
      const url = editingId ? `${API_BASE_URL}/api/shipments/${editingId}` : `${API_BASE_URL}/api/shipments`;
      const method = editingId ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newForm,
          shipmentValue: parseFloat(newForm.shipmentValue) || 0,
          etd: newForm.etd || null,
          eta: newForm.eta || null,
        }),
      });
      setNewShipmentOpen(false);
      setEditingId(null);
      setNewForm({ blNumber: '', shippingLine: '', freightForwarder: '', vesselName: '', voyageNumber: '', etd: '', eta: '', originCountry: '', originPort: '', destinationPort: '', priority: 'normal', status: 'draft', shipmentValue: '', currency: 'USD', companyId: '', exporterCompanyId: '', internalNotes: '', containers: [] });
      fetchShipments();
    } catch (e) {
      console.error(e);
    }
  };

  // Status counts for stats bar
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    shipments.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return counts;
  }, [shipments]);

  // Kanban groupings
  const kanbanColumns = ['draft', 'booking_confirmed', 'at_pol', 'vessel_departed', 'in_transit', 'at_pod', 'customs_clearance', 'duty_paid', 'in_transport', 'offloaded', 'delivered', 'closed'];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      {/* Filter Bar */}
      <Card className="glass border-0 shadow-enterprise">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shipment, BL, booking..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center border rounded-lg p-0.5">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm" className="h-7 px-2.5 text-xs"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-3.5 w-3.5 mr-1" /> Table
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                  size="sm" className="h-7 px-2.5 text-xs"
                  onClick={() => setViewMode('kanban')}
                >
                  <LayoutGrid className="h-3.5 w-3.5 mr-1" /> Kanban
                </Button>
              </div>
              <Button size="sm" className="h-9 text-xs ml-auto" onClick={() => {
                setEditingId(null);
                setNewForm({ blNumber: '', shippingLine: '', freightForwarder: '', vesselName: '', voyageNumber: '', etd: '', eta: '', originCountry: '', originPort: '', destinationPort: '', priority: 'normal', status: 'draft', shipmentValue: '', currency: 'USD', companyId: '', exporterCompanyId: '', internalNotes: '', containers: [] });
                setNewShipmentOpen(true);
              }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> New Shipment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {kanbanColumns.map((status) => {
          const count = statusCounts[status] || 0;
          if (statusFilter !== 'all' && statusFilter !== status) return null;
          return (
            <button
              key={status}
              onClick={() => { setStatusFilter(statusFilter === status ? 'all' : status); setPage(1); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
                statusFilter === status
                  ? statusColorMap[status] + ' ring-1 ring-current/20'
                  : 'bg-card border-border/50 text-muted-foreground hover:bg-accent/50'
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', statusDotMap[status])} />
              {statusLabelMap[status]}
              <Badge variant="secondary" className="h-4 min-w-[18px] px-1 text-[10px] ml-0.5">{count}</Badge>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="glass border-0 shadow-enterprise animate-pulse">
              <CardContent className="p-4 h-16" />
            </Card>
          ))}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <Card className="glass border-0 shadow-enterprise">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold">Shipment</TableHead>
                    <TableHead className="text-[11px] font-semibold hidden md:table-cell">Booking/BL</TableHead>
                    <TableHead className="text-[11px] font-semibold hidden lg:table-cell">Shipping Line</TableHead>
                    <TableHead className="text-[11px] font-semibold">Route</TableHead>
                    <TableHead className="text-[11px] font-semibold hidden sm:table-cell">ETD/ETA</TableHead>
                    <TableHead className="text-[11px] font-semibold">Status</TableHead>
                    <TableHead className="text-[11px] font-semibold hidden md:table-cell">Priority</TableHead>
                    <TableHead className="text-[11px] font-semibold text-right">Value</TableHead>
                    <TableHead className="text-[11px] font-semibold w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        No shipments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    shipments.map((s, i) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        className="group cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() => openDetail(s.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 shrink-0">
                              <Ship className="h-4 w-4 text-teal" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{s.shipmentNumber}</p>
                              <div className="flex flex-col">
                                {s.company && <p className="text-[10px] text-muted-foreground leading-tight">I: {s.company.name}</p>}
                                {s.exporterCompany && <p className="text-[10px] text-muted-foreground leading-tight">E: {s.exporterCompany.name}</p>}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-xs">{s.bookingNumber || '—'}</p>
                          <p className="text-[11px] text-muted-foreground">{s.blNumber || '—'}</p>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">{s.shippingLine || '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <span>{s.originPort || '?'}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span>{s.destinationPort || '?'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <p className="text-[11px]">{s.etd ? format(new Date(s.etd), 'MMM d') : '—'}</p>
                          <p className="text-[11px] text-muted-foreground">{s.eta ? format(new Date(s.eta), 'MMM d') : '—'}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[10px] font-semibold', statusColorMap[s.status] || '')}>
                            {statusLabelMap[s.status] || s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className={cn('text-[10px] font-semibold', priorityColorMap[s.priority] || '')}>
                            {s.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {s.shipmentValue > 0 ? currencyFmt(s.shipmentValue, s.currency) : '—'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {totalCount > 20 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, totalCount)} of {totalCount}
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-7 text-xs">Prev</Button>
                  <Button variant="outline" size="sm" disabled={page * 20 >= totalCount} onClick={() => setPage(page + 1)} className="h-7 text-xs">Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Kanban View */
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <div className="flex gap-4 min-w-max">
            {kanbanColumns.map((status) => {
              const items = shipments.filter((s) => s.status === status);
              if (statusFilter !== 'all' && statusFilter !== status) return null;
              return (
                <div key={status} className="w-72 shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className={cn('h-2 w-2 rounded-full', statusDotMap[status])} />
                    <span className="text-xs font-semibold">{statusLabelMap[status]}</span>
                    <Badge variant="secondary" className="h-4 min-w-[18px] px-1 text-[10px] ml-auto">{items.length}</Badge>
                  </div>
                  <div className="space-y-2 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
                    {items.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                        No shipments
                      </div>
                    ) : (
                      items.map((s) => (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          className="rounded-xl border border-border/50 bg-card/80 p-3 cursor-pointer hover:shadow-enterprise transition-shadow"
                          onClick={() => openDetail(s.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-medium">{s.shipmentNumber}</p>
                            <Badge variant="outline" className={cn('text-[9px] font-semibold shrink-0', priorityColorMap[s.priority])}>
                              {s.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1.5">
                            <span>{s.originPort || '?'}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{s.destinationPort || '?'}</span>
                          </div>
                          {s.company && (
                            <p className="text-[10px] text-muted-foreground truncate">I: {s.company.name}</p>
                          )}
                          {s.exporterCompany && (
                            <p className="text-[10px] text-muted-foreground truncate">E: {s.exporterCompany.name}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-medium">{s.shipmentValue > 0 ? currencyFmt(s.shipmentValue, s.currency) : '—'}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {s._count.containers}C &middot; {s._count.documents}D
                            </span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipment Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
                <Ship className="h-5 w-5 text-teal" />
              </div>
              <div>
                <DialogTitle className="text-lg">{selectedShipment?.shipmentNumber || 'Loading...'}</DialogTitle>
                <DialogDescription className="text-[10px] mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> Importer: {selectedShipment?.company?.name || 'N/A'}</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Exporter: {selectedShipment?.exporterCompany?.name || 'N/A'}</span>
                </DialogDescription>
              </div>
              {selectedShipment && (
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-[10px] font-semibold', statusColorMap[selectedShipment.status])}>
                    {statusLabelMap[selectedShipment.status]}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => openEdit(selectedShipment)} className="h-7 px-2 text-xs">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          {detailLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : selectedShipment ? (
            <Tabs defaultValue="overview" className="w-full">
              <div className="px-6 pt-2">
                <TabsList className="h-8">
                  <TabsTrigger value="overview" className="text-xs h-7 px-3">Overview</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs h-7 px-3">Timeline</TabsTrigger>
                  <TabsTrigger value="containers" className="text-xs h-7 px-3">Containers ({selectedShipment.containers?.length || 0})</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs h-7 px-3">Documents ({selectedShipment.documents?.length || 0})</TabsTrigger>
                  <TabsTrigger value="expenses" className="text-xs h-7 px-3">Expenses ({selectedShipment.expenses?.length || 0})</TabsTrigger>
                </TabsList>
              </div>
              <ScrollArea className="h-[55vh] px-6 pb-6">
                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Booking Number', value: selectedShipment.bookingNumber },
                      { label: 'BL Number', value: selectedShipment.blNumber },
                      { label: 'Shipping Line', value: selectedShipment.shippingLine },
                      { label: 'Vessel', value: selectedShipment.vesselName },
                      { label: 'Voyage', value: selectedShipment.voyageNumber },
                      { label: 'Freight Forwarder', value: selectedShipment.freightForwarder },
                      { label: 'Origin Country', value: selectedShipment.originCountry },
                      { label: 'Origin Port', value: selectedShipment.originPort },
                      { label: 'Destination Port', value: selectedShipment.destinationPort },
                      { label: 'Priority', value: selectedShipment.priority },
                      { label: 'ETD', value: selectedShipment.etd ? format(new Date(selectedShipment.etd), 'MMM d, yyyy') : null },
                      { label: 'ETA', value: selectedShipment.eta ? format(new Date(selectedShipment.eta), 'MMM d, yyyy') : null },
                      { label: 'Shipment Value', value: selectedShipment.shipmentValue > 0 ? currencyFmt(selectedShipment.shipmentValue, selectedShipment.currency) : null },
                      { label: 'Warehouse', value: selectedShipment.warehouseLocation },
                    ].map((field) => (
                      <div key={field.label}>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</p>
                        <p className="text-sm mt-0.5">{field.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                  {selectedShipment.internalNotes && (
                    <div className="mt-4 p-3 rounded-lg bg-amber/5 border border-amber/20">
                      <p className="text-[11px] font-semibold text-amber-dark mb-1">Internal Notes</p>
                      <p className="text-xs">{selectedShipment.internalNotes}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="mt-4">
                  {selectedShipment.timelineEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No timeline events</p>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                      <div className="space-y-4">
                        {selectedShipment.timelineEvents.map((event, i) => (
                          <div key={event.id} className="relative flex items-start gap-4 pl-10">
                            <div className={cn(
                              'absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-background',
                              i === 0 ? 'bg-teal' : 'bg-muted-foreground/30'
                            )} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{event.event}</p>
                              {event.description && <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>}
                              <div className="flex items-center gap-2 mt-1">
                                {event.location && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />{event.location}
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Containers Tab */}
                <TabsContent value="containers" className="mt-4">
                  {selectedShipment.containers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No containers</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedShipment.containers.map((c) => (
                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10">
                            <Package className="h-4 w-4 text-amber-dark" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{c.containerNumber}</p>
                            <p className="text-[11px] text-muted-foreground">{c.containerSize} &middot; {c.containerType}</p>
                          </div>
                          <Badge variant="outline" className={cn('text-[10px]', statusColorMap[c.status] || '')}>
                            {statusLabelMap[c.status] || c.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold">Shipment Documents</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[10px]"
                      onClick={() => setUploadDocOpen(!uploadDocOpen)}
                    >
                      {uploadDocOpen ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                      {uploadDocOpen ? 'Cancel' : 'Add Document'}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {uploadDocOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-6"
                      >
                        <div className="p-4 rounded-xl border border-teal/20 bg-teal/5 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Document Name</Label>
                              <Input 
                                value={newDocForm.name} 
                                onChange={(e) => setNewDocForm({ ...newDocForm, name: e.target.value })}
                                placeholder="Invoice #1234"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Document Type</Label>
                              <Select 
                                value={newDocForm.documentType} 
                                onValueChange={(v) => setNewDocForm({ ...newDocForm, documentType: v })}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {documentTypes.length > 0 ? (
                                    documentTypes.map((type) => (
                                      <SelectItem key={type} value={type.toLowerCase().replace(/ /g, '_')}>
                                        {type}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="other">Other</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              size="sm" 
                              className="h-8 text-xs bg-teal hover:bg-teal-dark"
                              disabled={docUploading || !newDocForm.name || !newDocForm.documentType}
                              onClick={handleUploadDocument}
                            >
                              {docUploading ? 'Uploading...' : 'Save Document'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {selectedShipment.documents.length === 0 ? (
                    <div className="text-center py-12 rounded-xl border border-dashed border-border/60">
                      <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">Upload required shipment documents above</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedShipment.documents.map((d) => (
                        <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors group">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10">
                            <FileText className="h-4 w-4 text-teal" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{d.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[11px] text-muted-foreground">{d.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                              <span className="text-[11px] text-muted-foreground/40">•</span>
                              <p className="text-[11px] text-muted-foreground">{format(new Date(d.createdAt), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={d.isVerified ? 'default' : 'outline'} className={cn('text-[10px]', d.isVerified ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-muted-foreground')}>
                              {d.isVerified ? 'Verified' : 'Pending'}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Expenses Tab */}
                <TabsContent value="expenses" className="mt-4">
                  {selectedShipment.expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No expenses</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedShipment.expenses.map((e) => (
                        <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{e.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                            {e.description && <p className="text-[11px] text-muted-foreground">{e.description}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{currencyFmt(e.amount, e.currency)}</p>
                            <Badge variant="outline" className={cn('text-[9px]', e.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : e.paymentStatus === 'overdue' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : '')}>
                              {e.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* New Shipment Dialog */}
      <Dialog open={newShipmentOpen} onOpenChange={setNewShipmentOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>{editingId ? 'Edit Shipment' : 'Create New Shipment'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update shipment details' : 'Enter shipment details to create a new draft shipment'}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] px-6 pb-6">
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">Importer Company (Client)</Label>
                  <Select value={newForm.companyId} onValueChange={(v) => setNewForm({ ...newForm, companyId: v })}>
                    <SelectTrigger className="h-8 text-sm mt-1">
                      <SelectValue placeholder="Select Importer" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">Exporter Company</Label>
                  <Select value={newForm.exporterCompanyId} onValueChange={(v) => setNewForm({ ...newForm, exporterCompanyId: v })}>
                    <SelectTrigger className="h-8 text-sm mt-1">
                      <SelectValue placeholder="Select Exporter" />
                    </SelectTrigger>
                    <SelectContent>
                      {exporterCompanies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">BL Number</Label>
                  <Input value={newForm.blNumber} onChange={(e) => setNewForm({ ...newForm, blNumber: e.target.value })} className="h-8 text-sm mt-1" placeholder="BL-2025-001" />
                </div>
                <div>
                  <Label className="text-xs">Shipping Line</Label>
                  <Select value={newForm.shippingLine} onValueChange={(v) => setNewForm({ ...newForm, shippingLine: v })}>
                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Select a shipping line" /></SelectTrigger>
                    <SelectContent>
                      {shippingLines.map((line) => (
                        <SelectItem key={line} value={line}>{line}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Vessel Name</Label>
                  <Input value={newForm.vesselName} onChange={(e) => setNewForm({ ...newForm, vesselName: e.target.value })} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Origin Port</Label>
                  <Input value={newForm.originPort} onChange={(e) => setNewForm({ ...newForm, originPort: e.target.value })} className="h-8 text-sm mt-1" placeholder="Shanghai" />
                </div>
                <div>
                  <Label className="text-xs">Destination Port</Label>
                  <Input value={newForm.destinationPort} onChange={(e) => setNewForm({ ...newForm, destinationPort: e.target.value })} className="h-8 text-sm mt-1" placeholder="Nhava Sheva" />
                </div>
                <div>
                  <Label className="text-xs">ETD</Label>
                  <Input type="date" value={newForm.etd} onChange={(e) => setNewForm({ ...newForm, etd: e.target.value })} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs">ETA</Label>
                  <Input type="date" value={newForm.eta} onChange={(e) => setNewForm({ ...newForm, eta: e.target.value })} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Priority</Label>
                  <Select value={newForm.priority} onValueChange={(v) => setNewForm({ ...newForm, priority: v })}>
                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={newForm.status} onValueChange={(v) => setNewForm({ ...newForm, status: v })}>
                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.filter(s => s.value !== 'all').map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Shipment Value</Label>
                  <Input type="number" value={newForm.shipmentValue} onChange={(e) => setNewForm({ ...newForm, shipmentValue: e.target.value })} className="h-8 text-sm mt-1" placeholder="0" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Origin Country</Label>
                <Input value={newForm.originCountry} onChange={(e) => setNewForm({ ...newForm, originCountry: e.target.value })} className="h-8 text-sm mt-1" placeholder="China" />
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs font-semibold">Containers</Label>
                  <Button
                    type="button"
                    onClick={() => setNewForm({ ...newForm, containers: [...newForm.containers, { containerNumber: '', size: '20FT', type: 'Dry Container' }] })}
                    className="h-6 text-xs px-2"
                    size="sm"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Container
                  </Button>
                </div>
                {newForm.containers.length === 0 ? (
                  <p className="text-xs text-gray-500">No containers added yet</p>
                ) : (
                  <div className="space-y-2">
                    {newForm.containers.map((container, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs">Container Number</Label>
                          <Input
                            value={container.containerNumber}
                            onChange={(e) => {
                              const newContainers = [...newForm.containers];
                              newContainers[idx].containerNumber = e.target.value;
                              setNewForm({ ...newForm, containers: newContainers });
                            }}
                            className="h-7 text-xs mt-1"
                            placeholder="CONT-123456"
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-xs">Size</Label>
                          <Select
                            value={container.size}
                            onValueChange={(v) => {
                              const newContainers = [...newForm.containers];
                              newContainers[idx].size = v;
                              setNewForm({ ...newForm, containers: newContainers });
                            }}
                          >
                            <SelectTrigger className="h-7 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {containerSizes.map((size) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-36">
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={container.type}
                            onValueChange={(v) => {
                              const newContainers = [...newForm.containers];
                              newContainers[idx].type = v;
                              setNewForm({ ...newForm, containers: newContainers });
                            }}
                          >
                            <SelectTrigger className="h-7 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {containerTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setNewForm({ ...newForm, containers: newForm.containers.filter((_, i) => i !== idx) })}
                          variant="ghost"
                          className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                          size="sm"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs">Internal Notes</Label>
                <Input value={newForm.internalNotes} onChange={(e) => setNewForm({ ...newForm, internalNotes: e.target.value })} className="h-8 text-sm mt-1" />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setNewShipmentOpen(false)} className="h-8 text-xs">Cancel</Button>
            <Button onClick={saveShipment} className="h-8 text-xs">{editingId ? 'Save Changes' : 'Create Shipment'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
