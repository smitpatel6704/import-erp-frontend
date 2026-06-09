'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Plus,
  Eye,
  Globe,
  Layers,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useERPStore } from '@/lib/store';

// ─── Types ──────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  category: string | null;
  hsCode: string | null;
  sku: string | null;
  brandName: string | null;
  unitType: string;
  countryOfOrigin: string | null;
  companyId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string } | null;
  _count: { shipmentItems: number };
}

interface ProductsResponse {
  data: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

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

const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

// ─── Component ──────────────────────────────────────────────────────────

export function ProductsModule() {
  const { productFilter, setProductFilter, resetProductFilter } = useERPStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
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
      if (search) params.set('search', search);
      if (productFilter.category && productFilter.category !== 'all')
        params.set('category', productFilter.category);
      if (productFilter.origin) params.set('countryOfOrigin', productFilter.origin);
      if (productFilter.status === 'active') params.set('isActive', 'true');
      if (productFilter.status === 'inactive') params.set('isActive', 'false');

      const res = await fetch(`/api/products?${params.toString()}`);
      const json: ProductsResponse = await res.json();
      setProducts(json.data || []);
      setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, productFilter]);

  // Fetch companies for select dropdown
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
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Stats calculations
  const totalProducts = pagination.total || products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const uniqueCategories = [...new Set(products.filter((p) => p.category).map((p) => p.category))];
  const countryCounts: Record<string, number> = {};
  products.forEach((p) => {
    if (p.countryOfOrigin) {
      countryCounts[p.countryOfOrigin] = (countryCounts[p.countryOfOrigin] || 0) + 1;
    }
  });
  const topCountry =
    Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Create new product
  const handleCreateProduct = async () => {
    if (!newProduct.name.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/api/products`, {
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
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Unique categories & origins from data
  const dataCategories = [...new Set(products.filter((p) => p.category).map((p) => p.category as string))];
  const dataOrigins = [...new Set(products.filter((p) => p.countryOfOrigin).map((p) => p.countryOfOrigin as string))];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
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
        ].map((stat, i) => (
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

      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, SKU, or HS code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={productFilter.category || 'all'}
                onValueChange={(v) => setProductFilter({ category: v })}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(dataCategories.length > 0 ? dataCategories : CATEGORIES).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={productFilter.origin || 'all'}
                onValueChange={(v) => setProductFilter({ origin: v === 'all' ? '' : v })}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Origin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Origins</SelectItem>
                  {(dataOrigins.length > 0 ? dataOrigins : COUNTRIES).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={productFilter.status || 'all'}
                onValueChange={(v) => setProductFilter({ status: v })}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  resetProductFilter();
                  setSearch('');
                }}
                title="Reset filters"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button onClick={() => setNewProductOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Products</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {pagination.total} products found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No products found</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead className="hidden lg:table-cell">HS Code</TableHead>
                      <TableHead className="hidden md:table-cell">SKU</TableHead>
                      <TableHead className="hidden xl:table-cell">Brand</TableHead>
                      <TableHead className="hidden lg:table-cell">Unit</TableHead>
                      <TableHead className="hidden md:table-cell">Origin</TableHead>
                      <TableHead className="hidden xl:table-cell">Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, i) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        className="hover:bg-accent/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/30">
                              <Package className="h-4 w-4 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{product.name}</p>
                              {product.sku && (
                                <p className="text-xs text-muted-foreground">{product.sku}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.category ? (
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs font-mono">{product.hsCode || '—'}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs font-mono">{product.sku || '—'}</span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <span className="text-xs">{product.brandName || '—'}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary" className="text-[10px]">
                            {product.unitType}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{product.countryOfOrigin || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <span className="text-xs">{product.company?.name || '—'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-semibold',
                              product.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-700'
                            )}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedProduct(product);
                                setDetailOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-teal-600" />
              Product Details
            </DialogTitle>
            <DialogDescription>Complete product information</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm font-medium">{selectedProduct.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <p className="text-sm">{selectedProduct.category || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">HS Code</Label>
                  <p className="text-sm font-mono">{selectedProduct.hsCode || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">SKU</Label>
                  <p className="text-sm font-mono">{selectedProduct.sku || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Brand</Label>
                  <p className="text-sm">{selectedProduct.brandName || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Unit Type</Label>
                  <p className="text-sm">{selectedProduct.unitType}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Country of Origin</Label>
                  <p className="text-sm">{selectedProduct.countryOfOrigin || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <p className="text-sm">{selectedProduct.company?.name || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-semibold',
                      selectedProduct.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-700'
                    )}
                  >
                    {selectedProduct.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Shipment Items</Label>
                  <p className="text-sm">{selectedProduct._count.shipmentItems}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span>Created: </span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedProduct.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span>Updated: </span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedProduct.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Product Dialog */}
      <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-teal-600" />
              New Product
            </DialogTitle>
            <DialogDescription>Add a new product to the catalog</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit Type</Label>
                <Select
                  value={newProduct.unitType}
                  onValueChange={(v) => setNewProduct({ ...newProduct, unitType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_TYPES.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-hscode">HS Code</Label>
                <Input
                  id="product-hscode"
                  placeholder="e.g. 8471.30.01"
                  value={newProduct.hsCode}
                  onChange={(e) => setNewProduct({ ...newProduct, hsCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  placeholder="e.g. SKU-001"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-brand">Brand Name</Label>
                <Input
                  id="product-brand"
                  placeholder="Enter brand name"
                  value={newProduct.brandName}
                  onChange={(e) => setNewProduct({ ...newProduct, brandName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Country of Origin</Label>
                <Select
                  value={newProduct.countryOfOrigin}
                  onValueChange={(v) => setNewProduct({ ...newProduct, countryOfOrigin: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Select
                value={newProduct.companyId}
                onValueChange={(v) => setNewProduct({ ...newProduct, companyId: v })}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProduct} disabled={!newProduct.name.trim() || submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
