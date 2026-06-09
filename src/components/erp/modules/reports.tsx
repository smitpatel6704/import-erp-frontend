'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  DollarSign,
  Ship,
  Shield,
  FileSpreadsheet,
  FileText,
  Anchor,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#0d9488', '#f59e0b', '#10b981', '#f97316', '#6b7280', '#14b8a6', '#ef4444', '#8b5cf6'];

type ShipmentRecord = {
  id: string;
  shipmentNumber: string;
  status: string;
  shipmentValue?: number;
  originCountry?: string | null;
  originPort?: string | null;
  destinationPort?: string | null;
  eta?: string | null;
  actualArrival?: string | null;
  createdAt?: string | null;
};

type ContainerRecord = {
  id: string;
  status: string;
  createdAt?: string | null;
};

type ExpenseRecord = {
  id: string;
  category: string;
  amountBase?: number;
  vendorName?: string | null;
  paymentStatus?: string | null;
  dueDate?: string | null;
  createdAt?: string | null;
};

type CustomsRecord = {
  id: string;
  clearanceStatus: string;
  dutyStatus: string;
  dutyAmount: number;
  assessmentValue: number;
  clearanceDate?: string | null;
  createdAt?: string | null;
  shipment?: {
    shipmentNumber?: string;
    originCountry?: string | null;
    destinationPort?: string | null;
  } | null;
};

type ReportData = {
  shipments: ShipmentRecord[];
  containers: ContainerRecord[];
  expenses: ExpenseRecord[];
  customs: CustomsRecord[];
};

const emptyReportData: ReportData = {
  shipments: [],
  containers: [],
  expenses: [],
  customs: [],
};

const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });

function labelize(value?: string | null) {
  if (!value) return 'Unknown';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function recordDate(record: { createdAt?: string | null; eta?: string | null; actualArrival?: string | null }) {
  return new Date(record.actualArrival || record.eta || record.createdAt || Date.now());
}

function lastSixMonthKeys() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      month: monthFormatter.format(date),
    };
  });
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function isDelayed(shipment: ShipmentRecord) {
  const eta = shipment.eta ? new Date(shipment.eta) : null;
  const actual = shipment.actualArrival ? new Date(shipment.actualArrival) : null;
  if (eta && actual) return actual.getTime() > eta.getTime();
  return Boolean(eta && shipment.status !== 'delivered' && shipment.status !== 'closed' && eta.getTime() < Date.now());
}

function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? '';
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportPrintableReport(title: string, rows: Record<string, unknown>[]) {
  const win = window.open('', '_blank');
  if (!win) return;
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const tableRows = rows
    .map((row) => `<tr>${headers.map((header) => `<td>${row[header] ?? ''}</td>`).join('')}</tr>`)
    .join('');
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 16px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated ${new Date().toLocaleString()}</p>
        <table>
          <thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
}

async function fetchReportEndpoint<T>(endpoint: string): Promise<T[]> {
  const res = await fetch(`${API_BASE_URL}/api/${endpoint}?limit=1000&isActive=true`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  const json = await res.json();
  return json.data || [];
}

function useReportData() {
  const [data, setData] = useState<ReportData>(emptyReportData);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [shipments, containers, expenses, customs] = await Promise.all([
        fetchReportEndpoint<ShipmentRecord>('shipments'),
        fetchReportEndpoint<ContainerRecord>('containers'),
        fetchReportEndpoint<ExpenseRecord>('expenses'),
        fetchReportEndpoint<CustomsRecord>('customs'),
      ]);
      setData({ shipments, containers, expenses, customs });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 15000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return { data, loading };
}

export function ReportsModule() {
  const [activeTab, setActiveTab] = useState('operational');
  const { data, loading } = useReportData();

  return (
    <div className="space-y-6">
      {/* Report Categories Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9">
            <TabsTrigger value="operational" className="text-xs px-4">
              <Ship className="h-3.5 w-3.5 mr-1.5" /> Operational
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-xs px-4">
              <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Financial
            </TabsTrigger>
            <TabsTrigger value="customs" className="text-xs px-4">
              <Shield className="h-3.5 w-3.5 mr-1.5" /> Customs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs px-4">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operational" className="mt-4">
            <OperationalReports data={data} loading={loading} />
          </TabsContent>
          <TabsContent value="financial" className="mt-4">
            <FinancialReports data={data} loading={loading} />
          </TabsContent>
          <TabsContent value="customs" className="mt-4">
            <CustomsReports data={data} loading={loading} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <AnalyticsReports data={data} loading={loading} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function ReportLoading() {
  return (
    <div className="h-[250px] flex items-center justify-center">
      <div className="animate-spin h-6 w-6 border-2 border-teal border-t-transparent rounded-full" />
    </div>
  );
}

function EmptyReport({ label = 'No live data available' }: { label?: string }) {
  return <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">{label}</div>;
}

function ReportCard({
  title,
  description,
  children,
  onExportExcel,
  onExportPdf,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            {description && <CardDescription className="text-xs mt-0.5">{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-1">
            {onExportExcel && (
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={onExportExcel}>
                <FileSpreadsheet className="h-3 w-3" /> Excel
              </Button>
            )}
            {onExportPdf && (
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={onExportPdf}>
                <FileText className="h-3 w-3" /> PDF
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function buildOperationalReports(data: ReportData) {
  const months = lastSixMonthKeys();
  const shipmentSummaryData = months.map(({ key, month }) => {
    const shipments = data.shipments.filter((shipment) => monthKey(recordDate(shipment)) === key);
    return {
      month,
      shipped: shipments.length,
      delivered: shipments.filter((shipment) => shipment.status === 'delivered' || shipment.status === 'closed').length,
      delayed: shipments.filter(isDelayed).length,
    };
  });
  const delayAnalysisData = shipmentSummaryData.map((row) => {
    const onTime = row.shipped ? Math.round(((row.shipped - row.delayed) / row.shipped) * 100) : 0;
    return { month: row.month, onTime, delayed: row.shipped ? 100 - onTime : 0 };
  });
  const deliveryPerformanceData = shipmentSummaryData.map((row) => ({
    month: row.month,
    target: 95,
    actual: row.shipped ? Math.round((row.delivered / row.shipped) * 100) : 0,
  }));
  const containerStatusData = Object.entries(
    data.containers.reduce<Record<string, number>>((acc, container) => {
      const status = labelize(container.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  return { shipmentSummaryData, containerStatusData, delayAnalysisData, deliveryPerformanceData };
}

function OperationalReports({ data, loading }: { data: ReportData; loading: boolean }) {
  const { shipmentSummaryData, containerStatusData, delayAnalysisData, deliveryPerformanceData } = buildOperationalReports(data);
  const shipmentRows = shipmentSummaryData.map(({ month, shipped, delivered, delayed }) => ({ month, shipped, delivered, delayed }));
  const hasShipments = shipmentSummaryData.some((row) => row.shipped > 0);
  const hasContainers = containerStatusData.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipment Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ReportCard
            title="Shipment Summary"
            description="Monthly shipment overview"
            onExportExcel={() => exportCsv('shipment-summary', shipmentRows)}
            onExportPdf={() => exportPrintableReport('Shipment Summary', shipmentRows)}
          >
            {loading ? <ReportLoading /> : hasShipments ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={shipmentSummaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="shipped" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delivered" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delayed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyReport />}
          </ReportCard>
        </motion.div>

        {/* Container Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <ReportCard
            title="Container Status Report"
            description="Current container distribution"
            onExportExcel={() => exportCsv('container-status-report', containerStatusData)}
            onExportPdf={() => exportPrintableReport('Container Status Report', containerStatusData)}
          >
            {loading ? <ReportLoading /> : hasContainers ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={containerStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyReport />}
          </ReportCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delay Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ReportCard
            title="Delay Analysis"
            description="On-time vs delayed shipments"
            onExportExcel={() => exportCsv('delay-analysis', delayAnalysisData)}
            onExportPdf={() => exportPrintableReport('Delay Analysis', delayAnalysisData)}
          >
            {loading ? <ReportLoading /> : hasShipments ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={delayAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="onTime" fill="#10b981" name="On Time %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delayed" fill="#f97316" name="Delayed %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyReport />}
          </ReportCard>
        </motion.div>

        {/* Delivery Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <ReportCard
            title="Delivery Performance"
            description="Target vs actual delivery rate"
            onExportExcel={() => exportCsv('delivery-performance', deliveryPerformanceData)}
            onExportPdf={() => exportPrintableReport('Delivery Performance', deliveryPerformanceData)}
          >
            {loading ? <ReportLoading /> : hasShipments ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={deliveryPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="target" stroke="#6b7280" strokeDasharray="5 5" name="Target %" />
                  <Line type="monotone" dataKey="actual" stroke="#0d9488" strokeWidth={2} name="Actual %" />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyReport />}
          </ReportCard>
        </motion.div>
      </div>
    </div>
  );
}

function buildFinancialReports(data: ReportData) {
  const months = lastSixMonthKeys();
  const normalizeCategory = (category: string) => {
    if (category.includes('freight')) return 'freight';
    if (category.includes('custom')) return 'customs';
    if (category.includes('port')) return 'port';
    if (category.includes('transport') || category.includes('delivery')) return 'transport';
    return 'other';
  };
  const importCostData = months.map(({ key, month }) => {
    const row = { month, freight: 0, customs: 0, port: 0, transport: 0, other: 0 };
    data.expenses
      .filter((expense) => monthKey(new Date(expense.createdAt || Date.now())) === key)
      .forEach((expense) => {
        row[normalizeCategory(expense.category || '')] += numberValue(expense.amountBase);
      });
    return row;
  });
  const expenseBreakdownData = Object.entries(
    data.expenses.reduce<Record<string, number>>((acc, expense) => {
      const category = labelize(expense.category);
      acc[category] = (acc[category] || 0) + numberValue(expense.amountBase);
      return acc;
    }, {})
  ).map(([name, value], index) => ({ name, value, color: CHART_COLORS[index % CHART_COLORS.length] }));
  const outstandingPaymentsData = data.expenses
    .filter((expense) => expense.paymentStatus !== 'paid')
    .map((expense) => {
      const due = expense.dueDate ? new Date(expense.dueDate) : null;
      const days = due ? Math.ceil((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return {
        vendor: expense.vendorName || 'Unknown Vendor',
        amount: numberValue(expense.amountBase),
        due: due ? due.toISOString().slice(0, 10) : '-',
        aging: due ? (days > 0 ? `${days} days` : 'Current') : '-',
        status: due && days > 0 ? 'overdue' : expense.paymentStatus || 'pending',
      };
    })
    .sort((a, b) => b.amount - a.amount);
  const vendorPaymentData = Object.values(
    data.expenses.reduce<Record<string, { vendor: string; paid: number; pending: number }>>((acc, expense) => {
      const vendor = expense.vendorName || 'Unknown';
      acc[vendor] ||= { vendor, paid: 0, pending: 0 };
      if (expense.paymentStatus === 'paid') {
        acc[vendor].paid += numberValue(expense.amountBase);
      } else {
        acc[vendor].pending += numberValue(expense.amountBase);
      }
      return acc;
    }, {})
  )
    .sort((a, b) => b.paid + b.pending - (a.paid + a.pending))
    .slice(0, 8);

  return { importCostData, expenseBreakdownData, outstandingPaymentsData, vendorPaymentData };
}

function FinancialReports({ data, loading }: { data: ReportData; loading: boolean }) {
  const { importCostData, expenseBreakdownData, outstandingPaymentsData, vendorPaymentData } = buildFinancialReports(data);
  const hasExpenses = data.expenses.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Cost Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ReportCard
            title="Import Cost Summary"
            description="Monthly cost breakdown by category"
            onExportExcel={() => exportCsv('import-cost-summary', importCostData)}
            onExportPdf={() => exportPrintableReport('Import Cost Summary', importCostData)}
          >
            {loading ? <ReportLoading /> : hasExpenses ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={importCostData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="freight" stackId="a" fill="#0d9488" name="Freight" />
                  <Bar dataKey="customs" stackId="a" fill="#f59e0b" name="Customs" />
                  <Bar dataKey="port" stackId="a" fill="#10b981" name="Port" />
                  <Bar dataKey="transport" stackId="a" fill="#f97316" name="Transport" />
                  <Bar dataKey="other" stackId="a" fill="#6b7280" name="Other" />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyReport />}
          </ReportCard>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <ReportCard
            title="Expense Breakdown"
            description="Overall cost distribution"
            onExportExcel={() => exportCsv('expense-breakdown', expenseBreakdownData)}
            onExportPdf={() => exportPrintableReport('Expense Breakdown', expenseBreakdownData)}
          >
            {loading ? <ReportLoading /> : expenseBreakdownData.length ? (
              <>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={expenseBreakdownData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                        {expenseBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12 }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {expenseBreakdownData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] text-muted-foreground">{item.name}</span>
                      <span className="text-[11px] font-medium ml-auto">${(item.value / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyReport />}
          </ReportCard>
        </motion.div>
      </div>

      {/* Outstanding Payments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <ReportCard
          title="Outstanding Payments"
          description="Aging analysis of unpaid invoices"
          onExportExcel={() => exportCsv('outstanding-payments', outstandingPaymentsData)}
          onExportPdf={() => exportPrintableReport('Outstanding Payments', outstandingPaymentsData)}
        >
          {loading ? <ReportLoading /> : outstandingPaymentsData.length ? <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Vendor</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs">Aging</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outstandingPaymentsData.slice(0, 12).map((row, index) => (
                <TableRow key={`${row.vendor}-${index}`}>
                  <TableCell className="text-xs font-medium">{row.vendor}</TableCell>
                  <TableCell className="text-xs">${row.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.due}</TableCell>
                  <TableCell className="text-xs">{row.aging}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        row.status === 'overdue'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : row.status === 'pending'
                          ? 'bg-amber/10 text-amber border-amber/20'
                          : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      )}
                    >
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table> : <EmptyReport label="No outstanding payments" />}
        </ReportCard>
      </motion.div>

      {/* Vendor Payment Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <ReportCard
          title="Vendor Payment Summary"
          description="Total payments by vendor"
          onExportExcel={() => exportCsv('vendor-payment-summary', vendorPaymentData)}
          onExportPdf={() => exportPrintableReport('Vendor Payment Summary', vendorPaymentData)}
        >
          {loading ? <ReportLoading /> : vendorPaymentData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vendorPaymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="vendor" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyReport />}
        </ReportCard>
      </motion.div>
    </div>
  );
}

function CustomsReports({ data, loading }: { data: ReportData; loading: boolean }) {
  const customsData = data.customs;

  const clearanceByStatus = customsData.reduce<Record<string, number>>((acc, c) => {
    const status = labelize(c.clearanceStatus);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const dutyByStatus = customsData.reduce<Record<string, number>>((acc, c) => {
    const status = labelize(c.dutyStatus);
    acc[status] = (acc[status] || 0) + numberValue(c.dutyAmount);
    return acc;
  }, {});

  const pendingClearances = customsData.filter(
    (c) => c.clearanceStatus !== 'clearance_approved'
  );
  const clearanceRows = Object.entries(clearanceByStatus).map(([status, count]) => ({ status, count }));
  const dutyRows = Object.entries(dutyByStatus).map(([status, amount]) => ({ status, amount }));
  const pendingRows = pendingClearances.map((c) => ({
    shipment: c.shipment?.shipmentNumber || '-',
    assessmentValue: numberValue(c.assessmentValue),
    dutyAmount: numberValue(c.dutyAmount),
    clearanceStatus: labelize(c.clearanceStatus),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clearance Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ReportCard
            title="Clearance Timeline"
            description="Shipments by clearance stage"
            onExportExcel={() => exportCsv('clearance-timeline', clearanceRows)}
            onExportPdf={() => exportPrintableReport('Clearance Timeline', clearanceRows)}
          >
            {loading ? (
              <ReportLoading />
            ) : Object.keys(clearanceByStatus).length === 0 ? (
              <EmptyReport />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={Object.entries(clearanceByStatus).map(([status, count]) => ({
                    status,
                    count,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ReportCard>
        </motion.div>

        {/* Duty Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <ReportCard
            title="Duty Summary"
            description="Total duty amount by status"
            onExportExcel={() => exportCsv('duty-summary', dutyRows)}
            onExportPdf={() => exportPrintableReport('Duty Summary', dutyRows)}
          >
            {loading ? (
              <ReportLoading />
            ) : Object.keys(dutyByStatus).length === 0 ? (
              <EmptyReport />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={Object.entries(dutyByStatus).map(([status, amount]) => ({
                        name: status,
                        value: amount,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {Object.entries(dutyByStatus).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {Object.entries(dutyByStatus).map(([status, amount], index) => (
                    <div key={status} className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-[11px]">
                        {status}: ${amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ReportCard>
        </motion.div>
      </div>

      {/* Pending Clearances */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <ReportCard
          title="Pending Clearances"
          description={`${pendingClearances.length} shipments pending full clearance`}
          onExportExcel={() => exportCsv('pending-clearances', pendingRows)}
          onExportPdf={() => exportPrintableReport('Pending Clearances', pendingRows)}
        >
          {pendingClearances.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No pending clearances
            </div>
          ) : (
            <div className="space-y-2">
              {pendingClearances.slice(0, 10).map((c, i) => {
                const statusMap: Record<string, string> = {
                  document_submission: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                  duty_assessment: 'bg-amber/10 text-amber border-amber/20',
                  verification: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                  duty_payment: 'bg-teal/10 text-teal border-teal/20',
                };
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                        <Shield className="h-4 w-4 text-orange-500" />
                      </div>
                  <div>
                    <p className="text-xs font-medium">Assessment: ${c.assessmentValue.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Duty: ${c.dutyAmount.toLocaleString()}</p>
                    {c.shipment?.shipmentNumber && (
                      <p className="text-[10px] text-muted-foreground">Shipment: {c.shipment.shipmentNumber}</p>
                    )}
                  </div>
                </div>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px]', statusMap[c.clearanceStatus] || '')}
                >
                  {labelize(c.clearanceStatus)}
                </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </ReportCard>
      </motion.div>
    </div>
  );
}

function buildAnalyticsReports(data: ReportData) {
  const countryImportsData = Object.values(
    data.shipments.reduce<Record<string, { country: string; value: number; shipments: number }>>((acc, shipment) => {
      const country = shipment.originCountry || 'Unknown';
      acc[country] ||= { country, value: 0, shipments: 0 };
      acc[country].value += numberValue(shipment.shipmentValue);
      acc[country].shipments += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const portPerformanceData = Object.values(
    data.shipments.reduce<Record<string, { port: string; volume: number; delivered: number; delayed: number; clearanceDays: number[] }>>(
      (acc, shipment) => {
        const port = shipment.destinationPort || 'Unknown';
        acc[port] ||= { port, volume: 0, delivered: 0, delayed: 0, clearanceDays: [] };
        acc[port].volume += 1;
        if (shipment.status === 'delivered' || shipment.status === 'closed') acc[port].delivered += 1;
        if (isDelayed(shipment)) acc[port].delayed += 1;
        return acc;
      },
      {}
    )
  )
    .map((port) => {
      const relatedCustoms = data.customs.filter((c) => c.shipment?.destinationPort === port.port);
      relatedCustoms.forEach((c) => {
        if (c.clearanceDate && c.createdAt) {
          const days = Math.max(0, (new Date(c.clearanceDate).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          port.clearanceDays.push(days);
        }
      });
      const deliveryScore = port.volume ? (port.delivered / port.volume) * 70 : 0;
      const delayPenalty = port.volume ? (port.delayed / port.volume) * 30 : 0;
      const efficiency = Math.max(0, Math.round(deliveryScore + 30 - delayPenalty));
      const avgDays = port.clearanceDays.length
        ? `${(port.clearanceDays.reduce((sum, days) => sum + days, 0) / port.clearanceDays.length).toFixed(1)} days`
        : '-';
      return { ...port, efficiency, avgClearance: avgDays };
    })
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5)
    .map((port, index) => ({ ...port, rank: index + 1 }));

  const months = lastSixMonthKeys();
  const monthlyTrendsData = months.map(({ key, month }) => {
    const monthShipments = data.shipments.filter((shipment) => monthKey(recordDate(shipment)) === key);
    const monthExpenses = data.expenses.filter((expense) => monthKey(new Date(expense.createdAt || Date.now())) === key);
    return {
      month,
      shipments: monthShipments.length,
      revenue: monthShipments.reduce((sum, shipment) => sum + numberValue(shipment.shipmentValue), 0),
      costs: monthExpenses.reduce((sum, expense) => sum + numberValue(expense.amountBase), 0),
    };
  });

  const totalShipments = Math.max(data.shipments.length, 1);
  const costPerShipmentData = Object.entries(
    data.expenses.reduce<Record<string, number>>((acc, expense) => {
      const category = labelize(expense.category);
      acc[category] = (acc[category] || 0) + numberValue(expense.amountBase);
      return acc;
    }, {})
  )
    .map(([category, total], index) => ({
      category,
      amount: Math.round(total / totalShipments),
      pct: 0,
      color: ['bg-teal', 'bg-amber', 'bg-emerald-500', 'bg-orange-500', 'bg-cyan-500', 'bg-slate-500', 'bg-gray-400'][index % 7],
    }))
    .sort((a, b) => b.amount - a.amount);
  const totalPerShipment = costPerShipmentData.reduce((sum, item) => sum + item.amount, 0);
  const costPerShipmentWithPct = costPerShipmentData.map((item) => ({
    ...item,
    pct: totalPerShipment ? Math.round((item.amount / totalPerShipment) * 100) : 0,
  }));

  return { countryImportsData, portPerformanceData, monthlyTrendsData, costPerShipmentData: costPerShipmentWithPct, totalPerShipment };
}

function AnalyticsReports({ data, loading }: { data: ReportData; loading: boolean }) {
  const { countryImportsData, portPerformanceData, monthlyTrendsData, costPerShipmentData, totalPerShipment } = buildAnalyticsReports(data);
  const hasShipments = data.shipments.length > 0;
  const hasTrends = monthlyTrendsData.some((row) => row.shipments > 0 || row.revenue > 0 || row.costs > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country-wise Imports */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ReportCard
            title="Country-wise Imports"
            description="Import value by country of origin"
            onExportExcel={() => exportCsv('country-wise-imports', countryImportsData)}
            onExportPdf={() => exportPrintableReport('Country-wise Imports', countryImportsData)}
          >
            {loading ? <ReportLoading /> : countryImportsData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={countryImportsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="country" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} name="Import Value" />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyReport />}
          </ReportCard>
        </motion.div>

        {/* Port Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <ReportCard
            title="Port Performance"
            description="Ranked by efficiency"
            onExportExcel={() => exportCsv('port-performance', portPerformanceData)}
            onExportPdf={() => exportPrintableReport('Port Performance', portPerformanceData)}
          >
            {loading ? <ReportLoading /> : portPerformanceData.length ? <div className="space-y-3">
              {portPerformanceData.map((port, i) => (
                <div key={port.port} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                      i === 0
                        ? 'bg-teal/10 text-teal'
                        : i === 1
                        ? 'bg-amber/10 text-amber'
                        : i === 2
                        ? 'bg-orange-500/10 text-orange-500'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {port.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Anchor className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">{port.port}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{port.volume} shipments</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${port.efficiency}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                        className="h-full rounded-full bg-teal"
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold">{port.efficiency}%</p>
                    <p className="text-[10px] text-muted-foreground">{port.avgClearance}</p>
                  </div>
                </div>
              ))}
            </div> : <EmptyReport />}
          </ReportCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ReportCard
            title="Monthly Trends"
            description="Revenue vs costs trend"
            onExportExcel={() => exportCsv('monthly-trends', monthlyTrendsData)}
            onExportPdf={() => exportPrintableReport('Monthly Trends', monthlyTrendsData)}
          >
            {loading ? <ReportLoading /> : hasTrends ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="costs" stroke="#f97316" strokeWidth={2} name="Costs" />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyReport />}
          </ReportCard>
        </motion.div>

        {/* Cost per Shipment Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <ReportCard
            title="Cost per Shipment Analysis"
            description="Average cost breakdown per shipment"
            onExportExcel={() => exportCsv('cost-per-shipment', costPerShipmentData)}
            onExportPdf={() => exportPrintableReport('Cost per Shipment Analysis', costPerShipmentData)}
          >
            {loading ? <ReportLoading /> : hasShipments && costPerShipmentData.length ? (
              <div className="space-y-4 mt-2">
                {costPerShipmentData.map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">${item.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground">({item.pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className={cn('h-full rounded-full', item.color)}
                      />
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Total per Shipment</span>
                  <span className="text-sm font-bold text-teal">${totalPerShipment.toLocaleString()}</span>
                </div>
              </div>
            ) : <EmptyReport />}
          </ReportCard>
        </motion.div>
      </div>
    </div>
  );
}
