"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  Search,
  X,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import { getInvoices, updateInvoiceStatus } from "@/lib/services/invoiceService";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import { Invoice } from "@/lib/types";
import {
  BankilyLogo,
  MasrviLogo,
  SedadLogo,
  BPMLogo,
} from "@/components/ui/PaymentLogos";

export default function SimpleDashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "sent" | "overdue">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getInvoices();
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleRefresh = () => loadData();
    const handleSearch = (e: any) => {
      if (e.detail !== undefined) setSearchQuery(e.detail);
    };

    window.addEventListener("simple-invoice-refresh", handleRefresh);
    window.addEventListener("simple-invoice-search", handleSearch);

    return () => {
      window.removeEventListener("simple-invoice-refresh", handleRefresh);
      window.removeEventListener("simple-invoice-search", handleSearch);
    };
  }, []);

  // Calculs simples & directs
  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.total, 0);

    const pendingAmount = invoices
      .filter((i) => i.status === "sent" || i.status === "draft")
      .reduce((sum, i) => sum + i.total, 0);

    const overdueAmount = invoices
      .filter((i) => i.status === "overdue")
      .reduce((sum, i) => sum + i.total, 0);

    return {
      totalRevenue,
      pendingAmount,
      overdueAmount,
      countTotal: invoices.length,
      countPaid: invoices.filter((i) => i.status === "paid").length,
      countPending: invoices.filter((i) => i.status === "sent").length,
    };
  }, [invoices]);

  // Filtrage
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (filterStatus !== "all") {
        if (filterStatus === "paid" && inv.status !== "paid") return false;
        if (filterStatus === "sent" && inv.status !== "sent" && inv.status !== "draft") return false;
        if (filterStatus === "overdue" && inv.status !== "overdue") return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const clientName = inv.client?.name || "";
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        clientName.toLowerCase().includes(q) ||
        inv.total.toString().includes(q)
      );
    });
  }, [invoices, filterStatus, searchQuery]);

  const handleDownload = async (inv: Invoice) => {
    toast.loading(`Téléchargement de ${inv.invoiceNumber}...`, { id: inv.id });
    try {
      await downloadInvoicePDF({
        reference: inv.invoiceNumber,
        clientName: inv.client?.name || "Client",
        clientEmail: inv.client?.email,
        clientPhone: inv.client?.phone,
        clientAddress: inv.client?.address,
        date: new Date(inv.issueDate).toLocaleDateString("fr-FR"),
        dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("fr-FR") : undefined,
        total: inv.total,
        status: inv.status,
        items: inv.items?.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      });
      toast.success("Facture PDF générée !", { id: inv.id });
    } catch {
      toast.error("Erreur lors du téléchargement", { id: inv.id });
    }
  };

  const handleWhatsApp = (inv: Invoice) => {
    const clientName = inv.client?.name || "Client";
    const msg = `Bonjour ${clientName},\nVoici votre facture *${inv.invoiceNumber}* d'un montant de *${inv.total.toLocaleString("fr-FR")} MRU*.\nMerci pour votre règlement.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Message WhatsApp ouvert");
  };

  const handleMarkPaid = async (inv: Invoice) => {
    try {
      await updateInvoiceStatus(inv.id, "paid");
      toast.success(`Facture ${inv.invoiceNumber} marquée comme réglée`);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Erreur de mise à jour");
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ["Facture", "Client", "Montant (MRU)", "Date", "Statut"];
      const rows = filteredInvoices.map((i) => [
        i.invoiceNumber,
        `"${(i.client?.name || "").replace(/"/g, '""')}"`,
        i.total,
        new Date(i.issueDate).toLocaleDateString("fr-FR"),
        i.status === "paid" ? "Payée" : i.status === "overdue" ? "En retard" : "En attente",
      ]);

      const csv =
        "\uFEFF" +
        headers.join(";") +
        "\n" +
        rows.map((r) => r.join(";")).join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Factures-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export CSV téléchargé !");
    } catch {
      toast.error("Erreur lors de l'export CSV");
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. GRILLE KPI ÉPURÉE & ESSENTIELLE (3 cartes claires)    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1 : Total Encaissé */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>TOTAL ENCAISSÉ</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalRevenue.toLocaleString("fr-FR")} <span className="text-sm font-bold text-slate-500">MRU</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {stats.countPaid} facture(s) réglée(s)
          </p>
        </div>

        {/* KPI 2 : En attente */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>EN ATTENTE</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 tracking-tight">
            {stats.pendingAmount.toLocaleString("fr-FR")} <span className="text-sm font-bold text-amber-600">MRU</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-1">
            {stats.countPending} facture(s) en cours
          </p>
        </div>

        {/* KPI 3 : Factures Émises */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>FACTURES DU MOIS</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Receipt size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.countTotal} <span className="text-sm font-bold text-slate-500">factures</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Historique complet actif
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BANDEAU DE CANAUX DE PAIEMENT DISCRET                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Moyens de règlement acceptés :</span>
        </div>
        <div className="flex items-center gap-3">
          <BankilyLogo height={20} variant="badge" />
          <MasrviLogo height={20} variant="badge" />
          <SedadLogo height={20} variant="badge" />
          <BPMLogo height={18} />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TABLEAU DES FACTURES (ÉPURÉ & LISIBLE)                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        {/* Ligne En-tête du tableau : Filtres en Pilules & Recherche */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          {/* Filtres Pilules */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 text-xs overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: `Toutes (${invoices.length})` },
              { id: "paid", label: `Payées (${stats.countPaid})` },
              { id: "sent", label: `En attente (${stats.countPending})` },
              { id: "overdue", label: `En retard` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === tab.id
                    ? "bg-white text-sky-700 shadow-xs scale-102"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Raccourci Export CSV */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet size={14} className="text-slate-500" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-200/70">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/70">
                <th className="py-3 px-4">Facture</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Receipt size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Aucune facture trouvée</p>
                    <p className="text-xs text-slate-400 mt-0.5">Cliquez sur « Nouvelle Facture » en haut pour commencer.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-sky-600">
                      <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {inv.client?.name || "Client Partenaire"}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500 tabular-nums">
                      {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-950 tabular-nums text-sm">
                      {inv.total.toLocaleString("fr-FR")} MRU
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          inv.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : inv.status === "overdue"
                            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                            : "bg-amber-50 text-amber-800 border border-amber-200/60"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            inv.status === "paid"
                              ? "bg-emerald-500"
                              : inv.status === "overdue"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {inv.status === "paid"
                          ? "Payée"
                          : inv.status === "overdue"
                          ? "En retard"
                          : "En attente"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownload(inv)}
                          title="Télécharger le PDF"
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
                        >
                          <Download size={15} />
                        </button>

                        <button
                          onClick={() => handleWhatsApp(inv)}
                          title="Partager par WhatsApp"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Share2 size={15} />
                        </button>

                        {inv.status !== "paid" && (
                          <button
                            onClick={() => handleMarkPaid(inv)}
                            title="Marquer comme payée"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
