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
import { useTranslation } from "@/contexts/LanguageContext";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t, formatMoney } = useTranslation();
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
      const saved =
        localStorage.getItem("facturim_company_logo") ||
        localStorage.getItem("sen_facture_company_logo");
      if (saved) setCompanyLogo(saved);
    }
  }, []);

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    try {
      await updateInvoiceStatus(invoice.id, "paid");
      setInvoice({ ...invoice, status: "paid" });
      toast.success(`Facture ${invoice.invoiceNumber} marquée comme payée en intégralité !`);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleMarkAsPartiallyPaid = async () => {
    if (!invoice) return;
    try {
      await updateInvoiceStatus(invoice.id, "partially_paid");
      setInvoice({ ...invoice, status: "partially_paid" });
      toast.success(`Acompte pour la facture ${invoice.invoiceNumber} enregistré avec succès !`);
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
      clientAddress: invoice.client?.address || "Nouakchott, Mauritanie",
      clientEmail: invoice.client?.email || "contact@client.mr",
      clientPhone: invoice.client?.phone || "+222 45 00 00 00",
      date: invoice.issueDate || "12/03/2025",
      dueDate: invoice.dueDate || "12/04/2025",
      total: invoice.total,
      taxRate: invoice.taxRate || 16,
      depositAmount: invoice.depositAmount,
      depositPercentage: invoice.depositPercentage,
      remainingAmount: invoice.remainingAmount,
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
    const acompteMention =
      invoice.depositAmount && invoice.depositAmount > 0
        ? `\n*Acompte exigible : ${formatMoney(invoice.depositAmount)}*\n*Solde : ${formatMoney(invoice.remainingAmount || invoice.total - invoice.depositAmount)}*`
        : "";
    const message = `Bonjour ${invoice.client?.name || "Client"},\nVoici votre facture *${invoice.invoiceNumber}* d'un montant de *${formatMoney(invoice.total)}* émise par Facturim.${acompteMention}\nMerci de votre confiance !`;
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

  const effectiveDeposit =
    invoice.depositAmount ||
    (invoice.depositPercentage ? Math.round(invoice.total * (invoice.depositPercentage / 100)) : 0);
  const effectiveRemaining =
    invoice.remainingAmount !== undefined
      ? invoice.remainingAmount
      : effectiveDeposit > 0
      ? invoice.total - effectiveDeposit
      : invoice.total;

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs hover:scale-105 active:scale-95 transition-all"
            title={t.nav.invoices}
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
                    : invoice.status === "partially_paid"
                    ? "bg-amber-100/90 text-amber-900 border-amber-300/70"
                    : invoice.status === "overdue"
                    ? "bg-rose-100 text-rose-700 border-rose-200/60"
                    : "bg-sky-100 text-sky-800 border-sky-200/60"
                }`}
              >
                {invoice.status === "paid"
                  ? t.status.paid
                  : invoice.status === "partially_paid"
                  ? t.status.partially_paid
                  : invoice.status === "overdue"
                  ? t.status.overdue
                  : t.status.sent}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.invoices.issueDate} : {invoice.issueDate || "12/03/2025"} — {t.invoices.dueDate} : {invoice.dueDate || "12/04/2025"}
            </p>
          </div>
        </div>

        {/* Boutons d'actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Partager WhatsApp */}
          <Tooltip content={t.invoices.shareWhatsApp} icon={Share2}>
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

          {/* Encaisser l'acompte si non payé */}
          {invoice.status !== "paid" && invoice.status !== "partially_paid" && effectiveDeposit > 0 && (
            <Tooltip content={t.invoices.collectDeposit} icon={Check}>
              <button
                onClick={handleMarkAsPartiallyPaid}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Check size={14} className="stroke-[2.5]" />
                <span>{t.invoices.collectDeposit} ({formatMoney(effectiveDeposit)})</span>
              </button>
            </Tooltip>
          )}

          {/* Encaisser le solde ou marquer comme payée */}
          {invoice.status !== "paid" && (
            <Tooltip content={invoice.status === "partially_paid" ? t.invoices.collectBalance : t.status.paid} icon={Check}>
              <button
                onClick={handleMarkAsPaid}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Check size={14} className="stroke-[2.5]" />
                <span>
                  {invoice.status === "partially_paid"
                    ? `${t.invoices.collectBalance} (${formatMoney(effectiveRemaining)})`
                    : t.status.paid}
                </span>
              </button>
            </Tooltip>
          )}

          {/* Télécharger le PDF officiel */}
          <Tooltip content={t.invoices.downloadPDF} icon={Download}>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <Download size={15} />
              <span>{t.invoices.downloadPDF}</span>
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
                  FI
                </div>
              )}
              <span className="text-xl font-black text-slate-900 tracking-tight">
                FACTURIM
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 space-y-0.5">
              <p className="font-bold text-slate-700">Facturim Mauritanie SARL</p>
              <p>Avenue du Roi Fayçal, Tevragh Zeina, Nouakchott, Mauritanie</p>
              <p>NIF : 00987654-MR | RC : MR.NKTT.2025.B.1234</p>
              <p>Tél : +222 45 25 00 00 | contact@facturim.mr</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-sky-50 text-sky-700 font-extrabold text-xs px-3.5 py-1 rounded-md tracking-wider uppercase border border-sky-200">
              FACTURE / فاتورة
            </span>
            <p className="text-base font-black text-slate-900 mt-2">
              {invoice.invoiceNumber}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {t.invoices.issueDate} : <span className="font-bold text-slate-700">{invoice.issueDate || "12/03/2025"}</span>
            </p>
            <p className="text-[11px] text-slate-500">
              {t.invoices.dueDate} : <span className="font-bold text-slate-700">{invoice.dueDate || "12/04/2025"}</span>
            </p>
          </div>
        </div>

        {/* Bloc Destinataire Facturé À */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t.invoices.client}
            </p>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              {invoice.client?.name || "Client Entreprise"}
            </h3>
            <p className="text-slate-600 text-[11px] mt-0.5">{invoice.client?.address || "Nouakchott, Mauritanie"}</p>
            <p className="text-slate-600 text-[11px]">{invoice.client?.email || "contact@client.mr"}</p>
            <p className="text-slate-600 text-[11px]">{invoice.client?.phone || "+222 45 00 00 00"}</p>
          </div>

          <div className="text-right text-[11px]">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t.invoices.status}
            </p>
            <span
              className={`inline-block mt-1 font-bold px-3 py-0.5 rounded-full text-[10px] border ${
                invoice.status === "paid"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                  : invoice.status === "partially_paid"
                  ? "bg-amber-100 text-amber-900 border-amber-300/70"
                  : "bg-sky-50 text-sky-700 border-sky-200/60"
              }`}
            >
              {invoice.status === "paid"
                ? t.status.paid
                : invoice.status === "partially_paid"
                ? t.status.partially_paid
                : t.status.sent}
            </span>
          </div>
        </div>

        {/* Tableau des prestations */}
        <div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 text-[11px] font-bold">
                <th className="py-2.5">{t.invoices.description}</th>
                <th className="py-2.5 text-center">{t.invoices.quantity}</th>
                <th className="py-2.5 text-right">{t.invoices.unitPrice}</th>
                <th className="py-2.5 text-right">{t.invoices.subtotal}</th>
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
                    Prestation de services &amp; ingénierie — {invoice.client?.name || "Client"}
                  </td>
                  <td className="py-3 text-center text-slate-600 font-bold">1</td>
                  <td className="py-3 text-right text-slate-600">
                    {formatMoney(Math.round(invoice.total / 1.16))}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    {formatMoney(Math.round(invoice.total / 1.16))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totaux financiers */}
        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <div className="w-80 space-y-2 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>{t.invoices.amountHT} :</span>
              <span className="font-bold text-slate-800">
                {formatMoney(Math.round(invoice.total / 1.16))}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t.invoices.taxAmount} ({t.vatRateLabel}) :</span>
              <span className="font-bold text-slate-800">
                {formatMoney(Math.round(invoice.total - invoice.total / 1.16))}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2.5 border-t-2 border-slate-900 text-slate-900">
              <span className="text-xs font-bold uppercase">{t.invoices.totalTTC} :</span>
              <span className="text-lg font-black text-sky-600">
                {formatMoney(invoice.total)}
              </span>
            </div>

            {/* Ligne d'acompte si configuré */}
            {effectiveDeposit > 0 && (
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200/90 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-amber-900 font-extrabold text-xs">
                  <span>{t.invoices.depositDue} ({invoice.depositPercentage || Math.round((effectiveDeposit / invoice.total) * 100)}%) :</span>
                  <span>{formatMoney(effectiveDeposit)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 font-bold text-[11px] pt-1 border-t border-dashed border-amber-300/80">
                  <span>{t.invoices.remainingBalance} :</span>
                  <span className="text-slate-900">{formatMoney(effectiveRemaining)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pied de page et modalités */}
        <div className="pt-5 border-t border-slate-200 text-[10px] text-slate-500 space-y-1.5">
          <p>
            <strong className="text-slate-700">{t.invoices.paymentTerms} :</strong> Règlements acceptés sous 30 jours par Bankily (BPM), Seddap, Masrvi ou virement bancaire BPM.
          </p>
          <div className="pt-2 text-center text-[9px] text-slate-400 font-medium">
            FACTURIM — {t.invoices.certifiedNotice}
          </div>
        </div>
      </div>
    </div>
  );
}
