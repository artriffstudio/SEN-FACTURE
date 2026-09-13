"use client";

import { useState } from "react";
import {
  Menu,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronsRight,
  Share2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  breadcrumbs?: string[];
}

export default function Header({
  onMenuClick,
  title = "SEN FACTURE",
  breadcrumbs = ["Ventes", "Clients", "SEN FACTURE"],
}: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");

  const handleQuickWhatsAppShare = () => {
    const text = "Bonjour, bienvenue sur SEN FACTURE. Comment pouvons-nous vous aider aujourd'hui ?";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Lien WhatsApp ouvert !");
  };

  const handleHeaderSearch = (val: string) => {
    setHeaderSearchQuery(val);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("global-invoice-search", { detail: val })
      );
    }
  };

  const handleToggleFilters = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toggle-invoice-filters"));
    }
  };

  return (
    <header className="sticky top-0 z-30 h-[65px] bg-white border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 shrink-0">
      {/* Left side: Chevron toggle + Entity Title + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <Tooltip content="Menu" icon={Menu} position="bottom" className="lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
        </Tooltip>

        {/* Desktop Collapse / expand icon >> */}
        <Tooltip content="Menu latéral" icon={ChevronsRight} position="bottom" className="hidden lg:inline-flex">
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-50 border border-slate-200/90 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronsRight size={14} />
          </button>
        </Tooltip>

        {/* Title and Breadcrumbs in French */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight tracking-tight">
              {title}
            </h1>
            <span className="hidden sm:inline-block bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              SaaS Pro
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <span className="text-slate-300">›</span>}
                <span className={idx === breadcrumbs.length - 1 ? "text-slate-600 font-medium" : ""}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Action icons, search bar and Primary CTA */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Barre de recherche directe dans le Header (Desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100 hover:border-slate-300 transition-all shadow-2xs hover:shadow-xs">
          <Tooltip content="Recherche rapide" icon={Search}>
            <Search size={14} className="text-slate-400 shrink-0 cursor-pointer" />
          </Tooltip>
          <input
            type="text"
            value={headerSearchQuery}
            onChange={(e) => handleHeaderSearch(e.target.value)}
            placeholder="Rechercher une facture..."
            className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-32 lg:w-44"
          />
          {headerSearchQuery && (
            <button
              onClick={() => handleHeaderSearch("")}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer hover:scale-110 transition-transform"
              title="Effacer la recherche"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Bouton recherche mobile */}
        <Tooltip content="Recherche" icon={Search} position="bottom" className="md:hidden">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200/90 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:shadow-sm hover:-translate-y-0.5 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Search size={15} />
          </button>
        </Tooltip>

        {/* Bouton Filtres interactif */}
        <Tooltip content="Filtres" icon={SlidersHorizontal} position="bottom">
          <button
            onClick={handleToggleFilters}
            className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200/90 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-sky-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <SlidersHorizontal size={15} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white pulse-gentle" />
          </button>
        </Tooltip>

        {/* Partage rapide WhatsApp avec hover indicatif */}
        <Tooltip content="WhatsApp Business" icon={Share2} position="bottom">
          <button
            onClick={handleQuickWhatsAppShare}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Share2 size={15} />
          </button>
        </Tooltip>

        {/* LE SEUL BOUTON CTA PRIMAIRE : + Nouvelle Facture (adapté et responsive) */}
        <Tooltip content="Nouvelle facture" icon={Plus} position="bottom">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-live-invoice-modal"));
              }
            }}
            className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shrink-0 cursor-pointer"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span className="hidden sm:inline">Nouvelle facture</span>
            <span className="sm:hidden">Facture</span>
          </button>
        </Tooltip>
      </div>

      {/* Barre de recherche déroulante sur mobile */}
      {mobileSearchOpen && (
        <div className="md:hidden absolute top-[65px] left-0 right-0 bg-white border-b border-slate-200 p-3 shadow-md z-40 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              autoFocus
              value={headerSearchQuery}
              onChange={(e) => handleHeaderSearch(e.target.value)}
              placeholder="Rechercher par client, référence..."
              className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>
          <button
            onClick={() => {
              handleHeaderSearch("");
              setMobileSearchOpen(false);
            }}
            className="p-2 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
