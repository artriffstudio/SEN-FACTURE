"use client";

import React from "react";
import { Clock, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export interface AgingBucket {
  range: "0-30" | "31-60" | "61-90" | "90+";
  label: string;
  labelAr: string;
  amount: number;
  count: number;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

interface AgingBalanceCardProps {
  buckets: AgingBucket[];
  totalReceivables: number;
  isAr?: boolean;
}

export default function AgingBalanceCard({
  buckets,
  totalReceivables,
  isAr = false,
}: AgingBalanceCardProps) {
  return (
    <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
            <Clock size={16} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              {isAr ? "ميزان أعمار الديون (Aging Balance)" : "Balance Âgée des Créances"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isAr
                ? "تصنيف الديون غير المسددة حسب مدة التأخير بالأوقية (MRU)"
                : "Ventilation des factures non réglées selon l'ancienneté du retard"}
            </p>
          </div>
        </div>
        <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full tabular-nums">
          Total : {totalReceivables.toLocaleString("fr-FR")} MRU
        </span>
      </div>

      {/* Grille des 4 tranches d'ancienneté */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {buckets.map((b) => {
          const pct = totalReceivables > 0 ? Math.round((b.amount / totalReceivables) * 100) : 0;
          return (
            <div
              key={b.range}
              className={`p-4 rounded-xl border transition-all ${b.bgClass} ${b.borderClass} flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${b.colorClass}`}>
                  {isAr ? b.labelAr : b.label}
                </span>
                <span className="text-[10px] bg-white/80 font-bold px-2 py-0.5 rounded-full text-slate-700 shadow-2xs">
                  {b.count} {isAr ? "فاتورة" : "facture(s)"}
                </span>
              </div>

              <div className="my-1.5">
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                  {b.amount.toLocaleString("fr-FR")}{" "}
                  <span className="text-xs font-semibold text-slate-500">{isAr ? "أوقية" : "MRU"}</span>
                </div>
              </div>

              {/* Jauge de pourcentage */}
              <div className="space-y-1 pt-1.5 border-t border-slate-200/60">
                <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
                  <span>{isAr ? "النسبة" : "Part du total"}</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.range === "0-30"
                        ? "bg-emerald-500"
                        : b.range === "31-60"
                        ? "bg-amber-500"
                        : b.range === "61-90"
                        ? "bg-orange-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
