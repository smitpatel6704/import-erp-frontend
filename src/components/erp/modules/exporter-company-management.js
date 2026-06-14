'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ExporterCompanyManagement() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const emptyForm = { name: '', address: '', contactPerson: '', mobile: '', email: '', country: '' };
    const [form, setForm] = useState(emptyForm);
    const fetchCompanies = useCallback(async () => {
        try {
            const res = await fetch('/api/exporter-companies');
            const json = await res.json();
            if (json.data)
                setCompanies(json.data);
        }
        catch (error) {
            console.error(error);
        }
    }, []);
    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);
    const handleAdd = async () => {
        if (!form.name.trim())
            return;
        setLoading(true);
        try {
            await fetch('/api/exporter-companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            setForm(emptyForm);
            setOpen(false);
            fetchCompanies();
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        try {
            await fetch(`/api/exporter-companies/${id}`, { method: 'DELETE' });
            fetchCompanies();
        }
        catch (error) {
            console.error(error);
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, children: [_jsxs(Card, { className: "glass border-0 shadow-enterprise", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [_jsx(Building2, { className: "h-4 w-4 text-teal" }), "Exporter Companies"] }), _jsx(CardDescription, { className: "text-xs", children: "Manage exporter companies and export partners" })] }), _jsxs(Button, { onClick: () => setOpen(true), size: "sm", className: "h-9 text-xs", children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), " Add Exporter"] })] }), _jsx(CardContent, { children: _jsx("div", { className: "rounded-md border border-border/50 overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { className: "bg-muted/30", children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-[10px] h-8 font-semibold", children: "Company Name" }), _jsx(TableHead, { className: "text-[10px] h-8 font-semibold", children: "Address" }), _jsx(TableHead, { className: "text-[10px] h-8 font-semibold", children: "Contact" }), _jsx(TableHead, { className: "text-[10px] h-8 font-semibold", children: "Country" }), _jsx(TableHead, { className: "text-[10px] h-8 font-semibold text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: companies.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: "text-center py-10 text-xs text-muted-foreground", children: "No exporter companies found." }) })) : (companies.map((company) => (_jsxs(TableRow, { className: "group", children: [_jsxs(TableCell, { className: "py-3", children: [_jsx("p", { className: "text-sm font-medium", children: company.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: company.email || 'No email' })] }), _jsx(TableCell, { className: "py-3 text-xs text-muted-foreground max-w-64", children: company.address || 'No address' }), _jsxs(TableCell, { className: "py-3", children: [_jsx("p", { className: "text-xs", children: company.contactPerson || 'No contact person' }), _jsx("p", { className: "text-xs text-muted-foreground", children: company.mobile || 'No contact number' })] }), _jsx(TableCell, { className: "py-3 text-xs", children: company.country || '—' }), _jsx(TableCell, { className: "py-3 text-right", children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity", onClick: () => handleDelete(company.id), children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })] }, company.id)))) })] }) }) })] }), _jsx(Dialog, { open: open, onOpenChange: setOpen, children: _jsxs(DialogContent, { className: "max-w-lg", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "text-sm", children: "Add Exporter Company" }) }), _jsxs("div", { className: "space-y-3 py-2", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Company Name *" }), _jsx(Input, { value: form.name, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { name: e.target.value })), className: "h-8 text-xs", placeholder: "ABC Exports Ltd" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Address" }), _jsx(Input, { value: form.address, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { address: e.target.value })), className: "h-8 text-xs", placeholder: "Company address" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Contact Person" }), _jsx(Input, { value: form.contactPerson, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { contactPerson: e.target.value })), className: "h-8 text-xs", placeholder: "Contact person name" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Contact No." }), _jsx(Input, { type: "tel", value: form.mobile, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { mobile: e.target.value })), className: "h-8 text-xs", placeholder: "+91 98765 43210" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Email ID" }), _jsx(Input, { type: "email", value: form.email, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { email: e.target.value })), className: "h-8 text-xs", placeholder: "contact@abc.com" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Country" }), _jsx(Input, { value: form.country, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { country: e.target.value })), className: "h-8 text-xs", placeholder: "India" })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setOpen(false), className: "h-8 text-xs", children: "Cancel" }), _jsx(Button, { onClick: handleAdd, size: "sm", className: "h-8 text-xs", disabled: loading || !form.name.trim(), children: loading ? 'Adding...' : 'Add Company' })] })] }) })] }));
}
