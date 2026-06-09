'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Search, Plus, Eye, Package, MapPin, Weight,
  ArrowRight, Filter, Anchor, Ship, Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContainerItem {
  id: string;
  containerNumber: string;
  containerType: string;
  containerSize: string;
  sealNumber: string | null;
  stuffingType: string | null;
  weightCapacity: number;
  currentWeight: number;
  status: string;
  currentLocation: string | null;
  latitude: number | null;
  longitude: number | null;
  shipmentId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shipment: {
    id: string;
    shipmentNumber: string;
    status: string;
    originPort: string | null;
    destinationPort: string | null;
    company: { id: string; name: string } | null;
  };
  _count: { expenses: number };
}

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

const statusLabelMap: Record<string, string> = Object.fromEntries(
  CONTAINER_STATUSES.map(s => [s.value, s.label])
);

const statusColorMap: Record<string, string> = {
  at_pol: 'bg-amber/10 text-amber-dark border-amber/20 dark:bg-amber/20 dark:text-amber-light',
  loaded: 'bg-teal/10 text-teal-dark border-teal/20 dark:bg-teal/20 dark:text-teal-light',
  in_transit: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  at_pod: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
  customs: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  transport: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
  offloaded: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
  delivered: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
};

const statusDotMap: Record<string, string> = {
  at_pol: 'bg-amber',
  loaded: 'bg-teal',
  in_transit: 'bg-sky-500',
  at_pod: 'bg-violet-500',
  customs: 'bg-orange-500',
  transport: 'bg-pink-500',
  offloaded: 'bg-rose-500',
  delivered: 'bg-green-500',
};

const typeIconMap: Record<string, React.ElementType> = {
  standard: Box,
  reefer: Package,
  open_top: Box,
  flat_rack: Box,
  tank: Box,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContainersModule() {
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<ContainerItem | null>(null);

  // New container dialog
  const [newContainerOpen, setNewContainerOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    containerNumber: '', containerType: '', containerSize: '',
    sealNumber: '', stuffingType: 'fcl', weightCapacity: '', currentWeight: '',
    status: 'at_pol', currentLocation: '', shipmentId: '',
  });

  const [containerTypes, setContainerTypes] = useState<{value: string, label: string}[]>([{ value: 'all', label: 'All Types' }]);
  const [containerSizes, setContainerSizes] = useState<{value: string, label: string}[]>([{ value: 'all', label: 'All Sizes' }]);

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
            ...sizes.data.map((d: any) => ({ value: d.value, label: d.label }))
          ]);
        }
        if (types.data) {
          setContainerTypes([
            { value: 'all', label: 'All Types' },
            ...types.data.map((d: any) => ({ value: d.value, label: d.label }))
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch settings options:', err);
      }
    };
    fetchOptions();
  }, []);

  const fetchContainers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { containerType: typeFilter }),
        ...(sizeFilter !== 'all' && { containerSize: sizeFilter }),
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await fetch(`/api/containers?${params}`);
      const json = await res.json();
      setContainers(json.data || []);
      setTotalCount(json.pagination?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, sizeFilter, searchQuery]);

  useEffect(() => { fetchContainers(); }, [fetchContainers]);

  const createContainer = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/containers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newForm,
          weightCapacity: parseFloat(newForm.weightCapacity) || 0,
          currentWeight: parseFloat(newForm.currentWeight) || 0,
        }),
      });
      setNewContainerOpen(false);
      setNewForm({
        containerNumber: '', containerType: 'standard', containerSize: '20ft',
        sealNumber: '', stuffingType: 'fcl', weightCapacity: '', currentWeight: '',
        status: 'at_pol', currentLocation: '', shipmentId: '',
      });
      fetchContainers();
    } catch (e) {
      console.error(e);
    }
  };

  // Status counts for stats
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    containers.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [containers]);

  // Group by location for status map
  const locationGroups = React.useMemo(() => {
    const groups: Record<string, ContainerItem[]> = {};
    containers.forEach((c) => {
      const loc = c.currentLocation || 'Unknown';
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(c);
    });
    return groups;
  }, [containers]);

  const containerTypeLabel = (type: string) => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      {/* Filter Bar */}
      <Card className="glass border-0 shadow-enterprise">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search container, seal, location..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTAINER_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {containerTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sizeFilter} onValueChange={(v) => { setSizeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[120px] h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {containerSizes.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-9 text-xs ml-auto" onClick={() => setNewContainerOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> New Container
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {CONTAINER_STATUSES.filter(s => s.value !== 'all').map((status, i) => (
          <motion.div
            key={status.value}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <Card className={cn(
              'glass border-0 shadow-enterprise cursor-pointer hover-lift transition-colors',
              statusFilter === status.value && 'ring-2 ring-teal/30'
            )} onClick={() => { setStatusFilter(statusFilter === status.value ? 'all' : status.value); setPage(1); }}>
              <CardContent className="p-3 text-center">
                <div className={cn('h-2 w-2 rounded-full mx-auto mb-2', statusDotMap[status.value])} />
                <p className="text-xl font-bold">{statusCounts[status.value] || 0}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{status.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Container Table + Status Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Container Table */}
        <div className="lg:col-span-3">
          <Card className="glass border-0 shadow-enterprise">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] font-semibold">Container</TableHead>
                      <TableHead className="text-[11px] font-semibold hidden sm:table-cell">Type / Size</TableHead>
                      <TableHead className="text-[11px] font-semibold hidden md:table-cell">Seal</TableHead>
                      <TableHead className="text-[11px] font-semibold">Shipment</TableHead>
                      <TableHead className="text-[11px] font-semibold hidden lg:table-cell">Weight</TableHead>
                      <TableHead className="text-[11px] font-semibold">Status</TableHead>
                      <TableHead className="text-[11px] font-semibold hidden md:table-cell">Location</TableHead>
                      <TableHead className="text-[11px] font-semibold w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={8}><div className="h-8 bg-muted rounded animate-pulse" /></TableCell>
                        </TableRow>
                      ))
                    ) : containers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No containers found</TableCell>
                      </TableRow>
                    ) : (
                      containers.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.2 }}
                          className="group cursor-pointer hover:bg-accent/30 transition-colors"
                          onClick={() => { setSelectedContainer(c); setDetailOpen(true); }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10 shrink-0">
                                <Box className="h-4 w-4 text-amber-dark" />
                              </div>
                              <span className="text-sm font-medium">{c.containerNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <p className="text-xs">{containerTypeLabel(c.containerType)}</p>
                            <p className="text-[11px] text-muted-foreground">{c.containerSize}</p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs">{c.sealNumber || '—'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Ship className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{c.shipment.shipmentNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="space-y-1">
                              <p className="text-xs">{c.currentWeight}/{c.weightCapacity} kg</p>
                              <Progress value={c.weightCapacity ? (c.currentWeight / c.weightCapacity) * 100 : 0} className="h-1.5" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-[10px] font-semibold', statusColorMap[c.status] || '')}>
                              {statusLabelMap[c.status] || c.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {c.currentLocation || '—'}
                            </div>
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
                    Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, totalCount)} of {totalCount}
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-7 text-xs">Prev</Button>
                    <Button variant="outline" size="sm" disabled={page * 20 >= totalCount} onClick={() => setPage(page + 1)} className="h-7 text-xs">Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Container Status Map */}
        <Card className="glass border-0 shadow-enterprise">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">By Location</CardTitle>
            <CardDescription className="text-[11px]">{Object.keys(locationGroups).length} locations</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {Object.entries(locationGroups).map(([loc, items]) => (
                  <div key={loc} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium truncate max-w-[120px]">{loc}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{items.length}</Badge>
                    </div>
                    <div className="space-y-1 pl-5">
                      {items.map((c) => (
                        <div key={c.id} className="flex items-center gap-1.5">
                          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', statusDotMap[c.status])} />
                          <span className="text-[10px] text-muted-foreground truncate">{c.containerNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Container Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[75vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/10">
                <Box className="h-5 w-5 text-amber-dark" />
              </div>
              <div>
                <DialogTitle>{selectedContainer?.containerNumber || 'Loading...'}</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {selectedContainer ? `${containerTypeLabel(selectedContainer.containerType)} — ${selectedContainer.containerSize}` : ''}
                </DialogDescription>
              </div>
              {selectedContainer && (
                <Badge variant="outline" className={cn('ml-auto text-[10px] font-semibold', statusColorMap[selectedContainer.status])}>
                  {statusLabelMap[selectedContainer.status] || selectedContainer.status}
                </Badge>
              )}
            </div>
          </DialogHeader>
          {selectedContainer && (
            <ScrollArea className="h-[55vh] px-6 pb-6">
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Container Number', value: selectedContainer.containerNumber },
                    { label: 'Type', value: containerTypeLabel(selectedContainer.containerType) },
                    { label: 'Size', value: selectedContainer.containerSize },
                    { label: 'Seal Number', value: selectedContainer.sealNumber },
                    { label: 'Stuffing Type', value: selectedContainer.stuffingType?.toUpperCase() },
                    { label: 'Status', value: statusLabelMap[selectedContainer.status] || selectedContainer.status },
                    { label: 'Current Location', value: selectedContainer.currentLocation },
                    { label: 'Current Weight', value: `${selectedContainer.currentWeight} kg` },
                    { label: 'Weight Capacity', value: `${selectedContainer.weightCapacity} kg` },
                    { label: 'Created', value: format(new Date(selectedContainer.createdAt), 'MMM d, yyyy') },
                  ].map((field) => (
                    <div key={field.label}>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</p>
                      <p className="text-sm mt-0.5">{field.value || '—'}</p>
                    </div>
                  ))}
                </div>

                {/* Weight utilization */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium">Weight Utilization</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedContainer.weightCapacity
                        ? `${((selectedContainer.currentWeight / selectedContainer.weightCapacity) * 100).toFixed(0)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <Progress
                    value={selectedContainer.weightCapacity
                      ? (selectedContainer.currentWeight / selectedContainer.weightCapacity) * 100
                      : 0}
                    className="h-2"
                  />
                </div>

                {/* Linked Shipment */}
                <Separator />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Linked Shipment</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 shrink-0">
                      <Ship className="h-4 w-4 text-teal" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedContainer.shipment.shipmentNumber}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {selectedContainer.shipment.originPort || '?'} → {selectedContainer.shipment.destinationPort || '?'}
                      </p>
                    </div>
                    {selectedContainer.shipment.company && (
                      <span className="text-xs text-muted-foreground">{selectedContainer.shipment.company.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* New Container Dialog */}
      <Dialog open={newContainerOpen} onOpenChange={setNewContainerOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Create New Container</DialogTitle>
            <DialogDescription>Enter container details</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] px-6 pb-6">
            <div className="space-y-4 pt-4">
              <div>
                <Label className="text-xs">Container Number *</Label>
                <Input value={newForm.containerNumber} onChange={(e) => setNewForm({ ...newForm, containerNumber: e.target.value })} className="h-8 text-sm mt-1" placeholder="MSKU-1234567" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={newForm.containerType} onValueChange={(v) => setNewForm({ ...newForm, containerType: v })}>
                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {containerTypes.filter(t => t.value !== 'all').map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Size</Label>
                  <Select value={newForm.containerSize} onValueChange={(v) => setNewForm({ ...newForm, containerSize: v })}>
                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {containerSizes.filter(s => s.value !== 'all').map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Seal Number</Label>
                  <Input value={newForm.sealNumber} onChange={(e) => setNewForm({ ...newForm, sealNumber: e.target.value })} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Stuffing Type</Label>
                  <Select value={newForm.stuffingType} onValueChange={(v) => setNewForm({ ...newForm, stuffingType: v })}>
                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fcl">FCL</SelectItem>
                      <SelectItem value="lcl">LCL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Weight Capacity (kg)</Label>
                  <Input type="number" value={newForm.weightCapacity} onChange={(e) => setNewForm({ ...newForm, weightCapacity: e.target.value })} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Current Weight (kg)</Label>
                  <Input type="number" value={newForm.currentWeight} onChange={(e) => setNewForm({ ...newForm, currentWeight: e.target.value })} className="h-8 text-sm mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Current Location</Label>
                <Input value={newForm.currentLocation} onChange={(e) => setNewForm({ ...newForm, currentLocation: e.target.value })} className="h-8 text-sm mt-1" placeholder="Shanghai Port" />
              </div>
              <div>
                <Label className="text-xs">Shipment ID</Label>
                <Input value={newForm.shipmentId} onChange={(e) => setNewForm({ ...newForm, shipmentId: e.target.value })} className="h-8 text-sm mt-1" placeholder="Enter shipment ID" />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setNewContainerOpen(false)} className="h-8 text-xs">Cancel</Button>
            <Button onClick={createContainer} className="h-8 text-xs" disabled={!newForm.containerNumber || !newForm.shipmentId}>Create Container</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
