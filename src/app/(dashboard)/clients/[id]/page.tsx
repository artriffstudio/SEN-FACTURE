"use client";

import { use, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Plus,
  Share2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { getClientById } from "@/lib/services/clientService";
import { Client, Invoice } from "@/lib/types";
import Tooltip from "@/components/ui/Tooltip";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import { useTranslation } from "@/contexts/LanguageContext";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t, formatMoney } = useTranslation();
  const resolvedParams = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getClientById(resolvedParams.id);
        if (res) {
          setClient(res.client);
          setInvoices(res.invoices || []);
        }
      } catch (err) {
        console.error("Erreur chargement client:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [resolvedParams.id]);

  const clientInvoices = useMemo(() => {
    return invoices;
  }, [invoices]);

  const totalInvoiced = useMemo(() => {
    return clientInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0) || (client?.totalRevenue || 0);
  }, [clientInvoices, client]);

  const handleWhatsAppReminder = () => {
    if (!client) return;
    const rawPhone = (client.phone || "+22245000000").replace(/[^0-9]/g, "");
    const message = `Bonjour ${client.name},\nNous vous remercions de votre collaboration avec Facturim. N'hésitez pas à nous contacter pour tout suivi concernant vos factures en cours.\nCordialement, l'équipe Facturim Mauritanie.`;
    window.open(`https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`, "_blank");
    toast.success("Lien de relance WhatsApp ouvert !");
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Chargement du client...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-12">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <Building2 size={26} />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">Client introuvable</h2>
        <p className="text-xs text-slate-500 mb-6">{t.clients.emptyClients}</p>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all"
        >
          <ArrowLeft size={14} />
          <span>{t.nav.clients}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton retour */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs hover:scale-105 active:scale-95 transition-all"
            title={t.nav.clients}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {client.name}
              </h1>
              <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {t.countryName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.clients.clientDetails}
            </p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2">
          <Tooltip content={t.clients.contactWhatsApp} icon={Share2}>
            <button
              onClick={handleWhatsAppReminder}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Share2 size={14} />
              <span>WhatsApp</span>
            </button>
          </Tooltip>

          <Tooltip content={t.invoices.newInvoice} icon={Plus}>
            <Link
              href="/invoices/new"
              className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>{t.invoices.newInvoice}</span>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Cartes d'identité et chiffres clés */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Coordonnées & Identité */}
        <div className="lg:col-span-7 card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {t.clients.clientDetails}
              </h2>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
              {client.taxId || "00987654-MR"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{t.clients.email} :</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                {client.email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{t.clients.phone} :</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                {client.phone}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{t.clients.address} :</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                {client.address}, {client.city}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{t.invoices.paymentTerms} :</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                30 jours (DGI {t.countryName})
              </p>
            </div>
          </div>
        </div>

        {/* Chiffres clés du client */}
        <div className="lg:col-span-5 card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              {t.clients.totalInvoiced}
            </h2>
            <span className="text-xs text-slate-400">{t.currencyCode}</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-400">{t.clients.totalInvoiced} :</span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {formatMoney(totalInvoiced)}
              </h3>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{t.invoices.status} :</span>
              <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                {t.status.paid} ✓
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Registre des factures de ce client */}
      <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-sky-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {t.invoices.title} ({client.name})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {clientInvoices.length > 0 ? clientInvoices.length : 1} {t.clients.invoicesCount}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/70">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/70">
                <th className="py-3 px-4">{t.invoices.invoiceNumber}</th>
                <th className="py-3 px-4">{t.invoices.issueDate}</th>
                <th className="py-3 px-4 text-right">{t.invoices.totalTTC}</th>
                <th className="py-3 px-4 text-center">{t.invoices.status}</th>
                <th className="py-3 px-4 text-center">{t.invoices.downloadPDF}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientInvoices.length > 0 ? (
                clientInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {inv.invoiceNumber || inv.id}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {inv.issueDate || "12/03/2025"}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {formatMoney(inv.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-100/80 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {inv.status === "paid" ? t.status.paid : t.status.sent}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Tooltip content={t.invoices.downloadPDF} icon={Download}>
                        <button
                          onClick={async () => {
                            toast.loading("Génération du PDF...", { id: "pdf" });
                            await downloadInvoicePDF({
                              reference: inv.invoiceNumber || "FAC-2025-001",
                              clientName: client.name,
                              date: inv.issueDate || "12/03/2025",
                              total: inv.total,
                            });
                            toast.success("Facture PDF téléchargée !", { id: "pdf" });
                          }}
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-all cursor-pointer inline-flex items-center gap-1 font-semibold"
                        >
                          <Download size={14} />
                          <span>PDF</span>
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    FAC-2025-0001
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    05/03/2025
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    {formatMoney(totalInvoiced)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-100/80 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      {t.status.paid}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Tooltip content={t.invoices.downloadPDF} icon={Download}>
                      <button
                        onClick={async () => {
                          toast.loading("Génération du PDF...", { id: "pdf" });
                          await downloadInvoicePDF({
                            reference: "FAC-2025-0001",
                            clientName: client.name,
                            date: "05/03/2025",
                            total: totalInvoiced,
                          });
                          toast.success("Facture PDF téléchargée !", { id: "pdf" });
                        }}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-all cursor-pointer inline-flex items-center gap-1 font-semibold"
                      >
                        <Download size={14} />
                        <span>PDF</span>
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
