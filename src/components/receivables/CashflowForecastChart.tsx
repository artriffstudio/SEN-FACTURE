"use client";

import React from "react";
import { TrendingUp, Calendar, Zap, ArrowUpRight } from "lucide-react";

export interface CashflowForecastItem {
  horizon: string;
  horizonAr: string;
  expectedAmount: number;
  invoiceCount: number;
  confidenceRate: number; // Taux de confiance %
}

interface CashflowForecastChartProps {
  data: CashflowForecastItem[];
  dsoDays: number;
  collectionRate: number;
  isAr?: boolean;
}

export default function CashflowForecastChart({
  data,
  dsoDays,
  collectionRate,
  isAr = false,
}: CashflowForecastChartProps) {
  const maxAmount = Math.max(...data.map((d) => d.expectedAmount), 100000);

  return (
    <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              {isAr ? "توقعات السيولة والتحصيل (Cashflow Forecast)" : "Trésorerie Prévisionnelle des Encaissements"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isAr
                ? "التدفقات النقدية المتوقعة من الفواتير المستحقة خلال الفترات القادمة"
                : "Estimations d'encaissements en MRU basées sur les dates d'échéances"}
            </p>
          </div>
        </div>

        {/* Badges KPIs DSO & Taux de recouvrement */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 font-bold text-slate-700">
            <span className="text-slate-400 font-normal">DSO :</span>
            <span className="text-sky-600">{dsoDays} {isAr ? "يوم" : "jours"}</span>
          </div>
          <div className="px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center gap-1.5 font-bold text-emerald-700">
            <span className="text-emerald-500/80 font-normal">{isAr ? "التحصيل" : "Recouvrement"} :</span>
            <span>{collectionRate}%</span>
          </div>
        </div>
      </div>

      {/* Graphique de bâtons prévisionnels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end pt-3">
        {data.map((item, idx) => {
          const heightPct = Math.max(Math.round((item.expectedAmount / maxAmount) * 100), 15);
          return (
            <div key={idx} className="flex flex-col items-center space-y-2 group">
              <div className="text-xs font-black text-slate-900 tabular-nums text-center">
                {item.expectedAmount.toLocaleString("fr-FR")}
                <span className="text-[10px] text-slate-400 block font-normal">
                  {item.invoiceCount} {isAr ? "فاتورة" : "factures"}
                </span>
              </div>

              {/* Barre verticale animée */}
              <div className="w-full h-36 bg-slate-100/90 rounded-2xl flex flex-col justify-end p-2 relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-sky-500 to-sky-600 group-hover:from-sky-600 group-hover:to-sky-700 shadow-md shadow-sky-500/20 transition-all duration-500 relative flex items-center justify-center"
                  style={{ height: `${heightPct}%` }}
                >
                  <span className="text-[10px] font-black text-white/90">
                    {item.confidenceRate}%
                  </span>
                </div>
              </div>

              {/* Label de la période */}
              <div className="text-center">
                <span className="text-xs font-bold text-slate-700 block">
                  {isAr ? item.horizonAr : item.horizon}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-center gap-0.5">
                  <Zap size={10} />
                  {isAr ? "ثقة عالية" : "Fiable"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
