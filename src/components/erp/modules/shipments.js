"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Ship, Search, Plus, Eye, LayoutGrid, List, MapPin, Clock,
  ArrowRight, X, Globe, Pencil, Building2, RefreshCw, Loader2,
  CheckCircle2, AlertCircle, Trash2, Truck, PackageCheck, Anchor,
  Inbox, FileText, DollarSign, Box, Calendar, ChevronDown,
  MoreHorizontal, Filter, Save, ArrowLeft, Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn, readJsonResponse } from "@/lib/utils";
import { format } from "date-fns";
import { useERPStore } from "@/lib/store";
import { PageHeader } from "@/components/erp/page-header";
import { StatCard } from "@/components/erp/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/erp/status-badge";
import { SectionHeader } from "@/components/erp/section-header";
import { EmptyState } from "@/components/erp/empty-state";
import { TableSkeleton } from "@/components/erp/loading-state";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/hooks/use-toast";

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "booking_confirmed", label: "Booking Confirmed" },
  { value: "at_pol", label: "At POL" },
  { value: "vessel_departed", label: "Vessel Departed" },
  { value: "in_transit", label: "In Transit" },
  { value: "at_pod", label: "At POD" },
  { value: "customs_clearance", label: "Customs Clearance" },
  { value: "in_transport", label: "In Transport" },
  { value: "delivered", label: "Delivered" },
];
const PRIORITIES = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];
const statusLabelMap = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));

const currencyFmt = (val, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const dateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};
const shipmentStatusFromCarrier = (status) => {
  const v = String(status || "").toLowerCase();
  if (v.includes("delivered") || v.includes("empty received")) return "delivered";
  if (v.includes("transship")) return "in_transit";
  if (v.includes("arrived") || v.includes("arrival") || v.includes("discharge") || v.includes("import to consignee")) return "at_pod";
  if (v.includes("in transit") || v.includes("transship")) return "in_transit";
  if (v.includes("depart") || v.includes("loaded on vessel")) return "vessel_departed";
  if (v.includes("gate in") || v.includes("export received")) return "at_pol";
  return "booking_confirmed";
};
const carrierSupported = (shippingLine) => {
  const v = String(shippingLine || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return v.includes("maersk") || v.includes("mersk") || v.includes("msc") ||
    v.includes("mediterraneanshipping") || v.includes("evergreen") ||
    v.includes("shipmentlink") || v.includes("hapag") || v.includes("hlag");
};
const kanbanColumns = ["draft","booking_confirmed","at_pol","vessel_departed","in_transit","at_pod","customs_clearance","in_transport","delivered"];

export default function ShipmentsModule() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canCreate = useERPStore((s) => s.canAction("shipments", "create"));
  const canUpdate = useERPStore((s) => s.canAction("shipments", "update"));
  const canDelete = useERPStore((s) => s.canAction("shipments", "delete"));

  // Options state
  const [shippingLines, setShippingLines] = useState([]);
  const [containerSizes, setContainerSizes] = useState([]);
  const [containerTypes, setContainerTypes] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentChecklist, setDocumentChecklist] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [exporterCompanies, setExporterCompanies] = useState([]);
  const [notificationUsers, setNotificationUsers] = useState([]);

  // List state
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [statusFilter, setStatusFilter] = useState("all");
  const [containerTypeFilter, setContainerTypeFilter] = useState("all");
  const [containerSizeFilter, setContainerSizeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Detail drawer
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create/edit form
  const [newShipmentOpen, setNewShipmentOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [entryMode, setEntryMode] = useState("automatic");
  const [trackingFetchState, setTrackingFetchState] = useState("idle");
  const [trackingFetchMessage, setTrackingFetchMessage] = useState("");
  const lastAutomaticLookup = useRef("");

  // Delete
  const [deleteShipmentObj, setDeleteShipmentObj] = useState(null);

  // Form state (shared for create & edit)
  const [newForm, setNewForm] = useState({
    blNumber: "", invoiceNumber: "", shippingLine: "",
    vesselName: "", etd: "", eta: "",
    originCountry: "", originPort: "", destinationPort: "",
    status: "draft",
    companyId: "", exporterCompanyId: "",
    goodsDescription: "", notes: "", internalNotes: "",
    requiredDocumentIds: [], notificationUserIds: [], containers: [],
  });

  // ─── Fetch options ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [lines, sizes, types, docs, checklist, comps, exps, users] = await Promise.all([
          fetch("/api/settings/options?category=shipping_line").then((r) => r.json()),
          fetch("/api/settings/options?category=container_size").then((r) => r.json()),
          fetch("/api/settings/options?category=container_type").then((r) => r.json()),
          fetch("/api/settings/options?category=document_type").then((r) => r.json()),
          fetch("/api/shipment-documents/checklist-types").then((r) => r.json()),
          fetch("/api/companies?companyType=importer").then((r) => r.json()),
          fetch("/api/exporter-companies").then((r) => r.json()),
          fetch("/api/shipments/notification-users").then((r) => r.json()),
        ]);
        if (lines.data) setShippingLines(lines.data.map((d) => d.label));
        if (sizes.data) setContainerSizes(sizes.data.map((d) => d.label));
        if (types.data) setContainerTypes(types.data.map((d) => d.label));
        if (docs.data) setDocumentTypes(docs.data.map((d) => d.label));
        if (checklist.data) setDocumentChecklist(checklist.data.filter((i) => i.isActive));
        if (comps.data) setCompanies(comps.data);
        if (exps.data) setExporterCompanies(exps.data);
        if (users.data) setNotificationUsers(users.data);
      } catch (err) { console.error("Failed to fetch options:", err); }
    };
    fetchOptions();
  }, []);

  // ─── Carrier tracking ────────────────────────────────────────────────
  const fetchTrackingDetails = useCallback(async (blNumber, shippingLine) => {
    const trackingNumber = String(blNumber || "").trim().toUpperCase();
    if (!trackingNumber || !shippingLine) return;
    setTrackingFetchState("loading");
    setTrackingFetchMessage("Fetching shipment details from the carrier...");
    try {
      const res = await fetch("/api/shipments/tracking/lookup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, shippingLine }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Carrier tracking request failed");
      const details = payload.data || {};
      if (details.error) throw new Error([details.error, "Continue by entering the shipment details manually."].filter(Boolean).join(" "));
      setNewForm((cur) => ({
        ...cur,
        blNumber: trackingNumber,
        vesselName: details.vesselName || cur.vesselName,
        etd: dateInputValue(details.etd) || cur.etd,
        eta: dateInputValue(details.eta) || cur.eta,
        originCountry: details.originCountry || cur.originCountry,
        originPort: details.originPort || details.origin || cur.originPort,
        destinationPort: details.destinationPort || details.destination || cur.destinationPort,
        status: shipmentStatusFromCarrier([details.status, details.lastEvent].filter(Boolean).join(" ")),
        containers: details.containers?.length > 0
          ? details.containers.map((c) => ({
              containerNumber: c.containerNumber || "", size: c.containerSize || c.size || "20FT",
              type: c.containerType || c.type || "Dry Container",
              currentWeight: c.currentWeight || c.weight || c.grossWeight || "",
              packageCount: c.packageCount || c.nos || c.packages || "",
              measurementType: (c.packageCount || c.nos || c.packages) && !(c.currentWeight || c.weight || c.grossWeight) ? "nos" : "weight",
              goodsDescription: c.goodsDescription || c.containerGoods || "",
            }))
          : cur.containers,
      }));
      setTrackingFetchState("success");
      setTrackingFetchMessage(details.lastEvent ? `Fetched successfully. Latest: ${details.lastEvent}` : "Shipment details fetched successfully.");
    } catch (error) {
      setTrackingFetchState("error");
      setTrackingFetchMessage(String(error.message || error));
      toast({ title: "Tracking lookup failed", description: String(error.message || error), variant: "destructive" });
    }
  }, []);

  // Auto-fetch on BL/shipping line change
  useEffect(() => {
    if (!newShipmentOpen || editingId || entryMode !== "automatic" || !newForm.blNumber.trim() || !carrierSupported(newForm.shippingLine)) return;
    const lookupKey = `${newForm.shippingLine}:${newForm.blNumber.trim().toUpperCase()}`;
    if (lastAutomaticLookup.current === lookupKey) return;
    const timeout = setTimeout(() => {
      lastAutomaticLookup.current = lookupKey;
      void fetchTrackingDetails(newForm.blNumber, newForm.shippingLine);
    }, 700);
    return () => clearTimeout(timeout);
  }, [newShipmentOpen, editingId, entryMode, newForm.blNumber, newForm.shippingLine, fetchTrackingDetails]);

  // ─── Fetch shipments ─────────────────────────────────────────────────
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (containerTypeFilter !== "all") params.set("containerType", containerTypeFilter);
      if (containerSizeFilter !== "all") params.set("containerSize", containerSizeFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/shipments?${params}`);
      const json = await res.json();
      setShipments(json.data || []);
      setTotalCount(json.pagination?.total || 0);
    } catch (e) {
      toast({ title: "Shipments could not load", description: e.message || "Please refresh.", variant: "destructive" });
    } finally { setLoading(false); }
  }, [page, statusFilter, containerTypeFilter, containerSizeFilter, searchQuery]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  // ─── Detail ───────────────────────────────────────────────────────────
  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const res = await fetch(`/api/shipments/${id}`);
      const json = await res.json();
      setSelectedShipment(json.data);
    } catch (e) {
      toast({ title: "Shipment details could not load", description: e.message || "Please try again.", variant: "destructive" });
    } finally { setDetailLoading(false); }
  };

  // ─── Create / Edit ────────────────────────────────────────────────────
  const openEdit = (shipment) => {
    const defaultDocIds = documentChecklist.filter((i) => i.isRequired).map((i) => i.id);
    setEditingId(shipment.id);
    setNewForm({
      blNumber: shipment.blNumber || "",
      invoiceNumber: shipment.invoiceNumber || (Array.isArray(shipment.invoices) ? shipment.invoices[0]?.invoiceNumber : "") || "",
      shippingLine: shipment.shippingLine || "",
      vesselName: shipment.vesselName || "",
      etd: shipment.etd ? new Date(shipment.etd).toISOString().slice(0, 10) : "",
      eta: shipment.eta ? new Date(shipment.eta).toISOString().slice(0, 10) : "",
      originCountry: shipment.originCountry || "",
      originPort: shipment.originPort || "",
      destinationPort: shipment.destinationPort || "",
      status: shipment.status || "draft",
      companyId: shipment.company?.id || shipment.companyId || "",
      exporterCompanyId: shipment.exporterCompany?.id || shipment.exporterCompanyId || "",
      goodsDescription: shipment.goodsDescription || "",
      notes: shipment.notes || "",
      internalNotes: shipment.internalNotes || "",
      requiredDocumentIds: defaultDocIds,
      notificationUserIds: Array.isArray(shipment.notificationUserIds) ? shipment.notificationUserIds : [],
      containers: Array.isArray(shipment.containers) ? shipment.containers.map((c) => ({
        containerNumber: c.containerNumber || "", size: c.containerSize || c.size || "20FT",
        type: c.containerType || c.type || "Dry Container",
        currentWeight: c.currentWeight || "", packageCount: c.packageCount || "",
        measurementType: c.packageCount && !c.currentWeight ? "nos" : "weight",
        goodsDescription: c.goodsDescription || "",
      })) : [],
    });
    setEntryMode("manual");
    setTrackingFetchState("idle");
    setTrackingFetchMessage("");
    lastAutomaticLookup.current = "";
    setNewShipmentOpen(true);
    setDetailOpen(false);
    fetch(`/api/shipment-documents/shipment/${shipment.id}/checklist`)
      .then((r) => r.json()).then((json) => {
        if (!Array.isArray(json.data)) return;
        const selected = json.data.filter((i) => i.document).map((i) => i.checklistId);
        setNewForm((cur) => ({ ...cur, requiredDocumentIds: selected }));
      }).catch(() => {});
  };

  const openCreate = useCallback(() => {
    setEditingId(null);
    setEntryMode("automatic");
    setTrackingFetchState("idle");
    setTrackingFetchMessage("");
    lastAutomaticLookup.current = "";
    setNewForm({
      blNumber: "", invoiceNumber: "", shippingLine: "",
      vesselName: "", etd: "", eta: "",
      originCountry: "", originPort: "", destinationPort: "",
      status: "draft", companyId: "", exporterCompanyId: "",
      goodsDescription: "", notes: "", internalNotes: "",
      requiredDocumentIds: documentChecklist.filter((i) => i.isRequired).map((i) => i.id),
      notificationUserIds: [], containers: [],
    });
    setDetailOpen(false);
    setNewShipmentOpen(true);
  }, [documentChecklist]);

  // Handle ?new=1 query param
  useEffect(() => {
    const shouldOpen = searchParams.get("new") === "1" || searchParams.get("new") === "shipment" || searchParams.get("action") === "new";
    if (!shouldOpen) return;
    if (canCreate) { openCreate(); } else { toast({ title: "Permission denied", description: "You do not have create permission.", variant: "destructive" }); }
    router.replace(pathname, { scroll: false });
  }, [canCreate, openCreate, pathname, router, searchParams]);

  // ─── Save ────────────────────────────────────────────────────────────
  const isFormValid = () => {
    if (!newForm.companyId || !newForm.exporterCompanyId) return false;
    if (!newForm.blNumber?.trim() || !newForm.invoiceNumber?.trim()) return false;
    if (!newForm.shippingLine?.trim() || !newForm.vesselName?.trim()) return false;
    if (!newForm.etd || !newForm.eta) return false;
    if (!newForm.originCountry?.trim() || !newForm.originPort?.trim() || !newForm.destinationPort?.trim()) return false;
    for (const c of newForm.containers) {
      if (!c.containerNumber?.trim()) return false;
      if (!(c.containerSize || c.size)) return false;
      if (!(c.containerType || c.type)) return false;
    }
    return true;
  };

  const saveShipment = async () => {
    try {
      const url = editingId ? `/api/shipments/${editingId}` : "/api/shipments";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newForm,
          invoiceNumber: newForm.invoiceNumber?.trim() || null,
          etd: newForm.etd || null, eta: newForm.eta || null,
          requiredDocumentIds: editingId ? newForm.requiredDocumentIds
            : newForm.requiredDocumentIds.length ? newForm.requiredDocumentIds
            : documentChecklist.filter((i) => i.isRequired).map((i) => i.id),
          containers: newForm.containers.map((c) => ({
            ...c,
            containerSize: c.containerSize || c.size,
            containerType: c.containerType || c.type,
            currentWeight: parseFloat(c.currentWeight) || 0,
            packageCount: parseInt(c.packageCount) || 0,
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to save shipment");
      setNewShipmentOpen(false);
      setEditingId(null);
      setEntryMode("automatic");
      setTrackingFetchState("idle");
      setTrackingFetchMessage("");
      lastAutomaticLookup.current = "";
      setNewForm({ blNumber: "", invoiceNumber: "", shippingLine: "", vesselName: "", etd: "", eta: "", originCountry: "", originPort: "", destinationPort: "", status: "draft", companyId: "", exporterCompanyId: "", goodsDescription: "", notes: "", internalNotes: "", requiredDocumentIds: [], notificationUserIds: [], containers: [] });
      fetchShipments();
      toast({ title: editingId ? "Shipment updated" : "Shipment created", description: json.data?.shipmentNumber ? `${json.data.shipmentNumber} saved successfully.` : "Saved." });
    } catch (e) {
      toast({ title: "Could not save", description: e.message || "Please check details.", variant: "destructive" });
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────
  const deleteShipment = async (shipment) => {
    if (!shipment) return;
    if (!canDelete) { toast({ title: "Permission denied", variant: "destructive" }); return; }
    try {
      const res = await fetch(`/api/shipments/${shipment.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to delete");
      setShipments((cur) => cur.filter((i) => i.id !== shipment.id));
      setTotalCount((cur) => Math.max(0, cur - 1));
      if (selectedShipment?.id === shipment.id) { setDetailOpen(false); setSelectedShipment(null); }
      fetchShipments();
      toast({ title: "Shipment deleted", description: `${shipment.shipmentNumber} removed.` });
    } catch (e) {
      toast({ title: "Could not delete", description: e.message, variant: "destructive" });
    }
  };

  // ─── Derived state ───────────────────────────────────────────────────
  const statusCounts = React.useMemo(() => {
    const counts = {};
    shipments.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, [shipments]);

  const kpis = [
    { label: "Total", value: totalCount || 0, icon: Ship },
    { label: "Active", value: (statusCounts.booking_confirmed || 0) + (statusCounts.at_pol || 0) + (statusCounts.vessel_departed || 0) + (statusCounts.in_transit || 0) + (statusCounts.at_pod || 0) + (statusCounts.customs_clearance || 0) + (statusCounts.in_transport || 0), icon: Truck },
    { label: "In Transit", value: statusCounts.in_transit || 0, icon: Anchor },
    { label: "Delivered", value: statusCounts.delivered || 0, icon: PackageCheck },
  ];
  const isDelayed = (s) => s.eta && new Date(s.eta) < new Date() && !["delivered", "closed"].includes(s.status);
  const delayed = shipments.filter(isDelayed).length;
  if (delayed > 0) kpis.push({ label: "Delayed", value: delayed, icon: AlertCircle });

  // ─── Container management helpers ────────────────────────────────────
  const addContainer = () => setNewForm((cur) => ({ ...cur, containers: [...cur.containers, { containerNumber: "", size: "20FT", type: "Dry Container", currentWeight: "", packageCount: "", measurementType: "weight", goodsDescription: "" }] }));
  const removeContainer = (i) => setNewForm((cur) => ({ ...cur, containers: cur.containers.filter((_, idx) => idx !== i) }));
  const updateContainer = (i, field, value) => setNewForm((cur) => {
    const updated = [...cur.containers];
    updated[i] = { ...updated[i], [field]: value };
    return { ...cur, containers: updated };
  });

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-5">
        <PageHeader icon={Ship} title="Shipments" description="Track and manage all import and export shipments">
          <Button variant="outline" size="sm" className="h-9">Export</Button>
          {canCreate && <Button size="sm" className="h-9" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" />New Shipment</Button>}
        </PageHeader>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <StatCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} compact className="p-3" />
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search shipment, BL, booking..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="h-9 pl-9 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-full sm:w-[170px] text-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={containerTypeFilter} onValueChange={(v) => { setContainerTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-full sm:w-[150px] text-sm"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {containerTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={containerSizeFilter} onValueChange={(v) => { setContainerSizeFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-full sm:w-[150px] text-sm"><SelectValue placeholder="All Sizes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {containerSizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border p-0.5">
                  <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => setViewMode("table")}>
                    <List className="h-3.5 w-3.5 mr-1" />Table
                  </Button>
                  <Button variant={viewMode === "kanban" ? "secondary" : "ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => setViewMode("kanban")}>
                    <LayoutGrid className="h-3.5 w-3.5 mr-1" />Kanban
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {kanbanColumns.map((status) => {
            const count = statusCounts[status] || 0;
            if (statusFilter !== "all" && statusFilter !== status) return null;
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => { setStatusFilter(isActive ? "all" : status); setPage(1); }}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  isActive ? "bg-primary/10 text-primary border-primary/20" : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <StatusBadge status={status} dot={false} className="border-0 px-0 text-xs" />
                <span className={cn("inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums", isActive ? "bg-primary/15" : "bg-muted text-muted-foreground")}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <Card><CardContent className="p-5"><TableSkeleton rows={8} cols={6} /></CardContent></Card>
        ) : viewMode === "table" ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Shipment</th>
                    <th className="hidden px-4 py-3 font-semibold md:table-cell">Booking / BL</th>
                    <th className="hidden px-4 py-3 font-semibold lg:table-cell">Shipping Line</th>
                    <th className="px-4 py-3 font-semibold">Route</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">ETD / ETA</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {shipments.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState icon={Inbox} title="No shipments found" description="Try adjusting your search or filters, or create a new shipment." compact className="py-16" />
                      </td>
                    </tr>
                  ) : shipments.map((s, i) => (
                    <tr
                      key={s.id}
                      onClick={() => openDetail(s.id)}
                      className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                            <Ship className="h-4 w-4" strokeWidth={1.8} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{s.shipmentNumber}</p>
                            <div className="text-[10px] text-muted-foreground leading-tight">
                              {s.company && <span>I: {s.company.name}</span>}
                              {s.exporterCompany && <span className="ml-1.5">E: {s.exporterCompany.name}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <p className="text-xs text-foreground">{s.bookingNumber || "—"}</p>
                        <p className="text-[11px] text-muted-foreground">{s.blNumber || "—"}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-xs lg:table-cell">{s.shippingLine || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-medium text-foreground">{s.originPort || "?"}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-foreground">{s.destinationPort || "?"}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-xs text-foreground">{s.etd ? format(new Date(s.etd), "MMM d") : "—"}</p>
                        <p className={cn("text-[11px]", isDelayed(s) ? "text-danger" : "text-muted-foreground")}>
                          {s.eta ? format(new Date(s.eta), "MMM d") : "—"}
                          {isDelayed(s) && " (late)"}
                        </p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => openDetail(s.id)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                              {canUpdate && <DropdownMenuItem onClick={() => openEdit(s)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>}
                              {canDelete && <DropdownMenuSeparator />}
                              {canDelete && <DropdownMenuItem onClick={() => setDeleteShipmentObj(s)} className="text-danger"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-8 text-xs gap-1">
                    <ArrowRight className="h-3.5 w-3.5 rotate-180" />Prev
                  </Button>
                  <span className="px-2 text-xs font-semibold tabular-nums text-muted-foreground">{page} / {Math.max(1, Math.ceil(totalCount / 20))}</span>
                  <Button variant="outline" size="sm" disabled={page * 20 >= totalCount} onClick={() => setPage(page + 1)} className="h-8 text-xs gap-1">
                    Next<ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : (
          /* Kanban View */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {kanbanColumns.map((status) => {
              const items = shipments.filter((s) => statusFilter === "all" ? s.status === status : s.status === statusFilter);
              if (items.length === 0 && statusFilter !== "all") return null;
              return (
                <div key={status} className="min-w-[260px] flex-1">
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <StatusBadge status={status} />
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => openDetail(s.id)}
                        className="cursor-pointer rounded-lg border bg-card p-3 shadow-xs transition-all hover:border-primary/20 hover:shadow-sm"
                      >
                        <div className="mb-1.5">
                          <span className="text-sm font-semibold text-foreground">{s.shipmentNumber}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Globe className="h-3 w-3" />
                          <span>{s.originPort || "?"}</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                          <span>{s.destinationPort || "?"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>ETA: {s.eta ? format(new Date(s.eta), "MMM d") : "—"}</span>
                        </div>
                        <div className="mt-1.5 text-xs text-muted-foreground truncate">
                          {s.company?.name || s.exporterCompany?.name || ""}
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && statusFilter === "all" && (
                      <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No {statusLabelMap[status]} shipments</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Detail Modal ───────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="w-full sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl">{selectedShipment?.shipmentNumber || "Shipment Details"}</DialogTitle>
                {selectedShipment && (
                  <StatusBadge status={selectedShipment.status} />
                )}
              </div>
            </div>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4">
              <div className="animate-shimmer h-6 w-48 rounded-lg" />
              <div className="animate-shimmer h-20 w-full rounded-lg" />
              <div className="animate-shimmer h-20 w-full rounded-lg" />
            </div>
          ) : selectedShipment ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="containers" className="text-xs">Containers ({selectedShipment.containers?.length || 0})</TabsTrigger>
                <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Identifiers */}
                  <div className="rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-primary">
                      <FileText className="h-4 w-4" />
                      <h4 className="text-sm font-semibold tracking-tight">Identifiers</h4>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">BL Number</span><span className="font-medium text-foreground">{selectedShipment.blNumber || "—"}</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Booking</span><span className="font-medium text-foreground">{selectedShipment.bookingNumber || "—"}</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Invoice</span><span className="font-medium text-foreground">{selectedShipment.invoiceNumber || "—"}</span></div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-primary">
                      <MapPin className="h-4 w-4" />
                      <h4 className="text-sm font-semibold tracking-tight">Route</h4>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex flex-col gap-0.5 text-sm"><span className="text-[11px] font-medium uppercase text-muted-foreground">Origin</span><span className="font-medium text-foreground">{selectedShipment.originPort || "—"} {selectedShipment.originCountry ? `(${selectedShipment.originCountry})` : ""}</span></div>
                      <div className="flex flex-col gap-0.5 text-sm"><span className="text-[11px] font-medium uppercase text-muted-foreground">Destination</span><span className="font-medium text-foreground">{selectedShipment.destinationPort || "—"}</span></div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="h-4 w-4" />
                      <h4 className="text-sm font-semibold tracking-tight">Schedule</h4>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">ETD</span><span className="font-medium text-foreground">{selectedShipment.etd ? format(new Date(selectedShipment.etd), "MMM d, yyyy") : "—"}</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">ETA</span><span className="font-medium text-foreground">{selectedShipment.eta ? format(new Date(selectedShipment.eta), "MMM d, yyyy") : "—"}</span></div>
                    </div>
                  </div>

                  {/* Carrier */}
                  <div className="rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Ship className="h-4 w-4" />
                      <h4 className="text-sm font-semibold tracking-tight">Carrier</h4>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Shipping Line</span><span className="font-medium text-foreground">{selectedShipment.shippingLine || "—"}</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Vessel</span><span className="font-medium text-foreground">{selectedShipment.vesselName || "—"}</span></div>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm flex flex-col gap-3 md:col-span-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Building2 className="h-4 w-4" />
                      <h4 className="text-sm font-semibold tracking-tight">Parties</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 text-sm bg-muted/20 border border-border/40 p-3 rounded-lg"><span className="text-[11px] font-medium uppercase text-muted-foreground">Importer</span><span className="font-medium text-foreground">{selectedShipment.company?.name || "—"}</span></div>
                      <div className="flex flex-col gap-1 text-sm bg-muted/20 border border-border/40 p-3 rounded-lg"><span className="text-[11px] font-medium uppercase text-muted-foreground">Exporter</span><span className="font-medium text-foreground">{selectedShipment.exporterCompany?.name || "—"}</span></div>
                    </div>
                  </div>
                </div>

                {(selectedShipment.goodsDescription || selectedShipment.notes) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedShipment.goodsDescription && (
                      <div className="rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary mb-1">
                          <Box className="h-4 w-4" />
                          <h4 className="text-sm font-semibold tracking-tight">Goods Description</h4>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">{selectedShipment.goodsDescription}</p>
                      </div>
                    )}
                    {selectedShipment.notes && (
                      <div className="rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary mb-1">
                          <FileText className="h-4 w-4" />
                          <h4 className="text-sm font-semibold tracking-tight">Notes</h4>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">{selectedShipment.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="containers">
                {selectedShipment.containers?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedShipment.containers.map((c, i) => (
                      <div key={i} className="rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-foreground">{c.containerNumber || "—"}</span>
                          <StatusBadge status={c.status || "active"} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-muted-foreground">Type: <span className="text-foreground font-medium">{c.containerType || c.type || "—"}</span></span>
                          <span className="text-muted-foreground">Size: <span className="text-foreground font-medium">{c.containerSize || c.size || "—"}</span></span>
                          <span className="text-muted-foreground">Weight: <span className="text-foreground font-medium">{c.currentWeight || "—"}</span></span>
                          <span className="text-muted-foreground">Seal: <span className="text-foreground font-medium">{c.sealNumber || "—"}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Box} title="No containers" description="No containers linked to this shipment." compact />
                )}
              </TabsContent>

              <TabsContent value="documents">
                <EmptyState icon={FileText} title="No documents" description="Documents will appear here once uploaded." compact />
              </TabsContent>
            </Tabs>
          ) : null}

          <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
            {canUpdate && (
              <Button variant="outline" size="sm" onClick={() => selectedShipment && openEdit(selectedShipment)}>
                <Pencil className="mr-1.5 h-4 w-4" />Edit
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Create / Edit Dialog ───────────────────────────────── */}
      <Dialog open={newShipmentOpen} onOpenChange={(open) => { if (!open) { setNewShipmentOpen(false); setEditingId(null); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Shipment" : "Create New Shipment"}</DialogTitle>
            <DialogDescription>{editingId ? "Update shipment details." : "Register a new import or export shipment."}</DialogDescription>
          </DialogHeader>

          {/* Entry mode selector (for new shipments) */}
          {!editingId && (
            <div className="flex gap-2">
              <Button variant={entryMode === "automatic" ? "default" : "outline"} size="sm" onClick={() => setEntryMode("automatic")} className="h-8 text-xs">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Auto-fetch from Carrier
              </Button>
              <Button variant={entryMode === "manual" ? "default" : "outline"} size="sm" onClick={() => setEntryMode("manual")} className="h-8 text-xs">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />Manual Entry
              </Button>
            </div>
          )}

          {/* Tracking status */}
          {trackingFetchState !== "idle" && (
            <div className={cn("rounded-lg border px-3 py-2 text-xs", trackingFetchState === "loading" && "border-info/20 bg-info/5 text-info", trackingFetchState === "success" && "border-success/20 bg-success/5 text-success", trackingFetchState === "error" && "border-danger/20 bg-danger/5 text-danger")}>
              {trackingFetchState === "loading" && <Loader2 className="mr-1.5 inline h-3 w-3 animate-spin" />}
              {trackingFetchMessage}
            </div>
          )}

          <div className="space-y-5">
            {/* Parties */}
            <div>
              <SectionHeader title="Parties" />
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Importer Company <span className="text-danger">*</span></Label>
                  <Select value={newForm.companyId} onValueChange={(v) => setNewForm((c) => ({ ...c, companyId: v }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select importer" /></SelectTrigger>
                    <SelectContent>{companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Exporter Company <span className="text-danger">*</span></Label>
                  <Select value={newForm.exporterCompanyId} onValueChange={(v) => setNewForm((c) => ({ ...c, exporterCompanyId: v }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select exporter" /></SelectTrigger>
                    <SelectContent>{exporterCompanies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Shipment Details */}
            <div>
              <SectionHeader title="Shipment Details" />
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">BL Number <span className="text-danger">*</span></Label>
                  <Input className="h-9 text-sm" value={newForm.blNumber} onChange={(e) => setNewForm((c) => ({ ...c, blNumber: e.target.value }))} placeholder="e.g. MSCU1234567" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Invoice Number <span className="text-danger">*</span></Label>
                  <Input className="h-9 text-sm" value={newForm.invoiceNumber} onChange={(e) => setNewForm((c) => ({ ...c, invoiceNumber: e.target.value }))} placeholder="e.g. INV-2024-001" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Shipping Line <span className="text-danger">*</span></Label>
                  <Select value={newForm.shippingLine} onValueChange={(v) => setNewForm((c) => ({ ...c, shippingLine: v }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select line" /></SelectTrigger>
                    <SelectContent>{shippingLines.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Vessel Name <span className="text-danger">*</span></Label>
                  <Input className="h-9 text-sm" value={newForm.vesselName} onChange={(e) => setNewForm((c) => ({ ...c, vesselName: e.target.value }))} placeholder="e.g. MSC DIANA" />
                </div>

              </div>
            </div>

            {/* Route & Schedule */}
            <div>
              <SectionHeader title="Route & Schedule" />
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Origin Country <span className="text-danger">*</span></Label>
                  <Input className="h-9 text-sm" value={newForm.originCountry} onChange={(e) => setNewForm((c) => ({ ...c, originCountry: e.target.value }))} placeholder="e.g. China" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Origin Port <span className="text-danger">*</span></Label>
                  <Input className="h-9 text-sm" value={newForm.originPort} onChange={(e) => setNewForm((c) => ({ ...c, originPort: e.target.value }))} placeholder="e.g. Shanghai" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Destination Port <span className="text-danger">*</span></Label>
                  <Input className="h-9 text-sm" value={newForm.destinationPort} onChange={(e) => setNewForm((c) => ({ ...c, destinationPort: e.target.value }))} placeholder="e.g. Mundra" />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs">ETD <span className="text-danger">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-9 px-3 text-sm",
                          !newForm.etd && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {newForm.etd ? format(new Date(newForm.etd), "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarUI
                        mode="single"
                        selected={newForm.etd ? new Date(newForm.etd) : undefined}
                        onSelect={(date) => setNewForm((c) => ({ ...c, etd: date ? format(date, "yyyy-MM-dd") : "" }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">ETA <span className="text-danger">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-9 px-3 text-sm",
                          !newForm.eta && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {newForm.eta ? format(new Date(newForm.eta), "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarUI
                        mode="single"
                        selected={newForm.eta ? new Date(newForm.eta) : undefined}
                        onSelect={(date) => setNewForm((c) => ({ ...c, eta: date ? format(date, "yyyy-MM-dd") : "" }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Containers */}
            <div>
              <SectionHeader title="Containers" badge={String(newForm.containers.length)}>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addContainer}><Plus className="mr-1 h-3.5 w-3.5" />Add</Button>
              </SectionHeader>
              <div className="mt-3 space-y-2">
                {newForm.containers.map((container, i) => (
                  <div key={i} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">Container #{i + 1}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-danger" onClick={() => removeContainer(i)}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="grid gap-1">
                        <Label className="text-[10px]">Number <span className="text-danger">*</span></Label>
                        <Input className="h-8 text-xs" placeholder="MSCU1234567" value={container.containerNumber} onChange={(e) => updateContainer(i, "containerNumber", e.target.value)} />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-[10px]">Size & Type <span className="text-danger">*</span></Label>
                        <Select value={`${container.size || ""}|||${container.type || ""}`} onValueChange={(v) => {
                          const [s, t] = v.split("|||");
                          setNewForm((cur) => {
                            const updated = [...cur.containers];
                            updated[i] = { ...updated[i], size: s, type: t };
                            return { ...cur, containers: updated };
                          });
                        }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {containerSizes.flatMap((s) => containerTypes.map((t) => (
                              <SelectItem key={`${s}|||${t}`} value={`${s}|||${t}`}>{`${s} - ${t}`}</SelectItem>
                            )))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-[10px]">Weight</Label>
                        <Input type="number" className="h-8 text-xs" placeholder="kg" value={container.currentWeight} onChange={(e) => updateContainer(i, "currentWeight", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                {newForm.containers.length === 0 && (
                  <button onClick={addContainer} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
                    <Plus className="h-4 w-4" />Add Container
                  </button>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <SectionHeader title="Additional" />
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Goods Description</Label>
                  <textarea className="min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" value={newForm.goodsDescription} onChange={(e) => setNewForm((c) => ({ ...c, goodsDescription: e.target.value }))} placeholder="Describe the goods..." />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Notes</Label>
                  <textarea className="min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" value={newForm.notes} onChange={(e) => setNewForm((c) => ({ ...c, notes: e.target.value }))} placeholder="Additional notes..." />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setNewShipmentOpen(false)}>Cancel</Button>
            {editingId && <Button variant="outline" onClick={() => { setNewShipmentOpen(false); setEditingId(null); }}>Discard</Button>}
            <Button onClick={saveShipment} disabled={!isFormValid()}>
              <Save className="mr-1.5 h-4 w-4" />{editingId ? "Update Shipment" : "Create Shipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ──────────────────────────────── */}
      <ConfirmDeleteDialog
        open={!!deleteShipmentObj}
        onOpenChange={(open) => { if (!open) setDeleteShipmentObj(null); }}
        title="Delete Shipment"
        description={`Are you sure you want to delete ${deleteShipmentObj?.shipmentNumber || "this shipment"}? This action cannot be undone.`}
        onConfirm={() => { if (deleteShipmentObj) { const s = deleteShipmentObj; setDeleteShipmentObj(null); deleteShipment(s); } }}
      />
    </>
  );
}
