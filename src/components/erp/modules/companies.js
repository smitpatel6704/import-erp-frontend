'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Plus, Phone, Mail, Globe, MapPin, FileText, Ship, CreditCard, Landmark, Hash, User, } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
// ─── Constants ────────────────────────────────────────────────────────────────
const currencyFmt = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
const statusLabelMap = {
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
const statusColorMap = {
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
const invoiceStatusColor = {
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
    var _a, _b, _c;
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    // Detail dialog
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
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
        var _a;
        setLoading(true);
        try {
            const params = new URLSearchParams(Object.assign({ page: String(page), limit: '20' }, (searchQuery && { search: searchQuery })));
            const res = await fetch(`/api/companies?${params}`);
            const json = await res.json();
            setCompanies(json.data || []);
            setTotalCount(((_a = json.pagination) === null || _a === void 0 ? void 0 : _a.total) || 0);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    }, [page, searchQuery]);
    useEffect(() => { fetchCompanies(); }, [fetchCompanies]);
    const openDetail = async (id) => {
        setDetailLoading(true);
        setDetailOpen(true);
        try {
            const res = await fetch(`/api/companies/${id}`);
            const json = await res.json();
            setSelectedCompany(json.data);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setDetailLoading(false);
        }
    };
    const createCompany = async () => {
        try {
            await fetch(`/api/companies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign(Object.assign({}, newForm), { creditLimit: parseFloat(newForm.creditLimit) || 0 })),
            });
            setNewCompanyOpen(false);
            setNewForm({
                name: '', contactPerson: '', mobile: '', email: '',
                officeAddress: '', gstNumber: '', iecCode: '', panNumber: '',
                bankName: '', bankAccount: '', bankIfsc: '',
                billingAddress: '', shippingAddress: '', creditLimit: '',
            });
            fetchCompanies();
        }
        catch (e) {
            console.error(e);
        }
    };
    // Financial summary for detail dialog
    const getOutstandingBalance = (company) => {
        if (!company)
            return 0;
        return company.invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
    };
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, className: "space-y-4", children: [_jsx(Card, { className: "glass border-0 shadow-enterprise", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-3", children: [_jsxs("div", { className: "relative flex-1 w-full sm:max-w-sm", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search company, GST, IEC, email...", value: searchQuery, onChange: (e) => { setSearchQuery(e.target.value); setPage(1); }, className: "pl-9 h-9 text-sm" })] }), _jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [_jsxs(Badge, { variant: "secondary", className: "text-xs", children: [totalCount, " companies"] }), _jsxs(Button, { size: "sm", className: "h-9 text-xs", onClick: () => setNewCompanyOpen(true), children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), " New Company"] })] })] }) }) }), loading ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: Array.from({ length: 6 }).map((_, i) => (_jsx(Card, { className: "glass border-0 shadow-enterprise animate-pulse", children: _jsx(CardContent, { className: "p-5 h-40" }) }, i))) })) : companies.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [_jsx(Building2, { className: "h-12 w-12 mb-3 opacity-30" }), _jsx("p", { className: "text-sm", children: "No companies found" }), _jsx("p", { className: "text-xs mt-1", children: "Try adjusting your search or create a new company" })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: companies.map((company, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04, duration: 0.25 }, children: _jsx(Card, { className: "glass border-0 shadow-enterprise hover-lift cursor-pointer group", onClick: () => openDetail(company.id), children: _jsxs(CardContent, { className: "p-5", children: [_jsxs("div", { className: "flex items-start gap-3 mb-4", children: [_jsx(Avatar, { className: "h-10 w-10 border border-teal/20", children: _jsx(AvatarFallback, { className: "bg-teal/10 text-teal font-semibold text-sm", children: company.name.charAt(0).toUpperCase() }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold truncate group-hover:text-teal transition-colors", children: company.name }), _jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5", children: [_jsx(User, { className: "h-3 w-3" }), _jsx("span", { className: "truncate", children: company.contactPerson || 'No contact' })] })] }), _jsx(Badge, { variant: "outline", className: cn('text-[9px] font-semibold shrink-0', company.isActive
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'), children: company.isActive ? 'Active' : 'Inactive' })] }), _jsxs("div", { className: "space-y-2", children: [company.email && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Mail, { className: "h-3.5 w-3.5 shrink-0" }), _jsx("span", { className: "truncate", children: company.email })] })), company.mobile && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Phone, { className: "h-3.5 w-3.5 shrink-0" }), _jsx("span", { children: company.mobile })] })), company.gstNumber && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Hash, { className: "h-3.5 w-3.5 shrink-0" }), _jsxs("span", { children: ["GST: ", company.gstNumber] })] })), company.iecCode && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Globe, { className: "h-3.5 w-3.5 shrink-0" }), _jsxs("span", { children: ["IEC: ", company.iecCode] })] }))] }), _jsx(Separator, { className: "my-3" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-1 text-xs", children: [_jsx(Ship, { className: "h-3.5 w-3.5 text-teal" }), _jsx("span", { className: "font-medium", children: company._count.shipments }), _jsx("span", { className: "text-muted-foreground", children: "shipments" })] }), _jsxs("div", { className: "flex items-center gap-1 text-xs", children: [_jsx(FileText, { className: "h-3.5 w-3.5 text-amber-dark" }), _jsx("span", { className: "font-medium", children: company._count.invoices }), _jsx("span", { className: "text-muted-foreground", children: "invoices" })] })] }), company.creditLimit > 0 && (_jsxs("span", { className: "text-xs font-medium text-muted-foreground", children: ["Credit: ", currencyFmt(company.creditLimit)] }))] })] }) }) }, company.id))) })), totalCount > 20 && (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage(page - 1), className: "h-8 text-xs", children: "Previous" }), _jsxs("span", { className: "text-xs text-muted-foreground", children: ["Page ", page] }), _jsx(Button, { variant: "outline", size: "sm", disabled: page * 20 >= totalCount, onClick: () => setPage(page + 1), className: "h-8 text-xs", children: "Next" })] })), _jsx(Dialog, { open: detailOpen, onOpenChange: setDetailOpen, children: _jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-hidden p-0", children: [_jsx(DialogHeader, { className: "px-6 pt-6 pb-4 border-b", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Avatar, { className: "h-12 w-12 border-2 border-teal/20", children: _jsx(AvatarFallback, { className: "bg-teal/10 text-teal font-bold text-lg", children: ((_a = selectedCompany === null || selectedCompany === void 0 ? void 0 : selectedCompany.name) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()) || '?' }) }), _jsxs("div", { className: "flex-1", children: [_jsx(DialogTitle, { className: "text-lg", children: (selectedCompany === null || selectedCompany === void 0 ? void 0 : selectedCompany.name) || 'Loading...' }), _jsxs(DialogDescription, { className: "text-xs mt-0.5", children: [(selectedCompany === null || selectedCompany === void 0 ? void 0 : selectedCompany.contactPerson) || 'No contact', " \u00B7 ", (selectedCompany === null || selectedCompany === void 0 ? void 0 : selectedCompany.email) || 'No email'] })] }), selectedCompany && (_jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', selectedCompany.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'), children: selectedCompany.isActive ? 'Active' : 'Inactive' }))] }) }), detailLoading ? (_jsx("div", { className: "p-6 space-y-4", children: Array.from({ length: 6 }).map((_, i) => (_jsx("div", { className: "h-4 bg-muted rounded animate-pulse" }, i))) })) : selectedCompany ? (_jsxs(Tabs, { defaultValue: "info", className: "w-full", children: [_jsx("div", { className: "px-6 pt-2", children: _jsxs(TabsList, { className: "h-8", children: [_jsx(TabsTrigger, { value: "info", className: "text-xs h-7 px-3", children: "Company Info" }), _jsxs(TabsTrigger, { value: "shipments", className: "text-xs h-7 px-3", children: ["Shipments (", selectedCompany._count.shipments, ")"] }), _jsx(TabsTrigger, { value: "financial", className: "text-xs h-7 px-3", children: "Financial" })] }) }), _jsxs(ScrollArea, { className: "h-[55vh] px-6 pb-6", children: [_jsx(TabsContent, { value: "info", className: "mt-4", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Contact Information" }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: [
                                                                    { label: 'Contact Person', value: selectedCompany.contactPerson, icon: User },
                                                                    { label: 'Email', value: selectedCompany.email, icon: Mail },
                                                                    { label: 'Mobile', value: selectedCompany.mobile, icon: Phone },
                                                                    { label: 'Office Address', value: selectedCompany.officeAddress, icon: MapPin },
                                                                ].map((field) => (_jsxs("div", { className: "flex items-start gap-2.5", children: [_jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-lg bg-teal/10 shrink-0 mt-0.5", children: _jsx(field.icon, { className: "h-3.5 w-3.5 text-teal" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground", children: field.label }), _jsx("p", { className: "text-sm", children: field.value || '—' })] })] }, field.label))) })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Regulatory & Tax" }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: [
                                                                    { label: 'GST Number', value: selectedCompany.gstNumber },
                                                                    { label: 'IEC Code', value: selectedCompany.iecCode },
                                                                    { label: 'PAN Number', value: selectedCompany.panNumber },
                                                                    { label: 'Credit Limit', value: selectedCompany.creditLimit > 0 ? currencyFmt(selectedCompany.creditLimit) : null },
                                                                ].map((field) => (_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground", children: field.label }), _jsx("p", { className: "text-sm mt-0.5", children: field.value || '—' })] }, field.label))) })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Banking Details" }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: [
                                                                    { label: 'Bank Name', value: selectedCompany.bankName, icon: Landmark },
                                                                    { label: 'Account Number', value: selectedCompany.bankAccount, icon: CreditCard },
                                                                    { label: 'IFSC Code', value: selectedCompany.bankIfsc, icon: Hash },
                                                                ].map((field) => (_jsxs("div", { className: "flex items-start gap-2.5", children: [_jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-lg bg-amber/10 shrink-0 mt-0.5", children: _jsx(field.icon, { className: "h-3.5 w-3.5 text-amber-dark" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground", children: field.label }), _jsx("p", { className: "text-sm", children: field.value || '—' })] })] }, field.label))) })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Addresses" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground", children: "Billing Address" }), _jsx("p", { className: "text-sm mt-0.5", children: selectedCompany.billingAddress || '—' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground", children: "Shipping Address" }), _jsx("p", { className: "text-sm mt-0.5", children: selectedCompany.shippingAddress || '—' })] })] })] })] }) }), _jsx(TabsContent, { value: "shipments", className: "mt-4", children: selectedCompany.shipments && selectedCompany.shipments.length > 0 ? (_jsx("div", { className: "space-y-2", children: selectedCompany.shipments.map((s) => (_jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 shrink-0", children: _jsx(Ship, { className: "h-4 w-4 text-teal" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: s.shipmentNumber }), _jsx("p", { className: "text-[11px] text-muted-foreground", children: format(new Date(s.createdAt), 'MMM d, yyyy') })] }), _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', statusColorMap[s.status] || ''), children: statusLabelMap[s.status] || s.status }), _jsx("span", { className: "text-sm font-medium", children: s.shipmentValue > 0 ? currencyFmt(s.shipmentValue) : '—' })] }, s.id))) })) : (_jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No shipments linked to this company" })) }), _jsx(TabsContent, { value: "financial", className: "mt-4", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsx(Card, { className: "glass border-0 shadow-enterprise", children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground uppercase", children: "Total Invoiced" }), _jsx("p", { className: "text-xl font-bold text-teal mt-1", children: currencyFmt(((_b = selectedCompany.invoices) === null || _b === void 0 ? void 0 : _b.reduce((sum, inv) => sum + inv.totalAmount, 0)) || 0) })] }) }), _jsx(Card, { className: "glass border-0 shadow-enterprise", children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground uppercase", children: "Paid" }), _jsx("p", { className: "text-xl font-bold text-emerald-600 mt-1", children: currencyFmt(((_c = selectedCompany.invoices) === null || _c === void 0 ? void 0 : _c.reduce((sum, inv) => sum + inv.paidAmount, 0)) || 0) })] }) }), _jsx(Card, { className: "glass border-0 shadow-enterprise", children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsx("p", { className: "text-[11px] font-semibold text-muted-foreground uppercase", children: "Outstanding" }), _jsx("p", { className: "text-xl font-bold text-red-500 mt-1", children: currencyFmt(getOutstandingBalance(selectedCompany)) })] }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Invoices" }), selectedCompany.invoices && selectedCompany.invoices.length > 0 ? (_jsx("div", { className: "space-y-2", children: selectedCompany.invoices.map((inv) => (_jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10 shrink-0", children: _jsx(FileText, { className: "h-4 w-4 text-amber-dark" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: inv.invoiceNumber }), _jsx("p", { className: "text-[11px] text-muted-foreground", children: format(new Date(inv.createdAt), 'MMM d, yyyy') })] }), _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', invoiceStatusColor[inv.status] || ''), children: inv.status }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm font-medium", children: currencyFmt(inv.totalAmount) }), _jsxs("p", { className: "text-[11px] text-emerald-600", children: ["Paid: ", currencyFmt(inv.paidAmount)] })] })] }, inv.id))) })) : (_jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "No invoices" }))] }), selectedCompany.creditLimit > 0 && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("span", { className: "text-xs font-medium", children: "Credit Utilization" }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [currencyFmt(getOutstandingBalance(selectedCompany)), " / ", currencyFmt(selectedCompany.creditLimit)] })] }), _jsx(Progress, { value: Math.min((getOutstandingBalance(selectedCompany) / selectedCompany.creditLimit) * 100, 100), className: "h-2" })] }))] }) })] })] })) : null] }) }), _jsx(Dialog, { open: newCompanyOpen, onOpenChange: setNewCompanyOpen, children: _jsxs(DialogContent, { className: "max-w-lg max-h-[80vh] overflow-hidden p-0", children: [_jsxs(DialogHeader, { className: "px-6 pt-6 pb-4 border-b", children: [_jsx(DialogTitle, { children: "Create New Company" }), _jsx(DialogDescription, { children: "Enter company details to register a new business partner" })] }), _jsx(ScrollArea, { className: "h-[60vh] px-6 pb-6", children: _jsxs("div", { className: "space-y-4 pt-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Company Name *" }), _jsx(Input, { value: newForm.name, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { name: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "Acme Imports Pvt Ltd" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Contact Person" }), _jsx(Input, { value: newForm.contactPerson, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { contactPerson: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "John Doe" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Mobile" }), _jsx(Input, { value: newForm.mobile, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { mobile: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "+91 98765 43210" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Email" }), _jsx(Input, { type: "email", value: newForm.email, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { email: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "contact@acme.com" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Credit Limit" }), _jsx(Input, { type: "number", value: newForm.creditLimit, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { creditLimit: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "500000" })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Office Address" }), _jsx(Input, { value: newForm.officeAddress, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { officeAddress: e.target.value })), className: "h-8 text-sm mt-1" })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "GST Number" }), _jsx(Input, { value: newForm.gstNumber, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { gstNumber: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "27AABCU9603R1ZM" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "IEC Code" }), _jsx(Input, { value: newForm.iecCode, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { iecCode: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "0905012345" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "PAN Number" }), _jsx(Input, { value: newForm.panNumber, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { panNumber: e.target.value })), className: "h-8 text-sm mt-1", placeholder: "AABCU9603R" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Bank Name" }), _jsx(Input, { value: newForm.bankName, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { bankName: e.target.value })), className: "h-8 text-sm mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Account Number" }), _jsx(Input, { value: newForm.bankAccount, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { bankAccount: e.target.value })), className: "h-8 text-sm mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "IFSC Code" }), _jsx(Input, { value: newForm.bankIfsc, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { bankIfsc: e.target.value })), className: "h-8 text-sm mt-1" })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Billing Address" }), _jsx(Input, { value: newForm.billingAddress, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { billingAddress: e.target.value })), className: "h-8 text-sm mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Shipping Address" }), _jsx(Input, { value: newForm.shippingAddress, onChange: (e) => setNewForm(Object.assign(Object.assign({}, newForm), { shippingAddress: e.target.value })), className: "h-8 text-sm mt-1" })] })] }) }), _jsxs(DialogFooter, { className: "px-6 py-4 border-t", children: [_jsx(Button, { variant: "outline", onClick: () => setNewCompanyOpen(false), className: "h-8 text-xs", children: "Cancel" }), _jsx(Button, { onClick: createCompany, className: "h-8 text-xs", disabled: !newForm.name, children: "Create Company" })] })] }) })] }));
}
