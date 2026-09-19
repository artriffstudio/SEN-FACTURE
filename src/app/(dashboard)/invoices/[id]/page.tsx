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
import { Invoice, Company } from "@/lib/types";
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
  const [company, setCompany] = useState<Company | null>(null);
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
      if (comp) {
        setCompany(comp);
        if (comp.logoUrl) {
          setCompanyLogo(comp.logoUrl);
        }
      }
    });
  }, [resolvedParams.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("facturim_company_logo");
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
      items: invoice.items,
      companyName: company?.name,
      companyTradeName: company?.tradeName,
      companyAddress: company?.address,
      companyTaxId: company?.taxId,
      companyPhone: company?.phone,
      companyEmail: company?.email,
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
        className="card-interactive relative bg-white rounded-2xl border border-slate-300/80 p-6 sm:p-10 max-w-4xl mx-auto shadow-xl space-y-5 text-xs text-slate-800 overflow-hidden"
      >
        {/* 1. En-tête Ultra-Moderne */}
        <div className="relative z-10 flex justify-between items-start border-b-2 border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="Logo Entreprise"
                className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-white shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center tracking-tight shrink-0 shadow-xs">
                FI
              </div>
            )}
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                {company?.name || "Facturim Mauritanie SARL"}
              </h2>
              <p className="text-[10.5px] text-slate-500 font-medium">
                Plateforme de Facturation &amp; Services
              </p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-black text-sky-600 uppercase tracking-wide">
              FACTURE
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5 justify-end">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-700 font-extrabold text-[10px] font-mono whitespace-nowrap">
                N° {invoice.invoiceNumber}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] whitespace-nowrap">
                {invoice.issueDate || "12/03/2025"}
              </span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-end mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500 font-medium text-[10px] whitespace-nowrap">
                  Échéance : {invoice.dueDate}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Coordonnées complètes (Sans inscriptions ÉMETTEUR / DESTINATAIRE) */}
        <div className="relative z-10 flex justify-between items-start text-[11px] leading-relaxed pt-1">
          {/* Émetteur à gauche */}
          <div className="text-left space-y-0.5 max-w-[48%]">
            <h3 className="font-black text-xs text-slate-900 uppercase">
              {company?.name || "Facturim Mauritanie SARL"}
            </h3>
            <p className="text-slate-600">{company?.phone || "+221 77 890 12 52"}</p>
            <p className="text-slate-600">{company?.email || "eywamarket@gmail.com"}</p>
            <p className="text-slate-600 font-mono">NIF : {company?.taxId || "SN-009876543-2B"}</p>
            <p className="text-slate-600">{company?.address || "Almadies, Zone 4"}</p>
          </div>

          {/* Destinataire complètement à droite */}
          <div className="text-right space-y-0.5 max-w-[48%]">
            <h4 className="font-black text-xs text-slate-900">
              {invoice.client?.name || "Client Entreprise"}
            </h4>
            <p className="text-slate-600">{invoice.client?.phone || "+222 45 00 00 00"}</p>
            <p className="text-slate-600">{invoice.client?.email || "contact@client.mr"}</p>
            <p className="text-slate-600">{invoice.client?.address || "Nouakchott, Mauritanie"}</p>
          </div>
        </div>

        {/* 3. Tableau des prestations avec Colonne # et En-tête Bleu Signature */}
        <div className="relative z-10 pt-1">
          <table className="w-full border-collapse border border-sky-600 text-xs">
            <thead>
              <tr className="bg-sky-600 text-white font-extrabold text-[10px] uppercase tracking-wider">
                <th className="p-2 border border-sky-600 text-center w-8 whitespace-nowrap">#</th>
                <th className="p-2.5 border border-sky-600 text-left">DESCRIPTION</th>
                <th className="p-2.5 border border-sky-600 text-right w-28 whitespace-nowrap">PRIX UNITAIRE</th>
                <th className="p-2 border border-sky-600 text-center w-12 whitespace-nowrap">QTÉ</th>
                <th className="p-2.5 border border-sky-600 text-right w-28 whitespace-nowrap">TOTAL HT</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((it: any, idx: number) => (
                  <tr key={it.id} className={`text-[11px] ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="p-2 border border-slate-200 text-center text-slate-500 font-bold font-mono">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="p-2.5 border border-slate-200 font-semibold text-slate-900">
                      {it.description}
                    </td>
                    <td className="p-2.5 border border-slate-200 text-right text-slate-700 whitespace-nowrap">
                      {formatMoney(it.unitPrice)}
                    </td>
                    <td className="p-2 border border-slate-200 text-center text-slate-700 font-mono">
                      {String(it.quantity || 1).padStart(2, "0")}
                    </td>
                    <td className="p-2.5 border border-slate-200 text-right font-bold text-slate-950 whitespace-nowrap">
                      {formatMoney(it.quantity * it.unitPrice)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-[11px] bg-white">
                  <td className="p-2 border border-slate-200 text-center text-slate-500 font-bold font-mono">01</td>
                  <td className="p-2.5 border border-slate-200 font-semibold text-slate-900">
                    Prestation de service
                  </td>
                  <td className="p-2.5 border border-slate-200 text-right text-slate-700 whitespace-nowrap">
                    {formatMoney(Math.round(invoice.total / 1.16))}
                  </td>
                  <td className="p-2 border border-slate-200 text-center text-slate-700 font-mono">01</td>
                  <td className="p-2.5 border border-slate-200 text-right font-bold text-slate-950 whitespace-nowrap">
                    {formatMoney(Math.round(invoice.total / 1.16))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Bloc Bas : Cartouche QR & Totaux en Bleu */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-end gap-3 pt-1">
          
          {/* Cartouche QR Code conforme à la capture utilisateur */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-center gap-3 shadow-2xs w-full sm:w-auto">
            <div className="w-13 h-13 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0 shadow-2xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                  `https://facturim.net/pay/${invoice.invoiceNumber}`
                )}&color=0f172a&bgcolor=ffffff`}
                alt="QR Paiement"
                className="w-11 h-11 object-contain"
              />
            </div>
            <div className="space-y-0.5 text-left">
              <p className="font-extrabold text-slate-900 text-[11.5px] leading-tight">
                Paiement direct
              </p>
              <p className="font-bold text-slate-800 text-[11px] leading-tight">
                Bankily • Masrvi • Sedad
              </p>
              <p className="text-slate-400 text-[9.5px] leading-tight">
                Scannez pour régler en 1 clic
              </p>
            </div>
          </div>

          {/* Totaux Chiffrés & Bandeau Bleu */}
          <div className="w-full sm:w-64 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">Sous-total HT :</span>
              <span className="font-bold text-slate-900">
                {formatMoney(Math.round(invoice.total / 1.16))}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">TVA légale (16%) :</span>
              <span className="font-bold text-slate-900">
                {formatMoney(Math.round(invoice.total - invoice.total / 1.16))}
              </span>
            </div>

            {effectiveDeposit > 0 && (
              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200 text-[11px]">
                <span className="font-medium">Acompte exigible ({invoice.depositPercentage || Math.round((effectiveDeposit / invoice.total) * 100)}%) :</span>
                <span className="font-bold text-slate-900">{formatMoney(effectiveDeposit)}</span>
              </div>
            )}

            {effectiveDeposit > 0 && (
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span className="font-medium">Solde restant :</span>
                <span className="font-bold text-slate-900">{formatMoney(effectiveRemaining)}</span>
              </div>
            )}

            {/* Bandeau TOTAL Plein Bleu Signature (#0284c7) */}
            <div className="w-full bg-sky-600 text-white p-2.5 rounded-lg flex justify-between items-center mt-2 shadow-xs">
              <span className="text-[11px] font-extrabold tracking-wider uppercase whitespace-nowrap">
                TOTAL NET TTC :
              </span>
              <span className="text-base font-black tracking-tight tabular-nums whitespace-nowrap">
                {formatMoney(invoice.total)}
              </span>
            </div>
          </div>

        </div>

        {/* 5. Coordonnées de Paiement & Mentions */}
        <div className="relative z-10 border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 text-[10.5px]">
          <div className="sm:col-span-8 space-y-0.5">
            <p className="font-bold text-slate-900">
              Paiement à l'ordre de {company?.name || "Facturim Mauritanie SARL"}
            </p>
            <p className="text-slate-600">
              N° Bankily / Masrvi / Compte : <span className="font-bold text-slate-900 font-mono">{company?.phone || "+221 77 890 12 52"}</span>
            </p>
            <p className="text-slate-400 text-[9.5px]">Paiement par Bankily, Masrvi ou virement bancaire.</p>
          </div>

          <div className="sm:col-span-4 text-left sm:text-right space-y-0.5">
            <p className="font-bold text-slate-900">Conditions de paiement</p>
            <p className="text-slate-600">Paiement sous 30 jours</p>
          </div>
        </div>

        {/* Mention de fin centrée & Facturim Année */}
        <div className="relative z-10 text-center pt-2 border-t border-slate-100">
          <div className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
            MERCI DE VOTRE CONFIANCE
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-[9px] font-extrabold text-slate-400 tracking-wider">
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-sky-600 text-white text-[7px] font-black">FI</span>
            <span className="text-slate-600 font-black">FACTURIM</span>
            <span className="text-slate-300">•</span>
            <span>{invoice.issueDate ? new Date(invoice.issueDate).getFullYear() || 2026 : 2026}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
