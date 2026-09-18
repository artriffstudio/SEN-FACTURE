"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, X, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SimpleHeaderProps {
  onNewInvoice: () => void;
  onSearch?: (query: string) => void;
}

export default function SimpleHeader({
  onNewInvoice,
  onSearch,
}: SimpleHeaderProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Logo simple & Titre épuré */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/simple" className="flex items-center gap-2.5 group select-none">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-sky-600 transition-colors">
            FI
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-base text-slate-900 tracking-tight">
              Facturim
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Espace Facturation
            </span>
          </div>
        </Link>
      </div>

      {/* Barre de recherche discrète */}
      <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100 transition-all max-w-xs w-full">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher une facture..."
          className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full font-medium"
        />
        {search && (
          <button
            onClick={() => handleSearchChange("")}
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Raccourcis & Profil */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Bouton Créer une facture simple */}
        <button
          onClick={onNewInvoice}
          className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 text-white font-bold text-xs px-3.5 sm:px-4 py-2 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>Nouvelle Facture</span>
        </button>

        {/* Profil utilisateur discret */}
        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
          <User size={15} />
        </div>
      </div>
    </header>
  );
}
