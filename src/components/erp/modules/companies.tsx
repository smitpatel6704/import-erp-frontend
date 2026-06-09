'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Search, Plus, Eye, Phone, Mail, Globe,
  MapPin, FileText, Ship, DollarSign, CreditCard,
  Landmark, Hash, User, Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, API_BASE_URL } from '@/lib/utils';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  id: string;
  name: string;
  contactPerson: string | null;
  mobile: string | null;
  email: string | null;
  officeAddress: string | null;
  gstNumber: string | null;
  iecCode: string | null;
  panNumber: string | null;
  bankName: string | null;
  bankAccount: string | null;
  bankIfsc: string | null;
  billingAddress: string | null;
  shippingAddress: string | null;
  creditLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { shipments: number; invoices: number; products: number };
}

interface CompanyDetail extends Company {
  shipments: { id: string; shipmentNumber: string; status: string; shipmentValue: number; currency: string; createdAt: string }[];
  invoices: { id: string; invoiceNumber: string; totalAmount: number; paidAmount: number; status: string; createdAt: string }[];
  transactions: { id: string; type: string; amount: number; currency: string; description: string | null; transactionDate: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const currencyFmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

const statusLabelMap: Record<string, string> = {
  draft: 'Draft',
  booking_confirmed: 'Confirmed',
  at_pol: 'At POL',
  vessel_departed: 'Departed',
  in_transit: 'In Transit',
  at_pod: 'At POD',
  customs_clearance: 'Customs',
  duty_paid: 'Duty Paid',
  in_transport: 'Transport',
  offloaded: 'Offloaded',
  delivered: 'Delivered',
  closed: 'Closed',
};

const statusColorMap: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  booking_confirmed: 'bg-teal/10 text-teal dark:bg-teal/20',
  at_pol: 'bg-amber/10 text-amber-dark dark:bg-amber/20',
  vessel_departed: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  in_transit: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  at_pod: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  customs_clearance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  duty_paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  in_transport: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  offloaded: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const invoiceStatusColor: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  sent: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  approved: 'bg-teal/10 text-teal dark:bg-teal/20',
  partial: 'bg-amber/10 text-amber-dark dark:bg-amber/20',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompaniesModule() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // New company dialog
  const [newCompanyOpen, setNewCompanyOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '', contactPerson: '', mobile: '', email: '',
    officeAddress: '', gstNumber: '', iecCode: '', panNumber: '',
    bankName: '', bankAccount: '', bankIfsc: '',
    billingAddress: '', shippingAddress: '', creditLimit: '',
  });

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await fetch(`/api/companies?${params}`);
      const json = await res.json();
      setCompanies(json.data || []);
      setTotalCount(json.pagination?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const res = await fetch(`/api/companies/${id}`);
      const json = await res.json();
      setSelectedCompany(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const createCompany = async () => {
    try {
      await fetch(`/api/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newForm,
          creditLimit: parseFloat(newForm.creditLimit) || 0,
        }),
      });
      setNewCompanyOpen(false);
      setNewForm({
        name: '', contactPerson: '', mobile: '', email: '',
        officeAddress: '', gstNumber: '', iecCode: '', panNumber: '',
        bankName: '', bankAccount: '', bankIfsc: '',
        billingAddress: '', shippingAddress: '', creditLimit: '',
      });
      fetchCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  // Financial summary for detail dialog
  const getOutstandingBalance = (company: CompanyDetail | null) => {
    if (!company) return 0;
    return company.invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      {/* Search & Filter Bar */}
      <Card className="glass border-0 shadow-enterprise">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search company, GST, IEC, email..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="secondary" className="text-xs">{totalCount} companies</Badge>
              <Button size="sm" className="h-9 text-xs" onClick={() => setNewCompanyOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> New Company
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass border-0 shadow-enterprise animate-pulse">
              <CardContent className="p-5 h-40" />
            </Card>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Building2 className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">No companies found</p>
          <p className="text-xs mt-1">Try adjusting your search or create a new company</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
            >
              <Card
                className="glass border-0 shadow-enterprise hover-lift cursor-pointer group"
                onClick={() => openDetail(company.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-10 w-10 border border-teal/20">
                      <AvatarFallback className="bg-teal/10 text-teal font-semibold text-sm">
                        {company.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-teal transition-colors">{company.name}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                        <User className="h-3 w-3" />
                        <span className="truncate">{company.contactPerson || 'No contact'}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      'text-[9px] font-semibold shrink-0',
                      company.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                    )}>
                      {company.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {company.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}
                    {company.mobile && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{company.mobile}</span>
                      </div>
                    )}
                    {company.gstNumber && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Hash className="h-3.5 w-3.5 shrink-0" />
                        <span>GST: {company.gstNumber}</span>
                      </div>
                    )}
                    {company.iecCode && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span>IEC: {company.iecCode}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs">
                        <Ship className="h-3.5 w-3.5 text-teal" />
                        <span className="font-medium">{company._count.shipments}</span>
                        <span className="text-muted-foreground">shipments</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <FileText className="h-3.5 w-3.5 text-amber-dark" />
                        <span className="font-medium">{company._count.invoices}</span>
                        <span className="text-muted-foreground">invoices</span>
                      </div>
                    </div>
                    {company.creditLimit > 0 && (
                      <span className="text-xs font-medium text-muted-foreground">
                        Credit: {currencyFmt(company.creditLimit)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-8 text-xs">Previous</Button>
          <span className="text-xs text-muted-foreground">Page {page}</span>
          <Button variant="outline" size="sm" disabled={page * 20 >= totalCount} onClick={() => setPage(page + 1)} className="h-8 text-xs">Next</Button>
        </div>
      )}

      {/* Company Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-teal/20">
                <AvatarFallback className="bg-teal/10 text-teal font-bold text-lg">
                  {selectedCompany?.name?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <DialogTitle className="text-lg">{selectedCompany?.name || 'Loading...'}</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {selectedCompany?.contactPerson || 'No contact'} &middot; {selectedCompany?.email || 'No email'}
                </DialogDescription>
              </div>
              {selectedCompany && (
                <Badge variant="outline" className={cn(
                  'text-[10px] font-semibold',
                  selectedCompany.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                )}>
                  {selectedCompany.isActive ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </div>
          </DialogHeader>
          {detailLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : selectedCompany ? (
            <Tabs defaultValue="info" className="w-full">
              <div className="px-6 pt-2">
                <TabsList className="h-8">
                  <TabsTrigger value="info" className="text-xs h-7 px-3">Company Info</TabsTrigger>
                  <TabsTrigger value="shipments" className="text-xs h-7 px-3">Shipments ({selectedCompany._count.shipments})</TabsTrigger>
                  <TabsTrigger value="financial" className="text-xs h-7 px-3">Financial</TabsTrigger>
                </TabsList>
              </div>
              <ScrollArea className="h-[55vh] px-6 pb-6">
                {/* Company Info Tab */}
                <TabsContent value="info" className="mt-4">
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Contact Person', value: selectedCompany.contactPerson, icon: User },
                          { label: 'Email', value: selectedCompany.email, icon: Mail },
                          { label: 'Mobile', value: selectedCompany.mobile, icon: Phone },
                          { label: 'Office Address', value: selectedCompany.officeAddress, icon: MapPin },
                        ].map((field) => (
                          <div key={field.label} className="flex items-start gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal/10 shrink-0 mt-0.5">
                              <field.icon className="h-3.5 w-3.5 text-teal" />
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-muted-foreground">{field.label}</p>
                              <p className="text-sm">{field.value || '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Regulatory Information */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Regulatory & Tax</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'GST Number', value: selectedCompany.gstNumber },
                          { label: 'IEC Code', value: selectedCompany.iecCode },
                          { label: 'PAN Number', value: selectedCompany.panNumber },
                          { label: 'Credit Limit', value: selectedCompany.creditLimit > 0 ? currencyFmt(selectedCompany.creditLimit) : null },
                        ].map((field) => (
                          <div key={field.label}>
                            <p className="text-[11px] font-semibold text-muted-foreground">{field.label}</p>
                            <p className="text-sm mt-0.5">{field.value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Banking Information */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Banking Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Bank Name', value: selectedCompany.bankName, icon: Landmark },
                          { label: 'Account Number', value: selectedCompany.bankAccount, icon: CreditCard },
                          { label: 'IFSC Code', value: selectedCompany.bankIfsc, icon: Hash },
                        ].map((field) => (
                          <div key={field.label} className="flex items-start gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber/10 shrink-0 mt-0.5">
                              <field.icon className="h-3.5 w-3.5 text-amber-dark" />
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-muted-foreground">{field.label}</p>
                              <p className="text-sm">{field.value || '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Addresses */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Addresses</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground">Billing Address</p>
                          <p className="text-sm mt-0.5">{selectedCompany.billingAddress || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground">Shipping Address</p>
                          <p className="text-sm mt-0.5">{selectedCompany.shippingAddress || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Shipments Tab */}
                <TabsContent value="shipments" className="mt-4">
                  {selectedCompany.shipments && selectedCompany.shipments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCompany.shipments.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 shrink-0">
                            <Ship className="h-4 w-4 text-teal" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{s.shipmentNumber}</p>
                            <p className="text-[11px] text-muted-foreground">{format(new Date(s.createdAt), 'MMM d, yyyy')}</p>
                          </div>
                          <Badge variant="outline" className={cn('text-[10px] font-semibold', statusColorMap[s.status] || '')}>
                            {statusLabelMap[s.status] || s.status}
                          </Badge>
                          <span className="text-sm font-medium">{s.shipmentValue > 0 ? currencyFmt(s.shipmentValue) : '—'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No shipments linked to this company</p>
                  )}
                </TabsContent>

                {/* Financial Tab */}
                <TabsContent value="financial" className="mt-4">
                  <div className="space-y-6">
                    {/* Financial KPIs */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="glass border-0 shadow-enterprise">
                        <CardContent className="p-4 text-center">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase">Total Invoiced</p>
                          <p className="text-xl font-bold text-teal mt-1">
                            {currencyFmt(selectedCompany.invoices?.reduce((sum, inv) => sum + inv.totalAmount, 0) || 0)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="glass border-0 shadow-enterprise">
                        <CardContent className="p-4 text-center">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase">Paid</p>
                          <p className="text-xl font-bold text-emerald-600 mt-1">
                            {currencyFmt(selectedCompany.invoices?.reduce((sum, inv) => sum + inv.paidAmount, 0) || 0)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="glass border-0 shadow-enterprise">
                        <CardContent className="p-4 text-center">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase">Outstanding</p>
                          <p className="text-xl font-bold text-red-500 mt-1">
                            {currencyFmt(getOutstandingBalance(selectedCompany))}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Invoices List */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Invoices</h4>
                      {selectedCompany.invoices && selectedCompany.invoices.length > 0 ? (
                        <div className="space-y-2">
                          {selectedCompany.invoices.map((inv) => (
                            <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10 shrink-0">
                                <FileText className="h-4 w-4 text-amber-dark" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                                <p className="text-[11px] text-muted-foreground">{format(new Date(inv.createdAt), 'MMM d, yyyy')}</p>
                              </div>
                              <Badge variant="outline" className={cn('text-[10px] font-semibold', invoiceStatusColor[inv.status] || '')}>
                                {inv.status}
                              </Badge>
                              <div className="text-right">
                                <p className="text-sm font-medium">{currencyFmt(inv.totalAmount)}</p>
                                <p className="text-[11px] text-emerald-600">Paid: {currencyFmt(inv.paidAmount)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-6">No invoices</p>
                      )}
                    </div>

                    {/* Credit Limit */}
                    {selectedCompany.creditLimit > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium">Credit Utilization</span>
                          <span className="text-xs text-muted-foreground">
                            {currencyFmt(getOutstandingBalance(selectedCompany))} / {currencyFmt(selectedCompany.creditLimit)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min((getOutstandingBalance(selectedCompany) / selectedCompany.creditLimit) * 100, 100)}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* New Company Dialog */}
      <Dialog open={newCompanyOpen} onOpenChange={setNewCompanyOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Create New Company</DialogTitle>
            <DialogDescription>Enter company details to register a new business partner</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] px-6 pb-6">
            <div className="space-y-4 pt-4">
              <div>
                <Label className="text-xs">Company Name *</Label>
                <Input value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} className="h-8 text-sm mt-1" placeholder="Acme Imports Pvt Ltd" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Contact Person</Label>
                  <Input value={newForm.contactPerson} onChange={(e) => setNewForm({ ...newForm, contactPerson: e.target.value })} className="h-8 text-sm mt-1" placeholder="John Doe" />
                </div>
                <div>
                  <Label className="text-xs">Mobile</Label>
                  <Input value={newForm.mobile} onChange={(e) => setNewForm({ ...newForm, mobile: e.target.value })} className="h-8 text-sm mt-1" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input type="email" value={newForm.email} onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} className="h-8 text-sm mt-1" placeholder="contact@acme.com" />
                </div>
                <div>
                  <Label className="text-xs">Credit Limit</Label>
                  <Input type="number" value={newForm.creditLimit} onChange={(e) => setNewForm({ ...newForm, creditLimit: e.target.value })} className="h-8 text-sm mt-1" placeholder="500000" />
                </div>
              </div>

              <div>
                <Label className="text-xs">Office Address</Label>
                <Input value={newForm.officeAddress} onChange={(e) => setNewForm({ ...newForm, officeAddress: e.target.value })} className="h-8 text-sm mt-1" />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">GST Number</Label>
                  <Input value={newForm.gstNumber} onChange={(e) => setNewForm({ ...newForm, gstNumber: e.target.value })} className="h-8 text-sm mt-1" placeholder="27AABCU9603R1ZM" />
                </div>
                <div>
                  <Label className="text-xs">IEC Code</Label>
                  <Input value={newForm.iecCode} onChange={(e) => setNewForm({ ...newForm, iecCode: e.target.value })} className="h-8 text-sm mt-1" placeholder="0905012345" />
                </div>
                <div>
                  <Label className="text-xs">PAN Number</Label>
                  <Input value={newForm.panNumber} onChange={(e) => setNewForm({ ...newForm, panNumber: e.target.value })} className="h-8 text-sm mt-1" placeholder="AABCU9603R" />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Bank Name</Label>
                  <Input value={newForm.bankName} onChange={(e) => setNewForm({ ...newForm, bankName: e.target.value })} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Account Number</Label>
                  <Input value={newForm.bankAccount} onChange={(e) => setNewForm({ ...newForm, bankAccount: e.target.value })} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs">IFSC Code</Label>
                  <Input value={newForm.bankIfsc} onChange={(e) => setNewForm({ ...newForm, bankIfsc: e.target.value })} className="h-8 text-sm mt-1" />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs">Billing Address</Label>
                <Input value={newForm.billingAddress} onChange={(e) => setNewForm({ ...newForm, billingAddress: e.target.value })} className="h-8 text-sm mt-1" />
              </div>
              <div>
                <Label className="text-xs">Shipping Address</Label>
                <Input value={newForm.shippingAddress} onChange={(e) => setNewForm({ ...newForm, shippingAddress: e.target.value })} className="h-8 text-sm mt-1" />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setNewCompanyOpen(false)} className="h-8 text-xs">Cancel</Button>
            <Button onClick={createCompany} className="h-8 text-xs" disabled={!newForm.name}>Create Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
