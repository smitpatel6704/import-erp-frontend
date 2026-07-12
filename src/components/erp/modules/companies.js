"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Search, Plus, Phone, Mail, Globe, MapPin, Ship, FileText, CreditCard, Hash, User, Trash2, Pencil, Inbox, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { cn } from "@/lib/utils";
import { useERPStore } from "@/lib/store";
import { PageHeader } from "@/components/erp/page-header";
import { SectionHeader } from "@/components/erp/section-header";
import { StatusBadge } from "@/components/erp/status-badge";
import { EmptyState } from "@/components/erp/empty-state";
import { TableSkeleton } from "@/components/erp/loading-state";
import ExporterCompanyManagement from "./exporter-company-management";

const currencyFmt = (val) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

export function ImporterCompanyManagement() {
  const canCreate = useERPStore((s) => s.canAction("companies", "create"));
  const canDelete = useERPStore((s) => s.canAction("companies", "delete"));
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteCompany, setDeleteCompany] = useState(null);
  const [newCompanyOpen, setNewCompanyOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [newForm, setNewForm] = useState({
    name: "", contactPerson: "", mobile: "", email: "", officeAddress: "",
    customFields: [{ name: "", value: "" }],
    bankName: "", bankAccount: "", bankIfsc: "", billingAddress: "", shippingAddress: "", creditLimit: "",
  });

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", companyType: "importer", isActive: "true" });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/companies?${params}`);
      const json = await res.json();
      setCompanies(json.data || []);
      setTotalCount(json.pagination?.total || 0);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, searchQuery]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const res = await fetch(`/api/companies/${id}`);
      const json = await res.json();
      setSelectedCompany(json.data);
    } catch (e) { console.error(e); } finally { setDetailLoading(false); }
  };

  const createCompany = async () => {
    if (!canCreate) return;
    try {
      const method = editingCompanyId ? "PUT" : "POST";
      const url = editingCompanyId ? `/api/companies/${editingCompanyId}` : "/api/companies";
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newForm, creditLimit: parseFloat(newForm.creditLimit) || 0, companyType: "importer" }) });
      setNewCompanyOpen(false);
      setEditingCompanyId(null);
      setNewForm({ name: "", contactPerson: "", mobile: "", email: "", officeAddress: "", customFields: [{ name: "", value: "" }], bankName: "", bankAccount: "", bankIfsc: "", billingAddress: "", shippingAddress: "", creditLimit: "" });
      fetchCompanies();
    } catch (e) { console.error(e); }
  };

  const handleEdit = (company) => {
    setEditingCompanyId(company.id);
    let customFields = [{ name: "", value: "" }];
    try {
      if (company.customFields) {
        const parsed = typeof company.customFields === "string" ? JSON.parse(company.customFields) : company.customFields;
        if (Array.isArray(parsed) && parsed.length > 0) customFields = parsed;
      }
    } catch (e) {}
    setNewForm({
      name: company.name || "", contactPerson: company.contactPerson || "", mobile: company.mobile || "",
      email: company.email || "", officeAddress: company.officeAddress || "", customFields,
      bankName: company.bankName || "", bankAccount: company.bankAccount || "", bankIfsc: company.bankIfsc || "",
      billingAddress: company.billingAddress || "", shippingAddress: company.shippingAddress || "", creditLimit: company.creditLimit || "",
    });
    setNewCompanyOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteCompany) return;
    if (!canDelete) { setDeleteCompany(null); return; }
    try {
      const res = await fetch(`/api/companies/${deleteCompany.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteCompany(null);
      if (selectedCompany?.id === deleteCompany.id) { setDetailOpen(false); setSelectedCompany(null); }
      fetchCompanies();
    } catch (e) { console.error(e); }
  };

  const getOutstanding = (company) => company?.invoices?.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0) || 0;

  return (
    <>
      <div className="space-y-5">
        <PageHeader icon={Building2} title="Companies" description="Manage importer and exporter companies">
          {canCreate && (
            <Button size="sm" className="h-9" onClick={() => { setEditingCompanyId(null); setNewForm({ name: "", contactPerson: "", mobile: "", email: "", officeAddress: "", customFields: [{ name: "", value: "" }], bankName: "", bankAccount: "", bankIfsc: "", billingAddress: "", shippingAddress: "", creditLimit: "" }); setNewCompanyOpen(true); }}>
              <Plus className="mr-1.5 h-4 w-4" />Add Company
            </Button>
          )}
        </PageHeader>

        <Tabs defaultValue="importers">
          <TabsList>
            <TabsTrigger value="importers" className="text-xs">Importers</TabsTrigger>
            <TabsTrigger value="exporters" className="text-xs">Exporters</TabsTrigger>
          </TabsList>

          <TabsContent value="importers" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search name, GST, IEC, email..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="h-9 pl-9 text-sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{totalCount} importers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <Card><CardContent className="p-5"><TableSkeleton rows={6} cols={6} /></CardContent></Card>
            ) : companies.length === 0 ? (
              <EmptyState icon={Building2} title="No companies found" description="Try adjusting your search or add an importer company." action={canCreate && <Button size="sm" onClick={() => { setNewCompanyOpen(true); }}><Plus className="mr-1.5 h-4 w-4" />Add Importer</Button>} />
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3 font-semibold">Company</th>
                        <th className="hidden px-4 py-3 font-semibold sm:table-cell">Contact</th>
                        <th className="hidden px-4 py-3 font-semibold md:table-cell">Email</th>
                        <th className="hidden px-4 py-3 font-semibold lg:table-cell">GST / IEC</th>
                        <th className="px-4 py-3 font-semibold">Activity</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="w-20 px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((c) => (
                        <tr key={c.id} onClick={() => openDetail(c.id)} className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8 ring-1 ring-border/50">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{c.name.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-foreground">{c.name}</p>
                                <p className="text-[10px] text-muted-foreground">{c.contactPerson || "No contact"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span>{c.mobile || "—"}</span>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 md:table-cell">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[150px]">{c.email || "—"}</span>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 lg:table-cell text-xs text-muted-foreground">
                            {c.gstNumber && <p>GST: {c.gstNumber}</p>}
                            {c.iecCode && <p>IEC: {c.iecCode}</p>}
                            {!c.gstNumber && !c.iecCode && "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1"><Ship className="h-3 w-3 text-muted-foreground" />{c._count?.shipments || 0}</span>
                              <span className="flex items-center gap-1"><FileText className="h-3 w-3 text-muted-foreground" />{c._count?.invoices || 0}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", c.isActive ? "border-success/20 bg-success/10 text-success" : "border-danger/20 bg-danger/10 text-danger")}>
                              <span className={cn("mr-1 h-1.5 w-1.5 rounded-full", c.isActive ? "bg-success" : "bg-danger")} />
                              {c.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                              {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-danger" onClick={() => setDeleteCompany(c)}><Trash2 className="h-3.5 w-3.5" /></Button>}
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
          </TabsContent>

          <TabsContent value="exporters">
            <ExporterCompanyManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-1 ring-border/50">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{selectedCompany?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle>{selectedCompany?.name || "Loading..."}</DialogTitle>
                <DialogDescription>{selectedCompany?.contactPerson ? `Contact: ${selectedCompany.contactPerson}` : "No contact person"}</DialogDescription>
              </div>
              {selectedCompany && (
                <div className="ml-auto">
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", selectedCompany.isActive ? "border-success/20 bg-success/10 text-success" : "border-danger/20 bg-danger/10 text-danger")}>
                    {selectedCompany.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              )}
            </div>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 py-8">
              <div className="animate-shimmer h-5 w-40 rounded-lg" />
              <div className="animate-shimmer h-20 w-full rounded-lg" />
              <div className="animate-shimmer h-20 w-full rounded-lg" />
            </div>
          ) : selectedCompany ? (
            <Tabs defaultValue="info">
              <TabsList className="mb-4">
                <TabsTrigger value="info" className="text-xs">Company Info</TabsTrigger>
                <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contact</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{selectedCompany.email || "—"}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{selectedCompany.mobile || "—"}</span></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Regulatory</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>GST: <span className="font-medium">{selectedCompany.gstNumber || "—"}</span></p>
                      <p>IEC: <span className="font-medium">{selectedCompany.iecCode || "—"}</span></p>
                      <p>PAN: <span className="font-medium">{selectedCompany.panNumber || "—"}</span></p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Office Address</p>
                    <p className="mt-1 text-sm">{selectedCompany.officeAddress || "Not provided"}</p>
                  </div>
                  {selectedCompany.billingAddress && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Billing Address</p>
                      <p className="mt-1 text-sm">{selectedCompany.billingAddress}</p>
                    </div>
                  )}
                  {selectedCompany.shippingAddress && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Shipping Address</p>
                      <p className="mt-1 text-sm">{selectedCompany.shippingAddress}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bank Details</p>
                    <div className="mt-2 space-y-1.5 text-sm">
                      <p>Bank: <span className="font-medium">{selectedCompany.bankName || "—"}</span></p>
                      <p>Account: <span className="font-medium">{selectedCompany.bankAccount || "—"}</span></p>
                      <p>IFSC: <span className="font-medium">{selectedCompany.bankIfsc || "—"}</span></p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Credit & Payment</p>
                    <div className="mt-2 space-y-1.5 text-sm">
                      <p>Credit Limit: <span className="font-medium">{currencyFmt(selectedCompany.creditLimit)}</span></p>
                      <p>Outstanding: <span className="font-medium text-warning">{currencyFmt(getOutstanding(selectedCompany))}</span></p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <Ship className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                    <p className="text-2xl font-bold text-foreground">{selectedCompany._count?.shipments || 0}</p>
                    <p className="text-xs text-muted-foreground">Shipments</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <FileText className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                    <p className="text-2xl font-bold text-foreground">{selectedCompany._count?.invoices || 0}</p>
                    <p className="text-xs text-muted-foreground">Invoices</p>
                  </div>
                </div>
                {selectedCompany.creditLimit > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Credit Utilization</p>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((getOutstanding(selectedCompany) / selectedCompany.creditLimit) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : null}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedCompany && handleEdit(selectedCompany)}><Pencil className="mr-1.5 h-4 w-4" />Edit</Button>
            <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={newCompanyOpen} onOpenChange={(open) => { if (!open) { setNewCompanyOpen(false); setEditingCompanyId(null); } }}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCompanyId ? "Edit Company" : "Add Company"}</DialogTitle>
            <DialogDescription>{editingCompanyId ? "Update company details." : "Register a new importer company."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <SectionHeader title="Basic Information" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label className="text-xs">Company Name</Label>
                <Input className="h-9 text-sm" value={newForm.name} onChange={(e) => setNewForm((c) => ({ ...c, name: e.target.value }))} placeholder="e.g. ABC Imports" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Contact Person</Label>
                <Input className="h-9 text-sm" value={newForm.contactPerson} onChange={(e) => setNewForm((c) => ({ ...c, contactPerson: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Mobile</Label>
                <Input className="h-9 text-sm" value={newForm.mobile} onChange={(e) => setNewForm((c) => ({ ...c, mobile: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Email</Label>
                <Input className="h-9 text-sm" type="email" value={newForm.email} onChange={(e) => setNewForm((c) => ({ ...c, email: e.target.value }))} placeholder="name@company.com" />
              </div>
              <div className="col-span-2 grid gap-1.5">
                <Label className="text-xs">Office Address</Label>
                <textarea className="min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" value={newForm.officeAddress} onChange={(e) => setNewForm((c) => ({ ...c, officeAddress: e.target.value }))} placeholder="Full address" />
              </div>
            </div>

            <SectionHeader title="Bank Details" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Bank Name</Label>
                <Input className="h-9 text-sm" value={newForm.bankName} onChange={(e) => setNewForm((c) => ({ ...c, bankName: e.target.value }))} placeholder="Bank name" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Account Number</Label>
                <Input className="h-9 text-sm" value={newForm.bankAccount} onChange={(e) => setNewForm((c) => ({ ...c, bankAccount: e.target.value }))} placeholder="Account number" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">IFSC Code</Label>
                <Input className="h-9 text-sm" value={newForm.bankIfsc} onChange={(e) => setNewForm((c) => ({ ...c, bankIfsc: e.target.value }))} placeholder="IFSC code" />
              </div>
            </div>

            <SectionHeader title="Addresses & Credit" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label className="text-xs">Billing Address</Label>
                <textarea className="min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" value={newForm.billingAddress} onChange={(e) => setNewForm((c) => ({ ...c, billingAddress: e.target.value }))} placeholder="Billing address" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Shipping Address</Label>
                <textarea className="min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" value={newForm.shippingAddress} onChange={(e) => setNewForm((c) => ({ ...c, shippingAddress: e.target.value }))} placeholder="Shipping address" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Credit Limit ($)</Label>
                <Input type="number" className="h-9 text-sm" value={newForm.creditLimit} onChange={(e) => setNewForm((c) => ({ ...c, creditLimit: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" onClick={() => { setNewCompanyOpen(false); setEditingCompanyId(null); }}>Cancel</Button>
            <Button onClick={createCompany} disabled={!newForm.name.trim()}>{editingCompanyId ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteCompany}
        onOpenChange={(open) => { if (!open) setDeleteCompany(null); }}
        title="Delete Company"
        description={`Are you sure you want to delete ${deleteCompany?.name || "this company"}? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default function CompaniesModule() {
  return <ImporterCompanyManagement />;
}
