'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Warehouse,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Eye,
  Plus,
  Search,
  Navigation,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface LogisticsRecord {
  id: string;
  shipmentId: string;
  type: string;
  driverName: string | null;
  driverPhone: string | null;
  vehicleNumber: string | null;
  transportVendor: string | null;
  routeFrom: string | null;
  routeTo: string | null;
  dispatchDate: string | null;
  deliveryDate: string | null;
  podStatus: string;
  warehouseEntry: string | null;
  offloadDate: string | null;
  storageDays: number;
  status: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shipment: {
    id: string;
    shipmentNumber: string;
    status: string;
    destinationPort: string | null;
    company: { id: string; name: string } | null;
  };
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  dispatched: 'bg-teal/10 text-teal border-teal/20',
  in_transit: 'bg-amber/10 text-amber border-amber/20',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const podStatusColors: Record<string, string> = {
  pending: 'bg-amber/10 text-amber border-amber/20',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function LogisticsModule() {
  const [logistics, setLogistics] = useState<LogisticsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transport');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<LogisticsRecord | null>(null);
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
    } catch {
      // silent
    } finally {
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

  const filteredRecords = currentRecords.filter(
    (r) =>
      r.shipment?.shipmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      r.transportVendor?.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className={cn('rounded-lg p-2', stat.bgColor)}>
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Transport / Warehouse Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="h-8">
                    <TabsTrigger value="transport" className="text-xs h-6 px-3">
                      <Truck className="h-3.5 w-3.5 mr-1" /> Transport
                    </TabsTrigger>
                    <TabsTrigger value="warehouse" className="text-xs h-6 px-3">
                      <Warehouse className="h-3.5 w-3.5 mr-1" /> Warehouse
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-48 pl-8 text-xs"
                  />
                </div>
                <Button size="sm" className="h-8 text-xs" onClick={() => setNewDialogOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> New
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              {activeTab === 'transport' ? (
                <TransportTable
                  records={filteredRecords}
                  loading={loading}
                  onView={(r) => {
                    setSelectedRecord(r);
                    setDetailOpen(true);
                  }}
                />
              ) : (
                <WarehouseTable
                  records={filteredRecords}
                  loading={loading}
                  onView={(r) => {
                    setSelectedRecord(r);
                    setDetailOpen(true);
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRecord?.type === 'transport' ? (
                <Truck className="h-5 w-5 text-teal" />
              ) : (
                <Warehouse className="h-5 w-5 text-orange-500" />
              )}
              Logistics Details
            </DialogTitle>
            <DialogDescription>
              Shipment: {selectedRecord?.shipment?.shipmentNumber || '-'}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge variant="outline" className="text-xs mt-1">
                    {formatStatus(selectedRecord.type)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge
                    variant="outline"
                    className={cn('text-xs mt-1', statusColors[selectedRecord.status] || '')}
                  >
                    {formatStatus(selectedRecord.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <p className="text-sm font-medium">
                    {selectedRecord.shipment?.company?.name || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Destination Port</Label>
                  <p className="text-sm font-medium">
                    {selectedRecord.shipment?.destinationPort || '-'}
                  </p>
                </div>
              </div>

              <Separator />

              {selectedRecord.type === 'transport' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Driver Name</Label>
                    <p className="text-sm font-medium">{selectedRecord.driverName || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Driver Phone</Label>
                    <p className="text-sm font-medium">{selectedRecord.driverPhone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Vehicle Number</Label>
                    <p className="text-sm font-medium">{selectedRecord.vehicleNumber || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Transport Vendor</Label>
                    <p className="text-sm font-medium">{selectedRecord.transportVendor || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Route</Label>
                    <p className="text-sm font-medium">
                      {selectedRecord.routeFrom || '?'} → {selectedRecord.routeTo || '?'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">POD Status</Label>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', podStatusColors[selectedRecord.podStatus] || '')}
                    >
                      {formatStatus(selectedRecord.podStatus)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Dispatch Date</Label>
                    <p className="text-sm">
                      {selectedRecord.dispatchDate
                        ? format(new Date(selectedRecord.dispatchDate), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Delivery Date</Label>
                    <p className="text-sm">
                      {selectedRecord.deliveryDate
                        ? format(new Date(selectedRecord.deliveryDate), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Warehouse Entry</Label>
                    <p className="text-sm">
                      {selectedRecord.warehouseEntry
                        ? format(new Date(selectedRecord.warehouseEntry), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Offload Date</Label>
                    <p className="text-sm">
                      {selectedRecord.offloadDate
                        ? format(new Date(selectedRecord.offloadDate), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Storage Days</Label>
                    <p className="text-sm font-medium">{selectedRecord.storageDays} days</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Transport Vendor</Label>
                    <p className="text-sm font-medium">{selectedRecord.transportVendor || '-'}</p>
                  </div>
                </div>
              )}

              {selectedRecord.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedRecord.notes}</p>
                  </div>
                </>
              )}

              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Timeline</Label>
                <div className="mt-2 space-y-2">
                  {[
                    { label: 'Record Created', date: selectedRecord.createdAt },
                    { label: 'Dispatched', date: selectedRecord.dispatchDate },
                    { label: 'Warehouse Entry', date: selectedRecord.warehouseEntry },
                    { label: 'Offloaded', date: selectedRecord.offloadDate },
                    { label: 'Delivered', date: selectedRecord.deliveryDate },
                  ]
                    .filter((e) => e.date)
                    .map((event, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-teal shrink-0" />
                        <span className="text-xs text-muted-foreground">{event.label}</span>
                        <span className="text-xs ml-auto">
                          {formatDistanceToNow(new Date(event.date!), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Record Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Logistics Record</DialogTitle>
            <DialogDescription>Create a new transport or warehouse entry</DialogDescription>
          </DialogHeader>
          <NewLogisticsForm onClose={() => setNewDialogOpen(false)} onCreated={fetchLogistics} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransportTable({
  records,
  loading,
  onView,
}: {
  records: LogisticsRecord[];
  loading: boolean;
  onView: (r: LogisticsRecord) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Shipment</TableHead>
          <TableHead className="text-xs">Driver</TableHead>
          <TableHead className="text-xs">Vehicle</TableHead>
          <TableHead className="text-xs">Vendor</TableHead>
          <TableHead className="text-xs">Route</TableHead>
          <TableHead className="text-xs">Dispatch Date</TableHead>
          <TableHead className="text-xs">Delivery Date</TableHead>
          <TableHead className="text-xs">POD Status</TableHead>
          <TableHead className="text-xs">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 9 }).map((_, j) => (
                <TableCell key={j}>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
              No transport records found
            </TableCell>
          </TableRow>
        ) : (
          records.map((record) => (
            <TableRow key={record.id} className="hover:bg-accent/30 transition-colors">
              <TableCell className="text-xs font-medium">
                {record.shipment?.shipmentNumber || '-'}
              </TableCell>
              <TableCell className="text-xs">{record.driverName || '-'}</TableCell>
              <TableCell className="text-xs">{record.vehicleNumber || '-'}</TableCell>
              <TableCell className="text-xs">{record.transportVendor || '-'}</TableCell>
              <TableCell className="text-xs">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{record.routeFrom || '?'}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{record.routeTo || '?'}</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {record.dispatchDate
                  ? format(new Date(record.dispatchDate), 'MMM dd, yyyy')
                  : '-'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {record.deliveryDate
                  ? format(new Date(record.deliveryDate), 'MMM dd, yyyy')
                  : '-'}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn('text-[10px] font-semibold', podStatusColors[record.podStatus] || '')}
                >
                  {formatStatus(record.podStatus)}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onView(record)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function WarehouseTable({
  records,
  loading,
  onView,
}: {
  records: LogisticsRecord[];
  loading: boolean;
  onView: (r: LogisticsRecord) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Shipment</TableHead>
          <TableHead className="text-xs">Entry Date</TableHead>
          <TableHead className="text-xs">Offload Date</TableHead>
          <TableHead className="text-xs">Storage Days</TableHead>
          <TableHead className="text-xs">Status</TableHead>
          <TableHead className="text-xs">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 6 }).map((_, j) => (
                <TableCell key={j}>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
              No warehouse records found
            </TableCell>
          </TableRow>
        ) : (
          records.map((record) => (
            <TableRow key={record.id} className="hover:bg-accent/30 transition-colors">
              <TableCell className="text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-orange-500" />
                  {record.shipment?.shipmentNumber || '-'}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {record.warehouseEntry
                  ? format(new Date(record.warehouseEntry), 'MMM dd, yyyy')
                  : '-'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {record.offloadDate
                  ? format(new Date(record.offloadDate), 'MMM dd, yyyy')
                  : '-'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-[10px]">
                  {record.storageDays} days
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn('text-[10px] font-semibold', statusColors[record.status] || '')}
                >
                  {formatStatus(record.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onView(record)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function NewLogisticsForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs">Shipment ID</Label>
          <Input
            value={form.shipmentId}
            onChange={(e) => setForm({ ...form, shipmentId: e.target.value })}
            placeholder="Enter shipment ID"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Type</Label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
          >
            <option value="transport">Transport</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Driver Name</Label>
          <Input
            value={form.driverName}
            onChange={(e) => setForm({ ...form, driverName: e.target.value })}
            placeholder="Driver name"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Vehicle Number</Label>
          <Input
            value={form.vehicleNumber}
            onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
            placeholder="Vehicle number"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Transport Vendor</Label>
          <Input
            value={form.transportVendor}
            onChange={(e) => setForm({ ...form, transportVendor: e.target.value })}
            placeholder="Vendor name"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Route From</Label>
          <Input
            value={form.routeFrom}
            onChange={(e) => setForm({ ...form, routeFrom: e.target.value })}
            placeholder="Origin"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Route To</Label>
          <Input
            value={form.routeTo}
            onChange={(e) => setForm({ ...form, routeTo: e.target.value })}
            placeholder="Destination"
            className="h-8 text-xs mt-1"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Notes</Label>
        <Input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any notes..."
          className="h-8 text-xs mt-1"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Record'}
        </Button>
      </DialogFooter>
    </form>
  );
}
