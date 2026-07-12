'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FolderOpen, Search, FileText, Eye, Clock, CheckCircle2, AlertTriangle,
  Upload, Ship, ChevronRight, Plus, Download, X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useERPStore } from '@/lib/store';
import { PageHeader } from '@/components/erp/page-header';
import { SectionHeader } from '@/components/erp/section-header';
import { StatCard, StatCardCompact } from '@/components/erp/stat-card';
import { StatusBadge } from '@/components/erp/status-badge';
import { EmptyState } from '@/components/erp/empty-state';
import { TableSkeleton } from '@/components/erp/loading-state';
import { toast } from '@/hooks/use-toast';

export function DocumentsModule() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shipments, setShipments] = useState([]);
  const [checklistShipment, setChecklistShipment] = useState(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [checklistTypes, setChecklistTypes] = useState([]);
  const [checklistData, setChecklistData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const [shipRes, statsRes] = await Promise.all([
        fetch('/api/shipments?limit=100'),
        fetch('/api/shipment-documents/stats')
      ]);
      const shipJson = await shipRes.json();
      const statsJson = await statsRes.json();
      if (shipJson.data) setShipments(shipJson.data);
      if (statsJson.data) setGlobalStats(statsJson.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  const openChecklist = async (shipment) => {
    setChecklistShipment(shipment);
    setChecklistOpen(true);
    try {
      const [typesRes, dataRes] = await Promise.all([
        fetch('/api/shipment-documents/checklist-types'),
        fetch(`/api/shipment-documents/shipment/${shipment.id}/checklist`),
      ]);
      const typesJson = await typesRes.json();
      const dataJson = await dataRes.json();
      setChecklistTypes(Array.isArray(typesJson.data) ? typesJson.data : []);
      setChecklistData(Array.isArray(dataJson.data) ? dataJson.data : []);
    } catch (err) { console.error(err); }
  };

  const docStatus = (item) => {
    if (item.document?.verifiedAt) return 'verified';
    if (item.document?.rejectedAt) return 'rejected';
    if (item.document?.uploadedAt) return 'uploaded';
    if (item.isRequired) return 'missing';
    return 'optional';
  };

  const filteredShipments = shipments.filter((s) =>
    !search || s.shipmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.company?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = globalStats || { total: 0, verified: 0, pending: 0, rejected: 0, expired: 0, missing: 0 };

  return (
    <>
      <div className="space-y-5">
        <PageHeader icon={FolderOpen} title="Documents" description="Document control center for all shipments" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard compact label="Total" value={stats.total} icon={FileText} />
          <StatCard compact label="Verified" value={stats.verified} icon={CheckCircle2} />
          <StatCard compact label="Pending" value={stats.pending} icon={Clock} />
          <StatCard compact label="Rejected" value={stats.rejected} icon={AlertTriangle} />
          <StatCard compact label="Expired" value={stats.expired} icon={AlertTriangle} />
          <StatCard compact label="Missing" value={stats.missing} icon={AlertTriangle} />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by shipment number or importer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-9 text-sm"
                />
              </div>
              <span className="text-xs text-muted-foreground">{filteredShipments.length} shipments</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipment Document Cards */}
        {loading ? (
          <Card><CardContent className="p-5"><TableSkeleton rows={5} cols={4} /></CardContent></Card>
        ) : filteredShipments.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No shipments found" description="Try adjusting your search." />
        ) : (
          <div className="space-y-3">
            {filteredShipments.slice(0, 20).map((shipment) => (
              <div
                key={shipment.id}
                onClick={() => openChecklist(shipment)}
                className="flex cursor-pointer items-center gap-4 rounded-lg border bg-card p-4 shadow-xs transition-all hover:border-primary/20 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                  <Ship className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{shipment.shipmentNumber}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{shipment.company?.name || "—"}</span>
                    <span>•</span>
                    <span>{shipment.originPort || "?"} → {shipment.destinationPort || "?"}</span>
                  </div>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <StatusBadge status={shipment.status} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Checklist Drawer */}
      <Dialog open={checklistOpen} onOpenChange={setChecklistOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                <Ship className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{checklistShipment?.shipmentNumber || "Checklist"}</DialogTitle>
                <DialogDescription>
                  {checklistShipment?.company?.name} — {checklistShipment?.originPort} → {checklistShipment?.destinationPort}
                </DialogDescription>
              </div>
              {checklistShipment && <StatusBadge status={checklistShipment.status} />}
            </div>
          </DialogHeader>

          {checklistData.length === 0 ? (
            <EmptyState icon={FileText} title="No checklist items" description="No document requirements defined for this shipment." compact />
          ) : (
            <div className="space-y-1">
              {['booking', 'departure', 'arrival', 'clearance', 'delivery'].map((stage) => {
                const items = checklistData.filter((i) => i.checklistItem?.shipmentStage === stage);
                if (items.length === 0) return null;
                return (
                  <div key={stage} className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stage}</p>
                    <div className="space-y-1">
                      {items.map((item) => {
                        const status = docStatus(item);
                        return (
                          <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
                            <div className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                              status === 'verified' && "bg-success/10 text-success",
                              status === 'rejected' && "bg-danger/10 text-danger",
                              status === 'uploaded' && "bg-info/10 text-info",
                              status === 'missing' && "bg-muted text-muted-foreground",
                            )}>
                              {status === 'verified' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                               status === 'rejected' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                               status === 'uploaded' ? <Upload className="h-3.5 w-3.5" /> :
                               <FileText className="h-3.5 w-3.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{item.checklistItem?.name || "Document"}</p>
                              <p className="text-xs text-muted-foreground">
                                {status === 'verified' && `Verified ${item.document?.verifiedAt ? format(new Date(item.document.verifiedAt), "MMM d") : ""}`}
                                {status === 'rejected' && `Rejected: ${item.document?.rejectionReason || "No reason"}`}
                                {status === 'uploaded' && `Uploaded ${item.document?.uploadedAt ? format(new Date(item.document.uploadedAt), "MMM d") : ""}`}
                                {status === 'missing' && (item.isRequired ? "Required - not yet uploaded" : "Optional")}
                              </p>
                            </div>
                            <StatusBadge status={status} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DocumentsPage() {
  return <DocumentsModule />;
}
