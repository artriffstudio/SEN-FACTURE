"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Building2,
  FileText,
  Calendar,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import {
  getInvoiceById,
  updateInvoiceStatus,
} from "@/lib/services/invoiceService";
import { getCompany } from "@/lib/services/companyService";
import { Invoice } from "@/lib/types";
import Tooltip from "@/components/ui/Tooltip";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const inv = await getInvoiceById(resolvedParams.id);
        if (inv) setInvoice(inv);
      } catch (err) {
        console.error("Erreur chargement facture:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();

    getCompany().then((comp) => {
      if (comp?.logoUrl) {
        setCompanyLogo(comp.logoUrl);
      }
    });
  }, [resolvedParams.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sen_facture_company_logo");
      if (saved) setCompanyLogo(saved);
    }
  }, []);

  const formatMoney = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} FCFA`;
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    try {
      await updateInvoiceStatus(invoice.id, "paid");
      setInvoice({ ...invoice, status: "paid" });
      toast.success(`Facture ${invoice.invoiceNumber} marquée comme payée !`);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleDownload = async () => {
    if (!invoice) return;
    toast.loading("Génération du PDF officiel...", { id: "pdf-doc" });
    const ok = await downloadInvoicePDF({
      reference: invoice.invoiceNumber,
      clientName: invoice.client?.name || "Client Entreprise",
      clientAddress: invoice.client?.address || "Dakar, Sénégal",
      clientEmail: invoice.client?.email || "contact@client.sn",
      clientPhone: invoice.client?.phone || "+221 33 800 00 00",
      date: invoice.issueDate || "12/03/2025",
      dueDate: invoice.dueDate || "12/04/2025",
      total: invoice.total,
      status: invoice.status,
      logoUrl: companyLogo || undefined,
    });
    if (ok) {
      toast.success(`Facture ${invoice.invoiceNumber} téléchargée !`, { id: "pdf-doc" });
    } else {
      toast.error("Erreur lors de la création du PDF", { id: "pdf-doc" });
    }
  };

  const handleWhatsAppShare = () => {
    if (!invoice) return;
    const message = `Bonjour ${invoice.client?.name || "Client"},\nVoici votre facture *${invoice.invoiceNumber}* d'un montant de *${formatMoney(invoice.total)}* émise par SEN FACTURE.\nMerci de votre confiance !`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    toast.success("Lien WhatsApp généré !");
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Chargement de la facture...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-12">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <FileText size={26} />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">Facture introuvable</h2>
        <p className="text-xs text-slate-500 mb-6">Cette facture n'existe pas ou a été supprimée.</p>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all"
        >
          <ArrowLeft size={14} />
          <span>Retour aux factures</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs hover:scale-105 active:scale-95 transition-all"
            title="Retour aux factures"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  invoice.status === "paid"
                    ? "bg-emerald-100/80 text-emerald-700 border-emerald-200/60"
                    : invoice.status === "overdue"
                    ? "bg-rose-100 text-rose-700 border-rose-200/60"
                    : "bg-amber-100 text-amber-800 border-amber-200/60"
                }`}
              >
                {invoice.status === "paid"
                  ? "Payée"
                  : invoice.status === "overdue"
                  ? "En retard"
                  : "En cours"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Émise le {invoice.issueDate || "12/03/2025"} — Échéance : {invoice.dueDate || "12/04/2025"}
            </p>
          </div>
        </div>

        {/* Boutons d'actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Partager WhatsApp */}
          <Tooltip content="Partager sur WhatsApp" icon={Share2}>
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </Tooltip>

          {/* Imprimer */}
          <Tooltip content="Imprimer" icon={Printer}>
            <button
              onClick={() => {
                window.print();
                toast.success("Impression lancée");
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
          </Tooltip>

          {invoice.status !== "paid" && (
            <Tooltip content="Marquer comme payée" icon={Check}>
              <button
                onClick={handleMarkAsPaid}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Check size={14} className="stroke-[2.5]" />
                <span>Marquer payée</span>
              </button>
            </Tooltip>
          )}

          {/* Télécharger le PDF officiel */}
          <Tooltip content="Télécharger le PDF" icon={Download}>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <Download size={15} />
              <span>Télécharger le PDF</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Feuille A4 virtuelle conforme au Design System */}
      <div
        id="live-invoice-preview-sheet"
        className="card-interactive bg-white rounded-2xl border border-slate-300/80 p-6 sm:p-10 max-w-4xl mx-auto shadow-xl space-y-8 text-xs text-slate-800"
      >
        {/* En-tête A4 */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Logo Entreprise"
                  className="w-11 h-11 rounded-xl object-contain border border-slate-200 bg-white shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-black text-base flex items-center justify-center tracking-tighter shrink-0">
                  SF
                </div>
              )}
              <span className="text-xl font-black text-slate-900 tracking-tight">
                SEN FACTURE
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 space-y-0.5">
              <p className="font-bold text-slate-700">Teranga Digital SARL</p>
              <p>46 Boulevard de la République, Dakar Plateau, Sénégal</p>
              <p>NINEA : SN-009876543-2B | RC : SN.DKR.2024.B.1234</p>
              <p>Tél : +221 77 123 45 67 | contact@senfacture.sn</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-sky-50 text-sky-700 font-extrabold text-xs px-3.5 py-1 rounded-md tracking-wider uppercase border border-sky-200">
              FACTURE
            </span>
            <p className="text-base font-black text-slate-900 mt-2">
              {invoice.invoiceNumber}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Émise le : <span className="font-bold text-slate-700">{invoice.issueDate || "12/03/2025"}</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Échéance : <span className="font-bold text-slate-700">{invoice.dueDate || "12/04/2025"}</span>
            </p>
          </div>
        </div>

        {/* Bloc Destinataire Facturé À */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              FACTURÉ À
            </p>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              {invoice.client?.name || "Client Entreprise"}
            </h3>
            <p className="text-slate-600 text-[11px] mt-0.5">{invoice.client?.address || "Dakar, Sénégal"}</p>
            <p className="text-slate-600 text-[11px]">{invoice.client?.email || "contact@client.sn"}</p>
            <p className="text-slate-600 text-[11px]">{invoice.client?.phone || "+221 33 800 00 00"}</p>
          </div>

          <div className="text-right text-[11px]">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Statut
            </p>
            <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 font-bold px-3 py-0.5 rounded-full text-[10px] border border-emerald-200/60">
              Règlement en règle
            </span>
          </div>
        </div>

        {/* Tableau des prestations */}
        <div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 text-[11px] font-bold">
                <th className="py-2.5">Désignation des prestations</th>
                <th className="py-2.5 text-center">Qté</th>
                <th className="py-2.5 text-right">Prix unit.</th>
                <th className="py-2.5 text-right">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((it: any) => (
                  <tr key={it.id} className="text-[11px]">
                    <td className="py-3 pr-2 font-medium text-slate-800">
                      {it.description}
                    </td>
                    <td className="py-3 text-center text-slate-600 font-bold">
                      {it.quantity}
                    </td>
                    <td className="py-3 text-right text-slate-600">
                      {formatMoney(it.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      {formatMoney(it.quantity * it.unitPrice)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-[11px]">
                  <td className="py-3 pr-2 font-medium text-slate-800">
                    Prestation contractuelle et intégration numérique — {invoice.client?.name || "Client"}
                  </td>
                  <td className="py-3 text-center text-slate-600 font-bold">1</td>
                  <td className="py-3 text-right text-slate-600">
                    {formatMoney(Math.round(invoice.total / 1.18))}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    {formatMoney(Math.round(invoice.total / 1.18))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totaux financiers */}
        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <div className="w-72 space-y-2 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total Hors Taxes (HT) :</span>
              <span className="font-bold text-slate-800">
                {formatMoney(Math.round(invoice.total / 1.18))}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>TVA légale (18% SYSCOHADA) :</span>
              <span className="font-bold text-slate-800">
                {formatMoney(Math.round(invoice.total - invoice.total / 1.18))}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2.5 border-t-2 border-slate-900 text-slate-900">
              <span className="text-xs font-bold uppercase">TOTAL NET TTC :</span>
              <span className="text-lg font-black text-sky-600">
                {formatMoney(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Pied de page et modalités */}
        <div className="pt-5 border-t border-slate-200 text-[10px] text-slate-500 space-y-1.5">
          <p>
            <strong className="text-slate-700">Modalités de règlement :</strong> Règlements acceptés sous 30 jours par Wave Mobile Money, Orange Money ou virement bancaire BICIS.
          </p>
          <div className="pt-2 text-center text-[9px] text-slate-400 font-medium">
            SEN FACTURE — Document certifié conforme aux normes fiscales SYSCOHADA et République du Sénégal
          </div>
        </div>
      </div>
    </div>
  );
}
