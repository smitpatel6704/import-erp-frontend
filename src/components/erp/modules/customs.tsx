'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  FileCheck,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Eye,
  Plus,
  Search,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface CustomsRecord {
  id: string;
  shipmentId: string;
  chaName: string | null;
  chaContact: string | null;
  assessmentValue: number;
  dutyAmount: number;
  dutyStatus: string;
  clearanceStatus: string;
  customsRemarks: string | null;
  assessmentDate: string | null;
  paymentDate: string | null;
  clearanceDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shipment: {
    id: string;
    shipmentNumber: string;
    status: string;
    originCountry: string | null;
    destinationPort: string | null;
    company: { id: string; name: string } | null;
  };
}

const dutyStatusColors: Record<string, string> = {
  pending: 'bg-amber/10 text-amber border-amber/20',
  assessed: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  waived: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const clearanceStatusColors: Record<string, string> = {
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

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CustomsModule() {
  const [customs, setCustoms] = useState<CustomsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<CustomsRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});

  const fetchCustoms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/customs?limit=50`);
      const json = await res.json();
      if (json.data) {
        setCustoms(json.data);
        const counts: Record<string, number> = {};
        clearanceStages.forEach((s) => (counts[s.key] = 0));
        json.data.forEach((r: CustomsRecord) => {
          if (counts[r.clearanceStatus] !== undefined) counts[r.clearanceStatus]++;
        });
        setStageCounts(counts);
      }
    } catch {
      // silent
    } finally {
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

  const filteredCustoms = customs.filter(
    (c) =>
      c.shipment?.shipmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.chaName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDuty = customs.reduce((sum, c) => sum + c.dutyAmount, 0);
  const totalAssessed = customs.reduce((sum, c) => sum + c.assessmentValue, 0);

  const currentStageIndex = (status: string) => {
    const idx = clearanceStages.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

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

      {/* Customs Workflow Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Customs Workflow Pipeline</CardTitle>
            <CardDescription className="text-xs">
              Clearance stages overview — Total Assessed: ${totalAssessed.toLocaleString()} | Total
              Duty: ${totalDuty.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {clearanceStages.map((stage, i) => {
                const StageIcon = stage.icon;
                return (
                  <React.Fragment key={stage.key}>
                    <div className="flex flex-col items-center gap-2 min-w-[120px]">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors',
                          stageCounts[stage.key] > 0
                            ? clearanceStatusColors[stage.key].replace('border-', 'border-').replace('/20', '/40')
                            : 'border-muted bg-muted/30'
                        )}
                      >
                        <StageIcon
                          className={cn(
                            'h-5 w-5',
                            stageCounts[stage.key] > 0
                              ? clearanceStatusColors[stage.key].split(' ')[1]
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <span className="text-xs font-medium text-center">{stage.label}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs',
                          stageCounts[stage.key] > 0
                            ? clearanceStatusColors[stage.key]
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {stageCounts[stage.key]}
                      </Badge>
                    </div>
                    {i < clearanceStages.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Customs Records</CardTitle>
                <CardDescription className="text-xs">
                  {filteredCustoms.length} clearance records
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search shipment, CHA..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-48 pl-8 text-xs"
                  />
                </div>
                <Button size="sm" className="h-8 text-xs" onClick={() => setNewDialogOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> New Record
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Shipment</TableHead>
                    <TableHead className="text-xs">CHA Name</TableHead>
                    <TableHead className="text-xs">Assessment Value</TableHead>
                    <TableHead className="text-xs">Duty Amount</TableHead>
                    <TableHead className="text-xs">Duty Status</TableHead>
                    <TableHead className="text-xs">Clearance Status</TableHead>
                    <TableHead className="text-xs">Assessment Date</TableHead>
                    <TableHead className="text-xs">Payment Date</TableHead>
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
                  ) : filteredCustoms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                        No customs records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustoms.map((record) => (
                      <TableRow key={record.id} className="hover:bg-accent/30 transition-colors">
                        <TableCell className="text-xs font-medium">
                          {record.shipment?.shipmentNumber || '-'}
                        </TableCell>
                        <TableCell className="text-xs">{record.chaName || '-'}</TableCell>
                        <TableCell className="text-xs">
                          ${record.assessmentValue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs">
                          ${record.dutyAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('text-[10px] font-semibold', dutyStatusColors[record.dutyStatus] || '')}
                          >
                            {formatStatus(record.dutyStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('text-[10px] font-semibold', clearanceStatusColors[record.clearanceStatus] || '')}
                          >
                            {formatStatus(record.clearanceStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.assessmentDate
                            ? format(new Date(record.assessmentDate), 'MMM dd, yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.paymentDate
                            ? format(new Date(record.paymentDate), 'MMM dd, yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedRecord(record);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal" />
              Customs Clearance Details
            </DialogTitle>
            <DialogDescription>
              Shipment: {selectedRecord?.shipment?.shipmentNumber || '-'}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              {/* Progress Pipeline */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {clearanceStages.map((stage, i) => {
                  const stageIdx = currentStageIndex(selectedRecord.clearanceStatus);
                  const isCompleted = i <= stageIdx;
                  const isCurrent = i === stageIdx;
                  const StageIcon = stage.icon;
                  return (
                    <React.Fragment key={stage.key}>
                      <div className="flex flex-col items-center gap-1 min-w-[90px]">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs',
                            isCompleted
                              ? isCurrent
                                ? clearanceStatusColors[stage.key]
                                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : 'border-muted bg-muted/30 text-muted-foreground'
                          )}
                        >
                          <StageIcon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[10px] text-center leading-tight">{stage.label}</span>
                      </div>
                      {i < clearanceStages.length - 1 && (
                        <ChevronRight
                          className={cn(
                            'h-3 w-3 shrink-0',
                            i < stageIdx ? 'text-emerald-500' : 'text-muted-foreground'
                          )}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Shipment Number</Label>
                  <p className="text-sm font-medium">{selectedRecord.shipment?.shipmentNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <p className="text-sm font-medium">{selectedRecord.shipment?.company?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CHA Name</Label>
                  <p className="text-sm font-medium">{selectedRecord.chaName || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CHA Contact</Label>
                  <p className="text-sm font-medium">{selectedRecord.chaContact || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Assessment Value</Label>
                  <p className="text-sm font-medium">${selectedRecord.assessmentValue.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duty Amount</Label>
                  <p className="text-sm font-medium">${selectedRecord.dutyAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duty Status</Label>
                  <Badge variant="outline" className={cn('text-xs', dutyStatusColors[selectedRecord.dutyStatus])}>
                    {formatStatus(selectedRecord.dutyStatus)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Clearance Status</Label>
                  <Badge variant="outline" className={cn('text-xs', clearanceStatusColors[selectedRecord.clearanceStatus])}>
                    {formatStatus(selectedRecord.clearanceStatus)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Assessment Date</Label>
                  <p className="text-sm">
                    {selectedRecord.assessmentDate
                      ? format(new Date(selectedRecord.assessmentDate), 'MMM dd, yyyy HH:mm')
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Date</Label>
                  <p className="text-sm">
                    {selectedRecord.paymentDate
                      ? format(new Date(selectedRecord.paymentDate), 'MMM dd, yyyy HH:mm')
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Clearance Date</Label>
                  <p className="text-sm">
                    {selectedRecord.clearanceDate
                      ? format(new Date(selectedRecord.clearanceDate), 'MMM dd, yyyy HH:mm')
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Origin Country</Label>
                  <p className="text-sm">{selectedRecord.shipment?.originCountry || '-'}</p>
                </div>
              </div>

              {selectedRecord.customsRemarks && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Customs Remarks</Label>
                    <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedRecord.customsRemarks}</p>
                  </div>
                </>
              )}

              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Timeline</Label>
                <div className="mt-2 space-y-2">
                  {[
                    { label: 'Record Created', date: selectedRecord.createdAt },
                    { label: 'Assessment Completed', date: selectedRecord.assessmentDate },
                    { label: 'Duty Paid', date: selectedRecord.paymentDate },
                    { label: 'Clearance Approved', date: selectedRecord.clearanceDate },
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
            <DialogTitle>New Customs Record</DialogTitle>
            <DialogDescription>Create a new customs clearance entry</DialogDescription>
          </DialogHeader>
          <NewCustomsForm onClose={() => setNewDialogOpen(false)} onCreated={fetchCustoms} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewCustomsForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/customs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          assessmentValue: parseFloat(form.assessmentValue) || 0,
          dutyAmount: parseFloat(form.dutyAmount) || 0,
        }),
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
          <Label className="text-xs">CHA Name</Label>
          <Input
            value={form.chaName}
            onChange={(e) => setForm({ ...form, chaName: e.target.value })}
            placeholder="CHA name"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">CHA Contact</Label>
          <Input
            value={form.chaContact}
            onChange={(e) => setForm({ ...form, chaContact: e.target.value })}
            placeholder="Contact info"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Assessment Value</Label>
          <Input
            type="number"
            value={form.assessmentValue}
            onChange={(e) => setForm({ ...form, assessmentValue: e.target.value })}
            placeholder="0.00"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Duty Amount</Label>
          <Input
            type="number"
            value={form.dutyAmount}
            onChange={(e) => setForm({ ...form, dutyAmount: e.target.value })}
            placeholder="0.00"
            className="h-8 text-xs mt-1"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Customs Remarks</Label>
        <Input
          value={form.customsRemarks}
          onChange={(e) => setForm({ ...form, customsRemarks: e.target.value })}
          placeholder="Any remarks..."
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
