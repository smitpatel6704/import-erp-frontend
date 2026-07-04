'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Anchor,
  BellRing,
  CheckCircle2,
  FileCheck2,
  Globe2,
  MapPin,
  PackageCheck,
  Ship,
  Sparkles,
  TrendingUp,
  Truck,
  Users2,
  Plus,
  FileText,
  Search,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, readJsonResponse } from '@/lib/utils';
import { useERPStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

const emptyData = {
  shipments: {
    total: 0,
    active: 0,
    atPol: 0,
    inTransit: 0,
    atPod: 0,
    customsClearance: 0,
    delivered: 0,
    totalValue: 0,
    monthlyTrend: [],
    yearlyTrend: [],
    bySupplier: [],
    byPort: [],
    byOriginCountry: [],
  },
  notifications: { total: 0, unread: 0 },
  recentShipments: [],
};

const statusLabels = {
  draft: 'Draft',
  booking_confirmed: 'Booking Confirmed',
  at_pol: 'At POL',
  vessel_departed: 'Vessel Departed',
  in_transit: 'In Transit',
  at_pod: 'At POD',
  customs_clearance: 'Customs Clearance',
  duty_paid: 'Duty Paid',
  in_transport: 'In Transport',
  offloaded: 'Offloaded',
  delivered: 'Delivered',
  closed: 'Closed',
};

const statusTone = {
  delivered: 'bg-success/12 text-success border-success/25',
  closed: 'bg-muted text-muted-foreground border-border',
  in_transit: 'bg-info/12 text-info border-info/25',
  vessel_departed: 'bg-info/12 text-info border-info/25',
  at_pol: 'bg-warning/15 text-amber-dark border-warning/30 dark:text-amber-light',
  at_pod: 'bg-violet-500/12 text-violet-600 border-violet-500/25 dark:text-violet-300',
  customs_clearance: 'bg-orange-500/12 text-orange-600 border-orange-500/25 dark:text-orange-300',
  duty_paid: 'bg-emerald-500/12 text-emerald-600 border-emerald-500/25 dark:text-emerald-300',
  in_transport: 'bg-cyan-500/12 text-cyan-600 border-cyan-500/25 dark:text-cyan-300',
  offloaded: 'bg-teal/12 text-teal border-teal/25',
  booking_confirmed: 'bg-sky-500/12 text-sky-600 border-sky-500/25 dark:text-sky-300',
  draft: 'bg-muted text-muted-foreground border-border',
};

const compactNumber = (value) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    Number(value || 0)
  );

const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

export default function DashboardModule() {
  const canViewNotifications = useERPStore((state) => state.canView('notifications'));
  const [data, setData] = useState(emptyData);
  const [highPriority, setHighPriority] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const dashboardResponse = await fetch('/api/dashboard');
        const notificationResponse = canViewNotifications
          ? await fetch('/api/notifications?limit=6&sortBy=createdAt&sortOrder=desc')
          : null;
        const dashboardJson = await readJsonResponse(dashboardResponse);
        const notificationJson = notificationResponse
          ? await readJsonResponse(notificationResponse)
          : { data: [] };
        if (!dashboardResponse.ok) throw new Error(dashboardJson.error || 'Unable to load dashboard');
        setData({
          ...emptyData,
          ...dashboardJson,
          shipments: { ...emptyData.shipments, ...dashboardJson.shipments },
          notifications: { ...emptyData.notifications, ...dashboardJson.notifications },
          recentShipments: dashboardJson.recentShipments || [],
        });
        setHighPriority(
          (notificationJson.data || []).filter(
            (item) => ['high', 'critical'].includes(item.priority) || item.type === 'error'
          )
        );
        setError('');
      } catch (requestError) {
        setError(requestError.message);
        toast({
          title: 'Dashboard could not load',
          description: requestError.message || 'Please refresh and try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [canViewNotifications]);

  const shipments = data.shipments;

  const kpis = [
    {
      label: 'Total Shipments',
      value: shipments.total,
      icon: Ship,
      iconColor: 'text-teal',
      iconBg: 'bg-teal/12',
      ring: 'ring-teal/25',
    },
    {
      label: 'Active Shipments',
      value: shipments.active,
      icon: Truck,
      iconColor: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-500/12',
      ring: 'ring-sky-500/25',
    },
    {
      label: 'At POL',
      value: shipments.atPol,
      icon: Anchor,
      iconColor: 'text-amber-dark dark:text-amber-light',
      iconBg: 'bg-amber/15',
      ring: 'ring-amber/30',
    },
    {
      label: 'In Transit',
      value: shipments.inTransit,
      icon: Ship,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-500/12',
      ring: 'ring-cyan-500/25',
    },
    {
      label: 'At POD',
      value: shipments.atPod,
      icon: PackageCheck,
      iconColor: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-500/12',
      ring: 'ring-violet-500/25',
    },
    {
      label: 'Customs Clearance',
      value: shipments.customsClearance,
      icon: FileCheck2,
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-500/12',
      ring: 'ring-orange-500/25',
    },
    {
      label: 'Delivered',
      value: shipments.delivered,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/12',
      ring: 'ring-emerald-500/25',
    },
    {
      label: 'Shipment Value',
      value: currency(shipments.totalValue),
      icon: Globe2,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-500/12',
      ring: 'ring-indigo-500/25',
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-danger/25 bg-danger/[0.06] px-4 py-3 text-sm text-danger backdrop-blur"
        >
          {error}
        </motion.div>
      )}

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="h-14 justify-start gap-3 bg-card hover:border-primary hover:text-primary">
          <Link href="/shipments?new=1">
            <div className="rounded-full bg-primary/10 p-2"><Plus className="h-4 w-4" /></div>
            New Shipment
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-14 justify-start gap-3 bg-card hover:border-primary hover:text-primary">
          <Link href="/containers">
            <div className="rounded-full bg-primary/10 p-2"><Search className="h-4 w-4" /></div>
            Track Container
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-14 justify-start gap-3 bg-card hover:border-primary hover:text-primary">
          <Link href="/documents">
            <div className="rounded-full bg-primary/10 p-2"><FileText className="h-4 w-4" /></div>
            Generate Invoice
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-14 justify-start gap-3 bg-card hover:border-primary hover:text-primary">
          <Link href="/documents">
            <div className="rounded-full bg-primary/10 p-2"><FileCheck2 className="h-4 w-4" /></div>
            Customs Doc
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card className="hover-lift h-full overflow-hidden">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold mt-1.5 tracking-tight tabular-nums">
                    {loading ? (
                      <span className="inline-block h-7 w-16 rounded-md bg-muted/70 animate-pulse" />
                    ) : (
                      item.value
                    )}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 shadow-sm',
                    item.iconBg,
                    item.ring
                  )}
                >
                  <item.icon className={cn('h-5 w-5', item.iconColor)} strokeWidth={2} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Shipments & Value"
          description="Shipment volume and value for the last six months"
          icon={TrendingUp}
        >
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={shipments.monthlyTrend}>
              <defs>
                <linearGradient id="grad-shipments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--teal)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="grad-value" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--amber)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="count" tick={{ fontSize: 11 }} allowDecimals={false} stroke="var(--muted-foreground)" />
              <YAxis
                yAxisId="value"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickFormatter={compactNumber}
                stroke="var(--muted-foreground)"
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }}
                formatter={(value, name) => (name === 'Value' ? currency(value) : value)}
              />
              <Area
                yAxisId="count"
                type="monotone"
                dataKey="shipments"
                name="Shipments"
                stroke="var(--teal)"
                fill="url(#grad-shipments)"
                strokeWidth={2.2}
              />
              <Area
                yAxisId="value"
                type="monotone"
                dataKey="value"
                name="Value"
                stroke="var(--amber)"
                fill="url(#grad-value)"
                strokeWidth={2.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Yearly Shipments & Value"
          description="Annual shipment volume and declared value"
          icon={Sparkles}
        >
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={shipments.yearlyTrend}>
              <CartesianGrid strokeDasharray="3 4" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="count" tick={{ fontSize: 11 }} allowDecimals={false} stroke="var(--muted-foreground)" />
              <YAxis
                yAxisId="value"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickFormatter={compactNumber}
                stroke="var(--muted-foreground)"
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }}
                formatter={(value, name) => (name === 'Value' ? currency(value) : value)}
              />
              <Bar yAxisId="count" dataKey="shipments" name="Shipments" fill="var(--teal)" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="value" dataKey="value" name="Value" fill="var(--amber)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Shipment Status Breakdown"
          description="Current distribution of active shipments"
          icon={PieChartIcon}
        >
          <ResponsiveContainer width="100%" height={290}>
            <PieChart>
              <Pie
                data={[
                  { name: 'In Transit', value: shipments.inTransit, color: 'var(--info)' },
                  { name: 'At POL', value: shipments.atPol, color: 'var(--warning)' },
                  { name: 'At POD', value: shipments.atPod, color: 'var(--primary)' },
                  { name: 'Customs', value: shipments.customsClearance, color: 'var(--amber)' }
                ].filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                cornerRadius={6}
              >
                {
                  [
                    { name: 'In Transit', value: shipments.inTransit, color: 'var(--info)' },
                    { name: 'At POL', value: shipments.atPol, color: 'var(--warning)' },
                    { name: 'At POD', value: shipments.atPod, color: 'var(--primary)' },
                    { name: 'Customs', value: shipments.customsClearance, color: 'var(--amber)' }
                  ].filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))
                }
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RankingCard title="Shipments by Supplier" icon={Users2} rows={shipments.bySupplier} labelKey="supplier" />
        <RankingCard title="Shipments by Port" icon={Anchor} rows={shipments.byPort} labelKey="port" />
        <RankingCard title="Shipments by Country" icon={MapPin} rows={shipments.byOriginCountry} labelKey="country" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/12 text-teal ring-1 ring-teal/25">
                <Ship className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">Recent Shipments</CardTitle>
                <CardDescription>Latest records and current stage</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
                  <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-5 py-2.5 font-semibold">Shipment</th>
                    <th className="px-5 py-2.5 font-semibold">Route</th>
                    <th className="px-5 py-2.5 font-semibold">Status</th>
                    <th className="px-5 py-2.5 font-semibold text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentShipments.map((shipment, i) => (
                    <motion.tr
                      key={shipment.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.24 }}
                      className="border-t border-border/60 transition-colors hover:bg-teal/[0.04]"
                    >
                      <td className="px-5 py-3 font-medium tabular-nums">
                        {shipment.shipmentNumber}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <span>{shipment.originPort || '-'}</span>
                          <span className="text-teal/60">→</span>
                          <span>{shipment.destinationPort || '-'}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold',
                            statusTone[shipment.status] || 'bg-muted text-muted-foreground border-border'
                          )}
                        >
                          {statusLabels[shipment.status] || shipment.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums">
                        {currency(shipment.shipmentValue)}
                      </td>
                    </motion.tr>
                  ))}
                  {!loading && data.recentShipments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Ship className="h-8 w-8 opacity-40" />
                          <span className="text-sm">No shipments found</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-sm text-muted-foreground">
                        Loading shipments...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/15 text-amber-dark ring-1 ring-amber/30 dark:text-amber-light">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base">High Priority</CardTitle>
                <CardDescription>
                  {data.notifications.unread} unread notification(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {highPriority.map((notification, i) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.24 }}
                className="rounded-xl border border-danger/20 bg-danger/[0.04] p-3 shadow-sm backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug">{notification.title}</p>
                  <Badge variant="destructive" className="text-[9px] shrink-0">
                    {notification.priority || 'high'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {notification.message}
                </p>
                {notification.emailStatus && (
                  <p className="text-[10px] text-muted-foreground/80 mt-2 uppercase tracking-wider">
                    Email: {notification.emailStatus.replace(/_/g, ' ')}
                  </p>
                )}
              </motion.div>
            ))}
            {!loading && highPriority.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                <BellRing className="h-8 w-8 opacity-40" />
                <span className="text-sm">No high priority notifications</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChartCard({ title, description, icon: Icon, children }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/12 text-teal ring-1 ring-teal/25">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}

function RankingCard({ title, icon: Icon, rows, labelKey }) {
  const topRows = (rows || []).slice(0, 6);
  const maximum = Math.max(...topRows.map((row) => Number(row.count || 0)), 1);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/12 text-teal ring-1 ring-teal/25">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>Shipment count and value</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3.5 pt-5">
        {topRows.map((row, i) => {
          const label = row[labelKey] || 'Unassigned';
          const pct = (Number(row.count || 0) / maximum) * 100;
          return (
            <div key={label}>
              <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                <span className="flex items-center gap-2 font-medium truncate">
                  {i === 0 && (
                    <Badge className="h-4 px-1.5 text-[9px] bg-teal/15 text-teal border-teal/25 hover:bg-teal/15">
                      TOP
                    </Badge>
                  )}
                  <span className="truncate">{label}</span>
                </span>
                <span className="text-muted-foreground whitespace-nowrap tabular-nums">
                  {row.count} / {currency(row.value)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/70 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-teal via-teal-light to-amber-light"
                />
              </div>
            </div>
          );
        })}
        {!topRows.length && (
          <div className="py-10 text-center text-sm text-muted-foreground">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}
