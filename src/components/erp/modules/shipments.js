"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ship,
  Search,
  Plus,
  Eye,
  LayoutGrid,
  List,
  MapPin,
  Clock,
  Package,
  FileText,
  DollarSign,
  ArrowRight,
  X,
  Globe,
  Pencil,
  Building2,
  RefreshCw,
  Loader2,
  WandSparkles,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useERPStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
// ─── Constants ────────────────────────────────────────────────────────────────
const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "booking_confirmed", label: "Booking Confirmed" },
  { value: "at_pol", label: "At POL" },
  { value: "vessel_departed", label: "Vessel Departed" },
  { value: "in_transit", label: "In Transit" },
  { value: "at_pod", label: "At POD" },
  { value: "customs_clearance", label: "Customs Clearance" },
  { value: "duty_paid", label: "Duty Paid" },
  { value: "in_transport", label: "In Transport" },
  { value: "offloaded", label: "Offloaded" },
  { value: "delivered", label: "Delivered" },
  { value: "closed", label: "Closed" },
];
const PRIORITIES = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];
// Options fetched from database API now
const statusLabelMap = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.label]),
);
const statusColorMap = {
  draft:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  booking_confirmed:
    "bg-teal/10 text-teal-dark border-teal/20 dark:bg-teal/20 dark:text-teal-light",
  at_pol:
    "bg-amber/10 text-amber-dark border-amber/20 dark:bg-amber/20 dark:text-amber-light",
  vessel_departed:
    "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800",
  in_transit:
    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800",
  at_pod:
    "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
  customs_clearance:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  duty_paid:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  in_transport:
    "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
  offloaded:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  delivered:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  closed:
    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};
const statusDotMap = {
  draft: "bg-slate-400",
  booking_confirmed: "bg-teal",
  at_pol: "bg-amber",
  vessel_departed: "bg-cyan-500",
  in_transit: "bg-sky-500",
  at_pod: "bg-violet-500",
  customs_clearance: "bg-orange-500",
  duty_paid: "bg-emerald-500",
  in_transport: "bg-pink-500",
  offloaded: "bg-rose-500",
  delivered: "bg-green-500",
  closed: "bg-gray-500",
};
const priorityColorMap = {
  urgent:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  high: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  normal:
    "bg-teal/10 text-teal-dark border-teal/20 dark:bg-teal/20 dark:text-teal-light",
  low: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};
const currencyFmt = (val, cur = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
const dateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};
const shipmentStatusFromCarrier = (status) => {
  const value = String(status || "").toLowerCase();
  if (value.includes("delivered") || value.includes("empty received"))
    return "delivered";
  if (value.includes("transship")) return "in_transit";
  if (
    value.includes("arrived") ||
    value.includes("discharge") ||
    value.includes("import to consignee")
  )
    return "at_pod";
  if (
    value.includes("depart") ||
    value.includes("in transit") ||
    value.includes("loaded on vessel")
  )
    return "in_transit";
  if (value.includes("gate in") || value.includes("export received"))
    return "at_pol";
  return "booking_confirmed";
};
const carrierSupported = (shippingLine) => {
  const value = String(shippingLine || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return (
    value.includes("maersk") ||
    value.includes("mersk") ||
    value.includes("msc") ||
    value.includes("mediterraneanshipping") ||
    value.includes("evergreen") ||
    value.includes("shipmentlink")
  );
};
// ─── Main Component ───────────────────────────────────────────────────────────
export default function ShipmentsModule() {
  var _a, _b, _c, _d, _e;
  const canCreateShipments = useERPStore((state) => state.canAction("shipments", "create"));
  const canUpdateShipments = useERPStore((state) => state.canAction("shipments", "update"));
  const canDeleteShipments = useERPStore((state) => state.canAction("shipments", "delete"));
  const [shippingLines, setShippingLines] = useState([]);
  const [containerSizes, setContainerSizes] = useState([]);
  const [containerTypes, setContainerTypes] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentChecklist, setDocumentChecklist] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [exporterCompanies, setExporterCompanies] = useState([]);
  const [notificationUsers, setNotificationUsers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  // Detail dialog
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  // New / Edit shipment dialog
  const [newShipmentOpen, setNewShipmentOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newForm, setNewForm] = useState({
    blNumber: "",
    shippingLine: "",
    freightForwarder: "",
    vesselName: "",
    voyageNumber: "",
    etd: "",
    eta: "",
    originCountry: "",
    originPort: "",
    destinationPort: "",
    priority: "normal",
    status: "draft",
    shipmentValue: "",
    currency: "USD",
    companyId: "",
    exporterCompanyId: "",
    goodsDescription: "",
    notes: "",
    internalNotes: "",
    requiredDocumentIds: [],
    notificationUserIds: [],
    containers: [],
  });
  const [entryMode, setEntryMode] = useState("automatic");
  const [trackingFetchState, setTrackingFetchState] = useState("idle");
  const [trackingFetchMessage, setTrackingFetchMessage] = useState("");
  const lastAutomaticLookup = useRef("");
  // Document upload state
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    name: "",
    documentType: "",
  });
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [lines, sizes, types, docs, checklist, comps, exps, users] =
          await Promise.all([
            fetch("/api/settings/options?category=shipping_line").then((r) =>
              r.json(),
            ),
            fetch("/api/settings/options?category=container_size").then((r) =>
              r.json(),
            ),
            fetch("/api/settings/options?category=container_type").then((r) =>
              r.json(),
            ),
            fetch("/api/settings/options?category=document_type").then((r) =>
              r.json(),
            ),
            fetch("/api/shipment-documents/checklist-types").then((r) =>
              r.json(),
            ),
            fetch("/api/companies?companyType=importer").then((r) => r.json()),
            fetch("/api/exporter-companies").then((r) => r.json()),
            fetch("/api/shipments/notification-users").then((r) => r.json()),
          ]);
        if (lines.data) setShippingLines(lines.data.map((d) => d.label));
        if (sizes.data) setContainerSizes(sizes.data.map((d) => d.label));
        if (types.data) setContainerTypes(types.data.map((d) => d.label));
        if (docs.data) setDocumentTypes(docs.data.map((d) => d.label));
        if (checklist.data)
          setDocumentChecklist(checklist.data.filter((item) => item.isActive));
        if (comps.data) setCompanies(comps.data);
        if (exps.data) setExporterCompanies(exps.data);
        if (users.data) setNotificationUsers(users.data);
      } catch (err) {
        console.error("Failed to fetch settings options:", err);
      }
    };
    fetchOptions();
  }, []);
  const fetchTrackingDetails = useCallback(async (blNumber, shippingLine) => {
    const trackingNumber = String(blNumber || "").trim().toUpperCase();
    if (!trackingNumber || !shippingLine) return;
    setTrackingFetchState("loading");
    setTrackingFetchMessage("Fetching shipment details from the carrier...");
    try {
      const response = await fetch("/api/shipments/tracking/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, shippingLine }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Carrier tracking request failed");
      }
      const details = payload.data || {};
      if (details.error) {
        const manualMessage = [
          details.error,
          "Continue by entering the shipment details manually.",
        ].filter(Boolean).join(" ");
        throw new Error(manualMessage);
      }
      setNewForm((current) => ({
        ...current,
        blNumber: trackingNumber,
        vesselName: details.vesselName || current.vesselName,
        voyageNumber: details.voyageNumber || current.voyageNumber,
        etd: dateInputValue(details.etd) || current.etd,
        eta: dateInputValue(details.eta) || current.eta,
        originCountry: details.originCountry || current.originCountry,
        originPort: details.originPort || details.origin || current.originPort,
        destinationPort:
          details.destinationPort || details.destination || current.destinationPort,
        status: shipmentStatusFromCarrier(details.status),
        containers:
          details.containers?.length > 0
            ? details.containers.map((container) => ({
                containerNumber: container.containerNumber || "",
                size: container.containerSize || container.size || "20FT",
                type: container.containerType || container.type || "Dry Container",
                goodsDescription:
                  container.goodsDescription || container.containerGoods || "",
              }))
            : current.containers,
      }));
      setTrackingFetchState("success");
      setTrackingFetchMessage(
        details.lastEvent
          ? `Fetched successfully. Latest: ${details.lastEvent}`
          : "Shipment details fetched successfully.",
      );
      toast({
        title: "Tracking updated",
        description: details.lastEvent
          ? `Latest carrier event: ${details.lastEvent}`
          : "Shipment details were fetched from the carrier.",
      });
    } catch (error) {
      setTrackingFetchState("error");
      setTrackingFetchMessage(String(error.message || error));
      toast({
        title: "Tracking lookup failed",
        description: String(error.message || error),
        variant: "destructive",
      });
    }
  }, []);
  useEffect(() => {
    if (
      !newShipmentOpen ||
      editingId ||
      entryMode !== "automatic" ||
      !newForm.blNumber.trim() ||
      !carrierSupported(newForm.shippingLine)
    ) {
      return;
    }
    const lookupKey = `${newForm.shippingLine}:${newForm.blNumber.trim().toUpperCase()}`;
    if (lastAutomaticLookup.current === lookupKey) return;
    const timeout = setTimeout(() => {
      lastAutomaticLookup.current = lookupKey;
      void fetchTrackingDetails(newForm.blNumber, newForm.shippingLine);
    }, 700);
    return () => clearTimeout(timeout);
  }, [
    newShipmentOpen,
    editingId,
    entryMode,
    newForm.blNumber,
    newForm.shippingLine,
    fetchTrackingDetails,
  ]);
  const fetchShipments = useCallback(async () => {
    var _a;
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.assign(
          Object.assign(
            Object.assign(
              { page: String(page), limit: "20" },
              statusFilter !== "all" && { status: statusFilter },
            ),
            priorityFilter !== "all" && { priority: priorityFilter },
          ),
          searchQuery && { search: searchQuery },
        ),
      );
      const res = await fetch(`/api/shipments?${params}`);
      const json = await res.json();
      setShipments(json.data || []);
      setTotalCount(
        ((_a = json.pagination) === null || _a === void 0
          ? void 0
          : _a.total) || 0,
      );
    } catch (e) {
      console.error(e);
      toast({
        title: "Shipments could not load",
        description: e.message || "Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter, searchQuery]);
  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);
  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const res = await fetch(`/api/shipments/${id}`);
      const json = await res.json();
      setSelectedShipment(json.data);
    } catch (e) {
      console.error(e);
      toast({
        title: "Shipment details could not load",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };
  const handleUploadDocument = async () => {
    if (!selectedShipment || !newDocForm.name || !newDocForm.documentType)
      return;
    setDocUploading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.assign(Object.assign({}, newDocForm), {
            shipmentId: selectedShipment.id,
            fileUrl: `https://storage.example.com/docs/${Date.now()}.pdf`,
            fileType: "application/pdf",
            fileSize: 1024 * 1024,
          }),
        ),
      });
      if (res.ok) {
        // Refresh detail
        await openDetail(selectedShipment.id);
        setUploadDocOpen(false);
        setNewDocForm({ name: "", documentType: "" });
        toast({
          title: "Document added",
          description: "Document was linked to this shipment.",
        });
      } else {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to add document");
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Document could not be added",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDocUploading(false);
    }
  };
  const openEdit = (shipment) => {
    var _a, _b;
    setEditingId(shipment.id);
    setNewForm({
      blNumber: shipment.blNumber || "",
      shippingLine: shipment.shippingLine || "",
      freightForwarder: shipment.freightForwarder || "",
      vesselName: shipment.vesselName || "",
      voyageNumber: shipment.voyageNumber || "",
      etd: shipment.etd
        ? new Date(shipment.etd).toISOString().slice(0, 10)
        : "",
      eta: shipment.eta
        ? new Date(shipment.eta).toISOString().slice(0, 10)
        : "",
      originCountry: shipment.originCountry || "",
      originPort: shipment.originPort || "",
      destinationPort: shipment.destinationPort || "",
      priority: shipment.priority || "normal",
      status: shipment.status || "draft",
      shipmentValue: shipment.shipmentValue
        ? String(shipment.shipmentValue)
        : "",
      currency: shipment.currency || "USD",
      companyId:
        ((_a = shipment.company) === null || _a === void 0 ? void 0 : _a.id) ||
        "",
      exporterCompanyId:
        ((_b = shipment.exporterCompany) === null || _b === void 0
          ? void 0
          : _b.id) || "",
      internalNotes: shipment.internalNotes || "",
      goodsDescription: shipment.goodsDescription || "",
      notes: shipment.notes || "",
      requiredDocumentIds: [],
      notificationUserIds: Array.isArray(shipment.notificationUserIds)
        ? shipment.notificationUserIds
        : [],
      containers: [], // Handle existing containers if needed
    });
    setEntryMode("manual");
    setTrackingFetchState("idle");
    setTrackingFetchMessage("");
    lastAutomaticLookup.current = "";
    setNewShipmentOpen(true);
    setDetailOpen(false);
  };
  const saveShipment = async () => {
    try {
    const url = editingId
        ? `/api/shipments/${editingId}`
        : `/api/shipments`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.assign(Object.assign({}, newForm), {
            shipmentValue: parseFloat(newForm.shipmentValue) || 0,
            etd: newForm.etd || null,
            eta: newForm.eta || null,
            requiredDocumentIds: editingId
              ? undefined
              : newForm.requiredDocumentIds.length
                ? newForm.requiredDocumentIds
                : documentChecklist
                    .filter((item) => item.isRequired)
                    .map((item) => item.id),
            containers: newForm.containers.map((container) => ({
              ...container,
              containerSize: container.containerSize || container.size,
              containerType: container.containerType || container.type,
            })),
          }),
        ),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to save shipment");
      setNewShipmentOpen(false);
      setEditingId(null);
      setEntryMode("automatic");
      setTrackingFetchState("idle");
      setTrackingFetchMessage("");
      lastAutomaticLookup.current = "";
      setNewForm({
        blNumber: "",
        shippingLine: "",
        freightForwarder: "",
        vesselName: "",
        voyageNumber: "",
        etd: "",
        eta: "",
        originCountry: "",
        originPort: "",
        destinationPort: "",
        priority: "normal",
        status: "draft",
        shipmentValue: "",
        currency: "USD",
        companyId: "",
        exporterCompanyId: "",
        goodsDescription: "",
        notes: "",
        internalNotes: "",
        requiredDocumentIds: [],
        notificationUserIds: [],
        containers: [],
      });
      fetchShipments();
      toast({
        title: editingId ? "Shipment updated" : "Shipment created",
        description: json.data?.shipmentNumber
          ? `${json.data.shipmentNumber} saved successfully.`
          : "Shipment saved successfully.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Shipment could not be saved",
        description: e.message || "Please check the details and try again.",
        variant: "destructive",
      });
    }
  };
  const deleteShipment = async (shipment) => {
    if (!shipment || deletingId) return;
    if (!canDeleteShipments) {
      toast({
        title: "Permission denied",
        description: "You do not have delete permission for shipments.",
        variant: "destructive",
      });
      return;
    }
    const confirmed = window.confirm(
      `Delete shipment ${shipment.shipmentNumber}? This will remove it from active shipment lists.`,
    );
    if (!confirmed) return;
    setDeletingId(shipment.id);
    try {
      const res = await fetch(`/api/shipments/${shipment.id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to delete shipment");
      setShipments((current) => current.filter((item) => item.id !== shipment.id));
      setTotalCount((current) => Math.max(0, current - 1));
      if (selectedShipment?.id === shipment.id) {
        setDetailOpen(false);
        setSelectedShipment(null);
      }
      await fetchShipments();
      toast({
        title: "Shipment deleted",
        description: `${shipment.shipmentNumber} was removed from active lists.`,
      });
    } catch (error) {
      console.error("Shipment delete error:", error);
      toast({
        title: "Shipment could not be deleted",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };
  // Status counts for stats bar
  const statusCounts = React.useMemo(() => {
    const counts = {};
    shipments.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return counts;
  }, [shipments]);
  // Kanban groupings
  const kanbanColumns = [
    "draft",
    "booking_confirmed",
    "at_pol",
    "vessel_departed",
    "in_transit",
    "at_pod",
    "customs_clearance",
    "duty_paid",
    "in_transport",
    "offloaded",
    "delivered",
    "closed",
  ];
  return _jsxs(motion.div, {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    className: "space-y-4",
    children: [
      _jsx(Card, {
        className: "glass border-0 shadow-enterprise",
        children: _jsx(CardContent, {
          className: "p-4",
          children: _jsxs("div", {
            className:
              "flex flex-col sm:flex-row items-start sm:items-center gap-3",
            children: [
              _jsxs("div", {
                className: "relative flex-1 w-full sm:max-w-xs",
                children: [
                  _jsx(Search, {
                    className:
                      "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                  }),
                  _jsx(Input, {
                    placeholder: "Search shipment, BL, booking...",
                    value: searchQuery,
                    onChange: (e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    },
                    className: "pl-9 h-9 text-sm",
                  }),
                ],
              }),
              _jsxs(Select, {
                value: statusFilter,
                onValueChange: (v) => {
                  setStatusFilter(v);
                  setPage(1);
                },
                children: [
                  _jsx(SelectTrigger, {
                    className: "w-full sm:w-[180px] h-9 text-sm",
                    children: _jsx(SelectValue, {}),
                  }),
                  _jsx(SelectContent, {
                    children: STATUSES.map((s) =>
                      _jsx(
                        SelectItem,
                        { value: s.value, children: s.label },
                        s.value,
                      ),
                    ),
                  }),
                ],
              }),
              _jsxs(Select, {
                value: priorityFilter,
                onValueChange: (v) => {
                  setPriorityFilter(v);
                  setPage(1);
                },
                children: [
                  _jsx(SelectTrigger, {
                    className: "w-full sm:w-[150px] h-9 text-sm",
                    children: _jsx(SelectValue, {}),
                  }),
                  _jsx(SelectContent, {
                    children: PRIORITIES.map((p) =>
                      _jsx(
                        SelectItem,
                        { value: p.value, children: p.label },
                        p.value,
                      ),
                    ),
                  }),
                ],
              }),
              _jsxs("div", {
                className: "flex items-center gap-2 ml-auto",
                children: [
                  _jsxs("div", {
                    className: "flex items-center border rounded-lg p-0.5",
                    children: [
                      _jsxs(Button, {
                        variant: viewMode === "table" ? "secondary" : "ghost",
                        size: "sm",
                        className: "h-7 px-2.5 text-xs",
                        onClick: () => setViewMode("table"),
                        children: [
                          _jsx(List, { className: "h-3.5 w-3.5 mr-1" }),
                          " Table",
                        ],
                      }),
                      _jsxs(Button, {
                        variant: viewMode === "kanban" ? "secondary" : "ghost",
                        size: "sm",
                        className: "h-7 px-2.5 text-xs",
                        onClick: () => setViewMode("kanban"),
                        children: [
                          _jsx(LayoutGrid, { className: "h-3.5 w-3.5 mr-1" }),
                          " Kanban",
                        ],
                      }),
                    ],
                  }),
                  canCreateShipments &&
                    _jsxs(Button, {
                      size: "sm",
                      className: "h-9 text-xs ml-auto",
                      onClick: () => {
                        setEditingId(null);
                        setEntryMode("automatic");
                        setTrackingFetchState("idle");
                        setTrackingFetchMessage("");
                        lastAutomaticLookup.current = "";
                        setNewForm({
                          blNumber: "",
                          shippingLine: "",
                          freightForwarder: "",
                          vesselName: "",
                          voyageNumber: "",
                          etd: "",
                          eta: "",
                          originCountry: "",
                          originPort: "",
                          destinationPort: "",
                          priority: "normal",
                          status: "draft",
                          shipmentValue: "",
                          currency: "USD",
                          companyId: "",
                          exporterCompanyId: "",
                          goodsDescription: "",
                          notes: "",
                          internalNotes: "",
                          requiredDocumentIds: documentChecklist
                            .filter((item) => item.isRequired)
                            .map((item) => item.id),
                          notificationUserIds: [],
                          containers: [],
                        });
                        setNewShipmentOpen(true);
                      },
                      children: [
                        _jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
                        " New Shipment",
                      ],
                    }),
                ],
              }),
            ],
          }),
        }),
      }),
      _jsx("div", {
        className: "flex gap-2 overflow-x-auto pb-1 custom-scrollbar",
        children: kanbanColumns.map((status) => {
          const count = statusCounts[status] || 0;
          if (statusFilter !== "all" && statusFilter !== status) return null;
          return _jsxs(
            "button",
            {
              onClick: () => {
                setStatusFilter(statusFilter === status ? "all" : status);
                setPage(1);
              },
              className: cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border",
                statusFilter === status
                  ? statusColorMap[status] + " ring-1 ring-current/20"
                  : "bg-card border-border/50 text-muted-foreground hover:bg-accent/50",
              ),
              children: [
                _jsx("span", {
                  className: cn(
                    "h-1.5 w-1.5 rounded-full",
                    statusDotMap[status],
                  ),
                }),
                statusLabelMap[status],
                _jsx(Badge, {
                  variant: "secondary",
                  className: "h-4 min-w-[18px] px-1 text-[10px] ml-0.5",
                  children: count,
                }),
              ],
            },
            status,
          );
        }),
      }),
      loading
        ? _jsx("div", {
            className: "grid grid-cols-1 gap-3",
            children: Array.from({ length: 5 }).map((_, i) =>
              _jsx(
                Card,
                {
                  className: "glass border-0 shadow-enterprise animate-pulse",
                  children: _jsx(CardContent, { className: "p-4 h-16" }),
                },
                i,
              ),
            ),
          })
        : viewMode === "table"
          ? /* Table View */
            _jsx(Card, {
              className: "glass border-0 shadow-enterprise",
              children: _jsxs(CardContent, {
                className: "p-0",
                children: [
                  _jsx("div", {
                    className: "overflow-x-auto",
                    children: _jsxs(Table, {
                      children: [
                        _jsx(TableHeader, {
                          children: _jsxs(TableRow, {
                            children: [
                              _jsx(TableHead, {
                                className: "text-[11px] font-semibold",
                                children: "Shipment",
                              }),
                              _jsx(TableHead, {
                                className:
                                  "text-[11px] font-semibold hidden md:table-cell",
                                children: "Booking/BL",
                              }),
                              _jsx(TableHead, {
                                className:
                                  "text-[11px] font-semibold hidden lg:table-cell",
                                children: "Shipping Line",
                              }),
                              _jsx(TableHead, {
                                className: "text-[11px] font-semibold",
                                children: "Route",
                              }),
                              _jsx(TableHead, {
                                className:
                                  "text-[11px] font-semibold hidden sm:table-cell",
                                children: "ETD/ETA",
                              }),
                              _jsx(TableHead, {
                                className: "text-[11px] font-semibold",
                                children: "Status",
                              }),
                              _jsx(TableHead, {
                                className:
                                  "text-[11px] font-semibold hidden md:table-cell",
                                children: "Priority",
                              }),
                              _jsx(TableHead, {
                                className:
                                  "text-[11px] font-semibold text-right",
                                children: "Value",
                              }),
                              _jsx(TableHead, {
                                className: "text-[11px] font-semibold w-10",
                              }),
                            ],
                          }),
                        }),
                        _jsx(TableBody, {
                          children:
                            shipments.length === 0
                              ? _jsx(TableRow, {
                                  children: _jsx(TableCell, {
                                    colSpan: 9,
                                    className:
                                      "text-center py-12 text-muted-foreground",
                                    children: "No shipments found",
                                  }),
                                })
                              : shipments.map((s, i) =>
                                  _jsxs(
                                    motion.tr,
                                    {
                                      initial: { opacity: 0, y: 8 },
                                      animate: { opacity: 1, y: 0 },
                                      transition: {
                                        delay: i * 0.03,
                                        duration: 0.2,
                                      },
                                      className:
                                        "group cursor-pointer hover:bg-accent/30 transition-colors",
                                      onClick: () => openDetail(s.id),
                                      children: [
                                        _jsx(TableCell, {
                                          children: _jsxs("div", {
                                            className:
                                              "flex items-center gap-2.5",
                                            children: [
                                              _jsx("div", {
                                                className:
                                                  "flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 shrink-0",
                                                children: _jsx(Ship, {
                                                  className:
                                                    "h-4 w-4 text-teal",
                                                }),
                                              }),
                                              _jsxs("div", {
                                                children: [
                                                  _jsx("p", {
                                                    className:
                                                      "text-sm font-medium",
                                                    children: s.shipmentNumber,
                                                  }),
                                                  _jsxs("div", {
                                                    className: "flex flex-col",
                                                    children: [
                                                      s.company &&
                                                        _jsxs("p", {
                                                          className:
                                                            "text-[10px] text-muted-foreground leading-tight",
                                                          children: [
                                                            "I: ",
                                                            s.company.name,
                                                          ],
                                                        }),
                                                      s.exporterCompany &&
                                                        _jsxs("p", {
                                                          className:
                                                            "text-[10px] text-muted-foreground leading-tight",
                                                          children: [
                                                            "E: ",
                                                            s.exporterCompany
                                                              .name,
                                                          ],
                                                        }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            ],
                                          }),
                                        }),
                                        _jsxs(TableCell, {
                                          className: "hidden md:table-cell",
                                          children: [
                                            _jsx("p", {
                                              className: "text-xs",
                                              children: s.bookingNumber || "—",
                                            }),
                                            _jsx("p", {
                                              className:
                                                "text-[11px] text-muted-foreground",
                                              children: s.blNumber || "—",
                                            }),
                                          ],
                                        }),
                                        _jsx(TableCell, {
                                          className:
                                            "hidden lg:table-cell text-xs",
                                          children: s.shippingLine || "—",
                                        }),
                                        _jsx(TableCell, {
                                          children: _jsxs("div", {
                                            className:
                                              "flex items-center gap-1 text-xs",
                                            children: [
                                              _jsx("span", {
                                                children: s.originPort || "?",
                                              }),
                                              _jsx(ArrowRight, {
                                                className:
                                                  "h-3 w-3 text-muted-foreground",
                                              }),
                                              _jsx("span", {
                                                children:
                                                  s.destinationPort || "?",
                                              }),
                                            ],
                                          }),
                                        }),
                                        _jsxs(TableCell, {
                                          className: "hidden sm:table-cell",
                                          children: [
                                            _jsx("p", {
                                              className: "text-[11px]",
                                              children: s.etd
                                                ? format(
                                                    new Date(s.etd),
                                                    "MMM d",
                                                  )
                                                : "—",
                                            }),
                                            _jsx("p", {
                                              className:
                                                "text-[11px] text-muted-foreground",
                                              children: s.eta
                                                ? format(
                                                    new Date(s.eta),
                                                    "MMM d",
                                                  )
                                                : "—",
                                            }),
                                          ],
                                        }),
                                        _jsx(TableCell, {
                                          children: _jsx(Badge, {
                                            variant: "outline",
                                            className: cn(
                                              "text-[10px] font-semibold",
                                              statusColorMap[s.status] || "",
                                            ),
                                            children:
                                              statusLabelMap[s.status] ||
                                              s.status,
                                          }),
                                        }),
                                        _jsx(TableCell, {
                                          className: "hidden md:table-cell",
                                          children: _jsx(Badge, {
                                            variant: "outline",
                                            className: cn(
                                              "text-[10px] font-semibold",
                                              priorityColorMap[s.priority] ||
                                                "",
                                            ),
                                            children: s.priority,
                                          }),
                                        }),
                                        _jsx(TableCell, {
                                          className:
                                            "text-right text-sm font-medium",
                                          children:
                                            s.shipmentValue > 0
                                              ? currencyFmt(
                                                  s.shipmentValue,
                                                  s.currency,
                                                )
                                              : "—",
                                        }),
                                        _jsx(TableCell, {
                                          children: _jsxs("div", {
                                            className:
                                              "flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100",
                                            children: [
                                              _jsx(Button, {
                                                variant: "ghost",
                                                size: "icon",
                                                className: "h-7 w-7",
                                                onClick: (event) => {
                                                  event.stopPropagation();
                                                  openDetail(s.id);
                                                },
                                                title: "View shipment",
                                                children: _jsx(Eye, {
                                                  className: "h-3.5 w-3.5",
                                                }),
                                              }),
                                              canDeleteShipments &&
                                                _jsx(Button, {
                                                  variant: "ghost",
                                                  size: "icon",
                                                  className:
                                                    "h-7 w-7 text-red-600 hover:bg-red-500/10 hover:text-red-700",
                                                  disabled: deletingId === s.id,
                                                  onClick: (event) => {
                                                    event.stopPropagation();
                                                    deleteShipment(s);
                                                  },
                                                  title: "Delete shipment",
                                                  children:
                                                    deletingId === s.id
                                                      ? _jsx(Loader2, {
                                                          className:
                                                            "h-3.5 w-3.5 animate-spin",
                                                        })
                                                      : _jsx(Trash2, {
                                                          className:
                                                            "h-3.5 w-3.5",
                                                        }),
                                                }),
                                            ],
                                          }),
                                        }),
                                      ],
                                    },
                                    s.id,
                                  ),
                                ),
                        }),
                      ],
                    }),
                  }),
                  totalCount > 20 &&
                    _jsxs("div", {
                      className:
                        "flex items-center justify-between px-4 py-3 border-t",
                      children: [
                        _jsxs("p", {
                          className: "text-xs text-muted-foreground",
                          children: [
                            "Showing ",
                            (page - 1) * 20 + 1,
                            "-",
                            Math.min(page * 20, totalCount),
                            " of ",
                            totalCount,
                          ],
                        }),
                        _jsxs("div", {
                          className: "flex gap-1",
                          children: [
                            _jsx(Button, {
                              variant: "outline",
                              size: "sm",
                              disabled: page === 1,
                              onClick: () => setPage(page - 1),
                              className: "h-7 text-xs",
                              children: "Prev",
                            }),
                            _jsx(Button, {
                              variant: "outline",
                              size: "sm",
                              disabled: page * 20 >= totalCount,
                              onClick: () => setPage(page + 1),
                              className: "h-7 text-xs",
                              children: "Next",
                            }),
                          ],
                        }),
                      ],
                    }),
                ],
              }),
            })
          : /* Kanban View */
            _jsx("div", {
              className: "overflow-x-auto custom-scrollbar pb-2",
              children: _jsx("div", {
                className: "flex gap-4 min-w-max",
                children: kanbanColumns.map((status) => {
                  const items = shipments.filter((s) => s.status === status);
                  if (statusFilter !== "all" && statusFilter !== status)
                    return null;
                  return _jsxs(
                    "div",
                    {
                      className: "w-72 shrink-0",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center gap-2 mb-3 px-1",
                          children: [
                            _jsx("span", {
                              className: cn(
                                "h-2 w-2 rounded-full",
                                statusDotMap[status],
                              ),
                            }),
                            _jsx("span", {
                              className: "text-xs font-semibold",
                              children: statusLabelMap[status],
                            }),
                            _jsx(Badge, {
                              variant: "secondary",
                              className:
                                "h-4 min-w-[18px] px-1 text-[10px] ml-auto",
                              children: items.length,
                            }),
                          ],
                        }),
                        _jsx("div", {
                          className:
                            "space-y-2 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1",
                          children:
                            items.length === 0
                              ? _jsx("div", {
                                  className:
                                    "rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground",
                                  children: "No shipments",
                                })
                              : items.map((s) =>
                                  _jsxs(
                                    motion.div,
                                    {
                                      initial: { opacity: 0, scale: 0.95 },
                                      animate: { opacity: 1, scale: 1 },
                                      whileHover: { scale: 1.02 },
                                      className:
                                        "rounded-xl border border-border/50 bg-card/80 p-3 cursor-pointer hover:shadow-enterprise transition-shadow",
                                      onClick: () => openDetail(s.id),
                                      children: [
                                        _jsxs("div", {
                                          className:
                                            "flex items-start justify-between mb-2",
                                          children: [
                                            _jsx("p", {
                                              className: "text-sm font-medium",
                                              children: s.shipmentNumber,
                                            }),
                                            _jsxs("div", {
                                              className:
                                                "flex shrink-0 items-center gap-1",
                                              children: [
                                                _jsx(Badge, {
                                                  variant: "outline",
                                                  className: cn(
                                                    "text-[9px] font-semibold",
                                                    priorityColorMap[
                                                      s.priority
                                                    ],
                                                  ),
                                                  children: s.priority,
                                                }),
                                                canDeleteShipments &&
                                                  _jsx(Button, {
                                                    variant: "ghost",
                                                    size: "icon",
                                                    className:
                                                      "h-6 w-6 text-red-600 hover:bg-red-500/10 hover:text-red-700",
                                                    disabled:
                                                      deletingId === s.id,
                                                    onClick: (event) => {
                                                      event.stopPropagation();
                                                      deleteShipment(s);
                                                    },
                                                    title: "Delete shipment",
                                                    children:
                                                      deletingId === s.id
                                                        ? _jsx(Loader2, {
                                                            className:
                                                              "h-3 w-3 animate-spin",
                                                          })
                                                        : _jsx(Trash2, {
                                                            className:
                                                              "h-3 w-3",
                                                          }),
                                                  }),
                                              ],
                                            }),
                                          ],
                                        }),
                                        _jsxs("div", {
                                          className:
                                            "flex items-center gap-1 text-[11px] text-muted-foreground mb-1.5",
                                          children: [
                                            _jsx("span", {
                                              children: s.originPort || "?",
                                            }),
                                            _jsx(ArrowRight, {
                                              className: "h-3 w-3",
                                            }),
                                            _jsx("span", {
                                              children:
                                                s.destinationPort || "?",
                                            }),
                                          ],
                                        }),
                                        s.company &&
                                          _jsxs("p", {
                                            className:
                                              "text-[10px] text-muted-foreground truncate",
                                            children: ["I: ", s.company.name],
                                          }),
                                        s.exporterCompany &&
                                          _jsxs("p", {
                                            className:
                                              "text-[10px] text-muted-foreground truncate",
                                            children: [
                                              "E: ",
                                              s.exporterCompany.name,
                                            ],
                                          }),
                                        _jsxs("div", {
                                          className:
                                            "flex items-center justify-between mt-2",
                                          children: [
                                            _jsx("span", {
                                              className: "text-xs font-medium",
                                              children:
                                                s.shipmentValue > 0
                                                  ? currencyFmt(
                                                      s.shipmentValue,
                                                      s.currency,
                                                    )
                                                  : "—",
                                            }),
                                            _jsxs("span", {
                                              className:
                                                "text-[10px] text-muted-foreground",
                                              children: [
                                                s._count.containers,
                                                "C \u00B7 ",
                                                s._count.documents,
                                                "D",
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    },
                                    s.id,
                                  ),
                                ),
                        }),
                      ],
                    },
                    status,
                  );
                }),
              }),
            }),
      _jsx(Dialog, {
        open: detailOpen,
        onOpenChange: setDetailOpen,
        children: _jsxs(DialogContent, {
          className: "max-w-3xl max-h-[85vh] overflow-hidden p-0",
          children: [
            _jsx(DialogHeader, {
              className: "px-6 pt-6 pb-4 border-b",
              children: _jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  _jsx("div", {
                    className:
                      "flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10",
                    children: _jsx(Ship, { className: "h-5 w-5 text-teal" }),
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx(DialogTitle, {
                        className: "text-lg",
                        children:
                          (selectedShipment === null ||
                          selectedShipment === void 0
                            ? void 0
                            : selectedShipment.shipmentNumber) || "Loading...",
                      }),
                      _jsxs(DialogDescription, {
                        className:
                          "text-[10px] mt-0.5 flex flex-wrap gap-x-3 gap-y-1",
                        children: [
                          _jsxs("span", {
                            className: "flex items-center gap-1",
                            children: [
                              _jsx(Building2, { className: "h-3 w-3" }),
                              " Importer: ",
                              ((_a =
                                selectedShipment === null ||
                                selectedShipment === void 0
                                  ? void 0
                                  : selectedShipment.company) === null ||
                              _a === void 0
                                ? void 0
                                : _a.name) || "N/A",
                            ],
                          }),
                          _jsxs("span", {
                            className: "flex items-center gap-1",
                            children: [
                              _jsx(Globe, { className: "h-3 w-3" }),
                              " Exporter: ",
                              ((_b =
                                selectedShipment === null ||
                                selectedShipment === void 0
                                  ? void 0
                                  : selectedShipment.exporterCompany) ===
                                null || _b === void 0
                                ? void 0
                                : _b.name) || "N/A",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  selectedShipment &&
                    _jsxs("div", {
                      className: "ml-auto flex items-center gap-2",
                      children: [
                        _jsx(Badge, {
                          variant: "outline",
                          className: cn(
                            "text-[10px] font-semibold",
                            statusColorMap[selectedShipment.status],
                          ),
                          children: statusLabelMap[selectedShipment.status],
                        }),
                        canUpdateShipments &&
                          _jsxs(Button, {
                            variant: "outline",
                            size: "sm",
                            onClick: () => openEdit(selectedShipment),
                            className: "h-7 px-2 text-xs",
                            children: [
                              _jsx(Pencil, { className: "w-3 h-3 mr-1" }),
                              " Edit",
                            ],
                          }),
                        canDeleteShipments &&
                          _jsxs(Button, {
                            variant: "outline",
                            size: "sm",
                            onClick: () => deleteShipment(selectedShipment),
                            disabled: deletingId === selectedShipment.id,
                            className:
                              "h-7 px-2 text-xs border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-700",
                            children: [
                              deletingId === selectedShipment.id
                                ? _jsx(Loader2, {
                                    className: "w-3 h-3 mr-1 animate-spin",
                                  })
                                : _jsx(Trash2, {
                                    className: "w-3 h-3 mr-1",
                                  }),
                              " Delete",
                            ],
                          }),
                      ],
                    }),
                ],
              }),
            }),
            detailLoading
              ? _jsx("div", {
                  className: "p-6 space-y-4",
                  children: Array.from({ length: 6 }).map((_, i) =>
                    _jsx(
                      "div",
                      { className: "h-4 bg-muted rounded animate-pulse" },
                      i,
                    ),
                  ),
                })
              : selectedShipment
                ? _jsxs(Tabs, {
                    defaultValue: "overview",
                    className: "w-full",
                    children: [
                      _jsx("div", {
                        className: "px-6 pt-2",
                        children: _jsxs(TabsList, {
                          className: "h-8",
                          children: [
                            _jsx(TabsTrigger, {
                              value: "overview",
                              className: "text-xs h-7 px-3",
                              children: "Overview",
                            }),
                            _jsx(TabsTrigger, {
                              value: "timeline",
                              className: "text-xs h-7 px-3",
                              children: "Timeline",
                            }),
                            _jsxs(TabsTrigger, {
                              value: "containers",
                              className: "text-xs h-7 px-3",
                              children: [
                                "Containers (",
                                ((_c = selectedShipment.containers) === null ||
                                _c === void 0
                                  ? void 0
                                  : _c.length) || 0,
                                ")",
                              ],
                            }),
                            _jsxs(TabsTrigger, {
                              value: "documents",
                              className: "text-xs h-7 px-3",
                              children: [
                                "Documents (",
                                ((_d = selectedShipment.documents) === null ||
                                _d === void 0
                                  ? void 0
                                  : _d.length) || 0,
                                ")",
                              ],
                            }),
                            _jsxs(TabsTrigger, {
                              value: "expenses",
                              className: "text-xs h-7 px-3",
                              children: [
                                "Expenses (",
                                ((_e = selectedShipment.expenses) === null ||
                                _e === void 0
                                  ? void 0
                                  : _e.length) || 0,
                                ")",
                              ],
                            }),
                          ],
                        }),
                      }),
                      _jsxs(ScrollArea, {
                        className: "h-[55vh] px-6 pb-6",
                        children: [
                          _jsxs(TabsContent, {
                            value: "overview",
                            className: "mt-4",
                            children: [
                              _jsx("div", {
                                className: "grid grid-cols-2 gap-4",
                                children: [
                                  {
                                    label: "Booking Number",
                                    value: selectedShipment.bookingNumber,
                                  },
                                  {
                                    label: "BL Number",
                                    value: selectedShipment.blNumber,
                                  },
                                  {
                                    label: "Shipping Line",
                                    value: selectedShipment.shippingLine,
                                  },
                                  {
                                    label: "Vessel",
                                    value: selectedShipment.vesselName,
                                  },
                                  {
                                    label: "Voyage",
                                    value: selectedShipment.voyageNumber,
                                  },
                                  {
                                    label: "Freight Forwarder",
                                    value: selectedShipment.freightForwarder,
                                  },
                                  {
                                    label: "Origin Country",
                                    value: selectedShipment.originCountry,
                                  },
                                  {
                                    label: "Origin Port",
                                    value: selectedShipment.originPort,
                                  },
                                  {
                                    label: "Destination Port",
                                    value: selectedShipment.destinationPort,
                                  },
                                  {
                                    label: "Priority",
                                    value: selectedShipment.priority,
                                  },
                                  {
                                    label: "ETD",
                                    value: selectedShipment.etd
                                      ? format(
                                          new Date(selectedShipment.etd),
                                          "MMM d, yyyy",
                                        )
                                      : null,
                                  },
                                  {
                                    label: "ETA",
                                    value: selectedShipment.eta
                                      ? format(
                                          new Date(selectedShipment.eta),
                                          "MMM d, yyyy",
                                        )
                                      : null,
                                  },
                                  {
                                    label: "Shipment Value",
                                    value:
                                      selectedShipment.shipmentValue > 0
                                        ? currencyFmt(
                                            selectedShipment.shipmentValue,
                                            selectedShipment.currency,
                                          )
                                        : null,
                                  },
                                  {
                                    label: "Warehouse",
                                    value: selectedShipment.warehouseLocation,
                                  },
                                ].map((field) =>
                                  _jsxs(
                                    "div",
                                    {
                                      children: [
                                        _jsx("p", {
                                          className:
                                            "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider",
                                          children: field.label,
                                        }),
                                        _jsx("p", {
                                          className: "text-sm mt-0.5",
                                          children: field.value || "—",
                                        }),
                                      ],
                                    },
                                    field.label,
                                  ),
                                ),
                              }),
                              selectedShipment.internalNotes &&
                                _jsxs("div", {
                                  className:
                                    "mt-4 p-3 rounded-lg bg-amber/5 border border-amber/20",
                                  children: [
                                    _jsx("p", {
                                      className:
                                        "text-[11px] font-semibold text-amber-dark mb-1",
                                      children: "Internal Notes",
                                    }),
                                    _jsx("p", {
                                      className: "text-xs",
                                      children: selectedShipment.internalNotes,
                                    }),
                                  ],
                                }),
                            ],
                          }),
                          _jsx(TabsContent, {
                            value: "timeline",
                            className: "mt-4",
                            children:
                              selectedShipment.timelineEvents.length === 0
                                ? _jsx("p", {
                                    className:
                                      "text-sm text-muted-foreground text-center py-8",
                                    children: "No timeline events",
                                  })
                                : _jsxs("div", {
                                    className: "relative",
                                    children: [
                                      _jsx("div", {
                                        className:
                                          "absolute left-4 top-0 bottom-0 w-px bg-border",
                                      }),
                                      _jsx("div", {
                                        className: "space-y-4",
                                        children:
                                          selectedShipment.timelineEvents.map(
                                            (event, i) =>
                                              _jsxs(
                                                "div",
                                                {
                                                  className:
                                                    "relative flex items-start gap-4 pl-10",
                                                  children: [
                                                    _jsx("div", {
                                                      className: cn(
                                                        "absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-background",
                                                        i === 0
                                                          ? "bg-teal"
                                                          : "bg-muted-foreground/30",
                                                      ),
                                                    }),
                                                    _jsxs("div", {
                                                      className: "flex-1",
                                                      children: [
                                                        _jsx("p", {
                                                          className:
                                                            "text-sm font-medium",
                                                          children: event.event,
                                                        }),
                                                        event.description &&
                                                          _jsx("p", {
                                                            className:
                                                              "text-xs text-muted-foreground mt-0.5",
                                                            children:
                                                              event.description,
                                                          }),
                                                        _jsxs("div", {
                                                          className:
                                                            "flex items-center gap-2 mt-1",
                                                          children: [
                                                            event.location &&
                                                              _jsxs("span", {
                                                                className:
                                                                  "text-[10px] text-muted-foreground flex items-center gap-1",
                                                                children: [
                                                                  _jsx(MapPin, {
                                                                    className:
                                                                      "h-3 w-3",
                                                                  }),
                                                                  event.location,
                                                                ],
                                                              }),
                                                            _jsxs("span", {
                                                              className:
                                                                "text-[10px] text-muted-foreground flex items-center gap-1",
                                                              children: [
                                                                _jsx(Clock, {
                                                                  className:
                                                                    "h-3 w-3",
                                                                }),
                                                                format(
                                                                  new Date(
                                                                    event.timestamp,
                                                                  ),
                                                                  "MMM d, yyyy h:mm a",
                                                                ),
                                                              ],
                                                            }),
                                                          ],
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                },
                                                event.id,
                                              ),
                                          ),
                                      }),
                                    ],
                                  }),
                          }),
                          _jsx(TabsContent, {
                            value: "containers",
                            className: "mt-4",
                            children:
                              selectedShipment.containers.length === 0
                                ? _jsx("p", {
                                    className:
                                      "text-sm text-muted-foreground text-center py-8",
                                    children: "No containers",
                                  })
                                : _jsx("div", {
                                    className: "space-y-2",
                                    children: selectedShipment.containers.map(
                                      (c) =>
                                        _jsxs(
                                          "div",
                                          {
                                            className:
                                              "flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors",
                                            children: [
                                              _jsx("div", {
                                                className:
                                                  "flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10",
                                                children: _jsx(Package, {
                                                  className:
                                                    "h-4 w-4 text-amber-dark",
                                                }),
                                              }),
                                              _jsxs("div", {
                                                className: "flex-1",
                                                children: [
                                                  _jsx("p", {
                                                    className:
                                                      "text-sm font-medium",
                                                    children: c.containerNumber,
                                                  }),
                                                  _jsxs("p", {
                                                    className:
                                                      "text-[11px] text-muted-foreground",
                                                    children: [
                                                      c.containerSize,
                                                      " \u00B7 ",
                                                      c.containerType,
                                                    ],
                                                  }),
                                                ],
                                              }),
                                              _jsx(Badge, {
                                                variant: "outline",
                                                className: cn(
                                                  "text-[10px]",
                                                  statusColorMap[c.status] ||
                                                    "",
                                                ),
                                                children:
                                                  statusLabelMap[c.status] ||
                                                  c.status,
                                              }),
                                            ],
                                          },
                                          c.id,
                                        ),
                                    ),
                                  }),
                          }),
                          _jsxs(TabsContent, {
                            value: "documents",
                            className: "mt-4",
                            children: [
                              _jsxs("div", {
                                className:
                                  "flex items-center justify-between mb-4",
                                children: [
                                  _jsx("h4", {
                                    className: "text-sm font-semibold",
                                    children: "Shipment Documents",
                                  }),
                                  _jsxs(Button, {
                                    variant: "outline",
                                    size: "sm",
                                    className: "h-7 text-[10px]",
                                    onClick: () =>
                                      setUploadDocOpen(!uploadDocOpen),
                                    children: [
                                      uploadDocOpen
                                        ? _jsx(X, { className: "h-3 w-3 mr-1" })
                                        : _jsx(Plus, {
                                            className: "h-3 w-3 mr-1",
                                          }),
                                      uploadDocOpen ? "Cancel" : "Add Document",
                                    ],
                                  }),
                                ],
                              }),
                              _jsx(AnimatePresence, {
                                children:
                                  uploadDocOpen &&
                                  _jsx(motion.div, {
                                    initial: { height: 0, opacity: 0 },
                                    animate: { height: "auto", opacity: 1 },
                                    exit: { height: 0, opacity: 0 },
                                    className: "overflow-hidden mb-6",
                                    children: _jsxs("div", {
                                      className:
                                        "p-4 rounded-xl border border-teal/20 bg-teal/5 space-y-4",
                                      children: [
                                        _jsxs("div", {
                                          className: "grid grid-cols-2 gap-4",
                                          children: [
                                            _jsxs("div", {
                                              className: "space-y-1.5",
                                              children: [
                                                _jsx(Label, {
                                                  className:
                                                    "text-[10px] uppercase tracking-wider text-muted-foreground font-bold",
                                                  children: "Document Name",
                                                }),
                                                _jsx(Input, {
                                                  value: newDocForm.name,
                                                  onChange: (e) =>
                                                    setNewDocForm(
                                                      Object.assign(
                                                        Object.assign(
                                                          {},
                                                          newDocForm,
                                                        ),
                                                        {
                                                          name: e.target.value,
                                                        },
                                                      ),
                                                    ),
                                                  placeholder: "Invoice #1234",
                                                  className: "h-8 text-sm",
                                                }),
                                              ],
                                            }),
                                            _jsxs("div", {
                                              className: "space-y-1.5",
                                              children: [
                                                _jsx(Label, {
                                                  className:
                                                    "text-[10px] uppercase tracking-wider text-muted-foreground font-bold",
                                                  children: "Document Type",
                                                }),
                                                _jsxs(Select, {
                                                  value:
                                                    newDocForm.documentType,
                                                  onValueChange: (v) =>
                                                    setNewDocForm(
                                                      Object.assign(
                                                        Object.assign(
                                                          {},
                                                          newDocForm,
                                                        ),
                                                        { documentType: v },
                                                      ),
                                                    ),
                                                  children: [
                                                    _jsx(SelectTrigger, {
                                                      className: "h-8 text-sm",
                                                      children: _jsx(
                                                        SelectValue,
                                                        {
                                                          placeholder:
                                                            "Select type",
                                                        },
                                                      ),
                                                    }),
                                                    _jsx(SelectContent, {
                                                      children:
                                                        documentTypes.length > 0
                                                          ? documentTypes.map(
                                                              (type) =>
                                                                _jsx(
                                                                  SelectItem,
                                                                  {
                                                                    value: type
                                                                      .toLowerCase()
                                                                      .replace(
                                                                        / /g,
                                                                        "_",
                                                                      ),
                                                                    children:
                                                                      type,
                                                                  },
                                                                  type,
                                                                ),
                                                            )
                                                          : _jsx(SelectItem, {
                                                              value: "other",
                                                              children: "Other",
                                                            }),
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                        _jsx("div", {
                                          className: "flex justify-end",
                                          children: _jsx(Button, {
                                            size: "sm",
                                            className:
                                              "h-8 text-xs bg-teal hover:bg-teal-dark",
                                            disabled:
                                              docUploading ||
                                              !newDocForm.name ||
                                              !newDocForm.documentType,
                                            onClick: handleUploadDocument,
                                            children: docUploading
                                              ? "Uploading..."
                                              : "Save Document",
                                          }),
                                        }),
                                      ],
                                    }),
                                  }),
                              }),
                              selectedShipment.documents.length === 0
                                ? _jsxs("div", {
                                    className:
                                      "text-center py-12 rounded-xl border border-dashed border-border/60",
                                    children: [
                                      _jsx(FileText, {
                                        className:
                                          "h-8 w-8 text-muted-foreground/30 mx-auto mb-3",
                                      }),
                                      _jsx("p", {
                                        className:
                                          "text-sm text-muted-foreground",
                                        children: "No documents uploaded yet",
                                      }),
                                      _jsx("p", {
                                        className:
                                          "text-[11px] text-muted-foreground/60 mt-1",
                                        children:
                                          "Upload required shipment documents above",
                                      }),
                                    ],
                                  })
                                : _jsx("div", {
                                    className: "space-y-2",
                                    children: selectedShipment.documents.map(
                                      (d) =>
                                        _jsxs(
                                          "div",
                                          {
                                            className:
                                              "flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors group",
                                            children: [
                                              _jsx("div", {
                                                className:
                                                  "flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10",
                                                children: _jsx(FileText, {
                                                  className:
                                                    "h-4 w-4 text-teal",
                                                }),
                                              }),
                                              _jsxs("div", {
                                                className: "flex-1 min-w-0",
                                                children: [
                                                  _jsx("p", {
                                                    className:
                                                      "text-sm font-medium truncate",
                                                    children: d.name,
                                                  }),
                                                  _jsxs("div", {
                                                    className:
                                                      "flex items-center gap-2 mt-0.5",
                                                    children: [
                                                      _jsx("p", {
                                                        className:
                                                          "text-[11px] text-muted-foreground",
                                                        children: d.documentType
                                                          .replace(/_/g, " ")
                                                          .replace(
                                                            /\b\w/g,
                                                            (l) =>
                                                              l.toUpperCase(),
                                                          ),
                                                      }),
                                                      _jsx("span", {
                                                        className:
                                                          "text-[11px] text-muted-foreground/40",
                                                        children: "\u2022",
                                                      }),
                                                      _jsx("p", {
                                                        className:
                                                          "text-[11px] text-muted-foreground",
                                                        children: format(
                                                          new Date(d.createdAt),
                                                          "MMM d, yyyy",
                                                        ),
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                              _jsxs("div", {
                                                className:
                                                  "flex items-center gap-2",
                                                children: [
                                                  _jsx(Badge, {
                                                    variant: d.isVerified
                                                      ? "default"
                                                      : "outline",
                                                    className: cn(
                                                      "text-[10px]",
                                                      d.isVerified
                                                        ? "bg-emerald-500 hover:bg-emerald-600"
                                                        : "text-muted-foreground",
                                                    ),
                                                    children: d.isVerified
                                                      ? "Verified"
                                                      : "Pending",
                                                  }),
                                                  _jsx(Button, {
                                                    variant: "ghost",
                                                    size: "icon",
                                                    className:
                                                      "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                                                    children: _jsx(Eye, {
                                                      className: "h-3.5 w-3.5",
                                                    }),
                                                  }),
                                                ],
                                              }),
                                            ],
                                          },
                                          d.id,
                                        ),
                                    ),
                                  }),
                            ],
                          }),
                          _jsx(TabsContent, {
                            value: "expenses",
                            className: "mt-4",
                            children:
                              selectedShipment.expenses.length === 0
                                ? _jsx("p", {
                                    className:
                                      "text-sm text-muted-foreground text-center py-8",
                                    children: "No expenses",
                                  })
                                : _jsx("div", {
                                    className: "space-y-2",
                                    children: selectedShipment.expenses.map(
                                      (e) =>
                                        _jsxs(
                                          "div",
                                          {
                                            className:
                                              "flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors",
                                            children: [
                                              _jsx("div", {
                                                className:
                                                  "flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30",
                                                children: _jsx(DollarSign, {
                                                  className:
                                                    "h-4 w-4 text-emerald-600",
                                                }),
                                              }),
                                              _jsxs("div", {
                                                className: "flex-1",
                                                children: [
                                                  _jsx("p", {
                                                    className:
                                                      "text-sm font-medium",
                                                    children: e.category
                                                      .replace(/_/g, " ")
                                                      .replace(/\b\w/g, (l) =>
                                                        l.toUpperCase(),
                                                      ),
                                                  }),
                                                  e.description &&
                                                    _jsx("p", {
                                                      className:
                                                        "text-[11px] text-muted-foreground",
                                                      children: e.description,
                                                    }),
                                                ],
                                              }),
                                              _jsxs("div", {
                                                className: "text-right",
                                                children: [
                                                  _jsx("p", {
                                                    className:
                                                      "text-sm font-medium",
                                                    children: currencyFmt(
                                                      e.amount,
                                                      e.currency,
                                                    ),
                                                  }),
                                                  _jsx(Badge, {
                                                    variant: "outline",
                                                    className: cn(
                                                      "text-[9px]",
                                                      e.paymentStatus === "paid"
                                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        : e.paymentStatus ===
                                                            "overdue"
                                                          ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                          : "",
                                                    ),
                                                    children: e.paymentStatus,
                                                  }),
                                                ],
                                              }),
                                            ],
                                          },
                                          e.id,
                                        ),
                                    ),
                                  }),
                          }),
                        ],
                      }),
                    ],
                  })
                : null,
          ],
        }),
      }),
      _jsx(Dialog, {
        open: newShipmentOpen,
        onOpenChange: setNewShipmentOpen,
        children: _jsxs(DialogContent, {
          className: "max-w-lg max-h-[80vh] overflow-hidden p-0",
          children: [
            _jsxs(DialogHeader, {
              className: "px-6 pt-6 pb-4 border-b",
              children: [
                _jsx(DialogTitle, {
                  children: editingId ? "Edit Shipment" : "Create New Shipment",
                }),
                _jsx(DialogDescription, {
                  children: editingId
                    ? "Update shipment details"
                    : "Enter shipment details to create a new draft shipment",
                }),
              ],
            }),
            _jsx(ScrollArea, {
              className: "h-[60vh] px-6 pb-6",
              children: _jsxs("div", {
                className: "space-y-4 pt-4",
                children: [
                  !editingId &&
                    _jsxs("div", {
                      className: "rounded-lg border bg-muted/20 p-3 space-y-3",
                      children: [
                        _jsxs("div", {
                          children: [
                            _jsx(Label, {
                              className: "text-xs font-semibold",
                              children: "Shipment Entry Method",
                            }),
                            _jsx("p", {
                              className: "text-[11px] text-muted-foreground mt-0.5",
                              children:
                                "Choose whether carrier details should be fetched or entered manually.",
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "grid grid-cols-2 gap-2",
                          children: [
                            _jsxs("button", {
                              type: "button",
                              onClick: () => {
                                setEntryMode("automatic");
                                setTrackingFetchState("idle");
                                setTrackingFetchMessage("");
                                lastAutomaticLookup.current = "";
                              },
                              className: cn(
                                "flex items-start gap-2 rounded-md border p-2.5 text-left transition-colors",
                                entryMode === "automatic"
                                  ? "border-teal-500 bg-teal-500/10 text-teal-800 dark:text-teal-200"
                                  : "bg-background hover:bg-muted/50",
                              ),
                              children: [
                                _jsx(WandSparkles, {
                                  className: "h-4 w-4 mt-0.5 shrink-0",
                                }),
                                _jsxs("span", {
                                  children: [
                                    _jsx("span", {
                                      className: "block text-xs font-semibold",
                                      children: "Automatic Fetch",
                                    }),
                                    _jsx("span", {
                                      className:
                                        "block text-[10px] opacity-75 mt-0.5",
                                      children: "Fill from Maersk or MSC",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            _jsxs("button", {
                              type: "button",
                              onClick: () => {
                                setEntryMode("manual");
                                setTrackingFetchState("idle");
                                setTrackingFetchMessage("");
                              },
                              className: cn(
                                "flex items-start gap-2 rounded-md border p-2.5 text-left transition-colors",
                                entryMode === "manual"
                                  ? "border-teal-500 bg-teal-500/10 text-teal-800 dark:text-teal-200"
                                  : "bg-background hover:bg-muted/50",
                              ),
                              children: [
                                _jsx(Keyboard, {
                                  className: "h-4 w-4 mt-0.5 shrink-0",
                                }),
                                _jsxs("span", {
                                  children: [
                                    _jsx("span", {
                                      className: "block text-xs font-semibold",
                                      children: "Manual Entry",
                                    }),
                                    _jsx("span", {
                                      className:
                                        "block text-[10px] opacity-75 mt-0.5",
                                      children: "Enter every field yourself",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  _jsxs("div", {
                    className: "grid grid-cols-2 gap-4",
                    children: [
                      _jsxs("div", {
                        className: "col-span-2 sm:col-span-1",
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Importer Company (Client)",
                          }),
                          _jsxs(Select, {
                            value: newForm.companyId,
                            onValueChange: (v) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  companyId: v,
                                }),
                              ),
                            children: [
                              _jsx(SelectTrigger, {
                                className: "h-8 text-sm mt-1",
                                children: _jsx(SelectValue, {
                                  placeholder: "Select Importer",
                                }),
                              }),
                              _jsx(SelectContent, {
                                children: companies.map((c) =>
                                  _jsx(
                                    SelectItem,
                                    { value: c.id, children: c.name },
                                    c.id,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "col-span-2 sm:col-span-1",
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Exporter Company",
                          }),
                          _jsxs(Select, {
                            value: newForm.exporterCompanyId,
                            onValueChange: (v) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  exporterCompanyId: v,
                                }),
                              ),
                            children: [
                              _jsx(SelectTrigger, {
                                className: "h-8 text-sm mt-1",
                                children: _jsx(SelectValue, {
                                  placeholder: "Select Exporter",
                                }),
                              }),
                              _jsx(SelectContent, {
                                children: exporterCompanies.map((c) =>
                                  _jsx(
                                    SelectItem,
                                    { value: c.id, children: c.name },
                                    c.id,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "BL Number",
                          }),
                          _jsx(Input, {
                            value: newForm.blNumber,
                            onChange: (e) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  blNumber: e.target.value,
                                }),
                              ),
                            className: "h-8 text-sm mt-1",
                            placeholder: "BL-2025-001",
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Shipping Line",
                          }),
                          _jsxs(Select, {
                            value: newForm.shippingLine,
                            onValueChange: (v) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  shippingLine: v,
                                }),
                              ),
                            children: [
                              _jsx(SelectTrigger, {
                                className: "h-8 text-sm mt-1",
                                children: _jsx(SelectValue, {
                                  placeholder: "Select a shipping line",
                                }),
                              }),
                              _jsx(SelectContent, {
                                children: shippingLines.map((line) =>
                                  _jsx(
                                    SelectItem,
                                    { value: line, children: line },
                                    line,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        ],
                      }),
                      !editingId &&
                        entryMode === "automatic" &&
                        _jsxs("div", {
                          className:
                            "col-span-2 rounded-md border px-3 py-2.5 bg-background",
                          children: [
                            _jsxs("div", {
                              className:
                                "flex items-center justify-between gap-3",
                              children: [
                                _jsxs("div", {
                                  className: "flex items-start gap-2 min-w-0",
                                  children: [
                                    trackingFetchState === "loading"
                                      ? _jsx(Loader2, {
                                          className:
                                            "h-4 w-4 mt-0.5 shrink-0 animate-spin text-teal-600",
                                        })
                                      : trackingFetchState === "success"
                                        ? _jsx(CheckCircle2, {
                                            className:
                                              "h-4 w-4 mt-0.5 shrink-0 text-emerald-600",
                                          })
                                        : trackingFetchState === "error"
                                          ? _jsx(AlertCircle, {
                                              className:
                                                "h-4 w-4 mt-0.5 shrink-0 text-red-600",
                                            })
                                          : _jsx(WandSparkles, {
                                              className:
                                                "h-4 w-4 mt-0.5 shrink-0 text-muted-foreground",
                                            }),
                                    _jsxs("div", {
                                      className: "min-w-0",
                                      children: [
                                        _jsx("p", {
                                          className: "text-xs font-medium",
                                          children:
                                            trackingFetchState === "idle"
                                              ? "Enter BL and select Maersk or MSC"
                                              : trackingFetchState === "loading"
                                                ? "Fetching carrier details"
                                                : trackingFetchState ===
                                                    "success"
                                                  ? "Carrier details added"
                                                  : "Could not fetch details",
                                        }),
                                        _jsx("p", {
                                          className: cn(
                                            "text-[10px] mt-0.5 break-words",
                                            trackingFetchState === "error"
                                              ? "text-red-600"
                                              : "text-muted-foreground",
                                          ),
                                          children:
                                            trackingFetchMessage ||
                                            "Vessel, ports, dates, status and containers will be filled automatically.",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                _jsxs(Button, {
                                  type: "button",
                                  variant: "outline",
                                  size: "sm",
                                  className: "h-7 text-[11px] shrink-0",
                                  disabled:
                                    trackingFetchState === "loading" ||
                                    !newForm.blNumber.trim() ||
                                    !carrierSupported(newForm.shippingLine),
                                  onClick: () => {
                                    lastAutomaticLookup.current = `${newForm.shippingLine}:${newForm.blNumber.trim().toUpperCase()}`;
                                    void fetchTrackingDetails(
                                      newForm.blNumber,
                                      newForm.shippingLine,
                                    );
                                  },
                                  children: [
                                    _jsx(RefreshCw, {
                                      className: cn(
                                        "h-3 w-3 mr-1",
                                        trackingFetchState === "loading" &&
                                          "animate-spin",
                                      ),
                                    }),
                                    trackingFetchState === "success"
                                      ? "Refresh"
                                      : "Fetch Now",
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Vessel Name",
                          }),
                          _jsx(Input, {
                            value: newForm.vesselName,
                            onChange: (e) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  vesselName: e.target.value,
                                }),
                              ),
                            className: "h-8 text-sm mt-1",
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Origin Port",
                          }),
                          _jsx(Input, {
                            value: newForm.originPort,
                            onChange: (e) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  originPort: e.target.value,
                                }),
                              ),
                            className: "h-8 text-sm mt-1",
                            placeholder: "Shanghai",
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Destination Port",
                          }),
                          _jsx(Input, {
                            value: newForm.destinationPort,
                            onChange: (e) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  destinationPort: e.target.value,
                                }),
                              ),
                            className: "h-8 text-sm mt-1",
                            placeholder: "Nhava Sheva",
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "ETD",
                          }),
                          _jsx(Input, {
                            type: "date",
                            value: newForm.etd,
                            onChange: (e) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  etd: e.target.value,
                                }),
                              ),
                            className: "h-8 text-sm mt-1",
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "ETA",
                          }),
                          _jsx(Input, {
                            type: "date",
                            value: newForm.eta,
                            onChange: (e) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  eta: e.target.value,
                                }),
                              ),
                            className: "h-8 text-sm mt-1",
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Priority",
                          }),
                          _jsxs(Select, {
                            value: newForm.priority,
                            onValueChange: (v) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  priority: v,
                                }),
                              ),
                            children: [
                              _jsx(SelectTrigger, {
                                className: "h-8 text-sm mt-1",
                                children: _jsx(SelectValue, {}),
                              }),
                              _jsxs(SelectContent, {
                                children: [
                                  _jsx(SelectItem, {
                                    value: "urgent",
                                    children: "Urgent",
                                  }),
                                  _jsx(SelectItem, {
                                    value: "high",
                                    children: "High",
                                  }),
                                  _jsx(SelectItem, {
                                    value: "normal",
                                    children: "Normal",
                                  }),
                                  _jsx(SelectItem, {
                                    value: "low",
                                    children: "Low",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Status",
                          }),
                          _jsxs(Select, {
                            value: newForm.status,
                            onValueChange: (v) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  status: v,
                                }),
                              ),
                            children: [
                              _jsx(SelectTrigger, {
                                className: "h-8 text-sm mt-1",
                                children: _jsx(SelectValue, {}),
                              }),
                              _jsx(SelectContent, {
                                children: STATUSES.filter(
                                  (s) => s.value !== "all",
                                ).map((s) =>
                                  _jsx(
                                    SelectItem,
                                    { value: s.value, children: s.label },
                                    s.value,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Shipment Value",
                          }),
                          _jsx(Input, {
                            type: "number",
                            value: newForm.shipmentValue,
                            onChange: (e) =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  shipmentValue: e.target.value,
                                }),
                              ),
                            className: "h-8 text-sm mt-1",
                            placeholder: "0",
                          }),
                        ],
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx(Label, {
                        className: "text-xs",
                        children: "Origin Country",
                      }),
                      _jsx(Input, {
                        value: newForm.originCountry,
                        onChange: (e) =>
                          setNewForm(
                            Object.assign(Object.assign({}, newForm), {
                              originCountry: e.target.value,
                            }),
                          ),
                        className: "h-8 text-sm mt-1",
                        placeholder: "China",
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                    children: [
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Goods Description",
                          }),
                          _jsx(Input, {
                            value: newForm.goodsDescription,
                            onChange: (e) =>
                              setNewForm({
                                ...newForm,
                                goodsDescription: e.target.value,
                              }),
                            className: "h-8 text-sm mt-1",
                            placeholder: "Main goods in this shipment",
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs",
                            children: "Notes",
                          }),
                          _jsx(Input, {
                            value: newForm.notes,
                            onChange: (e) =>
                              setNewForm({
                                ...newForm,
                                notes: e.target.value,
                              }),
                            className: "h-8 text-sm mt-1",
                            placeholder: "Shipment notes",
                          }),
                        ],
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "border rounded-lg p-3 space-y-2",
                    children: [
                      _jsxs("div", {
                        children: [
                          _jsx(Label, {
                            className: "text-xs font-semibold",
                            children: "Tracking Notification Recipients",
                          }),
                          _jsx("p", {
                            className: "text-[10px] text-muted-foreground mt-0.5",
                            children:
                              "All active admins are included automatically. Select additional people for status and ETA emails.",
                          }),
                        ],
                      }),
                      notificationUsers.length === 0
                        ? _jsx("p", {
                            className: "text-xs text-muted-foreground",
                            children: "No active users are available.",
                          })
                        : _jsx("div", {
                            className:
                              "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto",
                            children: notificationUsers
                              .filter(
                                (user) =>
                                  !["admin", "super_admin"].includes(user.role),
                              )
                              .map((user) =>
                                _jsxs(
                                  "label",
                                  {
                                    className:
                                      "flex items-start gap-2 rounded-md border px-3 py-2 text-xs cursor-pointer",
                                    children: [
                                      _jsx("input", {
                                        type: "checkbox",
                                        className: "mt-0.5",
                                        checked:
                                          newForm.notificationUserIds.includes(
                                            user.id,
                                          ),
                                        onChange: (event) =>
                                          setNewForm({
                                            ...newForm,
                                            notificationUserIds: event.target
                                              .checked
                                              ? [
                                                  ...newForm.notificationUserIds,
                                                  user.id,
                                                ]
                                              : newForm.notificationUserIds.filter(
                                                  (id) => id !== user.id,
                                                ),
                                          }),
                                      }),
                                      _jsxs("span", {
                                        className: "min-w-0",
                                        children: [
                                          _jsx("span", {
                                            className:
                                              "block font-medium truncate",
                                            children: user.name,
                                          }),
                                          _jsx("span", {
                                            className:
                                              "block text-[10px] text-muted-foreground truncate",
                                            children: user.email,
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  user.id,
                                ),
                              ),
                          }),
                    ],
                  }),
                  !editingId &&
                    _jsxs("div", {
                      className: "border rounded-lg p-3 space-y-2",
                      children: [
                        _jsx(Label, {
                          className: "text-xs font-semibold",
                          children: "Documents Required",
                        }),
                        documentChecklist.length === 0
                          ? _jsx("p", {
                              className: "text-xs text-muted-foreground",
                              children:
                                "No document checklist items are configured.",
                            })
                          : _jsx("div", {
                              className:
                                "grid grid-cols-1 sm:grid-cols-2 gap-2",
                              children: documentChecklist.map((document) =>
                                _jsxs(
                                  "label",
                                  {
                                    className:
                                      "flex items-center gap-2 rounded-md border px-3 py-2 text-xs cursor-pointer",
                                    children: [
                                      _jsx("input", {
                                        type: "checkbox",
                                        checked:
                                          newForm.requiredDocumentIds.includes(
                                            document.id,
                                          ),
                                        onChange: (event) =>
                                          setNewForm({
                                            ...newForm,
                                            requiredDocumentIds: event.target
                                              .checked
                                              ? [
                                                  ...newForm.requiredDocumentIds,
                                                  document.id,
                                                ]
                                              : newForm.requiredDocumentIds.filter(
                                                  (id) => id !== document.id,
                                                ),
                                          }),
                                      }),
                                      _jsx("span", {
                                        className: "flex-1",
                                        children: document.name,
                                      }),
                                      document.isRequired &&
                                        _jsx(Badge, {
                                          variant: "outline",
                                          className: "text-[9px]",
                                          children: "Required",
                                        }),
                                    ],
                                  },
                                  document.id,
                                ),
                              ),
                            }),
                      ],
                    }),
                  _jsxs("div", {
                    className: "border-t pt-4",
                    children: [
                      _jsxs("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                          _jsx(Label, {
                            className: "text-xs font-semibold",
                            children: "Containers",
                          }),
                          _jsxs(Button, {
                            type: "button",
                            onClick: () =>
                              setNewForm(
                                Object.assign(Object.assign({}, newForm), {
                                  containers: [
                                    ...newForm.containers,
                                    {
                                      containerNumber: "",
                                      size: "20FT",
                                      type: "Dry Container",
                                      goodsDescription: "",
                                    },
                                  ],
                                }),
                              ),
                            className: "h-6 text-xs px-2",
                            size: "sm",
                            children: [
                              _jsx(Plus, { className: "w-3 h-3 mr-1" }),
                              " Add Container",
                            ],
                          }),
                        ],
                      }),
                      newForm.containers.length === 0
                        ? _jsx("p", {
                            className: "text-xs text-gray-500",
                            children: "No containers added yet",
                          })
                        : _jsx("div", {
                            className: "space-y-2",
                            children: newForm.containers.map((container, idx) =>
                              _jsxs(
                                "div",
                                {
                                  className:
                                    "grid grid-cols-1 sm:grid-cols-[1fr_90px_140px_auto] gap-2 items-end rounded-lg border p-3",
                                  children: [
                                    _jsxs("div", {
                                      className: "flex-1",
                                      children: [
                                        _jsx(Label, {
                                          className: "text-xs",
                                          children: "Container Number",
                                        }),
                                        _jsx(Input, {
                                          value: container.containerNumber,
                                          onChange: (e) => {
                                            const newContainers = [
                                              ...newForm.containers,
                                            ];
                                            newContainers[idx].containerNumber =
                                              e.target.value;
                                            setNewForm(
                                              Object.assign(
                                                Object.assign({}, newForm),
                                                { containers: newContainers },
                                              ),
                                            );
                                          },
                                          className: "h-7 text-xs mt-1",
                                          placeholder: "CONT-123456",
                                        }),
                                      ],
                                    }),
                                    _jsxs("div", {
                                      className: "w-24",
                                      children: [
                                        _jsx(Label, {
                                          className: "text-xs",
                                          children: "Size",
                                        }),
                                        _jsxs(Select, {
                                          value: container.size,
                                          onValueChange: (v) => {
                                            const newContainers = [
                                              ...newForm.containers,
                                            ];
                                            newContainers[idx].size = v;
                                            setNewForm(
                                              Object.assign(
                                                Object.assign({}, newForm),
                                                { containers: newContainers },
                                              ),
                                            );
                                          },
                                          children: [
                                            _jsx(SelectTrigger, {
                                              className: "h-7 text-xs mt-1",
                                              children: _jsx(SelectValue, {}),
                                            }),
                                            _jsx(SelectContent, {
                                              children: containerSizes.map(
                                                (size) =>
                                                  _jsx(
                                                    SelectItem,
                                                    {
                                                      value: size,
                                                      children: size,
                                                    },
                                                    size,
                                                  ),
                                              ),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    _jsxs("div", {
                                      className: "w-36",
                                      children: [
                                        _jsx(Label, {
                                          className: "text-xs",
                                          children: "Type",
                                        }),
                                        _jsxs(Select, {
                                          value: container.type,
                                          onValueChange: (v) => {
                                            const newContainers = [
                                              ...newForm.containers,
                                            ];
                                            newContainers[idx].type = v;
                                            setNewForm(
                                              Object.assign(
                                                Object.assign({}, newForm),
                                                { containers: newContainers },
                                              ),
                                            );
                                          },
                                          children: [
                                            _jsx(SelectTrigger, {
                                              className: "h-7 text-xs mt-1",
                                              children: _jsx(SelectValue, {}),
                                            }),
                                            _jsx(SelectContent, {
                                              children: containerTypes.map(
                                                (type) =>
                                                  _jsx(
                                                    SelectItem,
                                                    {
                                                      value: type,
                                                      children: type,
                                                    },
                                                    type,
                                                  ),
                                              ),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    _jsxs("div", {
                                      className: "sm:col-span-3",
                                      children: [
                                        _jsx(Label, {
                                          className: "text-xs",
                                          children: "Container Goods",
                                        }),
                                        _jsx(Input, {
                                          value:
                                            container.goodsDescription || "",
                                          onChange: (e) => {
                                            const newContainers = [
                                              ...newForm.containers,
                                            ];
                                            newContainers[
                                              idx
                                            ].goodsDescription = e.target.value;
                                            setNewForm({
                                              ...newForm,
                                              containers: newContainers,
                                            });
                                          },
                                          className: "h-7 text-xs mt-1",
                                          placeholder:
                                            "Goods description for this container",
                                        }),
                                      ],
                                    }),
                                    _jsx(Button, {
                                      type: "button",
                                      onClick: () =>
                                        setNewForm(
                                          Object.assign(
                                            Object.assign({}, newForm),
                                            {
                                              containers:
                                                newForm.containers.filter(
                                                  (_, i) => i !== idx,
                                                ),
                                            },
                                          ),
                                        ),
                                      variant: "ghost",
                                      className:
                                        "h-7 px-2 text-xs text-red-600 hover:text-red-700",
                                      size: "sm",
                                      children: _jsx(X, {
                                        className: "w-3 h-3",
                                      }),
                                    }),
                                  ],
                                },
                                idx,
                              ),
                            ),
                          }),
                    ],
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx(Label, {
                        className: "text-xs",
                        children: "Internal Notes",
                      }),
                      _jsx(Input, {
                        value: newForm.internalNotes,
                        onChange: (e) =>
                          setNewForm(
                            Object.assign(Object.assign({}, newForm), {
                              internalNotes: e.target.value,
                            }),
                          ),
                        className: "h-8 text-sm mt-1",
                      }),
                    ],
                  }),
                ],
              }),
            }),
            _jsxs(DialogFooter, {
              className: "px-6 py-4 border-t",
              children: [
                _jsx(Button, {
                  variant: "outline",
                  onClick: () => setNewShipmentOpen(false),
                  className: "h-8 text-xs",
                  children: "Cancel",
                }),
                _jsx(Button, {
                  onClick: saveShipment,
                  className: "h-8 text-xs",
                  children: editingId ? "Save Changes" : "Create Shipment",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
