'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Anchor,
  CheckCircle2,
  FileCheck2,
  Globe2,
  PackageCheck,
  Ship,
  Truck,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

const compactNumber = (value) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0));

const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

export default function DashboardModule() {
  const [data, setData] = useState(emptyData);
  const [highPriority, setHighPriority] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const [dashboardResponse, notificationResponse] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/notifications?limit=6&sortBy=createdAt&sortOrder=desc'),
        ]);
        const dashboardJson = await dashboardResponse.json();
        const notificationJson = await notificationResponse.json();
        if (!dashboardResponse.ok) throw new Error(dashboardJson.error || 'Unable to load dashboard');
        setData({
          ...emptyData,
          ...dashboardJson,
          shipments: { ...emptyData.shipments, ...dashboardJson.shipments },
          notifications: { ...emptyData.notifications, ...dashboardJson.notifications },
          recentShipments: dashboardJson.recentShipments || [],
        });
        setHighPriority(
          (notificationJson.data || []).filter((item) =>
            ['high', 'critical'].includes(item.priority) || item.type === 'error'
          )
        );
        setError('');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const shipments = data.shipments;
  const kpis = [
    { label: 'Total Shipments', value: shipments.total, icon: Ship, tone: 'text-teal bg-teal/10' },
    { label: 'Active Shipments', value: shipments.active, icon: Truck, tone: 'text-sky-600 bg-sky-500/10' },
    { label: 'Shipment at POL', value: shipments.atPol, icon: Anchor, tone: 'text-amber bg-amber/10' },
    { label: 'In Transit', value: shipments.inTransit, icon: Ship, tone: 'text-cyan-600 bg-cyan-500/10' },
    { label: 'Shipment at POD', value: shipments.atPod, icon: PackageCheck, tone: 'text-violet-600 bg-violet-500/10' },
    { label: 'Custom Clearance', value: shipments.customsClearance, icon: FileCheck2, tone: 'text-orange-600 bg-orange-500/10' },
    { label: 'Delivered', value: shipments.delivered, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Shipment Value', value: currency(shipments.totalValue), icon: Globe2, tone: 'text-indigo-600 bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((item, index) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card className="shadow-sm h-full">
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold mt-1">{loading ? '-' : item.value}</p>
                </div>
                <div className={cn('rounded-xl p-2.5', item.tone.split(' ')[1])}>
                  <item.icon className={cn('h-5 w-5', item.tone.split(' ')[0])} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Monthly Shipments & Value" description="Shipment volume and value for the last six months">
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={shipments.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="count" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis yAxisId="value" orientation="right" tick={{ fontSize: 11 }} tickFormatter={compactNumber} />
              <Tooltip formatter={(value, name) => name === 'Value' ? currency(value) : value} />
              <Area yAxisId="count" type="monotone" dataKey="shipments" name="Shipments" stroke="#0d9488" fill="#0d948833" strokeWidth={2} />
              <Area yAxisId="value" type="monotone" dataKey="value" name="Value" stroke="#f59e0b" fill="#f59e0b22" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Yearly Shipments & Value" description="Annual shipment volume and declared value">
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={shipments.yearlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="count" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis yAxisId="value" orientation="right" tick={{ fontSize: 11 }} tickFormatter={compactNumber} />
              <Tooltip formatter={(value, name) => name === 'Value' ? currency(value) : value} />
              <Bar yAxisId="count" dataKey="shipments" name="Shipments" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="value" dataKey="value" name="Value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RankingCard title="Shipments by Supplier" rows={shipments.bySupplier} labelKey="supplier" />
        <RankingCard title="Shipments by Port" rows={shipments.byPort} labelKey="port" />
        <RankingCard title="Shipments by Country" rows={shipments.byOriginCountry} labelKey="country" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Shipments</CardTitle>
            <CardDescription>Latest shipment records and current stage</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-2.5">Shipment</th>
                    <th className="px-5 py-2.5">Route</th>
                    <th className="px-5 py-2.5">Status</th>
                    <th className="px-5 py-2.5 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentShipments.map((shipment) => (
                    <tr key={shipment.id} className="border-b">
                      <td className="px-5 py-3 font-medium">{shipment.shipmentNumber}</td>
                      <td className="px-5 py-3 text-muted-foreground">{shipment.originPort || '-'} to {shipment.destinationPort || '-'}</td>
                      <td className="px-5 py-3"><Badge variant="outline">{statusLabels[shipment.status] || shipment.status}</Badge></td>
                      <td className="px-5 py-3 text-right">{currency(shipment.shipmentValue)}</td>
                    </tr>
                  ))}
                  {!loading && data.recentShipments.length === 0 && (
                    <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No shipments found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">High Priority Notifications</CardTitle>
                <CardDescription>{data.notifications.unread} unread notification(s)</CardDescription>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {highPriority.map((notification) => (
              <div key={notification.id} className="rounded-lg border border-red-500/15 bg-red-500/[0.03] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{notification.title}</p>
                  <Badge variant="destructive" className="text-[9px]">{notification.priority || 'high'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                {notification.emailStatus && (
                  <p className="text-[10px] text-muted-foreground mt-2">Email: {notification.emailStatus.replace(/_/g, ' ')}</p>
                )}
              </div>
            ))}
            {!loading && highPriority.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">No high priority notifications</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function RankingCard({ title, rows, labelKey }) {
  const topRows = (rows || []).slice(0, 6);
  const maximum = Math.max(...topRows.map((row) => Number(row.count || 0)), 1);
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Shipment count and value</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {topRows.map((row) => (
          <div key={row[labelKey] || 'Unassigned'}>
            <div className="flex items-center justify-between gap-3 text-xs mb-1">
              <span className="font-medium truncate">{row[labelKey] || 'Unassigned'}</span>
              <span className="text-muted-foreground whitespace-nowrap">{row.count} / {currency(row.value)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-teal" style={{ width: `${(Number(row.count || 0) / maximum) * 100}%` }} />
            </div>
          </div>
        ))}
        {!topRows.length && <div className="py-10 text-center text-sm text-muted-foreground">No data available</div>}
      </CardContent>
    </Card>
  );
}
