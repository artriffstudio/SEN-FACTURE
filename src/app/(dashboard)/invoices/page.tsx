"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  Share2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import {
  getInvoices,
  updateInvoiceStatus,
  deleteInvoice,
} from "@/lib/services/invoiceService";
import { Invoice } from "@/lib/types";
import Tooltip from "@/components/ui/Tooltip";
import { useTranslation } from "@/contexts/LanguageContext";

export default function InvoicesPage() {
  const { t, formatMoney } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const statusTabs = [
    { label: t.invoices.filterAll, value: "all" },
    { label: t.invoices.filterPaid, value: "paid" },
    { label: t.invoices.filterPending, value: "sent" },
    { label: t.invoices.filterOverdue, value: "overdue" },
  ];

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data || []);
    } catch (err) {
      console.error("Erreur chargement factures:", err);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
    const onCreated = () => loadInvoices();
    window.addEventListener("invoice-created", onCreated);
    return () => window.removeEventListener("invoice-created", onCreated);
  }, []);

  const handleMarkAsPaid = async (inv: Invoice, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateInvoiceStatus(inv.id, "paid");
      toast.success(`${t.invoices.invoiceNumber} ${inv.invoiceNumber} -> ${t.status.paid} !`);
      loadInvoices();
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la mise à jour");
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchStatus =
        selectedStatus === "all"
          ? true
          : selectedStatus === "paid"
          ? inv.status === "paid"
          : selectedStatus === "overdue"
          ? inv.status === "overdue"
          : inv.status === "sent" || inv.status === "draft";

      const clientName = inv.client?.name || "";
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [invoices, selectedStatus, searchQuery]);

  const handleDownloadPDF = async (inv: any) => {
    toast.loading(`${t.invoices.downloadPDF} ${inv.invoiceNumber}...`, { id: `pdf-${inv.id}` });
    try {
      await downloadInvoicePDF({
        reference: inv.invoiceNumber,
        clientName: inv.client?.name || "Client Entreprise",
        clientAddress: inv.client?.address || "Nouakchott, Mauritanie",
        clientEmail: inv.client?.email || "contact@client.mr",
        clientPhone: inv.client?.phone || "+222 45 00 00 00",
        date: inv.issueDate || "12/03/2025",
        dueDate: inv.dueDate || "12/04/2025",
        total: inv.total,
        taxRate: inv.taxRate || 16,
        status: inv.status,
        items: inv.items || undefined,
      });
      toast.success(`${inv.invoiceNumber} - PDF OK !`, { id: `pdf-${inv.id}` });
    } catch {
      toast.error("Erreur téléchargement PDF", { id: `pdf-${inv.id}` });
    }
  };

  const handleWhatsAppShare = (inv: any) => {
    const clientName = inv.client?.name || "Client";
    const msg = `Bonjour ${clientName},\nVoici votre facture *${inv.invoiceNumber}* d'un montant de *${formatMoney(inv.total)}* émise par Facturim.\nMerci de votre confiance !`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Lien WhatsApp généré !");
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* EN-TÊTE DE LA PAGE */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.invoices.title}
            </h1>
            <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {invoices.length} {t.nav.invoices}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.invoices.subtitle}
          </p>
        </div>

        {/* Bouton CTA Primaire Unique */}
        <Tooltip content={t.invoices.newInvoice} icon={Plus}>
          <Link
            href="/invoices/new"
            className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0 cursor-pointer"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>{t.invoices.newInvoice}</span>
          </Link>
        </Tooltip>
      </div>

      {/* ======================================================== */}
      {/* CARTE TABLEAU PRINCIPALE (DESIGN SYSTEM) */}
      {/* ======================================================== */}
      <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Onglets de statuts */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {statusTabs.map((tab) => {
            const active = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`pb-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer px-2 ${
                  active
                    ? "text-sky-600 font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.75 bg-sky-500 rounded-t-full shadow-xs" />
                )}
              </button>
            );
          })}
        </div>

        {/* Barre de recherche */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 max-w-md w-full focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par référence, client..."
              className="bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            {filteredInvoices.length} résultat(s)
          </span>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/70">
                <th className="py-3 px-4 sm:px-6">{t.invoices.invoiceNumber}</th>
                <th className="py-3 px-4">{t.invoices.client}</th>
                <th className="py-3 px-4 hidden md:table-cell">{t.invoices.issueDate}</th>
                <th className="py-3 px-4 hidden lg:table-cell">{t.invoices.dueDate}</th>
                <th className="py-3 px-4 text-right">{t.invoices.totalTTC}</th>
                <th className="py-3 px-4 text-center">{t.invoices.status}</th>
                <th className="py-3 px-4 sm:px-6 text-right">{t.invoices.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === "paid";
                const isOverdue = inv.status === "overdue";

                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-sky-50/40 transition-colors group cursor-pointer"
                  >
                    {/* Référence */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-1.5"
                      >
                        <FileText size={14} className="text-slate-400 group-hover:text-sky-600" />
                        <span>{inv.invoiceNumber}</span>
                      </Link>
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {inv.client?.name || "Client"}
                    </td>

                    {/* Date émission */}
                    <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">
                      {inv.issueDate || "—"}
                    </td>

                    {/* Échéance */}
                    <td className="py-3.5 px-4 text-slate-600 hidden lg:table-cell">
                      {inv.dueDate || "—"}
                    </td>

                    {/* Montant TTC */}
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                      {formatMoney(inv.total)}
                    </td>

                    {/* Statut */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPaid
                            ? "bg-emerald-100/80 text-emerald-700 border-emerald-200/60"
                            : isOverdue
                            ? "bg-rose-100 text-rose-700 border-rose-200/60"
                            : "bg-amber-100 text-amber-800 border-amber-200/60"
                        }`}
                      >
                        {isPaid ? t.status.paid : isOverdue ? t.status.overdue : t.status.sent}
                      </span>
                    </td>

                    {/* Actions avec Tooltips Design System */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isPaid && (
                          <Tooltip content={t.status.paid} icon={Check}>
                            <button
                              onClick={(e) => handleMarkAsPaid(inv, e)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all cursor-pointer"
                            >
                              <Check size={14} className="stroke-[2.5]" />
                            </button>
                          </Tooltip>
                        )}

                        {/* Télécharger PDF officiel */}
                        <Tooltip content={t.invoices.downloadPDF} icon={Download}>
                          <button
                            onClick={() => handleDownloadPDF(inv)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-all cursor-pointer"
                          >
                            <Download size={14} />
                          </button>
                        </Tooltip>

                        {/* Partager WhatsApp */}
                        <Tooltip content={t.invoices.shareWhatsApp} icon={Share2}>
                          <button
                            onClick={() => handleWhatsAppShare(inv)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all cursor-pointer"
                          >
                            <Share2 size={14} />
                          </button>
                        </Tooltip>

                        {/* Consulter */}
                        <Tooltip content={t.invoices.viewDetails} icon={Eye}>
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
                          >
                            <Eye size={14} />
                          </Link>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-100 shadow-xs">
              <FileText size={26} className="stroke-[2.2]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              {t.dashboard.emptyInvoices}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {t.invoices.certifiedNotice}
            </p>
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg transition-all"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span>{t.dashboard.createFirstInvoice}</span>
            </Link>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <p className="font-semibold">{t.dashboard.emptyInvoices}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
