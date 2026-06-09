'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Loader2,
  DollarSign,
  Receipt,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import { format } from 'date-fns';

// ─── Types ──────────────────────────────────────────────────────────────

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: string;
  status: string;
  issueDate: string;
  dueDate: string | null;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paidAmount: number;
  companyId: string | null;
  shipmentId: string | null;
  notes: string | null;
  terms: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string } | null;
  shipment: { id: string; shipmentNumber: string } | null;
  _count: { items: number };
  items?: InvoiceItem[];
}

interface InvoicesResponse {
  data: Invoice[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ─── Constants ──────────────────────────────────────────────────────────

const INVOICE_TYPES = [
  'purchase',
  'freight',
  'customs',
  'transport',
  'commercial',
  'proforma',
] as const;

const TYPE_LABELS: Record<string, string> = {
  purchase: 'Purchase',
  freight: 'Freight',
  customs: 'Customs',
  transport: 'Transport',
  commercial: 'Commercial',
  proforma: 'Proforma',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: {
    label: 'Draft',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-700',
  },
  sent: {
    label: 'Sent',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800',
  },
  approved: {
    label: 'Approved',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  partial: {
    label: 'Partial',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  },
  paid: {
    label: 'Paid',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  },
  overdue: {
    label: 'Overdue',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-700',
  },
};

const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

// ─── Component ──────────────────────────────────────────────────────────

export function InvoicesModule() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  // New invoice form state
  const [newInvoice, setNewInvoice] = useState({
    invoiceType: 'commercial',
    companyId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'USD',
    notes: '',
    terms: '',
  });
  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 },
  ]);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', '50');
      if (search) params.set('search', search);
      if (filterType && filterType !== 'all') params.set('invoiceType', filterType);
      if (filterStatus && filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const json: InvoicesResponse = await res.json();
      setInvoices(json.data || []);
      setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterStatus]);

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/companies?limit=50`);
      const json = await res.json();
      setCompanies((json.data || []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Stats
  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((i) => i.status === 'paid').length;
    const pending = invoices.filter((i) => i.status === 'sent' || i.status === 'draft' || i.status === 'approved').length;
    const overdue = invoices.filter((i) => i.status === 'overdue').length;
    const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const outstandingAmount = invoices
      .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
    return { total, paid, pending, overdue, totalAmount, outstandingAmount };
  }, [invoices]);

  // Fetch invoice detail with items
  const openInvoiceDetail = async (invoice: Invoice) => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`);
      const json = await res.json();
      setSelectedInvoice(json.data || invoice);
      setDetailOpen(true);
    } catch {
      setSelectedInvoice(invoice);
      setDetailOpen(true);
    }
  };

  // Line item calculations
  const updateLineItem = (index: number, field: string, value: string | number) => {
    const updated = [...lineItems];
    (updated[index] as Record<string, string | number>)[field] = value;
    const item = updated[index];
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discount) || 0;
    const tax = Number(item.taxRate) || 0;
    item.total = qty * price - disc + (qty * price - disc) * (tax / 100);
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const lineItemsSubtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) - Number(item.discount)), 0);
  const lineItemsTax = lineItems.reduce((sum, item) => {
    const base = Number(item.quantity) * Number(item.unitPrice) - Number(item.discount);
    return sum + base * (Number(item.taxRate) / 100);
  }, 0);
  const lineItemsTotal = lineItemsSubtotal + lineItemsTax;

  // Create invoice
  const handleCreateInvoice = async () => {
    setSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newInvoice,
          subtotal: lineItemsSubtotal,
          taxAmount: lineItemsTax,
          totalAmount: lineItemsTotal,
          items: lineItems.filter((item) => item.description.trim()),
          issueDate: newInvoice.issueDate || new Date().toISOString(),
          dueDate: newInvoice.dueDate || null,
        }),
      });
      setNewInvoiceOpen(false);
      setNewInvoice({
        invoiceType: 'commercial',
        companyId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        currency: 'USD',
        notes: '',
        terms: '',
      });
      setLineItems([{ description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 }]);
      fetchInvoices();
    } catch (err) {
      console.error('Failed to create invoice:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const statCards = [
    {
      title: 'Total Invoices',
      value: stats.total,
      icon: FileText,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    },
    {
      title: 'Paid',
      value: stats.paid,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
    },
    {
      title: 'Total Amount',
      value: formatCurrency(stats.totalAmount),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      title: 'Outstanding',
      value: formatCurrency(stats.outstandingAmount),
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={cn('rounded-lg p-2', stat.bgColor)}>
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-tight">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {stat.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[170px]">
                  <SelectValue placeholder="Invoice Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {INVOICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setFilterType('all');
                  setFilterStatus('all');
                  setSearch('');
                }}
                title="Reset filters"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button onClick={() => setNewInvoiceOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoice Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Invoices</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {pagination.total} invoices found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No invoices found</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden lg:table-cell">Company</TableHead>
                      <TableHead className="hidden xl:table-cell">Shipment</TableHead>
                      <TableHead className="hidden md:table-cell">Issue Date</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead className="hidden lg:table-cell">Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice, i) => {
                      const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
                      return (
                        <motion.tr
                          key={invoice.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.2 }}
                          className="hover:bg-accent/30 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/30">
                                <FileText className="h-4 w-4 text-teal-600" />
                              </div>
                              <span className="text-sm font-semibold font-mono">
                                {invoice.invoiceNumber}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {TYPE_LABELS[invoice.invoiceType] || invoice.invoiceType}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs">{invoice.company?.name || '—'}</span>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <span className="text-xs font-mono">
                              {invoice.shipment?.shipmentNumber || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-xs">
                              {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-xs">
                              {invoice.dueDate
                                ? format(new Date(invoice.dueDate), 'MMM dd, yyyy')
                                : '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold">
                              {formatCurrency(invoice.totalAmount, invoice.currency)}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs">
                              {formatCurrency(invoice.paidAmount, invoice.currency)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn('text-[10px] font-semibold', statusCfg.bgColor, statusCfg.color)}
                            >
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openInvoiceDetail(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoice Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              Invoice {selectedInvoice?.invoiceNumber}
            </DialogTitle>
            <DialogDescription>Complete invoice information</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-5 pr-4">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Invoice Number</Label>
                    <p className="text-sm font-semibold font-mono">
                      {selectedInvoice.invoiceNumber}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[selectedInvoice.invoiceType] || selectedInvoice.invoiceType}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Company</Label>
                    <p className="text-sm">{selectedInvoice.company?.name || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Shipment</Label>
                    <p className="text-sm font-mono">
                      {selectedInvoice.shipment?.shipmentNumber || '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Issue Date</Label>
                    <p className="text-sm">
                      {format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                    <p className="text-sm">
                      {selectedInvoice.dueDate
                        ? format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')
                        : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs font-semibold',
                        STATUS_CONFIG[selectedInvoice.status]?.bgColor,
                        STATUS_CONFIG[selectedInvoice.status]?.color
                      )}
                    >
                      {STATUS_CONFIG[selectedInvoice.status]?.label || selectedInvoice.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Currency</Label>
                    <p className="text-sm">{selectedInvoice.currency}</p>
                  </div>
                </div>

                <Separator />

                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Subtotal</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Tax</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(selectedInvoice.taxAmount, selectedInvoice.currency)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-teal-50 dark:bg-teal-950/30 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
                      {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(selectedInvoice.paidAmount, selectedInvoice.currency)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      {formatCurrency(
                        selectedInvoice.totalAmount - selectedInvoice.paidAmount,
                        selectedInvoice.currency
                      )}
                    </p>
                  </div>
                </div>

                {/* Line Items Table */}
                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Line Items
                      </Label>
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Description</TableHead>
                              <TableHead className="text-xs text-right">Qty</TableHead>
                              <TableHead className="text-xs text-right">Unit Price</TableHead>
                              <TableHead className="text-xs text-right hidden sm:table-cell">
                                Tax %
                              </TableHead>
                              <TableHead className="text-xs text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedInvoice.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="text-xs">{item.description}</TableCell>
                                <TableCell className="text-xs text-right">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-xs text-right">
                                  {formatCurrency(item.unitPrice, selectedInvoice.currency)}
                                </TableCell>
                                <TableCell className="text-xs text-right hidden sm:table-cell">
                                  {item.taxRate}%
                                </TableCell>
                                <TableCell className="text-xs text-right font-semibold">
                                  {formatCurrency(item.total, selectedInvoice.currency)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )}

                {/* Payment History */}
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Payment History
                  </Label>
                  <div className="rounded-lg bg-muted/30 p-4 text-center">
                    {selectedInvoice.paidAmount > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Payment Received</span>
                          <span className="font-semibold text-emerald-600">
                            {formatCurrency(selectedInvoice.paidAmount, selectedInvoice.currency)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.min(
                                100,
                                (selectedInvoice.paidAmount / selectedInvoice.totalAmount) * 100
                              )}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(
                            (selectedInvoice.paidAmount / selectedInvoice.totalAmount) * 100
                          )}
                          % paid
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No payments recorded yet</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (
                    <Button variant="outline" size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Paid
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>

                {/* Notes & Terms */}
                {(selectedInvoice.notes || selectedInvoice.terms) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedInvoice.notes && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Notes</Label>
                          <p className="text-xs">{selectedInvoice.notes}</p>
                        </div>
                      )}
                      {selectedInvoice.terms && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Terms</Label>
                          <p className="text-xs">{selectedInvoice.terms}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* New Invoice Dialog */}
      <Dialog open={newInvoiceOpen} onOpenChange={setNewInvoiceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-teal-600" />
              New Invoice
            </DialogTitle>
            <DialogDescription>Create a new invoice</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Type</Label>
                  <Select
                    value={newInvoice.invoiceType}
                    onValueChange={(v) => setNewInvoice({ ...newInvoice, invoiceType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select
                    value={newInvoice.companyId}
                    onValueChange={(v) => setNewInvoice({ ...newInvoice, companyId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={newInvoice.issueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={newInvoice.currency}
                    onValueChange={(v) => setNewInvoice({ ...newInvoice, currency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Line Items</Label>
                  <Button variant="outline" size="sm" onClick={addLineItem}>
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-end border rounded-lg p-3"
                    >
                      <div className="col-span-4 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Description</Label>
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Qty</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Tax%</Label>
                        <Input
                          type="number"
                          value={item.taxRate}
                          onChange={(e) => updateLineItem(index, 'taxRate', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Total</Label>
                        <p className="text-xs font-semibold h-8 flex items-center">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(lineItemsSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>{formatCurrency(lineItemsTax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total:</span>
                      <span className="text-teal-600">{formatCurrency(lineItemsTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Invoice notes"
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Terms</Label>
                <Textarea
                  placeholder="Payment terms"
                  value={newInvoice.terms}
                  onChange={(e) => setNewInvoice({ ...newInvoice, terms: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
