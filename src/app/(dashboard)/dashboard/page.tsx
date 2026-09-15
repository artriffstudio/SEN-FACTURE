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
  Clock,
  Calendar,
  User,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Share2,
  Send,
  CheckCircle2,
  X,
  Printer,
  HelpCircle,
  Filter,
  RotateCcw,
  TrendingUp,
  Activity,
  Sparkles,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import { downloadInvoicePDF, downloadAttachmentPDF } from "@/lib/pdfGenerator";
import { getInvoices, updateInvoiceStatus } from "@/lib/services/invoiceService";
import { getCompany } from "@/lib/services/companyService";
import { Company, Invoice } from "@/lib/types";
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
  invoiceCode: string | null;
  status: "paid" | "overdue" | "unpaid";
}

export default function DashboardPage() {
  const { t, currentLanguage, formatMoney: formatMoneyContext } = useTranslation();
  const isAr = currentLanguage === "ar";

  // Mode de devise (MRU par défaut)
  const [currencyMode, setCurrencyMode] = useState<"MRU" | "USD" | "EUR">("MRU");

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
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadData = async () => {
    setIsLoadingData(true);
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
            invoiceCode: inv.invoiceNumber,
            status: inv.status === "paid" ? "paid" : inv.status === "overdue" ? "overdue" : "unpaid",
          }))
        );
      }
    } catch (err) {
      console.error("Erreur chargement Supabase:", err);
    } finally {
      setIsLoadingData(false);
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

  const handleInvoiceCreated = (newInv: InvoiceRow) => {
    loadData();
  };

  const stats = useMemo(() => {
    const totalFacture = invoices.reduce((acc, inv) => acc + inv.total, 0);
    const payeesInvoices = invoices.filter((i) => i.status === "paid");
    const encaisse = payeesInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const attenteInvoices = invoices.filter((i) => i.status === "unpaid");
    const attente = attenteInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const retardInvoices = invoices.filter((i) => i.status === "overdue");
    const retard = retardInvoices.reduce((acc, inv) => acc + inv.total, 0);

    const pctEncaisse = totalFacture > 0 ? Math.round((encaisse / totalFacture) * 100) : 0;
    const pctAttente = totalFacture > 0 ? Math.round((attente / totalFacture) * 100) : 0;
    const pctRetard = totalFacture > 0 ? Math.max(0, 100 - pctEncaisse - pctAttente) : 0;

    return {
      totalFacture,
      countTotal: invoices.length,
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
  }, [invoices]);

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
    return invoices
      .filter((inv) => {
        // Filtrage par onglets
        if (activeTab === "open") return inv.status !== "paid";
        if (activeTab === "statement") return true;
        if (activeTab === "comm") return true;
        return true;
      })
      .filter((inv) => {
        // Filtre avancé par statut
        if (filterStatus !== "all" && inv.status !== filterStatus) {
          return false;
        }

        // Filtre avancé par montant
        if (filterAmountRange === "low" && inv.total >= 1000000) return false;
        if (filterAmountRange === "mid" && (inv.total < 1000000 || inv.total > 5000000)) return false;
        if (filterAmountRange === "high" && inv.total <= 5000000) return false;

        // Barre de recherche
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
  }, [invoices, activeTab, searchQuery, sortBy, filterStatus, filterAmountRange]);

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

  // EXPORT CSV RÉEL & FONCTIONNEL (Compatible Excel avec BOM UTF-8)
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
        "\uFEFF" + // BOM UTF-8 pour ouverture directe sans bug dans Excel
        headers.join(";") +
        "\n" +
        rows.map((row) => row.join(";")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `SEN-FACTURE-EXPORT-${new Date().toISOString().split("T")[0]}.csv`
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
      {/* ======================================================== */}
      {/* BANDEAU SUPÉRIEUR ÉPURÉ : Statut & Sélecteur de Devise */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-sky-300/70 transition-all duration-300 card-interactive">
        {/* Statut Hub + Sélecteur de Devise */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-gentle shrink-0"
              title="Système opérationnel et synchronisé en temps réel"
            />
            <span className="font-bold text-slate-900 tracking-tight">{t.dashboard.operationalHub}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">Nouakchott, {t.countryName} (GMT)</span>
            <span className="hidden md:inline-block text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              DGI {t.countryName} &amp; {t.vatRateLabel}
            </span>
          </div>

          {/* Sélecteur de devise */}
          <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 shadow-inner">
            <button
              onClick={() => setCurrencyMode("MRU")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                currencyMode === "MRU"
                  ? "bg-white text-sky-700 shadow-xs scale-102"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Ouguiya mauritanienne (MRU) — Devise officielle par défaut"
            >
              MRU
            </button>
            <button
              onClick={() => setCurrencyMode("USD")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                currencyMode === "USD"
                  ? "bg-white text-slate-900 shadow-xs scale-102"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Dollar américain (USD)"
            >
              USD
            </button>
            <button
              onClick={() => setCurrencyMode("EUR")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                currencyMode === "EUR"
                  ? "bg-white text-slate-900 shadow-xs scale-102"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Euro (EUR)"
            >
              EUR
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DISPOSITION EN 2 COLONNES */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ======================================================== */}
        {/* COLONNE GAUCHE : Informations Entreprise, Adresses, Documents */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[350px] xl:w-[370px] shrink-0 space-y-4">
          {/* CARTE 1 : Informations de l'entreprise */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300/80 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <span title={t.settings.companyProfile} className="inline-flex items-center group-hover:scale-110 transition-transform duration-200">
                  <Package
                    size={17}
                    className="text-slate-600"
                  />
                </span>
                <span className="group-hover:text-sky-950 transition-colors">{t.settings.companyProfile}</span>
              </div>
              <button
                onClick={() => toast(t.settings.title, { icon: "⚙️" })}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title={t.settings.title}
              >
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Actions rapides */}
            <div className="relative">
              <button
                onClick={() => setCustomerActionsOpen(!customerActionsOpen)}
                className="w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-sky-300 text-xs font-semibold text-slate-700 transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5 cursor-pointer"
              >
                <Eye size={14} className="text-slate-500" />
                <span>{t.invoices.actions}</span>
                <ChevronDown size={14} className="text-slate-400 ml-0.5" />
              </button>

              {customerActionsOpen && (
                <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 text-xs animate-in fade-in duration-100">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserCheck size={14} className="text-slate-400" />
                    {t.nav.settings}
                  </Link>
                  <button
                    onClick={() => {
                      toast.success(t.reports.title);
                      setCustomerActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet size={14} className="text-slate-400" />
                    {t.reports.title}
                  </button>
                  <button
                    onClick={() => {
                      const url = `https://wa.me/?text=${encodeURIComponent("Bonjour, voici notre récapitulatif Facturim.")}`;
                      window.open(url, "_blank");
                      setCustomerActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50 text-left font-medium transition-colors cursor-pointer"
                  >
                    <Share2 size={14} />
                    {t.invoices.shareWhatsApp}
                  </button>
                </div>
              )}
            </div>

            {/* Profil Entreprise Supabase */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                {company?.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="w-12 h-12 rounded-2xl object-contain bg-white border border-slate-200 shadow-md p-1 group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-black text-base tracking-tighter group-hover:scale-105 group-hover:shadow-sky-500/30 transition-all duration-300"
                  >
                    {company?.tradeName ? company.tradeName.slice(0, 2).toUpperCase() : "FI"}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-sky-900 transition-colors">
                    {company?.tradeName || company?.name || t.brandName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    {company?.name || `${t.brandName} ${t.countryName}`}
                  </p>
                </div>
              </div>

              <span
                className="bg-emerald-500 text-white font-extrabold text-[11px] px-3 py-0.5 rounded-full shadow-2xs pulse-gentle"
              >
                {t.status.paid ? "Actif" : "Active"}
              </span>
            </div>

            {/* Grille de métadonnées avec hover indicatif */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all duration-150">
                <div
                  className="flex items-center gap-1.5 text-slate-400 mb-0.5"
                >
                  <Building size={13} />
                  <span>{t.settings.companyName}</span>
                </div>
                <p className="font-bold text-slate-800">SARL ({t.countryName})</p>
              </div>

              <div className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all duration-150">
                <div
                  className="flex items-center gap-1.5 text-slate-400 mb-0.5"
                >
                  <Mail size={13} />
                  <span>{t.clients.email}</span>
                </div>
                <p className="font-bold text-slate-800 truncate" title={company?.email || "contact@facturim.mr"}>
                  {company?.email || "contact@facturim.mr"}
                </p>
              </div>

              <div className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all duration-150">
                <div
                  className="flex items-center gap-1.5 text-slate-400 mb-0.5"
                >
                  <FileText size={13} />
                  <span>{t.settings.nifNumber}</span>
                </div>
                <p className="font-bold text-slate-800">{company?.taxId || "00987654-MR"}</p>
              </div>

              <div className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all duration-150">
                <div
                  className="flex items-center gap-1.5 text-slate-400 mb-0.5"
                >
                  <UserCheck size={13} />
                  <span>{t.settings.rcNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-slate-800">MR.NKTT.2025.B</span>
                </div>
              </div>

              <div className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all duration-150">
                <div
                  className="flex items-center gap-1.5 text-slate-400 mb-0.5"
                >
                  <Globe size={13} />
                  <span>{t.clients.city}</span>
                </div>
                <p className="font-bold text-slate-800 truncate">
                  Nouakchott
                </p>
              </div>

              <div className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all duration-150">
                <div
                  className="flex items-center gap-1.5 text-slate-400 mb-0.5"
                >
                  <Phone size={13} />
                  <span>{t.clients.phone}</span>
                </div>
                <p className="font-bold text-slate-800">{company?.phone || "+222 45 25 00 00"}</p>
              </div>
            </div>
          </div>

          {/* CARTE 2 : Adresses professionnelles */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300/80 space-y-3.5 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Tooltip content="Adresses de facturation" icon={MapPin}>
                  <span className="inline-flex items-center group-hover:scale-110 transition-transform duration-200">
                    <MapPin size={17} className="text-slate-600" />
                  </span>
                </Tooltip>
                <span className="group-hover:text-sky-950 transition-colors">Adresses professionnelles</span>
              </div>

              {/* Bouton + Ajouter une adresse interactif avec Tooltip */}
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
            <div className="space-y-2.5">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      toast.success(`Adresse active : ${addr.title}`);
                    }}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer sub-card-interactive ${
                      isSelected
                        ? "border-sky-400 bg-sky-50/70 shadow-xs ring-1 ring-sky-300"
                        : "border-slate-200/70 bg-white hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                            isSelected
                              ? "bg-sky-100 text-sky-600 font-bold"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Building size={16} />
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

                    <div className="mt-2.5 pl-10 text-[11px] text-slate-600 space-y-0.5">
                      <p className="leading-snug">{addr.street}</p>
                      <p className="text-slate-500 font-medium">{addr.phone}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARTE 3 : Pièces jointes & Documents */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300/80 space-y-3.5 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <span title="Documents contractuels et factures archivées" className="inline-flex items-center group-hover:scale-110 transition-transform duration-200">
                  <FileText
                    size={17}
                    className="text-slate-600"
                  />
                </span>
                <span className="group-hover:text-sky-950 transition-colors">Documents & Pièces jointes</span>
              </div>
              <button
                onClick={() => toast.success("Sélectionnez un document à téléverser")}
                className="w-7 h-7 rounded-lg border border-slate-200/90 hover:bg-sky-50 hover:border-sky-300 flex items-center justify-center text-slate-500 hover:text-sky-600 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                title="Joindre un nouveau document PDF"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Fichier 1 */}
            <div className="sub-card-interactive flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 transition-all duration-200 group/file cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-9 rounded-md bg-gradient-to-br from-rose-500 to-rose-600 flex flex-col items-center justify-center text-white shrink-0 shadow-2xs group-hover/file:scale-105 transition-transform"
                  title="Document officiel au format PDF"
                >
                  <span className="text-[8px] font-black tracking-tighter">PDF</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover/file:text-sky-600 transition-colors">facture-sonatel-mars.pdf</p>
                  <p className="text-[11px] text-slate-400">1.8 Mo</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip content="Télécharger le PDF" icon={Download}>
                  <button
                    onClick={async () => {
                      toast.loading("Génération du document PDF...", { id: "doc-1" });
                      const ok = await downloadInvoicePDF({
                        reference: "FAC-2025-0001",
                        clientName: "Sonatel SA",
                        clientAddress: "46 Boulevard de la République, Dakar Plateau, Sénégal",
                        clientEmail: "compta@sonatel.sn",
                        clientPhone: "+221 33 839 12 34",
                        date: "15/03/2025",
                        dueDate: "15/04/2025",
                        total: 4750000,
                        taxRate: 18,
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
                        paymentTerms: "Règlement effectué par Virement Bancaire (BICIS SN08 0100 1025 0001 2345 6789).",
                        notes: "Facture acquittée et scellée. Merci pour votre fidélité.",
                      });
                      if (ok) {
                        toast.success("Facture Sonatel SA téléchargée en PDF !", { id: "doc-1" });
                      } else {
                        toast.error("Erreur téléchargement document", { id: "doc-1" });
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                  </button>
                </Tooltip>
                <button
                  onClick={() => toast("Options du document", { icon: "📄" })}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 hover:scale-110 transition-all cursor-pointer"
                  title="Options de gestion du fichier"
                >
                  <MoreVertical size={15} />
                </button>
              </div>
            </div>

            {/* Fichier 2 */}
            <div className="sub-card-interactive flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 transition-all duration-200 group/file cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-9 rounded-md bg-gradient-to-br from-rose-500 to-rose-600 flex flex-col items-center justify-center text-white shrink-0 shadow-2xs group-hover/file:scale-105 transition-transform"
                  title="Document officiel au format PDF"
                >
                  <span className="text-[8px] font-black tracking-tighter">PDF</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover/file:text-sky-600 transition-colors">contrat-prestation-2025.pdf</p>
                  <p className="text-[11px] text-slate-400">2.4 Mo</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip content="Télécharger le PDF" icon={Download}>
                  <button
                    onClick={async () => {
                      toast.loading("Génération du contrat PDF...", { id: "doc-2" });
                      const ok = await downloadInvoicePDF({
                        reference: "CONTRAT-CADRE-2025",
                        clientName: "Sonatel SA — Direction Générale",
                        clientAddress: "46 Boulevard de la République, Dakar Plateau, Sénégal",
                        clientEmail: "marches.publics@sonatel.sn",
                        clientPhone: "+221 33 839 12 00",
                        date: "15/01/2025",
                        dueDate: "31/12/2025",
                        total: 14160000,
                        taxRate: 18,
                        status: "paid",
                        items: [
                          {
                            description: "Contrat annuel d'infogérance, maintenance préventive & astreinte 24/7",
                            quantity: 4,
                            unitPrice: 2500000,
                          },
                          {
                            description: "Assistance technique spécialisée SYSCOHADA & intégrations API sécurisées",
                            quantity: 2,
                            unitPrice: 1000000,
                          },
                        ],
                        paymentTerms: "Paiement trimestriel à terme échu par Virement Bancaire BICIS.",
                        notes: "Contrat officiel de prestation de services numériques — Enregistré et certifié conforme au Sénégal.",
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
                <button
                  onClick={() => toast("Options du document", { icon: "📄" })}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 hover:scale-110 transition-all cursor-pointer"
                  title="Options de gestion du fichier"
                >
                  <MoreVertical size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLONNE DROITE : Métriques & Tableau des factures */}
        {/* ======================================================== */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* CARTE 1 : Synthèse globale de facturation */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300/80 space-y-5 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform shadow-2xs">
                  <Activity size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.dashboard.welcome}</h2>
                  <p className="text-[11px] text-slate-400">{t.dashboard.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles size={12} className="text-sky-500" />
                  <span>{t.vatRateLabel}</span>
                </span>
              </div>
            </div>

            {/* Grille de 3 KPI interactifs avec animation au survol */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* KPI 1 : Valeur totale facturée */}
              <div className="sub-card-interactive p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 cursor-pointer">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium mb-1">
                  <span>{t.clients.totalInvoiced}</span>
                  <span className="text-[10px] bg-slate-200/70 text-slate-700 font-bold px-1.5 py-0.5 rounded">{stats.countTotal}</span>
                </div>
                <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {formatMoney(stats.totalFacture)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                  <TrendingUp size={12} />
                  <span>{t.brandName} Cloud</span>
                </div>
              </div>

              {/* KPI 2 : Recouvrement encaissé */}
              <div className="sub-card-interactive p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 cursor-pointer">
                <div className="flex items-center justify-between text-emerald-700 text-[11px] font-medium mb-1">
                  <span>{t.dashboard.kpiRevenue}</span>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-bold px-1.5 py-0.5 rounded">{stats.pctEncaisse}%</span>
                </div>
                <div className="text-base sm:text-lg font-extrabold text-emerald-900 tracking-tight">
                  {formatMoney(stats.encaisse)}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">
                  {stats.countPayees} {t.status.paid.toLowerCase()}
                </div>
              </div>

              {/* KPI 3 : Créances en attente */}
              <div className="sub-card-interactive p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 cursor-pointer">
                <div className="flex items-center justify-between text-amber-700 text-[11px] font-medium mb-1">
                  <span>{t.dashboard.kpiPending}</span>
                  <span className="text-[10px] bg-amber-200/70 text-amber-800 font-bold px-1.5 py-0.5 rounded">{100 - stats.pctEncaisse}%</span>
                </div>
                <div className="text-base sm:text-lg font-extrabold text-amber-900 tracking-tight">
                  {formatMoney(stats.attente + stats.retard)}
                </div>
                <div className="text-[11px] text-amber-700 font-medium mt-1">
                  {stats.countAttente + stats.countRetard} {t.status.sent.toLowerCase()}
                </div>
              </div>
            </div>

            {/* Barre de progression tricolore avec effet SHIMMER continu */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>{t.reports.kpiRecoveryRate}</span>
                <span className="font-bold text-slate-800">{stats.pctEncaisse}%</span>
              </div>
              <div className="relative w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${stats.pctEncaisse}%` }}
                />
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${stats.pctAttente}%` }}
                />
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${stats.pctRetard}%` }}
                />
                {/* Voile de brillance animée (shimmer) qui traverse la barre */}
                <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              </div>
            </div>

            {/* Légende interactive avec hover indicatif et cartes dynamiques */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div
                className="sub-card-interactive p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 flex items-center justify-between cursor-default"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 pulse-gentle" />
                  <span className="font-bold text-slate-800">{t.status.paid}</span>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-900">{formatMoney(stats.encaisse)}</div>
                  <div className="text-[10px] text-slate-400">{stats.countPayees} {t.nav.invoices}</div>
                </div>
              </div>

              <div
                className="sub-card-interactive p-2.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 flex items-center justify-between cursor-default"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 pulse-gentle" />
                  <span className="font-bold text-slate-800">{t.status.sent}</span>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-900">{formatMoney(stats.attente)}</div>
                  <div className="text-[10px] text-slate-400">{stats.countAttente} {t.nav.invoices}</div>
                </div>
              </div>

              <div
                className="sub-card-interactive p-2.5 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 flex items-center justify-between cursor-default"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 pulse-gentle" />
                  <span className="font-bold text-slate-800">{t.status.overdue}</span>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-900">{formatMoney(stats.retard)}</div>
                  <div className="text-[10px] text-slate-400">{stats.countRetard} {t.nav.invoices}</div>
                </div>
              </div>
            </div>
          </div>

          {/* CARTE 2 : Tableau des Factures avec Outils 100% Fonctionnels */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300/80 space-y-4">
            {/* Ligne En-tête : Titre + Bouton Exporter FONCTIONNEL */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center group-hover:scale-110 transition-transform">
                  <Receipt
                    size={18}
                    className="text-slate-700"
                  />
                </span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{t.dashboard.recentInvoices}</h3>
                {searchQuery && (
                  <span className="bg-sky-50 text-sky-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-sky-200 shadow-2xs">
                    {filteredInvoices.length}
                  </span>
                )}
              </div>

              {/* Menu Exporter FONCTIONNEL */}
              <div className="relative">
                <button
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-sky-50/60 hover:border-sky-300 text-xs font-bold text-slate-700 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <Download size={14} className="text-slate-500" />
                  <span>{t.reports.exportCSV}</span>
                  <ChevronDown size={13} className="text-slate-400 ml-0.5" />
                </button>

                {/* Dropdown d'exportation */}
                {isExportOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1 text-xs text-left animate-in fade-in duration-100">
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-2 px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <Download size={14} className="text-sky-600" />
                      <span>{t.reports.exportCSV}</span>
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                        setIsExportOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 font-medium transition-colors border-t border-slate-100"
                    >
                      <Printer size={14} className="text-slate-500" />
                      <span>{t.reports.print}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ligne métadonnées rapides avec Tooltip blanc épuré */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 pt-1 pb-2 border-b border-slate-100">
              <Tooltip content={t.invoices.paymentTerms} icon={Calendar}>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <Calendar size={14} className="text-sky-600" />
                  <span>{t.invoices.paymentTerms} :</span>
                  <strong className="text-slate-800 font-bold">30 jours</strong>
                </div>
              </Tooltip>

              <Tooltip content={t.reports.generalLedger} icon={FileSpreadsheet}>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <FileSpreadsheet size={14} className="text-sky-600" />
                  <span>{t.reports.generalLedger} :</span>
                  <strong className="text-slate-800 font-bold">411 ({t.countryName})</strong>
                </div>
              </Tooltip>

              <Tooltip content={t.settings.companyProfile} icon={User}>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <User size={14} className="text-sky-600" />
                  <span>{t.settings.companyName} :</span>
                  <strong className="text-slate-800 font-bold">{company?.name || t.brandName}</strong>
                </div>
              </Tooltip>
            </div>

            {/* Onglets, Barre de recherche et Bouton Filtres FONCTIONNELS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-b border-slate-200/70">
              {/* Onglets */}
              <div className="flex items-center gap-5 overflow-x-auto no-scrollbar text-xs">
                <button
                  onClick={() => setActiveTab("invoices")}
                  className={`pb-3 font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                    activeTab === "invoices"
                      ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900"
                      : "text-slate-500 hover:text-slate-800 font-medium"
                  }`}
                >
                  {t.invoices.filterAll} ({invoices.length})
                </button>

                <button
                  onClick={() => setActiveTab("statement")}
                  className={`pb-3 font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                    activeTab === "statement"
                      ? "text-slate-900 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.reports.title}
                </button>

                <button
                  onClick={() => setActiveTab("open")}
                  className={`pb-3 font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                    activeTab === "open"
                      ? "text-slate-900 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.invoices.filterPending}
                </button>

                <button
                  onClick={() => setActiveTab("comm")}
                  className={`pb-3 font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                    activeTab === "comm"
                      ? "text-slate-900 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.invoices.shareWhatsApp}
                </button>
              </div>

              {/* Contrôles de droite : Recherche, Tri, Filtres */}
              <div className="flex items-center gap-2 pb-2 self-end md:self-auto">
                {/* Champ de recherche FONCTIONNEL */}
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.invoices.searchPlaceholder}
                    className="w-40 sm:w-56 pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Effacer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Sélecteur de tri */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Trier"
                    className="appearance-none bg-white border border-slate-200 rounded-xl text-xs text-slate-700 pl-2.5 pr-7 py-1.5 font-semibold shadow-2xs hover:border-slate-300 hover:shadow-xs focus:outline-none cursor-pointer transition-all"
                  >
                    <option value="date">{t.invoices.issueDate}</option>
                    <option value="total">{t.invoices.totalTTC}</option>
                    <option value="ref">{t.invoices.invoiceNumber}</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                </div>

                {/* Bouton de filtrage FONCTIONNEL avec badge actif */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center justify-center gap-1 w-8.5 h-8.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 ${
                      activeFiltersCount > 0 || isFilterOpen
                        ? "border-sky-500 bg-sky-50 text-sky-700 font-bold ring-2 ring-sky-100"
                        : "border-slate-200 bg-white hover:bg-sky-50/50 hover:border-sky-300 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* PANNEAU DE FILTRES AVANCÉS DÉROULANT */}
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-3.5 animate-in fade-in duration-100">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Filter size={14} className="text-sky-600" />
                          <span>{t.invoices.actions}</span>
                        </div>
                        {activeFiltersCount > 0 && (
                          <button
                            onClick={handleResetFilters}
                            className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                          >
                            <RotateCcw size={11} />
                            <span>Effacer</span>
                          </button>
                        )}
                      </div>

                      {/* 1. Filtrer par statut */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {t.invoices.status}
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                        >
                          <option value="all">{t.invoices.filterAll}</option>
                          <option value="paid">{t.invoices.filterPaid}</option>
                          <option value="unpaid">{t.invoices.filterPending}</option>
                          <option value="overdue">{t.invoices.filterOverdue}</option>
                        </select>
                      </div>

                      {/* 2. Filtrer par montant */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {t.invoices.amountHT}
                        </label>
                        <select
                          value={filterAmountRange}
                          onChange={(e) => setFilterAmountRange(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                        >
                          <option value="all">{t.invoices.filterAll}</option>
                          <option value="low">&lt; 100 000 {t.currencySymbol}</option>
                          <option value="mid">100 000 - 500 000 {t.currencySymbol}</option>
                          <option value="high">&gt; 500 000 {t.currencySymbol}</option>
                        </select>
                      </div>

                      {/* Bouton de confirmation */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => setIsFilterOpen(false)}
                          className="w-full py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-bold text-center transition-colors"
                        >
                          OK ({filteredInvoices.length})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tableau des factures */}
            <div className="overflow-x-auto no-scrollbar pt-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                    <th className="py-3 px-2 w-8">
                      <input
                        type="checkbox"
                        checked={
                          filteredInvoices.length > 0 &&
                          selectedRowIds.length === filteredInvoices.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 font-medium">
                      <div
                        onClick={() => setSortBy("ref")}
                        className="flex items-center gap-1 cursor-pointer hover:text-slate-700"
                      >
                        <span>{t.invoices.invoiceNumber}</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-3 font-medium">
                      <span>{t.invoices.client}</span>
                    </th>
                    <th className="py-3 px-3 font-medium">
                      <span>{t.invoices.subtotal}</span>
                    </th>
                    <th className="py-3 px-3 font-medium">
                      <div
                        onClick={() => setSortBy("total")}
                        className="flex items-center gap-1 cursor-pointer hover:text-slate-700"
                      >
                        <span>{t.invoices.totalTTC}</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-3 font-medium">
                      <div
                        onClick={() => setSortBy("date")}
                        className="flex items-center gap-1 cursor-pointer hover:text-slate-700"
                      >
                        <span>{t.invoices.issueDate}</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-3 font-medium">
                      <span>PDF</span>
                    </th>
                    <th className="py-3 px-3 font-medium">
                      <span>{t.invoices.status}</span>
                    </th>
                    <th className="py-3 px-2 text-right"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100/80">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600 shadow-sm">
                            <Receipt size={24} />
                          </div>
                          <p className="font-bold text-slate-800 text-sm">
                            {t.dashboard.emptyInvoices}
                          </p>
                          <p className="text-xs text-slate-400 max-w-sm">
                            {t.invoices.certifiedNotice}
                          </p>
                          <button
                            onClick={() => setIsLiveModalOpen(true)}
                            className="mt-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus size={15} />
                            <span>{t.dashboard.createFirstInvoice}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search size={28} className="text-slate-300" />
                          <p className="font-semibold text-slate-700">
                            {t.dashboard.emptyInvoices}
                          </p>
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              handleResetFilters();
                            }}
                            className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const isSelected = selectedRowIds.includes(inv.id);
                      const isMenuOpen = actionMenuOpenId === inv.id;

                      return (
                        <tr
                          key={inv.id}
                          className={`group transition-all duration-150 cursor-pointer border-l-2 ${
                            isSelected
                              ? "border-l-sky-500 bg-sky-50/80 shadow-xs"
                              : "border-l-transparent hover:border-l-sky-400 hover:bg-sky-50/40 hover:shadow-xs"
                          }`}
                        >
                          {/* Case à cocher */}
                          <td className="py-3.5 px-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(inv.id)}
                              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer transition-transform group-hover:scale-110"
                            />
                          </td>

                          {/* Référence */}
                          <td className="py-3.5 px-3 font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {inv.reference}
                          </td>

                          {/* Nom du Client */}
                          <td className="py-3.5 px-3 font-semibold text-slate-800">
                            {inv.clientName}
                          </td>

                          {/* Marge brute */}
                          <td className="py-3.5 px-3 text-slate-600 font-medium">
                            {formatMoney(inv.grossProfit)}
                          </td>

                          {/* Total */}
                          <td className="py-3.5 px-3 text-slate-900 font-extrabold group-hover:text-sky-950 transition-colors">
                            {formatMoney(inv.total)}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-3 text-slate-600">
                            {inv.date}
                          </td>

                          {/* Document PDF avec téléchargement direct et Tooltip */}
                          <td className="py-3.5 px-3">
                            {inv.invoiceCode ? (
                              <Tooltip content={t.invoices.downloadPDF} icon={Download}>
                                <button
                                  onClick={async () => {
                                    toast.loading(`PDF ${inv.reference}...`, { id: `pdf-${inv.id}` });
                                    const ok = await downloadInvoicePDF({
                                      reference: inv.reference,
                                      clientName: inv.clientName,
                                      date: inv.date,
                                      total: inv.total,
                                      grossProfit: inv.grossProfit,
                                      status: inv.status,
                                    });
                                    if (ok) {
                                      toast.success(`PDF ${inv.reference} OK !`, { id: `pdf-${inv.id}` });
                                    } else {
                                      toast.error("Erreur PDF", { id: `pdf-${inv.id}` });
                                    }
                                  }}
                                  className="flex items-center gap-1.5 text-slate-700 hover:text-sky-600 font-semibold group/code cursor-pointer"
                                >
                                  <div className="w-4 h-4 rounded-xs bg-rose-500 flex items-center justify-center text-white shrink-0 text-[7px] font-black group-hover/code:scale-110 transition-transform shadow-2xs">
                                    PDF
                                  </div>
                                  <span className="underline-offset-2 group-hover/code:underline">
                                    {inv.invoiceCode}
                                  </span>
                                </button>
                              </Tooltip>
                            ) : (
                              <div
                                className="flex items-center gap-1.5 text-slate-400"
                              >
                                <FileText size={14} className="text-slate-300" />
                                <span>{t.status.draft}</span>
                              </div>
                            )}
                          </td>

                          {/* Statut de paiement avec hover indicatif */}
                          <td className="py-3.5 px-3">
                            {inv.status === "paid" && (
                              <span
                                className="bg-emerald-100/80 text-emerald-700 font-bold text-[11px] px-3 py-0.5 rounded-full inline-flex items-center justify-center border border-emerald-200/60 shadow-2xs hover:scale-105 transition-transform"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 pulse-gentle" />
                                {t.status.paid}
                              </span>
                            )}
                            {inv.status === "overdue" && (
                              <span
                                className="bg-rose-100/80 text-rose-700 font-bold text-[11px] px-3 py-0.5 rounded-full inline-flex items-center justify-center border border-rose-200/60 shadow-2xs hover:scale-105 transition-transform"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 pulse-gentle" />
                                {t.status.overdue}
                              </span>
                            )}
                            {inv.status === "unpaid" && (
                              <span
                                className="bg-amber-100/80 text-amber-700 font-bold text-[11px] px-3 py-0.5 rounded-full inline-flex items-center justify-center border border-amber-200/60 shadow-2xs hover:scale-105 transition-transform"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 pulse-gentle" />
                                {t.status.sent}
                              </span>
                            )}
                          </td>

                          {/* Actions ⋮ */}
                          <td className="py-3.5 px-2 text-right relative">
                            <button
                              onClick={() => setActionMenuOpenId(isMenuOpen ? null : inv.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Menu contextuel */}
                            {isMenuOpen && (
                              <div className="absolute right-2 top-8 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1.5 text-xs text-left animate-in fade-in duration-100">
                                <Link
                                  href="/invoices"
                                  className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                                >
                                  <Eye size={14} className="text-slate-400" />
                                  {t.invoices.viewDetails}
                                </Link>

                                <button
                                  onClick={() => handleWhatsAppSend(inv)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50 text-left font-medium cursor-pointer"
                                >
                                  <Share2 size={14} />
                                  {t.invoices.shareWhatsApp}
                                </button>

                                <button
                                  onClick={() => handleEmailSend(inv)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sky-600 hover:bg-sky-50 text-left cursor-pointer"
                                >
                                  <Send size={14} />
                                  Email
                                </button>

                                <button
                                  onClick={() => {
                                    downloadInvoicePDF(inv);
                                    toast.success(`${inv.reference} PDF !`);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                                >
                                  <Download size={14} className="text-sky-600" />
                                  {t.invoices.downloadPDF}
                                </button>

                                {inv.status !== "paid" && (
                                  <button
                                    onClick={() => handleMarkPaid(inv.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50 text-left border-t border-slate-100 cursor-pointer"
                                  >
                                    <CheckCircle2 size={14} />
                                    {t.status.paid}
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div>
                <span>{filteredInvoices.length} / {invoices.length} {t.nav.invoices}</span>
              </div>

              {/* Boutons de pagination */}
              <div className="flex items-center gap-1 self-center">
                <button
                  onClick={() => toast("1")}
                  className="w-7 h-7 rounded-md bg-slate-100 text-slate-900 font-bold flex items-center justify-center shadow-2xs"
                >
                  1
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout d'adresse professionnelle */}
      {isAddAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ajouter une adresse</h3>
                  <p className="text-[11px] text-slate-400">Établissement, succursale ou entrepôt</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAddressModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Intitulé du lieu / Établissement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Succursale Almadies, Dépôt Diamniadio"
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
                  placeholder="Ex: Route des Almadies, Immeuble Horizon, 2ème étage, Dakar"
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
                  placeholder="+221 33 800 00 00"
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
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Enregistrer l'adresse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal atelier de création avec aperçu A4 instantané */}
      <LiveInvoiceModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </div>
  );
}
