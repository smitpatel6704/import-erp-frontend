'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Search,
  Plus,
  Eye,
  Ship,
  Warehouse,
  Truck,
  Shield,
  Anchor,
  Package,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
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
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

// ─── Types ──────────────────────────────────────────────────────────────

interface Expense {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountBase: number;
  vendorName: string | null;
  paymentStatus: string;
  paymentDate: string | null;
  dueDate: string | null;
  shipmentId: string | null;
  containerId: string | null;
  invoiceNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shipment: {
    id: string;
    shipmentNumber: string;
    company: { id: string; name: string } | null;
  } | null;
  container: { id: string; containerNumber: string } | null;
}

interface ExpensesResponse {
  data: Expense[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ─── Constants ──────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
  'freight',
  'customs_duty',
  'port_charges',
  'warehouse',
  'transport',
  'clearance',
  'insurance',
  'miscellaneous',
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  freight: 'Freight Charges',
  customs_duty: 'Customs Duty',
  port_charges: 'Port Charges',
  warehouse: 'Warehouse',
  transport: 'Transport',
  clearance: 'Clearance',
  insurance: 'Insurance',
  miscellaneous: 'Miscellaneous',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  freight: Ship,
  customs_duty: Shield,
  port_charges: Anchor,
  warehouse: Warehouse,
  transport: Truck,
  clearance: Shield,
  insurance: Package,
  miscellaneous: DollarSign,
};

const PIE_COLORS = [
  '#0d9488', // teal
  '#d97706', // amber
  '#059669', // emerald
  '#ea580c', // orange
  '#6366f1', // indigo
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#64748b', // slate
];

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  },
  paid: {
    label: 'Paid',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  partial: {
    label: 'Partial',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800',
  },
  overdue: {
    label: 'Overdue',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  },
};

const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

// ─── Component ──────────────────────────────────────────────────────────

export function FinanceModule() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newExpenseOpen, setNewExpenseOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'freight',
    description: '',
    amount: '',
    currency: 'USD',
    vendorName: '',
    paymentStatus: 'pending',
    dueDate: '',
  });

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', '100');
      if (search) params.set('search', search);
      if (filterCategory && filterCategory !== 'all') params.set('category', filterCategory);
      if (filterPaymentStatus && filterPaymentStatus !== 'all')
        params.set('paymentStatus', filterPaymentStatus);

      const res = await fetch(`/api/expenses?${params.toString()}`);
      const json: ExpensesResponse = await res.json();
      setExpenses(json.data || []);
      setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterPaymentStatus]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // KPI calculations
  const kpis = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amountBase, 0);
    const freight = expenses
      .filter((e) => e.category === 'freight')
      .reduce((sum, e) => sum + e.amountBase, 0);
    const customs = expenses
      .filter((e) => e.category === 'customs_duty')
      .reduce((sum, e) => sum + e.amountBase, 0);
    const port = expenses
      .filter((e) => e.category === 'port_charges')
      .reduce((sum, e) => sum + e.amountBase, 0);
    const warehouse = expenses
      .filter((e) => e.category === 'warehouse')
      .reduce((sum, e) => sum + e.amountBase, 0);
    const transport = expenses
      .filter((e) => e.category === 'transport')
      .reduce((sum, e) => sum + e.amountBase, 0);
    return { total, freight, customs, port, warehouse, transport };
  }, [expenses]);

  // Payment status counts
  const paymentStatusCounts = useMemo(() => {
    const counts: Record<string, { count: number; amount: number }> = {
      pending: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      partial: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
    };
    expenses.forEach((e) => {
      if (counts[e.paymentStatus]) {
        counts[e.paymentStatus].count++;
        counts[e.paymentStatus].amount += e.amountBase;
      }
    });
    return counts;
  }, [expenses]);

  // Pie chart data
  const pieData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amountBase;
    });
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name: CATEGORY_LABELS[name] || name,
        value: Math.round(value),
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const monthMap: Record<string, number> = {};
    expenses.forEach((e) => {
      const month = format(new Date(e.createdAt), 'MMM yyyy');
      monthMap[month] = (monthMap[month] || 0) + e.amountBase;
    });
    return Object.entries(monthMap)
      .map(([month, amount]) => ({ month, amount: Math.round(amount) }))
      .slice(-6);
  }, [expenses]);

  // Create new expense
  const handleCreateExpense = async () => {
    if (!newExpense.amount || !newExpense.category) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          exchangeRate: 1,
        }),
      });
      setNewExpenseOpen(false);
      setNewExpense({
        category: 'freight',
        description: '',
        amount: '',
        currency: 'USD',
        vendorName: '',
        paymentStatus: 'pending',
        dueDate: '',
      });
      fetchExpenses();
    } catch (err) {
      console.error('Failed to create expense:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(kpis.total),
      icon: DollarSign,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Freight Charges',
      value: formatCurrency(kpis.freight),
      icon: Ship,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      trend: '+8.3%',
      trendUp: true,
    },
    {
      title: 'Customs Duty',
      value: formatCurrency(kpis.customs),
      icon: Shield,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      trend: '-2.1%',
      trendUp: false,
    },
    {
      title: 'Port Charges',
      value: formatCurrency(kpis.port),
      icon: Anchor,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      trend: '+5.7%',
      trendUp: true,
    },
    {
      title: 'Warehouse Charges',
      value: formatCurrency(kpis.warehouse),
      icon: Warehouse,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 dark:bg-violet-950/30',
      trend: '-1.4%',
      trendUp: false,
    },
    {
      title: 'Transport Charges',
      value: formatCurrency(kpis.transport),
      icon: Truck,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      trend: '+3.2%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
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
                <div className="flex items-center gap-1.5 mt-3">
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      stat.trendUp ? 'text-emerald-500' : 'text-red-500'
                    )}
                  >
                    {stat.trend}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Expense Breakdown</CardTitle>
              <CardDescription className="text-xs">By category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Expense Trend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Monthly Expense Trend</CardTitle>
              <CardDescription className="text-xs">Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Payment Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(paymentStatusCounts).map(([status, data]) => {
                const config = PAYMENT_STATUS_CONFIG[status];
                const Icon =
                  status === 'paid'
                    ? CheckCircle2
                    : status === 'overdue'
                    ? AlertTriangle
                    : status === 'partial'
                    ? CreditCard
                    : Clock;
                return (
                  <div
                    key={status}
                    className={cn(
                      'rounded-lg border p-4',
                      config.bgColor
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn('h-4 w-4', config.color)} />
                      <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
                    </div>
                    <p className="text-xl font-bold">{data.count}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(data.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setFilterCategory('all');
                  setFilterPaymentStatus('all');
                  setSearch('');
                }}
                title="Reset filters"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button onClick={() => setNewExpenseOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expense Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Expenses</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {pagination.total} expenses found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <DollarSign className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No expenses found</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Currency</TableHead>
                      <TableHead className="hidden lg:table-cell">Vendor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead className="hidden xl:table-cell">Shipment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense, i) => {
                      const CategoryIcon = CATEGORY_ICONS[expense.category] || DollarSign;
                      const statusConfig = PAYMENT_STATUS_CONFIG[expense.paymentStatus] || PAYMENT_STATUS_CONFIG.pending;
                      return (
                        <motion.tr
                          key={expense.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.2 }}
                          className="hover:bg-accent/30 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/30">
                                <CategoryIcon className="h-3.5 w-3.5 text-teal-600" />
                              </div>
                              <span className="text-xs font-medium">
                                {CATEGORY_LABELS[expense.category] || expense.category}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            <span className="text-xs">{expense.description || '—'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold">
                              {formatCurrency(expense.amount, expense.currency)}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="secondary" className="text-[10px]">
                              {expense.currency}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs">{expense.vendorName || '—'}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-[10px] font-semibold', statusConfig.bgColor, statusConfig.color)}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-xs">
                              {expense.dueDate
                                ? format(new Date(expense.dueDate), 'MMM dd, yyyy')
                                : '—'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <span className="text-xs">
                              {expense.shipment?.shipmentNumber || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedExpense(expense);
                                setDetailOpen(true);
                              }}
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

      {/* Expense Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-teal-600" />
              Expense Details
            </DialogTitle>
            <DialogDescription>Complete expense information</DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <p className="text-sm font-medium">
                    {CATEGORY_LABELS[selectedExpense.category] || selectedExpense.category}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="text-sm font-bold">
                    {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Base Amount (USD)</Label>
                  <p className="text-sm">{formatCurrency(selectedExpense.amountBase)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Exchange Rate</Label>
                  <p className="text-sm">{selectedExpense.exchangeRate}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Vendor</Label>
                  <p className="text-sm">{selectedExpense.vendorName || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Payment Status</Label>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-semibold',
                      PAYMENT_STATUS_CONFIG[selectedExpense.paymentStatus]?.bgColor,
                      PAYMENT_STATUS_CONFIG[selectedExpense.paymentStatus]?.color
                    )}
                  >
                    {PAYMENT_STATUS_CONFIG[selectedExpense.paymentStatus]?.label || selectedExpense.paymentStatus}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Due Date</Label>
                  <p className="text-sm">
                    {selectedExpense.dueDate
                      ? format(new Date(selectedExpense.dueDate), 'MMM dd, yyyy')
                      : '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Payment Date</Label>
                  <p className="text-sm">
                    {selectedExpense.paymentDate
                      ? format(new Date(selectedExpense.paymentDate), 'MMM dd, yyyy')
                      : '—'}
                  </p>
                </div>
              </div>
              {selectedExpense.description && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm">{selectedExpense.description}</p>
                  </div>
                </>
              )}
              {(selectedExpense.shipment || selectedExpense.container) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {selectedExpense.shipment && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Shipment</Label>
                        <p className="text-sm">{selectedExpense.shipment.shipmentNumber}</p>
                      </div>
                    )}
                    {selectedExpense.container && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Container</Label>
                        <p className="text-sm">{selectedExpense.container.containerNumber}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Expense Dialog */}
      <Dialog open={newExpenseOpen} onOpenChange={setNewExpenseOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-teal-600" />
              New Expense
            </DialogTitle>
            <DialogDescription>Record a new expense</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={newExpense.currency}
                  onValueChange={(v) => setNewExpense({ ...newExpense, currency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={newExpense.paymentStatus}
                  onValueChange={(v) => setNewExpense({ ...newExpense, paymentStatus: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input
                placeholder="Enter vendor name"
                value={newExpense.vendorName}
                onChange={(e) => setNewExpense({ ...newExpense, vendorName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter expense description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newExpense.dueDate}
                onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewExpenseOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateExpense}
              disabled={!newExpense.amount || !newExpense.category || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
