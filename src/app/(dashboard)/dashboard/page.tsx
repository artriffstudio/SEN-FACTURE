"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import LiveInvoiceModal from "@/components/invoices/LiveInvoiceModal";
import {
  Package,
  MoreVertical,
  ChevronDown,
  Eye,
  Mail,
  FileText,
  UserCheck,
  Globe,
  Phone,
  MapPin,
  Building,
  Plus,
  Download,
  Receipt,
  FileSpreadsheet,
  Calendar,
  User,
  Search,
  SlidersHorizontal,
  Share2,
  Send,
  CheckCircle2,
  X,
  Printer,
  Filter,
  RotateCcw,
  TrendingUp,
  Activity,
  Sparkles,
  Trash2,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import { getInvoices, updateInvoiceStatus } from "@/lib/services/invoiceService";
import { getCompany } from "@/lib/services/companyService";
import { Company } from "@/lib/types";
import { useTranslation } from "@/contexts/LanguageContext";

interface AddressItem {
  id: string;
  title: string;
  street: string;
  phone: string;
  type?: "billing" | "shipping" | "branch";
}

interface InvoiceRow {
  id: string;
  reference: string;
  clientName: string;
  grossProfit: number;
  total: number;
  date: string;
  rawDate: string;
  invoiceCode: string | null;
  status: "paid" | "overdue" | "unpaid";
}

type PeriodFilter = "7d" | "30d" | "month" | "year" | "all";

export default function DashboardPage() {
  const { t, currentLanguage } = useTranslation();
  const isAr = currentLanguage === "ar";

  // Mode de devise (MRU par défaut)
  const [currencyMode, setCurrencyMode] = useState<"MRU" | "USD" | "EUR">("MRU");

  // Filtre temporel dynamique (inspiré de la maquette)
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");

  // Onglets et Recherche
  const [activeTab, setActiveTab] = useState<"invoices" | "statement" | "open" | "comm">("invoices");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "total" | "ref">("date");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [customerActionsOpen, setCustomerActionsOpen] = useState(false);

  // Adresses professionnelles dynamiques (Mauritanie)
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: "billing",
      title: "Adresse de facturation",
      street: "Avenue du Roi Fayçal, Tevragh-Zeina, Nouakchott, Mauritanie",
      phone: "+222 45 25 00 00",
      type: "billing",
    },
    {
      id: "shipping",
      title: "Siège social & Opérations",
      street: "Ilot K, Lot 14, Nouakchott, Mauritanie",
      phone: "+222 36 00 00 00",
      type: "shipping",
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("shipping");
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState<boolean>(false);
  const [newAddressTitle, setNewAddressTitle] = useState("");
  const [newAddressStreet, setNewAddressStreet] = useState("");
  const [newAddressPhone, setNewAddressPhone] = useState("+222 ");

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressTitle.trim() || !newAddressStreet.trim()) {
      toast.error("Veuillez renseigner le titre et l'adresse");
      return;
    }
    const newAddr: AddressItem = {
      id: "addr-" + Date.now(),
      title: newAddressTitle.trim(),
      street: newAddressStreet.trim(),
      phone: newAddressPhone.trim() || "+222 45 00 00 00",
      type: "branch",
    };
    setAddresses((prev) => [...prev, newAddr]);
    setSelectedAddressId(newAddr.id);
    setNewAddressTitle("");
    setNewAddressStreet("");
    setNewAddressPhone("+222 ");
    setIsAddAddressModalOpen(false);
    toast.success(`Adresse "${newAddr.title}" ajoutée avec succès !`);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      toast.error("Vous devez conserver au moins une adresse");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddressId === id) {
      const remaining = addresses.filter((a) => a.id !== id);
      if (remaining[0]) setSelectedAddressId(remaining[0].id);
    }
    toast.success("Adresse supprimée");
  };

  // Filtres avancés
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "overdue" | "unpaid">("all");
  const [filterAmountRange, setFilterAmountRange] = useState<"all" | "low" | "mid" | "high">("all");

  // Export menu
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Données de factures & entreprise Supabase
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [comp, dbInvoices] = await Promise.all([
        getCompany(),
        getInvoices(),
      ]);
      if (comp) setCompany(comp);
      if (dbInvoices) {
        setInvoices(
          dbInvoices.map((inv) => ({
            id: inv.id,
            reference: inv.invoiceNumber,
            clientName: inv.client?.name || "Client Partenaire",
            grossProfit: inv.subtotal,
            total: inv.total,
            date: new Date(inv.issueDate).toLocaleDateString("fr-FR"),
            rawDate: inv.issueDate,
            invoiceCode: inv.invoiceNumber,
            status: inv.status === "paid" ? "paid" : inv.status === "overdue" ? "overdue" : "unpaid",
          }))
        );
      }
    } catch (err) {
      console.error("Erreur chargement Supabase:", err);
    }
  };

  useEffect(() => {
    loadData();
    const handleInvoiceEvent = () => loadData();
    const handleCompanyLogoEvent = () => loadData();

    window.addEventListener("invoice-created", handleInvoiceEvent);
    window.addEventListener("company-logo-updated", handleCompanyLogoEvent);

    return () => {
      window.removeEventListener("invoice-created", handleInvoiceEvent);
      window.removeEventListener("company-logo-updated", handleCompanyLogoEvent);
    };
  }, []);

  // Écouteurs d'événements globaux (Header search & Live modal & Filter toggle)
  useEffect(() => {
    const handleOpenModal = () => setIsLiveModalOpen(true);
    const handleGlobalSearch = (e: any) => {
      if (e.detail !== undefined) setSearchQuery(e.detail);
    };
    const handleToggleFilters = () => setIsFilterOpen((prev) => !prev);

    window.addEventListener("open-live-invoice-modal", handleOpenModal);
    window.addEventListener("global-invoice-search", handleGlobalSearch);
    window.addEventListener("toggle-invoice-filters", handleToggleFilters);

    return () => {
      window.removeEventListener("open-live-invoice-modal", handleOpenModal);
      window.removeEventListener("global-invoice-search", handleGlobalSearch);
      window.removeEventListener("toggle-invoice-filters", handleToggleFilters);
    };
  }, []);

  // Filtrage selon la période sélectionnée
  const periodFilteredInvoices = useMemo(() => {
    if (periodFilter === "all") return invoices;
    const now = new Date();
    return invoices.filter((inv) => {
      const invDate = new Date(inv.rawDate || inv.date);
      if (isNaN(invDate.getTime())) return true;
      const diffDays = (now.getTime() - invDate.getTime()) / (1000 * 3600 * 24);
      if (periodFilter === "7d") return diffDays <= 7;
      if (periodFilter === "30d") return diffDays <= 30;
      if (periodFilter === "month") {
        return (
          invDate.getMonth() === now.getMonth() &&
          invDate.getFullYear() === now.getFullYear()
        );
      }
      if (periodFilter === "year") {
        return invDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [invoices, periodFilter]);

  const stats = useMemo(() => {
    const source = periodFilteredInvoices;
    const totalFacture = source.reduce((acc, inv) => acc + inv.total, 0);
    const payeesInvoices = source.filter((i) => i.status === "paid");
    const encaisse = payeesInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const attenteInvoices = source.filter((i) => i.status === "unpaid");
    const attente = attenteInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const retardInvoices = source.filter((i) => i.status === "overdue");
    const retard = retardInvoices.reduce((acc, inv) => acc + inv.total, 0);

    const pctEncaisse = totalFacture > 0 ? Math.round((encaisse / totalFacture) * 100) : 0;
    const pctAttente = totalFacture > 0 ? Math.round((attente / totalFacture) * 100) : 0;
    const pctRetard = totalFacture > 0 ? Math.max(0, 100 - pctEncaisse - pctAttente) : 0;

    return {
      totalFacture,
      countTotal: source.length,
      encaisse,
      countPayees: payeesInvoices.length,
      attente,
      countAttente: attenteInvoices.length,
      retard,
      countRetard: retardInvoices.length,
      pctEncaisse,
      pctAttente,
      pctRetard,
    };
  }, [periodFilteredInvoices]);

  // Formatage monétaire localisé
  const formatMoney = (amount: number) => {
    if (currencyMode === "MRU") {
      return amount.toLocaleString("fr-FR") + " MRU";
    } else if (currencyMode === "USD") {
      const usdAmount = Math.round(amount / 39.5);
      return "$" + usdAmount.toLocaleString("en-US", { minimumFractionDigits: 2 });
    } else {
      const eurAmount = Math.round(amount / 43);
      return eurAmount.toLocaleString("fr-FR") + " €";
    }
  };

  // Compteur de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterStatus !== "all") count++;
    if (filterAmountRange !== "all") count++;
    return count;
  }, [filterStatus, filterAmountRange]);

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilterStatus("all");
    setFilterAmountRange("all");
    setIsFilterOpen(false);
    toast.success("Filtres réinitialisés");
  };

  // Filtrage multi-critères et recherche temps réel
  const filteredInvoices = useMemo(() => {
    return periodFilteredInvoices
      .filter((inv) => {
        if (activeTab === "open") return inv.status !== "paid";
        if (activeTab === "statement") return true;
        if (activeTab === "comm") return true;
        return true;
      })
      .filter((inv) => {
        if (filterStatus !== "all" && inv.status !== filterStatus) return false;
        if (filterAmountRange === "low" && inv.total >= 1000000) return false;
        if (filterAmountRange === "mid" && (inv.total < 1000000 || inv.total > 5000000)) return false;
        if (filterAmountRange === "high" && inv.total <= 5000000) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          inv.reference.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q) ||
          (inv.invoiceCode && inv.invoiceCode.toLowerCase().includes(q)) ||
          inv.date.includes(q) ||
          (inv.status === "paid" && "payée".includes(q)) ||
          (inv.status === "overdue" && "en retard".includes(q)) ||
          (inv.status === "unpaid" && "en attente".includes(q)) ||
          inv.total.toString().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "date") return b.date.localeCompare(a.date);
        if (sortBy === "total") return b.total - a.total;
        if (sortBy === "ref") return a.reference.localeCompare(b.reference);
        return 0;
      });
  }, [periodFilteredInvoices, activeTab, searchQuery, sortBy, filterStatus, filterAmountRange]);

  // Sélection par case à cocher
  const handleSelectAll = () => {
    if (selectedRowIds.length === filteredInvoices.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredInvoices.map((inv) => inv.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // EXPORT CSV RÉEL & FONCTIONNEL
  const handleExportCSV = () => {
    try {
      const headers = [
        "Référence",
        "Client",
        "Marge brute (MRU)",
        "Montant Total (MRU)",
        "Date d'émission",
        "Document PDF",
        "Statut",
      ];

      const rows = filteredInvoices.map((inv) => [
        inv.reference,
        `"${inv.clientName.replace(/"/g, '""')}"`,
        inv.grossProfit,
        inv.total,
        inv.date,
        inv.invoiceCode || "En attente",
        inv.status === "paid" ? "Payée" : inv.status === "overdue" ? "En retard" : "En attente",
      ]);

      const csvContent =
        "\uFEFF" +
        headers.join(";") +
        "\n" +
        rows.map((row) => row.join(";")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `FACTURIM-EXPORT-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${filteredInvoices.length} factures exportées en CSV avec succès !`);
      setIsExportOpen(false);
    } catch (err) {
      toast.error("Erreur lors de l'exportation CSV");
    }
  };

  // Partage WhatsApp
  const handleWhatsAppSend = (inv: InvoiceRow) => {
    const text = `Bonjour ${inv.clientName},\nVoici votre facture *${inv.reference}* (${inv.invoiceCode || "N° en cours"}) d'un montant de *${formatMoney(inv.total)}* émise par Facturim.\nMerci pour votre confiance !`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success(`Message WhatsApp préparé pour ${inv.clientName}`);
    setActionMenuOpenId(null);
  };

  // Envoi Email
  const handleEmailSend = (inv: InvoiceRow) => {
    toast.success(`Facture ${inv.reference} envoyée par email à ${inv.clientName}`);
    setActionMenuOpenId(null);
  };

  // Marquer comme payée dans Supabase
  const handleMarkPaid = async (id: string) => {
    try {
      await updateInvoiceStatus(id, "paid");
      setInvoices((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "paid" } : item))
      );
      toast.success("Facture marquée comme réglée dans Supabase !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setActionMenuOpenId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. BANDEAU DE PROFIL & HUB SUPÉRIEUR (Inspiré de la Maquette) */}
      {/* ======================================================== */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white p-5 sm:p-7 shadow-xl shadow-slate-900/10 overflow-hidden border border-slate-800">
        {/* Lueur d'ambiance cyan en arrière-plan */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Bloc Profil Entreprise */}
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar Pro */}
            <div className="relative shrink-0">
              {company?.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-white p-1.5 shadow-lg border border-slate-700/50"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-700 flex items-center justify-center font-black text-xl tracking-tight text-white shadow-lg shadow-sky-500/30">
                  {company?.tradeName ? company.tradeName.slice(0, 2).toUpperCase() : "FI"}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-900 shadow-xs pulse-gentle" />
            </div>

            {/* Titres & Badges de Certification */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {company?.tradeName || company?.name || t.brandName}
                </h2>
                {/* Badge Certifié DGI Style "Public Profile ✓" */}
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold tracking-wide shadow-2xs backdrop-blur-md">
                  <ShieldCheck size={13} className="text-sky-400" />
                  <span>Certifié DGI Mauritanie ✓</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                <span className="text-slate-400">NIF : <strong className="text-slate-200">{company?.taxId || "00987654-MR"}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Passerelle : <strong className="text-emerald-400">Bankily &amp; Seddap</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">TVA Légale : <strong className="text-sky-300">16%</strong></span>
              </div>
            </div>
          </div>

          {/* Contrôles & Sélecteurs en Pilules (Period Tabs & Currency) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Sélecteur de Période (Pill Tabs interactives) */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-inner text-xs">
              {(
                [
                  { id: "7d", label: "7j" },
                  { id: "30d", label: "30j" },
                  { id: "month", label: "Ce Mois" },
                  { id: "year", label: "Année" },
                  { id: "all", label: "Tout" },
                ] as { id: PeriodFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPeriodFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
                    periodFilter === tab.id
                      ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/30 scale-102"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sélecteur de Devise */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 backdrop-blur-md text-xs">
              {(["MRU", "USD", "EUR"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrencyMode(curr)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
                    currencyMode === curr
                      ? "bg-white text-slate-900 shadow-sm font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. GRILLE KPI STATISTIQUES (« Role Statistics » Style) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : CA Encaissé */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-lg hover:border-sky-300 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dashboard.kpiRevenue}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-110 transition-transform">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            {formatMoney(stats.encaisse)}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              {stats.pctEncaisse}% Recouvré
            </span>
            <span className="text-slate-400 font-medium">
              {stats.countPayees} {t.status.paid.toLowerCase()}
            </span>
          </div>
          <div className="relative w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2.5">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${stats.pctEncaisse}%` }} />
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          </div>
        </div>

        {/* KPI 2 : En Attente */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dashboard.kpiPending}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-110 transition-transform">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight">
            {formatMoney(stats.attente)}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
              {stats.pctAttente}% En cours
            </span>
            <span className="text-slate-400 font-medium">
              {stats.countAttente} {t.status.sent.toLowerCase()}
            </span>
          </div>
          <div className="relative w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2.5">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${stats.pctAttente}%` }} />
          </div>
        </div>

        {/* KPI 3 : En Retard */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-lg hover:border-rose-300 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dashboard.kpiOverdue}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-110 transition-transform">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-900 tracking-tight">
            {formatMoney(stats.retard)}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
              {stats.pctRetard}% Échu
            </span>
            <span className="text-slate-400 font-medium">
              {stats.countRetard} {t.status.overdue.toLowerCase()}
            </span>
          </div>
          <div className="relative w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2.5">
            <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${stats.pctRetard}%` }} />
          </div>
        </div>

        {/* KPI 4 : Total Facturé */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-lg hover:border-sky-300 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.clients.totalInvoiced}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-110 transition-transform">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            {formatMoney(stats.totalFacture)}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-md">
              {stats.countTotal} Factures émises
            </span>
            <span className="text-slate-400 font-medium">
              TVA 16% active
            </span>
          </div>
          <div className="relative w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2.5">
            <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DISPOSITION PRINCIPALE EN 2 COLONNES */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* COLONNE GAUCHE (350px) : Raccourcis, Adresses, Documents & Chevrons */}
        <div className="w-full lg:w-[350px] xl:w-[370px] shrink-0 space-y-4">
          {/* CARTE 1 : Informations de l'Entreprise avec Actions à Chevrons */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Package size={15} />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{t.settings.companyProfile}</h3>
              </div>
              <Link
                href="/settings"
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-0.5"
              >
                <span>Modifier</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Rangées de métadonnées avec Chevrons interactifs */}
            <div className="space-y-1.5">
              <Link
                href="/settings"
                className="sub-card-interactive flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50/40 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                    <Building size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {company?.name || `${t.brandName} SARL`}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">NIF : {company?.taxId || "00987654-MR"}</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/settings"
                className="sub-card-interactive flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50/40 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CreditCard size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Paiement Mobile Money</p>
                    <p className="text-[11px] text-emerald-600 font-medium">Bankily • Seddap • Masrvi</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/reports"
                className="sub-card-interactive flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50/40 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <FileSpreadsheet size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Grand Livre Comptable</p>
                    <p className="text-[11px] text-slate-400 truncate">Déclaration DGI Mauritanie</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* CARTE 2 : Adresses professionnelles */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <MapPin size={15} />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Adresses professionnelles</h3>
              </div>

              <Tooltip content="Ajouter une adresse" icon={Plus}>
                <button
                  onClick={() => setIsAddAddressModalOpen(true)}
                  className="w-7 h-7 rounded-lg border border-slate-200/90 hover:bg-sky-50 hover:border-sky-300 flex items-center justify-center text-slate-500 hover:text-sky-600 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Plus size={15} />
                </button>
              </Tooltip>
            </div>

            {/* Liste dynamique des adresses */}
            <div className="space-y-2">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      toast.success(`Adresse active : ${addr.title}`);
                    }}
                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer sub-card-interactive ${
                      isSelected
                        ? "border-sky-400 bg-sky-50/70 shadow-xs ring-1 ring-sky-300"
                        : "border-slate-200/70 bg-white hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? "bg-sky-500 text-white shadow-xs"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Building size={14} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900">{addr.title}</h4>
                            {isSelected && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-sky-500 text-white rounded-md">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {addresses.length > 1 && (
                        <Tooltip content="Supprimer l'adresse" icon={Trash2}>
                          <button
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </Tooltip>
                      )}
                    </div>

                    <div className="mt-2 pl-9 text-[11px] text-slate-600 space-y-0.5">
                      <p className="leading-snug">{addr.street}</p>
                      <p className="text-slate-500 font-medium">{addr.phone}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARTE 3 : Pièces jointes & Documents */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <FileText size={15} />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Documents &amp; Contrats A4</h3>
              </div>
              <button
                onClick={() => toast.success("Prêt pour l'ajout d'un nouveau document PDF")}
                className="w-7 h-7 rounded-lg border border-slate-200/90 hover:bg-sky-50 hover:border-sky-300 flex items-center justify-center text-slate-500 hover:text-sky-600 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                title="Joindre un nouveau document PDF"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Documents List */}
            <div className="space-y-2">
              {/* Document 1 */}
              <div className="sub-card-interactive flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 transition-all group/file cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-9 rounded-md bg-gradient-to-br from-rose-500 to-rose-600 flex flex-col items-center justify-center text-white shrink-0 shadow-2xs group-hover/file:scale-105 transition-transform">
                    <span className="text-[8px] font-black tracking-tighter">PDF</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover/file:text-sky-600 transition-colors">facture-mauritel-mars.pdf</p>
                    <p className="text-[11px] text-slate-400">1.8 Mo • Certifiée DGI</p>
                  </div>
                </div>
                <Tooltip content="Télécharger le PDF" icon={Download}>
                  <button
                    onClick={async () => {
                      toast.loading("Génération du document PDF...", { id: "doc-1" });
                      const ok = await downloadInvoicePDF({
                        reference: "FAC-2025-0001",
                        clientName: "Mauritel SA",
                        clientAddress: "Avenue Gamal Abdel Nasser, Tevragh-Zeina, Nouakchott, Mauritanie",
                        clientEmail: "compta@mauritel.mr",
                        clientPhone: "+222 45 25 12 34",
                        date: "15/03/2025",
                        dueDate: "15/04/2025",
                        total: 4750000,
                        taxRate: 16,
                        status: "paid",
                        items: [
                          {
                            description: "Déploiement infrastructure réseau télécoms & raccordement fibre optique",
                            quantity: 1,
                            unitPrice: 2500000,
                          },
                          {
                            description: "Configuration serveurs haute disponibilité & passerelle VoIP",
                            quantity: 2,
                            unitPrice: 762711,
                          },
                        ],
                        paymentTerms: "Règlement effectué par Virement Bancaire (BPM MR13 00010 01234567890 12).",
                        notes: "Facture acquittée et scellée. Merci pour votre fidélité.",
                      });
                      if (ok) {
                        toast.success("Facture Mauritel SA téléchargée en PDF !", { id: "doc-1" });
                      } else {
                        toast.error("Erreur téléchargement document", { id: "doc-1" });
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                  </button>
                </Tooltip>
              </div>

              {/* Document 2 */}
              <div className="sub-card-interactive flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 transition-all group/file cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-9 rounded-md bg-gradient-to-br from-rose-500 to-rose-600 flex flex-col items-center justify-center text-white shrink-0 shadow-2xs group-hover/file:scale-105 transition-transform">
                    <span className="text-[8px] font-black tracking-tighter">PDF</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover/file:text-sky-600 transition-colors">contrat-cadre-2025.pdf</p>
                    <p className="text-[11px] text-slate-400">2.4 Mo • Contrat Cadre</p>
                  </div>
                </div>
                <Tooltip content="Télécharger le PDF" icon={Download}>
                  <button
                    onClick={async () => {
                      toast.loading("Génération du contrat PDF...", { id: "doc-2" });
                      const ok = await downloadInvoicePDF({
                        reference: "CONTRAT-CADRE-2025",
                        clientName: "Mauritel SA — Direction Générale",
                        clientAddress: "Avenue Gamal Abdel Nasser, Tevragh-Zeina, Nouakchott, Mauritanie",
                        clientEmail: "marches.publics@mauritel.mr",
                        clientPhone: "+222 45 25 12 00",
                        date: "15/01/2025",
                        dueDate: "31/12/2025",
                        total: 14160000,
                        taxRate: 16,
                        status: "paid",
                        items: [
                          {
                            description: "Contrat annuel d'infogérance, maintenance préventive & astreinte 24/7",
                            quantity: 4,
                            unitPrice: 2500000,
                          },
                          {
                            description: "Assistance technique spécialisée & intégrations API passerelle Moosyl",
                            quantity: 2,
                            unitPrice: 1000000,
                          },
                        ],
                        paymentTerms: "Paiement trimestriel à terme échu par Virement Bancaire BPM.",
                        notes: "Contrat officiel de prestation de services numériques — Enregistré et certifié conforme en République Islamique de Mauritanie.",
                      });
                      if (ok) {
                        toast.success("Contrat officiel 2025 téléchargé en PDF !", { id: "doc-2" });
                      } else {
                        toast.error("Erreur téléchargement document", { id: "doc-2" });
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : Tableau de bord des Factures avec Onglets en Pilules */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* CARTE TABLEAU */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            {/* Ligne En-tête : Titre + Export CSV */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Receipt size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 tracking-tight">{t.dashboard.recentInvoices}</h3>
                  <p className="text-xs text-slate-400">
                    {filteredInvoices.length} factures répertoriées pour la période
                  </p>
                </div>
              </div>

              {/* Menu Exporter */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 text-xs font-bold text-slate-700 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <Download size={14} className="text-slate-500" />
                  <span>{t.reports.exportCSV}</span>
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open-live-invoice-modal"));
                    }
                  }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  <span>Créer</span>
                </button>
              </div>
            </div>

            {/* Onglets en Pilules (Segmented Controls) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 pb-2 border-b border-slate-100">
              {/* Pill Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 text-xs">
                {[
                  { id: "invoices", label: `Toutes (${invoices.length})` },
                  { id: "open", label: `En attente (${stats.countAttente + stats.countRetard})` },
                  { id: "statement", label: t.reports.title },
                  { id: "comm", label: "WhatsApp Direct" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-white text-sky-700 shadow-xs scale-102"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Recherche & Tri */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.invoices.searchPlaceholder}
                    className="w-36 sm:w-48 pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-2xs hover:border-slate-300 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-white border border-slate-200 rounded-xl text-xs text-slate-700 pl-2.5 pr-7 py-1.5 font-semibold shadow-2xs hover:border-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="date">{t.invoices.issueDate}</option>
                    <option value="total">{t.invoices.totalTTC}</option>
                    <option value="ref">{t.invoices.invoiceNumber}</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* TABLEAU DES FACTURES */}
            <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-200/70">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/70">
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={
                          filteredInvoices.length > 0 &&
                          selectedRowIds.length === filteredInvoices.length
                        }
                        onChange={handleSelectAll}
                        className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">{t.invoices.invoiceNumber}</th>
                    <th className="py-3 px-3">{t.invoices.client}</th>
                    <th className="py-3 px-3 text-right">Marge HT</th>
                    <th className="py-3 px-3 text-right">{t.invoices.totalTTC}</th>
                    <th className="py-3 px-3 text-center">{t.invoices.issueDate}</th>
                    <th className="py-3 px-3 text-center">{t.invoices.status}</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Receipt size={32} className="mx-auto mb-2 text-slate-300 opacity-60" />
                        <p className="font-semibold text-slate-600">{t.dashboard.emptyInvoices}</p>
                        <p className="text-xs text-slate-400 mt-1">Créez votre première facture en un clic.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-sky-50/40 transition-colors group cursor-pointer"
                      >
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRowIds.includes(inv.id)}
                            onChange={() => handleToggleSelectRow(inv.id)}
                            className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 font-bold text-sky-600 group-hover:underline">
                          <Link href={`/invoices/${inv.id}`}>{inv.reference}</Link>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">
                              {inv.clientName.slice(0, 2).toUpperCase()}
                            </div>
                            <span>{inv.clientName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-600 tabular-nums">
                          {formatMoney(inv.grossProfit)}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-950 tabular-nums">
                          {formatMoney(inv.total)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500 tabular-nums">
                          {inv.date}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              inv.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                : inv.status === "overdue"
                                ? "bg-rose-50 text-rose-700 border-rose-200/60"
                                : "bg-amber-50 text-amber-800 border-amber-200/60"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                inv.status === "paid"
                                  ? "bg-emerald-500"
                                  : inv.status === "overdue"
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            {inv.status === "paid"
                              ? t.status.paid
                              : inv.status === "overdue"
                              ? t.status.overdue
                              : t.status.sent}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip content="Télécharger PDF" icon={Download}>
                              <button
                                onClick={async () => {
                                  toast.loading(`Export PDF de ${inv.reference}...`, { id: inv.id });
                                  const ok = await downloadInvoicePDF({
                                    reference: inv.reference,
                                    clientName: inv.clientName,
                                    date: inv.date,
                                    total: inv.total,
                                    status: inv.status,
                                    taxRate: 16,
                                  });
                                  if (ok) {
                                    toast.success("Facture téléchargée !", { id: inv.id });
                                  } else {
                                    toast.error("Erreur téléchargement", { id: inv.id });
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                              >
                                <Download size={14} />
                              </button>
                            </Tooltip>

                            <Tooltip content="WhatsApp" icon={Share2}>
                              <button
                                onClick={() => handleWhatsAppSend(inv)}
                                className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                              >
                                <Share2 size={14} />
                              </button>
                            </Tooltip>

                            {inv.status !== "paid" && (
                              <Tooltip content="Marquer Payée" icon={CheckCircle2}>
                                <button
                                  onClick={() => handleMarkPaid(inv.id)}
                                  className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODALE D'AJOUT D'ADRESSE PROFESSIONNELLE */}
      {isAddAddressModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <MapPin size={16} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Ajouter une adresse professionnelle
                </h3>
              </div>
              <button
                onClick={() => setIsAddAddressModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Titre de l'adresse *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Agence Tevragh-Zeina ou Entrepôt Ksar"
                  value={newAddressTitle}
                  onChange={(e) => setNewAddressTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adresse complète / Rue *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: Avenue Moktar Ould Daddah, Immeuble Horizon, Tevragh-Zeina, Nouakchott"
                  value={newAddressStreet}
                  onChange={(e) => setNewAddressStreet(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 text-slate-800 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="text"
                  placeholder="+222 45 25 00 00"
                  value={newAddressPhone}
                  onChange={(e) => setNewAddressPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAddressModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg transition-all cursor-pointer"
                >
                  Enregistrer l'adresse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATELIER DE FACTURATION EN DIRECT */}
      <LiveInvoiceModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
      />
    </div>
  );
}
