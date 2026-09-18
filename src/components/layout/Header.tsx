"use client";

import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronsRight,
  Share2,
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useTranslation } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  breadcrumbs?: string[];
}

export default function Header({
  onMenuClick,
  title,
  breadcrumbs,
}: HeaderProps) {
  const { t, currentLanguage } = useTranslation();
  const { user } = useAuth();
  const isAr = currentLanguage === "ar";
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const effectiveTitle = title || t.brandName;
  const effectiveBreadcrumbs = breadcrumbs || [
    t.nav.invoices,
    t.nav.clients,
    t.brandName,
  ];

  // Notifications simulées en temps réel
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Conformité DGI Mauritanie",
      desc: "Taux de TVA légal standard 16% actif et synchronisé.",
      time: "En direct",
      type: "success",
      read: false,
    },
    {
      id: "notif-2",
      title: "Passerelle Mobile Money",
      desc: "Bankily (BPM) & Seddap connectés et prêts pour les encaissements.",
      time: "Il y a 10 min",
      type: "info",
      read: false,
    },
    {
      id: "notif-3",
      title: "Sauvegarde Cloud Sécurisée",
      desc: "Base de données Supabase PostgreSQL à jour.",
      time: "Aujourd'hui",
      type: "success",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickWhatsAppShare = () => {
    const text = `Bonjour, bienvenue sur ${t.brandName} Mauritanie. Comment pouvons-nous vous aider aujourd'hui ?`;
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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Toutes les notifications ont été marquées comme lues");
  };

  return (
    <header className="sticky top-0 z-30 h-[65px] bg-white border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 shrink-0">
      {/* Left side: Chevron toggle + Entity Title + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <Tooltip content="Menu" icon={Menu} position="bottom" className="lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
        </Tooltip>

        {/* Desktop Collapse / expand icon >> */}
        <Tooltip content="Menu latéral" icon={ChevronsRight} position="bottom" className="hidden lg:inline-flex">
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-400 hover:text-slate-700 hover:bg-slate-100 hover:border-sky-300 transition-colors cursor-pointer"
          >
            <ChevronsRight size={15} />
          </button>
        </Tooltip>

        {/* Title and Breadcrumbs */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight tracking-tight">
              {effectiveTitle}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200/70 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-gentle" />
              {t.countryName} Pro
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
            {effectiveBreadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <span className="text-slate-300">›</span>}
                <span className={idx === effectiveBreadcrumbs.length - 1 ? "text-slate-700 font-semibold" : ""}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Action icons, search bar, notifications, language selector & Primary CTA */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Barre de recherche directe dans le Header (Desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100 hover:border-slate-300 transition-all shadow-2xs">
          <Tooltip content="Recherche rapide" icon={Search}>
            <Search size={14} className="text-slate-400 shrink-0 cursor-pointer" />
          </Tooltip>
          <input
            type="text"
            value={headerSearchQuery}
            onChange={(e) => handleHeaderSearch(e.target.value)}
            placeholder={t.invoices.searchPlaceholder}
            className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-28 lg:w-44"
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

        {/* Notifications Cloche Flottante */}
        <div className="relative" ref={notifRef}>
          <Tooltip content="Notifications" icon={Bell} position="bottom">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200/90 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-sky-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-2xs cursor-pointer shrink-0"
              aria-label="Notifications"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-sky-500 text-white font-black text-[9px] px-1 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs pulse-gentle">
                  {unreadCount}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Menu déroulant des notifications */}
          {notificationsOpen && (
            <div
              className={`absolute top-full mt-2 ${
                isAr ? "left-0" : "right-0"
              } w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 z-50 p-3 animate-in fade-in zoom-in-95 duration-150`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-sky-100 text-sky-700 text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                      {unreadCount} nouvelles
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold transition-colors cursor-pointer"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto no-scrollbar">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      n.read
                        ? "bg-white border-slate-100 text-slate-600"
                        : "bg-sky-50/50 border-sky-200/60 text-slate-900"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {n.type === "success" ? (
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={15} className="text-sky-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold truncate">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bouton Filtres interactif */}
        <Tooltip content="Filtres" icon={SlidersHorizontal} position="bottom">
          <button
            onClick={handleToggleFilters}
            className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200/90 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-sky-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <SlidersHorizontal size={15} />
          </button>
        </Tooltip>

        {/* Partage rapide WhatsApp */}
        <Tooltip content="WhatsApp Business" icon={Share2} position="bottom">
          <button
            onClick={handleQuickWhatsAppShare}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Share2 size={15} />
          </button>
        </Tooltip>

        {/* Sélecteur de Langue Multilingue (FR / AR / EN / ZH) */}
        <LanguageSelector variant="pill" />

        {/* LE SEUL BOUTON CTA PRIMAIRE : + Nouvelle Facture */}
        <Tooltip content={t.invoices.newInvoice} icon={Plus} position="bottom">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-live-invoice-modal"));
              }
            }}
            className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shrink-0 cursor-pointer"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span className="hidden sm:inline">{t.invoices.newInvoice}</span>
            <span className="sm:hidden">{t.nav.quickInvoice}</span>
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
              placeholder={t.invoices.searchPlaceholder}
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
