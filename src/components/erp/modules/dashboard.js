'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Anchor,
  Ship,
  CheckCircle2,
  TrendingUp,
  Clock,
  Package,
  Plus,
  FileText,
  Search,
  Truck,
  BellRing,
  ShipIcon,
  Box,
  BarChart3,
  Activity,
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
import { Card, CardContent } from '@/components/ui/card';
import { cn, readJsonResponse } from '@/lib/utils';
import { useERPStore } from '@/lib/store';
import { PageHeader } from '@/components/erp/page-header';
import { StatCard, StatCardCompact } from '@/components/erp/stat-card';
import { StatusBadge } from '@/components/erp/status-badge';
import { SectionHeader } from '@/components/erp/section-header';
import { KPISkeleton, CardSkeleton } from '@/components/erp/loading-state';
import { EmptyState } from '@/components/erp/empty-state';
import { toast } from '@/hooks/use-toast';

const emptyData = {
  shipments: {
    total: 0, active: 0, atPol: 0, inTransit: 0, atPod: 0,
    customsClearance: 0, delivered: 0, totalValue: 0,
    monthlyTrend: [], yearlyTrend: [], bySupplier: [], byPort: [], byOriginCountry: [],
  },
  notifications: { total: 0, unread: 0 },
  recentShipments: [],
};

const pipelineStages = [
  { key: 'draft', label: 'Draft' },
  { key: 'booking_confirmed', label: 'Confirmed' },
  { key: 'at_pol', label: 'At POL' },
  { key: 'vessel_departed', label: 'Departed' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'at_pod', label: 'At POD' },
  { key: 'customs_clearance', label: 'Customs' },
  { key: 'delivered', label: 'Delivered' },
];

const statusLabels = {
  draft: 'Draft', booking_confirmed: 'Booking Confirmed', at_pol: 'At POL',
  vessel_departed: 'Vessel Departed', in_transit: 'In Transit', at_pod: 'At POD',
  customs_clearance: 'Customs Clearance', duty_paid: 'Duty Paid', in_transport: 'In Transport',
  offloaded: 'Offloaded', delivered: 'Delivered', closed: 'Closed',
};

const statusTone = {
  delivered: 'bg-success/10 text-success border-success/20',
  closed: 'bg-muted text-muted-foreground border-border',
  in_transit: 'bg-info/10 text-info border-info/20',
  vessel_departed: 'bg-info/10 text-info border-info/20',
  at_pol: 'bg-warning/12 text-warning border-warning/20',
  at_pod: 'bg-purple/10 text-purple border-purple/20',
  customs_clearance: 'bg-warning/12 text-warning border-warning/20',
  duty_paid: 'bg-success/10 text-success border-success/20',
  in_transport: 'bg-info/10 text-info border-info/20',
  offloaded: 'bg-primary/10 text-primary border-primary/20',
  booking_confirmed: 'bg-info/10 text-info border-info/20',
  draft: 'bg-muted text-muted-foreground border-border',
};

const compactNumber = (v) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v || 0));
const currency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(Number(v || 0));

export default function DashboardModule() {
  const canViewNotifications = useERPStore((s) => s.canView('notifications'));
  const [data, setData] = useState(emptyData);
  const [highPriority, setHighPriority] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const [dashRes, notifRes] = await Promise.all([
          fetch('/api/dashboard'),
          canViewNotifications ? fetch('/api/notifications?limit=6&sortBy=createdAt&sortOrder=desc') : Promise.resolve(null),
        ]);
        const dashJson = await readJsonResponse(dashRes);
        const notifJson = notifRes ? await readJsonResponse(notifRes) : { data: [] };
        if (!dashRes.ok) throw new Error(dashJson.error || 'Unable to load dashboard');
        setData({
          ...emptyData,
          ...dashJson,
          shipments: { ...emptyData.shipments, ...dashJson.shipments },
          notifications: { ...emptyData.notifications, ...dashJson.notifications },
          recentShipments: dashJson.recentShipments || [],
        });
        setHighPriority((notifJson.data || []).filter((n) => ['high', 'critical'].includes(n.priority) || n.type === 'error'));
      } catch (e) {
        setError(e.message);
        toast({ title: 'Dashboard could not load', description: e.message || 'Please refresh and try again.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [canViewNotifications]);

  const s = data.shipments;
  const showChart = s.monthlyTrend?.length > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Operational overview of your import business" />
        <KPISkeleton count={4} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CardSkeleton className="h-80" />
          <CardSkeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Operational overview of your import business" />
        <EmptyState
          icon={AlertTriangle}
          title="Unable to load dashboard"
          description={error}
          action={<Button onClick={() => window.location.reload()}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Activity} title="Dashboard" description="Operational overview of your import business">
        <Button variant="outline" size="sm" asChild>
          <Link href="/reports">View Reports</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/shipments?new=1"><Plus className="mr-1.5 h-4 w-4" />New Shipment</Link>
        </Button>
      </PageHeader>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Shipments" value={s.total} change={12} changeLabel="vs last month" icon={Ship} href="/shipments" />
        <StatCard label="Active Shipments" value={s.active} change={8} changeLabel="in progress" icon={Truck} />
        <StatCard label="In Transit" value={s.inTransit} change={-3} changeLabel="on water" icon={Package} />
        <StatCard label="Delivered" value={s.delivered} change={15} changeLabel="this month" icon={CheckCircle2} />
      </div>

      {/* Compact secondary metrics */}
      <div className="flex flex-wrap gap-3">
        <StatCardCompact label="At POL" value={s.atPol} icon={Anchor} />
        <StatCardCompact label="At POD" value={s.atPod} icon={Box} />
        <StatCardCompact label="Customs" value={s.customsClearance} icon={FileText} />
        <StatCardCompact label="Shipment Value" value={currency(s.totalValue)} icon={TrendingUp} color="text-success bg-success/8 ring-success/15" />
      </div>

      {/* Pipeline + Needs Attention */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Shipment Pipeline */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="border-b border-border px-5 py-3.5">
            <SectionHeader
              title="Shipment Pipeline"
              description="Current distribution across lifecycle stages"
            />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {pipelineStages.map((stage, i) => {
                const count = s[stage.key] ?? 0;
                const maxCount = Math.max(...pipelineStages.map((st) => s[st.key] ?? 0), 1);
                const pct = (count / maxCount) * 100;
                return (
                  <div key={stage.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex h-20 w-full items-end justify-center gap-0.5">
                      <div
                        className="w-full max-w-[32px] rounded-t-md bg-primary transition-all duration-500"
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-foreground">{count}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{stage.label}</span>
                    {i < pipelineStages.length - 1 && (
                      <span className="text-[9px] text-muted-foreground/40">→</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-3.5">
            <SectionHeader title="Needs Attention" badge={highPriority.length + (s.atPol > 0 ? 1 : 0)}>
              {canViewNotifications && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href="/notifications">View All</Link>
                </Button>
              )}
            </SectionHeader>
          </div>
          <CardContent className="space-y-2 p-4">
            {s.atPol > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2.5">
                <Anchor className="h-4 w-4 shrink-0 text-warning" />
                <span className="text-sm text-foreground">{s.atPol} shipment{s.atPol > 1 ? 's' : ''} at Port of Loading</span>
              </div>
            )}
            {s.customsClearance > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2.5">
                <FileText className="h-4 w-4 shrink-0 text-warning" />
                <span className="text-sm text-foreground">{s.customsClearance} in customs clearance</span>
              </div>
            )}
            {highPriority.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                </div>
              </div>
            ))}
            {highPriority.length === 0 && s.atPol === 0 && s.customsClearance === 0 && (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-success/60" />
                <p className="mt-2 text-sm text-muted-foreground">All clear — no issues detected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-3.5">
            <SectionHeader
              title="Monthly Volume & Value"
              description="Shipments and declared value over the last 6 months"
            />
          </div>
          <CardContent className="p-5">
            {showChart ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={s.monthlyTrend}>
                  <defs>
                    <linearGradient id="grad-vol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="grad-val" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--warning)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--warning)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 4" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis yAxisId="count" tick={{ fontSize: 11 }} allowDecimals={false} stroke="var(--muted-foreground)" />
                  <YAxis yAxisId="value" orientation="right" tick={{ fontSize: 11 }} tickFormatter={compactNumber} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
                    formatter={(v, n) => (n === 'Value' ? currency(v) : v)}
                  />
                  <Area yAxisId="count" type="monotone" dataKey="shipments" name="Shipments" stroke="var(--primary)" fill="url(#grad-vol)" strokeWidth={2} />
                  <Area yAxisId="value" type="monotone" dataKey="value" name="Value" stroke="var(--warning)" fill="url(#grad-val)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={BarChart3} title="No trend data yet" description="Monthly data will appear once shipments are created" compact />
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-3.5">
            <SectionHeader title="Status Distribution" description="Current active shipment breakdown" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center gap-6">
              <div className="shrink-0">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'In Transit', value: s.inTransit, color: 'var(--info)' },
                        { name: 'At POL', value: s.atPol, color: 'var(--warning)' },
                        { name: 'At POD', value: s.atPod, color: 'var(--purple)' },
                        { name: 'Customs', value: s.customsClearance, color: 'var(--amber)' },
                        { name: 'Delivered', value: s.delivered, color: 'var(--success)' },
                      ].filter((d) => d.value > 0)}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                      paddingAngle={3} dataKey="value" stroke="none"
                    >
                      {[
                        { name: 'In Transit', value: s.inTransit, color: 'var(--info)' },
                        { name: 'At POL', value: s.atPol, color: 'var(--warning)' },
                        { name: 'At POD', value: s.atPod, color: 'var(--purple)' },
                        { name: 'Customs', value: s.customsClearance, color: 'var(--amber)' },
                        { name: 'Delivered', value: s.delivered, color: 'var(--success)' },
                      ].filter((d) => d.value > 0).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {[
                  { label: 'In Transit', value: s.inTransit, color: 'bg-info' },
                  { label: 'At POL', value: s.atPol, color: 'bg-warning' },
                  { label: 'At POD', value: s.atPod, color: 'bg-purple' },
                  { label: 'Customs', value: s.customsClearance, color: 'bg-warning' },
                  { label: 'Delivered', value: s.delivered, color: 'bg-success' },
                ].filter((d) => d.value > 0).map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className={cn('h-2 w-2 rounded-full', item.color)} />
                      {item.label}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shipments */}
      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <SectionHeader title="Recent Shipments" description="Latest records and current stage">
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link href="/shipments">View All</Link>
            </Button>
          </SectionHeader>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Shipment</th>
                <th className="px-5 py-3 font-semibold">Route</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.recentShipments.map((shipment, i) => (
                <tr key={shipment.id} className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0">
                  <td className="px-5 py-3 font-medium tabular-nums text-foreground">
                    {shipment.shipmentNumber}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span>{shipment.originPort || '-'}</span>
                      <span className="text-primary/50">→</span>
                      <span>{shipment.destinationPort || '-'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={shipment.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums text-foreground">
                    {currency(shipment.shipmentValue)}
                  </td>
                </tr>
              ))}
              {data.recentShipments.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState icon={Ship} title="No shipments yet" description="Create your first shipment to get started" compact className="py-12" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
          <Link href="/shipments?new=1"><Plus className="h-4 w-4" />New Shipment</Link>
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
          <Link href="/containers"><Search className="h-4 w-4" />Track Container</Link>
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
          <Link href="/documents"><FileText className="h-4 w-4" />Upload Document</Link>
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
          <Link href="/companies"><Box className="h-4 w-4" />Create Company</Link>
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
          <Link href="/reports"><BarChart3 className="h-4 w-4" />Generate Report</Link>
        </Button>
      </div>
    </div>
  );
}
