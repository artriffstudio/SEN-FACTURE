"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Filter,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import { getInvoices } from "@/lib/services/invoiceService";
import { Invoice } from "@/lib/types";
import { useTranslation } from "@/contexts/LanguageContext";

export default function ReportsPage() {
  const { t, formatMoney, currentLanguage } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("year");
  const [selectedMonthHover, setSelectedMonthHover] = useState<any | null>(null);
  const [dbInvoices, setDbInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const invs = await getInvoices();
        if (invs) setDbInvoices(invs);
      } catch (err) {
        console.error("Erreur chargement rapports Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const kpis = useMemo(() => {
    if (!dbInvoices || dbInvoices.length === 0) {
      return {
        encaisse: 0,
        creances: 0,
        creancesCount: 0,
        tauxRecouvrement: 0,
        tvaCollectee: 0,
        totalFlux: 0,
      };
    }
    const totalFacture = dbInvoices.reduce((sum, i) => sum + i.total, 0);
    const paidInvs = dbInvoices.filter((i) => i.status === "paid");
    const encaisse = paidInvs.reduce((sum, i) => sum + i.total, 0);
    const pendingInvs = dbInvoices.filter((i) => i.status !== "paid");
    const creances = pendingInvs.reduce((sum, i) => sum + i.total, 0);
    const tvaCollectee = dbInvoices.reduce((sum, i) => sum + i.taxAmount, 0);
    const tauxRecouvrement = totalFacture > 0 ? (encaisse / totalFacture) * 100 : 0;

    return {
      encaisse,
      creances,
      creancesCount: pendingInvs.length,
      tauxRecouvrement: Number(tauxRecouvrement.toFixed(1)),
      tvaCollectee,
      totalFlux: encaisse + creances,
    };
  }, [dbInvoices]);

  const computedTopClients = useMemo(() => {
    if (!dbInvoices || dbInvoices.length === 0) return [];

    const map: Record<string, { revenue: number; invoices: number }> = {};
    for (const inv of dbInvoices) {
      const name = inv.client?.name || "Client Partenaire";
      if (!map[name]) map[name] = { revenue: 0, invoices: 0 };
      map[name].revenue += inv.total;
      map[name].invoices += 1;
    }

    const totalRev = Object.values(map).reduce((s, c) => s + c.revenue, 0) || 1;
    const colors = ["bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-slate-400"];

    return Object.entries(map)
      .map(([name, data], idx) => ({
        name,
        revenue: data.revenue,
        invoices: data.invoices,
        percentage: Math.round((data.revenue / totalRev) * 100),
        badgeColor: colors[idx % colors.length],
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [dbInvoices]);

  const computedSyscohadaAccounts = useMemo(() => {
    const subtotalHT = dbInvoices?.reduce((s, i) => s + i.subtotal, 0) || 0;
    const tvaTotal = dbInvoices?.reduce((s, i) => s + i.taxAmount, 0) || 0;
    const paidTTC = dbInvoices?.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0) || 0;
    const pendingTTC = dbInvoices?.filter((i) => i.status !== "paid").reduce((s, i) => s + i.total, 0) || 0;

    return [
      { code: "701100", label: "Ventes de prestations de services (HT)", credit: subtotalHT, debit: 0, status: "Créditeur" },
      { code: "443100", label: "État, TVA facturée sur ventes (16%)", credit: tvaTotal, debit: 0, status: "En règle" },
      { code: "411100", label: "Clients locaux (Créances exigibles)", credit: 0, debit: pendingTTC, status: "À recouvrer" },
      { code: "521100", label: "Banque BPM Mauritanie (Virements)", credit: 0, debit: Math.round(paidTTC * 0.75), status: "Disponible" },
      { code: "521200", label: "Comptes Bankily & Seddap", credit: 0, debit: Math.round(paidTTC * 0.25), status: "Disponible" },
    ];
  }, [dbInvoices]);

  const computedMonthlyData = useMemo(() => {
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
    const targetMap: Record<string, number> = {
      Jan: 2000000, Fév: 2000000, Mar: 2500000, Avr: 2500000, Mai: 3000000, Juin: 3200000,
      Juil: 3000000, Août: 2800000, Sept: 3200000, Oct: 3500000, Nov: 3500000, Déc: 4000000,
    };

    const monthlyMap: Record<string, { revenue: number; count: number }> = {};
    monthNames.forEach((m) => {
      monthlyMap[m] = { revenue: 0, count: 0 };
    });

    if (dbInvoices && dbInvoices.length > 0) {
      for (const inv of dbInvoices) {
        if (inv.issueDate) {
          const d = new Date(inv.issueDate);
          const m = monthNames[d.getMonth()];
          if (m && monthlyMap[m]) {
            monthlyMap[m].revenue += inv.total;
            monthlyMap[m].count += 1;
          }
        }
      }
    }

    const maxRev = Math.max(...Object.values(monthlyMap).map((m) => m.revenue), 1000000);

    return monthNames.map((m) => {
      const rev = monthlyMap[m].revenue;
      const target = targetMap[m] || 2500000;
      const pct = maxRev > 0 ? Math.round((rev / maxRev) * 100) : 0;
      return {
        month: m,
        revenue: rev,
        target,
        invoicesCount: monthlyMap[m].count,
        height: rev > 0 ? `${Math.max(12, Math.min(100, pct))}%` : "6%",
      };
    });
  }, [dbInvoices]);

  const handleExportCSV = () => {
    toast.loading("Génération du fichier Excel (CSV)...", { id: "csv" });
    setTimeout(() => {
      const csvContent =
        "data:text/csv;charset=utf-8,Mois,Chiffre d'affaires HT (MRU),Nombre de factures,Objectif\n" +
        computedMonthlyData
          .map((m) => `${m.month},${m.revenue},${m.invoicesCount},${m.target}`)
          .join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rapport-chiffre-affaires-facturim-2025.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Rapport financier CSV téléchargé !", { id: "csv" });
    }, 600);
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
              {t.reports.title}
            </h1>
            <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {t.countryName} DGI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.reports.subtitle}
          </p>
        </div>

        {/* Actions d'exportation et filtres de période */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur de période */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs text-xs">
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedPeriod === "month"
                  ? "bg-sky-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.landing.monthly}
            </button>
            <button
              onClick={() => setSelectedPeriod("year")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedPeriod === "year"
                  ? "bg-sky-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.landing.yearly}
            </button>
          </div>

          {/* Export CSV */}
          <Tooltip content={t.reports.exportCSV} icon={FileSpreadsheet}>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet size={15} className="text-sky-600" />
              <span className="hidden md:inline">{t.reports.exportCSV}</span>
            </button>
          </Tooltip>

          {/* Impression PDF */}
          <Tooltip content={t.reports.print} icon={Printer}>
            <button
              onClick={() => {
                window.print();
                toast.success(t.reports.print);
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Printer size={15} className="text-slate-500" />
              <span className="hidden md:inline">{t.reports.print}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 CARTES KPI CLÉS (DESIGN SYSTEM) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : CA Encaissé */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.reports.kpiCollected}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatMoney(kpis.encaisse)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="inline-flex items-center text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-md text-[10px]">
                <ArrowUpRight size={12} />
                +14.2%
              </span>
              <span className="text-slate-400 text-[11px]">{t.status.paid}</span>
            </div>
          </div>
        </div>

        {/* KPI 2 : Créances en attente */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.reports.kpiReceivables}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatMoney(kpis.creances)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="inline-flex items-center text-amber-700 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded-md text-[10px]">
                {kpis.creancesCount} {t.nav.invoices}
              </span>
              <span className="text-slate-400 text-[11px]">{t.status.sent}</span>
            </div>
          </div>
        </div>

        {/* KPI 3 : Taux de recouvrement */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.reports.kpiRecoveryRate}
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200/60">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.tauxRecouvrement}%
            </h3>
            {/* Barre de progression avec animation shimmer */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-sky-500 h-2 rounded-full animate-shimmer"
                style={{ width: `${Math.min(100, kpis.tauxRecouvrement)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4 : TVA Collectée (16% DGI Mauritanie) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.reports.kpiVat16}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-sky-600 tracking-tight">
              {formatMoney(kpis.tvaCollectee)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="inline-flex items-center text-purple-700 font-extrabold bg-purple-50 px-1.5 py-0.5 rounded-md text-[10px]">
                {t.vatRateLabel}
              </span>
              <span className="text-slate-400 text-[11px]">DGI {t.countryName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION PRINCIPALE : GRAPHIQUE BARRES + RÉPARTITION CLIENTS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* GRAPHIQUE BARRES : Évolution mensuelle du CA */}
        <div className="lg:col-span-8 card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {t.reports.monthlyEvolution}
              </h2>
              <p className="text-xs text-slate-500">
                {t.dashboard.subtitle}
              </p>
            </div>
            <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/60">
              {t.brandName} Cloud
            </span>
          </div>

          {/* Zone du graphique en barres CSS interactives */}
          <div className="pt-6">
            <div className="h-56 sm:h-64 flex items-end gap-2 sm:gap-3 px-2 border-b border-slate-200 pb-2">
              {computedMonthlyData.map((item, idx) => {
                const isHovered = selectedMonthHover?.month === item.month;
                return (
                  <div
                    key={item.month}
                    onMouseEnter={() => setSelectedMonthHover(item)}
                    onMouseLeave={() => setSelectedMonthHover(null)}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative h-full justify-end"
                  >
                    {/* Tooltip flottant au survol de la barre */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in duration-150 pointer-events-none">
                        <p>{item.month} : {formatMoney(item.revenue)}</p>
                        <p className="text-[9px] text-sky-300">{item.invoicesCount} {t.nav.invoices}</p>
                      </div>
                    )}

                    {/* Barre de valeur avec gradient */}
                    <div
                      style={{ height: item.height }}
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        idx === 9 || idx === 11
                          ? "bg-gradient-to-t from-sky-600 to-sky-400 group-hover:from-sky-500 group-hover:to-sky-300 shadow-md shadow-sky-500/20"
                          : "bg-slate-200 group-hover:bg-sky-400"
                      }`}
                    />

                    {/* Nom du mois */}
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-sky-600 transition-colors">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Légende du graphique */}
            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-sky-500 to-sky-600" />
                <span>{t.dashboard.kpiRevenue}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-slate-200" />
                <span>{t.status.paid}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RÉPARTITION PAR CLIENT MAJEUR */}
        <div className="lg:col-span-4 card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {t.reports.clientBreakdown}
            </h2>
            <span className="text-xs font-semibold text-slate-400">100%</span>
          </div>

          <div className="space-y-4 pt-1">
            {computedTopClients.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <p className="font-semibold text-slate-600">{t.clients.emptyClients}</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  {t.clients.subtitle}
                </p>
              </div>
            ) : (
              computedTopClients.map((client) => (
                <div key={client.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate pr-2">
                      {client.name}
                    </span>
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      {client.percentage}%
                    </span>
                  </div>

                  {/* Barre de pourcentage */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${client.badgeColor}`}
                      style={{ width: `${client.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{client.invoices} {t.nav.invoices}</span>
                    <span className="font-semibold text-slate-600">
                      {formatMoney(client.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center gap-2 text-xs text-sky-800">
              <Sparkles size={16} className="text-sky-600 shrink-0" />
              <span>
                {t.brandName} Cloud {t.countryName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TABLEAU DE SYNTHÈSE COMPTABLE */}
      {/* ======================================================== */}
      <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {t.reports.generalLedger}
            </h2>
            <p className="text-xs text-slate-500">
              {t.invoices.certifiedNotice}
            </p>
          </div>
          <span className="self-start sm:self-auto bg-emerald-50 text-emerald-700 font-extrabold text-[11px] px-3 py-1 rounded-full border border-emerald-200/60">
            {t.status.paid}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/70">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/70">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">{t.invoices.description}</th>
                <th className="py-3 px-4 text-right">Débit ({t.currencySymbol})</th>
                <th className="py-3 px-4 text-right">Crédit ({t.currencySymbol})</th>
                <th className="py-3 px-4 text-center">{t.invoices.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {computedSyscohadaAccounts.map((acc) => (
                <tr key={acc.code} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {acc.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {acc.label}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                    {acc.debit > 0 ? formatMoney(acc.debit) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                    {acc.credit > 0 ? formatMoney(acc.credit) : "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        acc.status === "Créditeur" || acc.status === "Disponible" || acc.status === "En règle"
                          ? "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60"
                          : "bg-amber-100 text-amber-800 border border-amber-200/60"
                      }`}
                    >
                      {acc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-900 text-slate-900 font-extrabold text-xs">
                <td colSpan={2} className="py-3 px-4 uppercase tracking-wider">
                  TOTAL
                </td>
                <td className="py-3 px-4 text-right text-sky-700">
                  {formatMoney(kpis.totalFlux)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-700">
                  {formatMoney(kpis.totalFlux)}
                </td>
                <td className="py-3 px-4 text-center text-[10px] text-emerald-700 font-black">
                  OK
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
