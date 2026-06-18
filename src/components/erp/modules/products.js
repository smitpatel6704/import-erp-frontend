'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Plus, Eye, Globe, Layers, X, CheckCircle2, Loader2, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useERPStore } from '@/lib/store';
// ─── Constants ──────────────────────────────────────────────────────────
const CATEGORIES = [
    'Electronics',
    'Textiles',
    'Machinery',
    'Chemicals',
    'Food & Beverage',
    'Automotive',
    'Building Materials',
    'Consumer Goods',
    'Medical Equipment',
    'Agricultural Products',
];
const UNIT_TYPES = ['PCS', 'KG', 'TON', 'M', 'SQM', 'CBM', 'LTR', 'SET', 'BOX', 'ROLL'];
const COUNTRIES = [
    'China',
    'India',
    'Japan',
    'South Korea',
    'Germany',
    'USA',
    'Brazil',
    'Vietnam',
    'Thailand',
    'Indonesia',
];
const formatCurrency = (value, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
// ─── Component ──────────────────────────────────────────────────────────
export function ProductsModule() {
    var _a, _b;
    const { productFilter, setProductFilter, resetProductFilter } = useERPStore();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [newProductOpen, setNewProductOpen] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        hsCode: '',
        sku: '',
        brandName: '',
        unitType: 'PCS',
        countryOfOrigin: '',
        companyId: '',
    });
    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', '1');
            params.set('limit', '50');
            if (search)
                params.set('search', search);
            if (productFilter.category && productFilter.category !== 'all')
                params.set('category', productFilter.category);
            if (productFilter.origin)
                params.set('countryOfOrigin', productFilter.origin);
            if (productFilter.status === 'active')
                params.set('isActive', 'true');
            if (productFilter.status === 'inactive')
                params.set('isActive', 'false');
            const res = await fetch(`/api/products?${params.toString()}`);
            const json = await res.json();
            setProducts(json.data || []);
            setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
        }
        catch (err) {
            console.error('Failed to fetch products:', err);
        }
        finally {
            setLoading(false);
        }
    }, [search, productFilter]);
    // Fetch companies for select dropdown
    const fetchCompanies = useCallback(async () => {
        try {
            const res = await fetch('/api/companies?limit=50');
            const json = await res.json();
            setCompanies((json.data || []).map((c) => ({ id: c.id, name: c.name })));
        }
        catch (_a) {
            // silent
        }
    }, []);
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);
    // Stats calculations
    const totalProducts = pagination.total || products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const uniqueCategories = [...new Set(products.filter((p) => p.category).map((p) => p.category))];
    const countryCounts = {};
    products.forEach((p) => {
        if (p.countryOfOrigin) {
            countryCounts[p.countryOfOrigin] = (countryCounts[p.countryOfOrigin] || 0) + 1;
        }
    });
    const topCountry = ((_a = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]) === null || _a === void 0 ? void 0 : _a[0]) || 'N/A';
    // Create new product
    const handleCreateProduct = async () => {
        if (!newProduct.name.trim())
            return;
        setSubmitting(true);
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct),
            });
            setNewProductOpen(false);
            setNewProduct({
                name: '',
                category: '',
                hsCode: '',
                sku: '',
                brandName: '',
                unitType: 'PCS',
                countryOfOrigin: '',
                companyId: '',
            });
            fetchProducts();
        }
        catch (err) {
            console.error('Failed to create product:', err);
        }
        finally {
            setSubmitting(false);
        }
    };
    // Unique categories & origins from data
    const dataCategories = [...new Set(products.filter((p) => p.category).map((p) => p.category))];
    const dataOrigins = [...new Set(products.filter((p) => p.countryOfOrigin).map((p) => p.countryOfOrigin))];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
                    {
                        title: 'Total Products',
                        value: totalProducts,
                        icon: Package,
                        color: 'text-teal-600',
                        bgColor: 'bg-teal-50 dark:bg-teal-950/30',
                    },
                    {
                        title: 'Active Products',
                        value: activeProducts,
                        icon: CheckCircle2,
                        color: 'text-emerald-600',
                        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
                    },
                    {
                        title: 'Categories',
                        value: uniqueCategories.length,
                        icon: Layers,
                        color: 'text-amber-600',
                        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
                    },
                    {
                        title: 'Top Origin',
                        value: topCountry,
                        icon: Globe,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
                    },
                ].map((stat, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1, duration: 0.3 }, children: _jsx(Card, { children: _jsx(CardContent, { className: "p-5", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: stat.title }), _jsx("p", { className: "text-2xl font-bold tracking-tight", children: stat.value })] }), _jsx("div", { className: cn('rounded-lg p-2.5', stat.bgColor), children: _jsx(stat.icon, { className: cn('h-5 w-5', stat.color) }) })] }) }) }) }, stat.title))) }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, children: _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by name, SKU, or HS code...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })] }), _jsxs(Select, { value: productFilter.category || 'all', onValueChange: (v) => setProductFilter({ category: v }), children: [_jsxs(SelectTrigger, { className: "w-full sm:w-[180px]", children: [_jsx(Layers, { className: "h-4 w-4 mr-2 text-muted-foreground" }), _jsx(SelectValue, { placeholder: "Category" })] }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), (dataCategories.length > 0 ? dataCategories : CATEGORIES).map((cat) => (_jsx(SelectItem, { value: cat, children: cat }, cat)))] })] }), _jsxs(Select, { value: productFilter.origin || 'all', onValueChange: (v) => setProductFilter({ origin: v === 'all' ? '' : v }), children: [_jsxs(SelectTrigger, { className: "w-full sm:w-[180px]", children: [_jsx(Globe, { className: "h-4 w-4 mr-2 text-muted-foreground" }), _jsx(SelectValue, { placeholder: "Origin" })] }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Origins" }), (dataOrigins.length > 0 ? dataOrigins : COUNTRIES).map((c) => (_jsx(SelectItem, { value: c, children: c }, c)))] })] }), _jsxs(Select, { value: productFilter.status || 'all', onValueChange: (v) => setProductFilter({ status: v }), children: [_jsx(SelectTrigger, { className: "w-full sm:w-[140px]", children: _jsx(SelectValue, { placeholder: "Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "inactive", children: "Inactive" })] })] }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => {
                                        resetProductFilter();
                                        setSearch('');
                                    }, title: "Reset filters", children: _jsx(X, { className: "h-4 w-4" }) }), _jsxs(Button, { onClick: () => setNewProductOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Product"] })] }) }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, children: _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Products" }), _jsxs(CardDescription, { className: "text-xs mt-1", children: [pagination.total, " products found"] })] }) }) }), _jsx(CardContent, { className: "p-0", children: loading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-teal-600" }) })) : products.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [_jsx(Package, { className: "h-12 w-12 mb-3 opacity-30" }), _jsx("p", { className: "text-sm", children: "No products found" })] })) : (_jsx(ScrollArea, { className: "max-h-[600px]", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { className: "hidden md:table-cell", children: "Category" }), _jsx(TableHead, { className: "hidden lg:table-cell", children: "HS Code" }), _jsx(TableHead, { className: "hidden md:table-cell", children: "SKU" }), _jsx(TableHead, { className: "hidden xl:table-cell", children: "Brand" }), _jsx(TableHead, { className: "hidden lg:table-cell", children: "Unit" }), _jsx(TableHead, { className: "hidden md:table-cell", children: "Origin" }), _jsx(TableHead, { className: "hidden xl:table-cell", children: "Company" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: products.map((product, i) => {
                                                var _a;
                                                return (_jsxs(motion.tr, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.03, duration: 0.2 }, className: "hover:bg-accent/30 transition-colors", children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/30", children: _jsx(Package, { className: "h-4 w-4 text-teal-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: product.name }), product.sku && (_jsx("p", { className: "text-xs text-muted-foreground", children: product.sku }))] })] }) }), _jsx(TableCell, { className: "hidden md:table-cell", children: product.category ? (_jsx(Badge, { variant: "outline", className: "text-xs", children: product.category })) : (_jsx("span", { className: "text-xs text-muted-foreground", children: "\u2014" })) }), _jsx(TableCell, { className: "hidden lg:table-cell", children: _jsx("span", { className: "text-xs font-mono", children: product.hsCode || '—' }) }), _jsx(TableCell, { className: "hidden md:table-cell", children: _jsx("span", { className: "text-xs font-mono", children: product.sku || '—' }) }), _jsx(TableCell, { className: "hidden xl:table-cell", children: _jsx("span", { className: "text-xs", children: product.brandName || '—' }) }), _jsx(TableCell, { className: "hidden lg:table-cell", children: _jsx(Badge, { variant: "secondary", className: "text-[10px]", children: product.unitType }) }), _jsx(TableCell, { className: "hidden md:table-cell", children: _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Globe, { className: "h-3 w-3 text-muted-foreground" }), _jsx("span", { className: "text-xs", children: product.countryOfOrigin || '—' })] }) }), _jsx(TableCell, { className: "hidden xl:table-cell", children: _jsx("span", { className: "text-xs", children: ((_a = product.company) === null || _a === void 0 ? void 0 : _a.name) || '—' }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', product.isActive
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                                                                    : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-700'), children: product.isActive ? 'Active' : 'Inactive' }) }), _jsx(TableCell, { className: "text-right", children: _jsx("div", { className: "flex items-center justify-end gap-1", children: _jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => {
                                                                        setSelectedProduct(product);
                                                                        setDetailOpen(true);
                                                                    }, children: _jsx(Eye, { className: "h-4 w-4" }) }) }) })] }, product.id));
                                            }) })] }) })) })] }) }), _jsx(Dialog, { open: detailOpen, onOpenChange: setDetailOpen, children: _jsxs(DialogContent, { className: "max-w-lg", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Package, { className: "h-5 w-5 text-teal-600" }), "Product Details"] }), _jsx(DialogDescription, { children: "Complete product information" })] }), selectedProduct && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Name" }), _jsx("p", { className: "text-sm font-medium", children: selectedProduct.name })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Category" }), _jsx("p", { className: "text-sm", children: selectedProduct.category || '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "HS Code" }), _jsx("p", { className: "text-sm font-mono", children: selectedProduct.hsCode || '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "SKU" }), _jsx("p", { className: "text-sm font-mono", children: selectedProduct.sku || '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Brand" }), _jsx("p", { className: "text-sm", children: selectedProduct.brandName || '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Unit Type" }), _jsx("p", { className: "text-sm", children: selectedProduct.unitType })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Country of Origin" }), _jsx("p", { className: "text-sm", children: selectedProduct.countryOfOrigin || '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Company" }), _jsx("p", { className: "text-sm", children: ((_b = selectedProduct.company) === null || _b === void 0 ? void 0 : _b.name) || '—' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Status" }), _jsx(Badge, { variant: "outline", className: cn('text-xs font-semibold', selectedProduct.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-700'), children: selectedProduct.isActive ? 'Active' : 'Inactive' })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: "Shipment Items" }), _jsx("p", { className: "text-sm", children: selectedProduct._count.shipmentItems })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-xs text-muted-foreground", children: [_jsxs("div", { children: [_jsx("span", { children: "Created: " }), _jsx("span", { className: "font-medium text-foreground", children: new Date(selectedProduct.createdAt).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("span", { children: "Updated: " }), _jsx("span", { className: "font-medium text-foreground", children: new Date(selectedProduct.updatedAt).toLocaleDateString() })] })] })] }))] }) }), _jsx(Dialog, { open: newProductOpen, onOpenChange: setNewProductOpen, children: _jsxs(DialogContent, { className: "max-w-lg", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-5 w-5 text-teal-600" }), "New Product"] }), _jsx(DialogDescription, { children: "Add a new product to the catalog" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "product-name", children: "Product Name *" }), _jsx(Input, { id: "product-name", placeholder: "Enter product name", value: newProduct.name, onChange: (e) => setNewProduct(Object.assign(Object.assign({}, newProduct), { name: e.target.value })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Category" }), _jsxs(Select, { value: newProduct.category, onValueChange: (v) => setNewProduct(Object.assign(Object.assign({}, newProduct), { category: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsx(SelectContent, { children: CATEGORIES.map((cat) => (_jsx(SelectItem, { value: cat, children: cat }, cat))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Unit Type" }), _jsxs(Select, { value: newProduct.unitType, onValueChange: (v) => setNewProduct(Object.assign(Object.assign({}, newProduct), { unitType: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: UNIT_TYPES.map((u) => (_jsx(SelectItem, { value: u, children: u }, u))) })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "product-hscode", children: "HS Code" }), _jsx(Input, { id: "product-hscode", placeholder: "e.g. 8471.30.01", value: newProduct.hsCode, onChange: (e) => setNewProduct(Object.assign(Object.assign({}, newProduct), { hsCode: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "product-sku", children: "SKU" }), _jsx(Input, { id: "product-sku", placeholder: "e.g. SKU-001", value: newProduct.sku, onChange: (e) => setNewProduct(Object.assign(Object.assign({}, newProduct), { sku: e.target.value })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "product-brand", children: "Brand Name" }), _jsx(Input, { id: "product-brand", placeholder: "Enter brand name", value: newProduct.brandName, onChange: (e) => setNewProduct(Object.assign(Object.assign({}, newProduct), { brandName: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Country of Origin" }), _jsxs(Select, { value: newProduct.countryOfOrigin, onValueChange: (v) => setNewProduct(Object.assign(Object.assign({}, newProduct), { countryOfOrigin: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select country" }) }), _jsx(SelectContent, { children: COUNTRIES.map((c) => (_jsx(SelectItem, { value: c, children: c }, c))) })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Company" }), _jsxs(Select, { value: newProduct.companyId, onValueChange: (v) => setNewProduct(Object.assign(Object.assign({}, newProduct), { companyId: v })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsx(SelectContent, { children: companies.map((c) => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id))) })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setNewProductOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleCreateProduct, disabled: !newProduct.name.trim() || submitting, children: [submitting ? (_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(Plus, { className: "h-4 w-4 mr-2" })), "Create Product"] })] })] }) })] }));
}
