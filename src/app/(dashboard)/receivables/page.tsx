"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  TrendingUp,
  MessageCircle,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building2,
  Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import AgingBalanceCard, { AgingBucket } from "@/components/receivables/AgingBalanceCard";
import CashflowForecastChart, { CashflowForecastItem } from "@/components/receivables/CashflowForecastChart";
import DunningModal from "@/components/receivables/DunningModal";
import { getInvoices, updateInvoiceStatus } from "@/lib/services/invoiceService";
import { Invoice } from "@/lib/types";
import { useTranslation } from "@/contexts/LanguageContext";

export default function ReceivablesPage() {
  const { t, formatMoney, currentLanguage } = useTranslation();
  const isAr = currentLanguage === "ar";

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "overdue">("all");

  // Modale de relance
  const [selectedInvoiceForDunning, setSelectedInvoiceForDunning] = useState<Invoice | null>(null);
  const [isDunningModalOpen, setIsDunningModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const invs = await getInvoices();
        setInvoices(invs);
      } catch (err) {
        console.error("Erreur chargement factures:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtrage des créances (factures non payées)
  const unpaidInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.status === "sent" || inv.status === "overdue" || inv.status === "draft");
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return unpaidInvoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client?.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (statusFilter === "pending") return matchSearch && inv.status === "sent";
      if (statusFilter === "overdue") return matchSearch && inv.status === "overdue";
      return matchSearch;
    });
  }, [unpaidInvoices, searchQuery, statusFilter]);

  // Calculs financiers
  const totalReceivables = useMemo(() => {
    return unpaidInvoices.reduce((acc, inv) => acc + inv.total, 0);
  }, [unpaidInvoices]);

  const totalOverdue = useMemo(() => {
    return unpaidInvoices
      .filter((inv) => inv.status === "overdue")
      .reduce((acc, inv) => acc + inv.total, 0);
  }, [unpaidInvoices]);

  // Calcul des tranches de la Balance Âgée
  const agingBuckets: AgingBucket[] = useMemo(() => {
    const b0_30 = unpaidInvoices.filter((i) => i.status !== "overdue");
    const b31_60 = unpaidInvoices.filter((i) => i.status === "overdue");

    const sum0_30 = b0_30.reduce((acc, i) => acc + i.total, 0);
    const sum31_60 = b31_60.reduce((acc, i) => acc + i.total, 0);

    return [
      {
        range: "0-30",
        label: "0 - 30 jours (Sain)",
        labelAr: "0 - 30 يوم (سليم)",
        amount: sum0_30,
        count: b0_30.length,
        colorClass: "text-emerald-700",
        bgClass: "bg-emerald-50/70",
        borderClass: "border-emerald-200/80",
      },
      {
        range: "31-60",
        label: "31 - 60 jours (Modéré)",
        labelAr: "31 - 60 يوم (متوسط)",
        amount: sum31_60,
        count: b31_60.length,
        colorClass: "text-amber-700",
        bgClass: "bg-amber-50/70",
        borderClass: "border-amber-200/80",
      },
      {
        range: "61-90",
        label: "61 - 90 jours (Critique)",
        labelAr: "61 - 90 يوم (حرج)",
        amount: 0,
        count: 0,
        colorClass: "text-orange-700",
        bgClass: "bg-orange-50/70",
        borderClass: "border-orange-200/80",
      },
      {
        range: "90+",
        label: "+90 jours (Contentieux)",
        labelAr: "+90 يوم (نزاع)",
        amount: 0,
        count: 0,
        colorClass: "text-rose-700",
        bgClass: "bg-rose-50/70",
        borderClass: "border-rose-200/80",
      },
    ];
  }, [unpaidInvoices]);

  // Données de prévision de trésorerie
  const cashflowForecast: CashflowForecastItem[] = useMemo(() => {
    return [
      {
        horizon: "7 prochains jours",
        horizonAr: "خلال 7 أيام",
        expectedAmount: Math.round(totalReceivables * 0.4),
        invoiceCount: 2,
        confidenceRate: 95,
      },
      {
        horizon: "15 jours",
        horizonAr: "خلال 15 يوماً",
        expectedAmount: Math.round(totalReceivables * 0.3),
        invoiceCount: 2,
        confidenceRate: 85,
      },
      {
        horizon: "30 jours",
        horizonAr: "خلال 30 يوماً",
        expectedAmount: Math.round(totalReceivables * 0.2),
        invoiceCount: 1,
        confidenceRate: 75,
      },
      {
        horizon: "60 jours & +",
        horizonAr: "خلال 60 يوماً وأكثر",
        expectedAmount: Math.round(totalReceivables * 0.1),
        invoiceCount: 1,
        confidenceRate: 60,
      },
    ];
  }, [totalReceivables]);

  const handleOpenDunning = (inv: Invoice) => {
    setSelectedInvoiceForDunning(inv);
    setIsDunningModalOpen(true);
  };

  const handleMarkAsPaid = async (inv: Invoice) => {
    toast.loading("Validation de l'encaissement...", { id: "pay-inv" });
    try {
      await updateInvoiceStatus(inv.id, "paid");
      setInvoices((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, status: "paid" } : i))
      );
      toast.success(`Facture ${inv.invoiceNumber} marquée comme payée !`, { id: "pay-inv" });
    } catch {
      toast.error("Erreur lors de la mise à jour", { id: "pay-inv" });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ======================================================== */}
      {/* EN-TÊTE DE LA PAGE */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isAr ? "إدارة الديون والتحصيل والسيولة" : "Créances, Recouvrement & Trésorerie"}
            </h1>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Moosyl PayFac
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAr
              ? "متابعة مستحقات العملاء، إشعارات التذكير التلقائية عبر واتساب وتوقعات التدفقات النقدية بالأوقية (MRU)."
              : "Pilotez vos encours clients, vos relances WhatsApp automatiques et vos prévisions d'encaissements en MRU."}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 CARTES KPIS FINANCIERS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Total Créances */}
        <div className="card-interactive bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? "إجمالي الديون المستحقة" : "Total Créances en cours"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {formatMoney(totalReceivables)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {unpaidInvoices.length} {isAr ? "فاتورة غير مسددة" : "facture(s) non soldée(s)"}
          </p>
        </div>

        {/* KPI 2 : Retards Critiques */}
        <div className="card-interactive bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              {isAr ? "المتأخرات الحرجة" : "Encours en Retard"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 tabular-nums">
            {formatMoney(totalOverdue)}
          </div>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">
            {isAr ? "يتطلب إجراءات تذكير فورية" : "Relance recommandée"}
          </p>
        </div>

        {/* KPI 3 : DSO Moyen */}
        <div className="card-interactive bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? "متوسط فترة السداد (DSO)" : "Délai Moyen Client (DSO)"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            24 <span className="text-xs font-bold text-slate-500">{isAr ? "يوم" : "jours"}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {isAr ? "ممتاز (أقل من المعدل الوطني 45 يوم)" : "Excellent (Moyenne Mauritanie : 45j)"}
          </p>
        </div>

        {/* KPI 4 : Taux de Recouvrement */}
        <div className="card-interactive bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? "نسبة التحصيل السنوي" : "Taux de Recouvrement"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            88.5%
          </div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">
            +4.2% {isAr ? "مقارنة بالشهر السابق" : "vs mois précédent"}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2 GRANDS MODULES : BALANCE ÂGÉE & PRÉVISIONS CASHFLOW */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 gap-6">
        {/* Module 1 : Balance Âgée */}
        <AgingBalanceCard
          buckets={agingBuckets}
          totalReceivables={totalReceivables}
          isAr={isAr}
        />

        {/* Module 2 : Prévisions de Trésorerie */}
        <CashflowForecastChart
          data={cashflowForecast}
          dsoDays={24}
          collectionRate={88.5}
          isAr={isAr}
        />
      </div>

      {/* ======================================================== */}
      {/* TABLEAU DES CRÉANCES CLIENTS & ACTIONS DE RELANCE */}
      {/* ======================================================== */}
      <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              {isAr ? "قائمة الديون والفواتير غير المسددة" : "Journal des Créances &amp; Actions de Recouvrement"}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr
                ? "إرسال تذكيرات عبر واتساب برابط بنكيلي ومصرفي بنقرة واحدة"
                : "Déclenchez des relances WhatsApp avec lien Moosyl (Bankily/Masrvi) en 1 clic."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Barre de Recherche */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder={isAr ? "بحث بالعميل أو الفاتورة..." : "Rechercher..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Filtre de Statut */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500"
            >
              <option value="all">{isAr ? "الكل" : "Toutes les créances"}</option>
              <option value="pending">{isAr ? "في الانتظار" : "En attente"}</option>
              <option value="overdue">{isAr ? "متأخرة" : "En retard"}</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/70 text-[11px]">
              <tr>
                <th className="py-3 px-3">{isAr ? "الفاتورة" : "Facture"}</th>
                <th className="py-3 px-3">{isAr ? "العميل" : "Client"}</th>
                <th className="py-3 px-3">{isAr ? "الإصدار" : "Émission"}</th>
                <th className="py-3 px-3">{isAr ? "الاستحقاق" : "Échéance"}</th>
                <th className="py-3 px-3 text-right">{isAr ? "المبلغ" : "Montant MRU"}</th>
                <th className="py-3 px-3 text-center">{isAr ? "الحالة" : "Statut"}</th>
                <th className="py-3 px-3 text-right">{isAr ? "الإجراءات" : "Actions de relance"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {isAr ? "لا توجد ديون مطابقة للبحث." : "Aucune créance en attente trouvée."}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <Link href={`/invoices/${inv.id}`} className="hover:text-sky-600 underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{inv.client?.name || "Client Entreprise"}</p>
                      <p className="text-[10px] text-slate-400">{inv.client?.phone || "+222 45 00 00 00"}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{inv.issueDate || "15/01/2025"}</td>
                    <td className="py-3 px-3">
                      <span className={inv.status === "overdue" ? "text-rose-600 font-bold" : "text-slate-600"}>
                        {inv.dueDate || "15/02/2025"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900 tabular-nums">
                      {inv.total.toLocaleString("fr-FR")} MRU
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          inv.status === "overdue"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {inv.status === "overdue" ? (isAr ? "متأخرة" : "EN RETARD") : (isAr ? "في الانتظار" : "EN ATTENTE")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Bouton Relance WhatsApp */}
                        <Tooltip content="Relancer par WhatsApp">
                          <button
                            onClick={() => handleOpenDunning(inv)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            <MessageCircle size={15} />
                          </button>
                        </Tooltip>

                        {/* Bouton Lien Moosyl direct */}
                        <Tooltip content="Page de Paiement Moosyl">
                          <Link
                            href={`/pay/${inv.id}`}
                            target="_blank"
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg border border-sky-200/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            <CreditCard size={15} />
                          </Link>
                        </Tooltip>

                        {/* Bouton Encaisser manuellement */}
                        <Tooltip content="Marquer comme payée">
                          <button
                            onClick={() => handleMarkAsPaid(inv)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale de Relance 4 Niveaux */}
      <DunningModal
        isOpen={isDunningModalOpen}
        onClose={() => setIsDunningModalOpen(false)}
        invoice={selectedInvoiceForDunning}
        isAr={isAr}
      />
    </div>
  );
}
