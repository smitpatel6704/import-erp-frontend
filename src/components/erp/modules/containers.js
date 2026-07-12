"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, Search, Eye, MapPin, Ship, Inbox, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PageHeader } from "@/components/erp/page-header";
import { SectionHeader } from "@/components/erp/section-header";
import { StatCardCompact } from "@/components/erp/stat-card";
import { StatusBadge } from "@/components/erp/status-badge";
import { EmptyState } from "@/components/erp/empty-state";
import { TableSkeleton } from "@/components/erp/loading-state";

const CONTAINER_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "booking_confirmed", label: "Booking Confirmed" },
  { value: "at_pol", label: "At POL" },
  { value: "vessel_departed", label: "Vessel Departed" },
  { value: "in_transit", label: "In Transit" },
  { value: "at_pod", label: "At POD" },
  { value: "customs_clearance", label: "Customs Clearance" },
  { value: "in_transport", label: "In Transport" },
  { value: "delivered", label: "Delivered" },
];
const statusLabelMap = Object.fromEntries(CONTAINER_STATUSES.map((s) => [s.value, s.label]));
const containerTypeLabel = (type) => type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "—";

export default function ContainersModule() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [containerTypes, setContainerTypes] = useState([{ value: "all", label: "All Types" }]);
  const [containerSizes, setContainerSizes] = useState([{ value: "all", label: "All Sizes" }]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [sizes, types] = await Promise.all([
          fetch("/api/settings/options?category=container_size").then((r) => r.json()),
          fetch("/api/settings/options?category=container_type").then((r) => r.json()),
        ]);
        if (sizes.data) setContainerSizes([{ value: "all", label: "All Sizes" }, ...sizes.data.map((d) => ({ value: d.value, label: d.label }))]);
        if (types.data) setContainerTypes([{ value: "all", label: "All Types" }, ...types.data.map((d) => ({ value: d.value, label: d.label }))]);
      } catch (err) { console.error(err); }
    };
    fetchOptions();
  }, []);

  const fetchContainers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", isActive: "true", linkedShipment: "true" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("containerType", typeFilter);
      if (sizeFilter !== "all") params.set("containerSize", sizeFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/containers?${params}`);
      const json = await res.json();
      setContainers(json.data || []);
      setTotalCount(json.pagination?.total || 0);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, statusFilter, typeFilter, sizeFilter, searchQuery]);

  useEffect(() => { fetchContainers(); }, [fetchContainers]);

  const statusCounts = React.useMemo(() => {
    const counts = {};
    containers.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return counts;
  }, [containers]);

  const locationGroups = React.useMemo(() => {
    const groups = {};
    containers.forEach((c) => {
      const loc = c.currentLocation || "Unknown";
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(c);
    });
    return groups;
  }, [containers]);

  return (
    <>
      <div className="space-y-5">
        <PageHeader icon={Box} title="Containers" description="Track and manage container inventory">
          <Button variant="outline" size="sm" className="h-9">Export</Button>
        </PageHeader>

        {/* Lifecycle metrics */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-wrap gap-2">
              {CONTAINER_STATUSES.filter((s) => s.value !== "all").map((status) => {
                const count = statusCounts[status.value] || 0;
                const isActive = statusFilter === status.value;
                return (
                  <button
                    key={status.value}
                    onClick={() => { setStatusFilter(isActive ? "all" : status.value); setPage(1); }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                      isActive ? "bg-primary/10 text-primary border-primary/20" : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <StatusBadge status={status.value} dot={false} className="border-0 px-0 text-xs" />
                    <span className={cn("tabular-nums", isActive && "font-bold")}>{count}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search container, seal, location..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="h-9 pl-9 text-sm" />
              </div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-full sm:w-[150px] text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{containerTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={sizeFilter} onValueChange={(v) => { setSizeFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-full sm:w-[130px] text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{containerSizes.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {loading ? (
              <Card><CardContent className="p-5"><TableSkeleton rows={6} cols={7} /></CardContent></Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3 font-semibold">Container</th>
                        <th className="hidden px-4 py-3 font-semibold sm:table-cell">Type / Size</th>
                        <th className="hidden px-4 py-3 font-semibold md:table-cell">Seal</th>
                        <th className="px-4 py-3 font-semibold">Shipment</th>
                        <th className="hidden px-4 py-3 font-semibold lg:table-cell">Weight</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="hidden px-4 py-3 font-semibold md:table-cell">Location</th>
                        <th className="w-10 px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {containers.length === 0 ? (
                        <tr><td colSpan={8}><EmptyState icon={Box} title="No containers found" description="Containers linked to shipments will appear here." compact className="py-16" /></td></tr>
                      ) : containers.map((c) => (
                        <tr key={c.id} onClick={() => { setSelectedContainer(c); setDetailOpen(true); }} className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                                <Box className="h-4 w-4" strokeWidth={1.8} />
                              </div>
                              <span className="text-sm font-medium text-foreground">{c.containerNumber}</span>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <p className="text-xs text-foreground">{containerTypeLabel(c.containerType)}</p>
                            <p className="text-[11px] text-muted-foreground">{c.containerSize}</p>
                          </td>
                          <td className="hidden px-4 py-3 text-xs md:table-cell">{c.sealNumber || "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Ship className="h-3 w-3 text-muted-foreground" />
                              <span>{c.shipment?.shipmentNumber || "—"}</span>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 lg:table-cell">
                            <div className="space-y-1">
                              <p className="text-xs text-foreground">{c.currentWeight || 0}/{c.weightCapacity || 0} kg</p>
                              {c.weightCapacity > 0 && (
                                <div className="h-1.5 w-full max-w-[100px] rounded-full bg-muted overflow-hidden">
                                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((c.currentWeight / c.weightCapacity) * 100, 100)}%` }} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                          <td className="hidden px-4 py-3 md:table-cell">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[100px]">{c.currentLocation || "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalCount > 20 && (
                  <div className="flex items-center justify-between border-t border-border px-4 py-3">
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Showing <span className="font-semibold text-foreground">{(page - 1) * 20 + 1}</span>-
                      <span className="font-semibold text-foreground">{Math.min(page * 20, totalCount)}</span> of{" "}
                      <span className="font-semibold text-foreground">{totalCount}</span>
                    </p>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-8 text-xs">Prev</Button>
                      <Button variant="outline" size="sm" disabled={page * 20 >= totalCount} onClick={() => setPage(page + 1)} className="h-8 text-xs">Next</Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* By Location Panel */}
          <Card className="lg:col-span-1">
            <div className="border-b border-border px-4 py-3">
              <SectionHeader title="By Location" badge={String(Object.keys(locationGroups).length)} />
            </div>
            <div className="max-h-[500px] overflow-y-auto p-4">
              <div className="space-y-3">
                {Object.entries(locationGroups).map(([loc, items]) => (
                  <div key={loc}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="text-xs font-medium truncate">{loc}</span>
                      </div>
                      <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{items.length}</span>
                    </div>
                    <div className="space-y-0.5 pl-5">
                      {items.map((c) => (
                        <div key={c.id} className="flex items-center gap-1.5">
                          <span className="status-dot" style={{ background: c.status === "delivered" ? "var(--success)" : c.status === "in_transit" ? "var(--info)" : "var(--warning)" }} />
                          <span className="text-[10px] text-muted-foreground">{c.containerNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(locationGroups).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No location data</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                <Box className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{selectedContainer?.containerNumber || "Loading..."}</DialogTitle>
                <DialogDescription>
                  {selectedContainer ? `${containerTypeLabel(selectedContainer.containerType)} — ${selectedContainer.containerSize}` : ""}
                </DialogDescription>
              </div>
              {selectedContainer && (
                <div className="ml-auto">
                  <StatusBadge status={selectedContainer.status} />
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedContainer && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Container Number", value: selectedContainer.containerNumber },
                  { label: "Type", value: containerTypeLabel(selectedContainer.containerType) },
                  { label: "Size", value: selectedContainer.containerSize },
                  { label: "Seal Number", value: selectedContainer.sealNumber },
                  { label: "Stuffing Type", value: selectedContainer.stuffingType?.toUpperCase() },
                  { label: "Status", value: statusLabelMap[selectedContainer.status] || selectedContainer.status },
                  { label: "Current Location", value: selectedContainer.currentLocation },
                  { label: "Current Weight", value: `${selectedContainer.currentWeight || 0} kg` },
                  { label: "Weight Capacity", value: `${selectedContainer.weightCapacity || 0} kg` },
                  { label: "Created", value: selectedContainer.createdAt ? format(new Date(selectedContainer.createdAt), "MMM d, yyyy") : "—" },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{field.label}</p>
                    <p className="text-sm mt-0.5 text-foreground">{field.value || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Weight Utilization */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground">Weight Utilization</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedContainer.weightCapacity > 0
                      ? `${((selectedContainer.currentWeight / selectedContainer.weightCapacity) * 100).toFixed(0)}%`
                      : "Not available"}
                  </span>
                </div>
                {selectedContainer.weightCapacity > 0 ? (
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((selectedContainer.currentWeight / selectedContainer.weightCapacity) * 100, 100)}%` }} />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Not available</p>
                )}
              </div>

              {/* Linked Shipment */}
              {selectedContainer.shipment && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Linked Shipment</p>
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                      <Ship className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{selectedContainer.shipment.shipmentNumber}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {selectedContainer.shipment.originPort || "?"} → {selectedContainer.shipment.destinationPort || "?"}
                      </p>
                    </div>
                    {selectedContainer.shipment.company && (
                      <span className="text-xs text-muted-foreground">{selectedContainer.shipment.company.name}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
