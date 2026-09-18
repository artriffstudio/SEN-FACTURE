"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Send,
  Eye,
  FileText,
  Wallet,
  Zap,
  Sparkles,
  Command,
  X,
  Check,
  Building,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  BankilyLogo,
  MasrviLogo,
  SedadLogo,
  BPMLogo,
} from "@/components/ui/PaymentLogos";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import { getInvoices, updateInvoiceStatus, createInvoice } from "@/lib/services/invoiceService";
import { createClient } from "@/lib/services/clientService";
import { Invoice } from "@/lib/types";

interface QuickInvoiceItem {
  clientName: string;
  amount: number;
  description: string;
  paymentMethod: "bankily" | "masrvi" | "sedad" | "bpm";
}

export default function ConceptDashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Formulaire de création rapide 15 secondes
  const [quickForm, setQuickForm] = useState<QuickInvoiceItem>({
    clientName: "",
    amount: 150000,
    description: "Prestation de services & développement",
    paymentMethod: "bankily",
  });
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    try {
      const data = await getInvoices();
      if (data && data.length > 0) {
        setInvoices(data);
      } else {
        // Jeu de données de démonstration ultra-réaliste
        setInvoices([
          {
            id: "demo-1",
            companyId: "comp-1",
            clientId: "cl-1",
            invoiceNumber: "FAC-2025-0042",
            status: "paid",
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
            subtotal: 1850000,
            taxRate: 0,
            taxAmount: 0,
            total: 1850000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            client: {
              id: "cl-1",
              companyId: "comp-1",
              name: "Mauritel SA",
              email: "finance@mauritel.mr",
              phone: "+222 45 25 12 34",
              address: "Avenue Gamal Abdel Nasser",
              city: "Nouakchott",
              country: "Mauritanie",
              taxId: "00123456-MR",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            items: [
              {
                id: "it-1",
                description: "Contrat infrastructure fibre & hébergement Cloud sécurisé",
                quantity: 1,
                unitPrice: 1850000,
                total: 1850000,
                sortOrder: 0,
              },
            ],
          },
          {
            id: "demo-2",
            companyId: "comp-1",
            clientId: "cl-2",
            invoiceNumber: "FAC-2025-0041",
            status: "sent",
            issueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
            dueDate: new Date(Date.now() + 86400000 * 12).toISOString(),
            subtotal: 620000,
            taxRate: 0,
            taxAmount: 0,
            total: 620000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            client: {
              id: "cl-2",
              companyId: "comp-1",
              name: "Banque Populaire de Mauritanie (BPM)",
              email: "compta@bpm.mr",
              phone: "+222 45 00 11 22",
              address: "Tevragh-Zeina",
              city: "Nouakchott",
              country: "Mauritanie",
              taxId: "00987654-MR",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            items: [
              {
                id: "it-2",
                description: "Intégration passerelle API Bankily & automatisation des flux",
                quantity: 1,
                unitPrice: 620000,
                total: 620000,
                sortOrder: 0,
              },
            ],
          },
          {
            id: "demo-3",
            companyId: "comp-1",
            clientId: "cl-3",
            invoiceNumber: "FAC-2025-0040",
            status: "sent",
            issueDate: new Date(Date.now() - 86400000 * 5).toISOString(),
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            subtotal: 340000,
            taxRate: 0,
            taxAmount: 0,
            total: 340000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            client: {
              id: "cl-3",
              companyId: "comp-1",
              name: "SNIM Mauritanie",
              email: "achats@snim.mr",
              phone: "+222 45 74 10 00",
              address: "Cansado, Nouadhibou",
              city: "Nouadhibou",
              country: "Mauritanie",
              taxId: "00543210-MR",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            items: [
              {
                id: "it-3",
                description: "Maintenance préventive des serveurs et réseaux de transmission",
                quantity: 1,
                unitPrice: 340000,
                total: 340000,
                sortOrder: 0,
              },
            ],
          },
          {
            id: "demo-4",
            companyId: "comp-1",
            clientId: "cl-4",
            invoiceNumber: "FAC-2025-0039",
            status: "overdue",
            issueDate: new Date(Date.now() - 86400000 * 35).toISOString(),
            dueDate: new Date(Date.now() - 86400000 * 5).toISOString(),
            subtotal: 210000,
            taxRate: 0,
            taxAmount: 0,
            total: 210000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            client: {
              id: "cl-4",
              companyId: "comp-1",
              name: "Chinguitel",
              email: "facturation@chinguitel.mr",
              phone: "+222 45 29 00 00",
              address: "Avenue Moktar Ould Daddah",
              city: "Nouakchott",
              country: "Mauritanie",
              taxId: "00778899-MR",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            items: [
              {
                id: "it-4",
                description: "Audit de performance et sécurisation des passerelles SMS",
                quantity: 1,
                unitPrice: 210000,
                total: 210000,
                sortOrder: 0,
              },
            ],
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // KPIs financiers clairs et épurés
  const metrics = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
    const pending = invoices.filter((i) => i.status === "sent" || i.status === "draft").reduce((s, i) => s + i.total, 0);
    const overdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0);
    const total = paid + pending + overdue;
    const recoveryRate = total > 0 ? Math.round((paid / total) * 100) : 0;

    return {
      paid,
      pending,
      overdue,
      total,
      recoveryRate,
      paidCount: invoices.filter((i) => i.status === "paid").length,
      pendingCount: invoices.filter((i) => i.status === "sent" || i.status === "draft").length,
      overdueCount: invoices.filter((i) => i.status === "overdue").length,
    };
  }, [invoices]);

  // Filtrage
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (activeTab === "paid" && inv.status !== "paid") return false;
      if (activeTab === "pending" && inv.status !== "sent" && inv.status !== "draft") return false;
      if (activeTab === "overdue" && inv.status !== "overdue") return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const client = inv.client?.name || "";
      return inv.invoiceNumber.toLowerCase().includes(q) || client.toLowerCase().includes(q);
    });
  }, [invoices, activeTab, searchQuery]);

  // Création express
  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickForm.clientName.trim() || !quickForm.amount) {
      toast.error("Veuillez renseigner le nom et le montant");
      return;
    }
    try {
      setIsCreating(true);
      toast.loading("Génération de la facture...", { id: "quick" });

      const client = await createClient({
        name: quickForm.clientName.trim(),
        email: `contact@${quickForm.clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}.mr`,
        phone: "+222 45 00 00 00",
        address: "Nouakchott",
        country: "Mauritanie",
      });

      const inv = await createInvoice({
        clientId: client.id,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 86400000 * 15).toISOString().split("T")[0],
        status: "sent",
        notes: `Règlement par ${quickForm.paymentMethod.toUpperCase()}.`,
        items: [
          {
            description: quickForm.description.trim() || "Prestation",
            quantity: 1,
            unitPrice: Number(quickForm.amount),
            total: Number(quickForm.amount),
          },
        ],
      });

      toast.success(`Facture ${inv.invoiceNumber} créée !`, { id: "quick" });
      setIsQuickCreateOpen(false);
      setQuickForm({
        clientName: "",
        amount: 150000,
        description: "Prestation de services & développement",
        paymentMethod: "bankily",
      });
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Erreur de création", { id: "quick" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadPDF = async (inv: Invoice) => {
    toast.loading(`Génération PDF ${inv.invoiceNumber}...`, { id: `pdf-${inv.id}` });
    try {
      await downloadInvoicePDF({
        reference: inv.invoiceNumber,
        clientName: inv.client?.name || "Client",
        clientEmail: inv.client?.email,
        clientPhone: inv.client?.phone,
        clientAddress: inv.client?.address,
        date: new Date(inv.issueDate).toLocaleDateString("fr-FR"),
        dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("fr-FR") : undefined,
        total: inv.total,
        status: inv.status,
        items: inv.items?.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      });
      toast.success("Facture téléchargée !", { id: `pdf-${inv.id}` });
    } catch {
      toast.error("Erreur téléchargement", { id: `pdf-${inv.id}` });
    }
  };

  const handleWhatsApp = (inv: Invoice) => {
    const client = inv.client?.name || "Client";
    const msg = `Bonjour ${client},\nVoici votre facture *${inv.invoiceNumber}* d'un montant de *${inv.total.toLocaleString("fr-FR")} MRU*.\nRèglement possible par Bankily / Masrvi / Virement BPM.\nMerci pour votre confiance.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Lien WhatsApp prêt !");
  };

  const handleMarkPaid = async (inv: Invoice) => {
    try {
      await updateInvoiceStatus(inv.id, "paid");
      toast.success(`Facture ${inv.invoiceNumber} marquée comme réglée !`);
      loadData();
      if (selectedInvoice?.id === inv.id) {
        setSelectedInvoice({ ...selectedInvoice, status: "paid" });
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur de mise à jour");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* ============================================================ */}
      {/* 1. TOP APP BAR ULTRA-CLEAN                                   */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Marque & Logo Monogramme */}
        <div className="flex items-center gap-6">
          <Link href="/concept" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-xs shadow-md shadow-slate-900/10 group-hover:bg-sky-600 transition-colors">
              FI
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-slate-950 text-sm tracking-tight">Facturim</span>
              <span className="text-[10px] text-slate-400 font-medium">Workspace</span>
            </div>
          </Link>

          {/* Navigation Pill */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
            <button className="px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-2xs font-bold">
              Vue d'ensemble
            </button>
            <Link href="/invoices" className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
              Factures
            </Link>
            <Link href="/clients" className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
              Clients
            </Link>
            <Link href="/settings" className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
              Paramètres
            </Link>
          </nav>
        </div>

        {/* Barre de recherche centrale & Raccourci ⌘K */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl px-3 py-1.5 w-64 focus-within:w-72 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
            <Search size={14} className="text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Recherche rapide..."
              className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full font-medium"
            />
            <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs">
              ⌘K
            </kbd>
          </div>

          {/* Bouton Créer une facture éclair */}
          <button
            onClick={() => setIsQuickCreateOpen(true)}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-slate-950/10 hover:shadow-sky-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Facture Éclair</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. CONTENEUR PRINCIPAL DU DASHBOARD                         */}
      {/* ============================================================ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* En-tête de bienvenue discret */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Bonjour, voici l'état de vos règlements
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Synchronisation instantanée des paiements Bankily &amp; virements
            </p>
          </div>

          {/* Badge Passerelle Prête */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Bankily &amp; Masrvi Actifs</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. HERO OVERVIEW / TRÉSORERIE DISPONIBLE                   */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* CARTE HERO GAUCHE : Solde encaissé & Recouvrement (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  SOLDE ENCAISSÉ
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                  <TrendingUp size={13} />
                  <span>{metrics.recoveryRate}% Taux d'encaissement</span>
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  {metrics.paid.toLocaleString("fr-FR")}{" "}
                  <span className="text-xl font-bold text-slate-400">MRU</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Règlements reçus sur vos comptes ce mois-ci
                </p>
              </div>
            </div>

            {/* Micro-jauge de progression */}
            <div className="space-y-2 mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Progression des rentrées</span>
                <span className="font-bold text-slate-900">{metrics.paidCount} payée(s) sur {invoices.length}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full bg-slate-950 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.recoveryRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* CARTE HERO DROITE : Créances en attente & Canaux (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  EN ATTENTE DE RÈGLEMENT
                </span>
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock size={15} />
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">
                  {metrics.pending.toLocaleString("fr-FR")}{" "}
                  <span className="text-lg font-bold text-amber-600/70">MRU</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {metrics.pendingCount} facture(s) émise(s) à échoir
                </p>
              </div>
            </div>

            {/* Bandeau discret des passerelles de paiement */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Canaux d'encaissement actifs
              </span>
              <div className="flex items-center gap-3">
                <BankilyLogo height={18} variant="badge" />
                <MasrviLogo height={18} variant="badge" />
                <SedadLogo height={18} variant="badge" />
                <BPMLogo height={16} />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. ACTIONS RAPIDES & BARRE DE CONTRÔLE                     */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Onglets Filtres Pilules */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl border border-slate-200/80 text-xs w-fit">
            {[
              { id: "all", label: `Toutes (${invoices.length})` },
              { id: "paid", label: `Payées (${metrics.paidCount})` },
              { id: "pending", label: `En attente (${metrics.pendingCount})` },
              { id: "overdue", label: `En retard (${metrics.overdueCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer select-none ${
                  activeTab === tab.id
                    ? "bg-white text-slate-950 shadow-xs scale-102 font-extrabold"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Raccourcis complémentaires */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                const url = `https://wa.me/?text=${encodeURIComponent("Bonjour, voici l'état récapitulatif de vos factures.")}`;
                window.open(url, "_blank");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 transition-all shadow-2xs"
            >
              <Share2 size={13} />
              <span>Rappel WhatsApp</span>
            </button>
            <button
              onClick={() => loadData()}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
              title="Actualiser les données"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. TABLEAU STREAM DES FACTURES                             */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/70 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Réf &amp; Document</th>
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-5 text-center">Émission</th>
                  <th className="py-3.5 px-5 text-right">Montant</th>
                  <th className="py-3.5 px-5 text-center">Statut</th>
                  <th className="py-3.5 px-5 text-right">Actions rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <Receipt size={32} className="mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 text-sm">Aucune facture ne correspond</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Créez votre première facture en 15 secondes avec le bouton ci-dessus.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Numéro de facture */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                            <FileText size={15} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-950 group-hover:text-sky-600 transition-colors">
                              {inv.invoiceNumber}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {inv.items?.[0]?.description || "Prestation de service"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                            {(inv.client?.name || "C").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900">{inv.client?.name || "Client Partenaire"}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5 text-center text-slate-500 tabular-nums">
                        {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                      </td>

                      {/* Montant Net */}
                      <td className="py-4 px-5 text-right font-black text-slate-950 tabular-nums text-sm">
                        {inv.total.toLocaleString("fr-FR")}{" "}
                        <span className="text-[11px] font-bold text-slate-400">MRU</span>
                      </td>

                      {/* Badge de statut */}
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                            inv.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                              : inv.status === "overdue"
                              ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                              : "bg-amber-50 text-amber-800 border border-amber-200/80"
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
                          {inv.status === "paid" ? "Payée" : inv.status === "overdue" ? "En retard" : "En attente"}
                        </span>
                      </td>

                      {/* Actions rapides */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDownloadPDF(inv)}
                            title="Télécharger le PDF A4"
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => handleWhatsApp(inv)}
                            title="Envoyer sur WhatsApp"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          >
                            <Share2 size={15} />
                          </button>
                          {inv.status !== "paid" && (
                            <button
                              onClick={() => handleMarkPaid(inv)}
                              title="Marquer comme réglée"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                            >
                              <CheckCircle2 size={15} />
                            </button>
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
      </main>

      {/* ============================================================ */}
      {/* 6. TIROIR LATÉRAL (SIDE PEEK) SUR CLIC FACTURE               */}
      {/* ============================================================ */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6">
              {/* En-tête du tiroir */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950 text-base">
                      {selectedInvoice.invoiceNumber}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Émise le {new Date(selectedInvoice.issueDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Client cartouche */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Destinataire
                </span>
                <p className="font-extrabold text-slate-950 text-sm">
                  {selectedInvoice.client?.name || "Client"}
                </p>
                <p className="text-xs text-slate-600">
                  {selectedInvoice.client?.phone || "+222 45 00 00 00"} • {selectedInvoice.client?.email || "contact@client.mr"}
                </p>
              </div>

              {/* Détails du montant */}
              <div className="p-5 rounded-2xl bg-slate-950 text-white space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Statut</span>
                  <span className="font-bold text-white uppercase">{selectedInvoice.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Montant Total</span>
                  <span className="text-xl font-black text-sky-400">
                    {selectedInvoice.total.toLocaleString("fr-FR")} MRU
                  </span>
                </div>
              </div>

              {/* Lignes de prestations */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Prestations incluses</span>
                <div className="space-y-2">
                  {selectedInvoice.items?.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white"
                    >
                      <span className="text-xs font-medium text-slate-800">{it.description}</span>
                      <span className="text-xs font-bold text-slate-900">{it.unitPrice.toLocaleString("fr-FR")} MRU</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions en bas du tiroir */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-950 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>Télécharger la facture A4 certifiée</span>
              </button>

              <button
                onClick={() => handleWhatsApp(selectedInvoice)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200/80 transition-colors cursor-pointer"
              >
                <Share2 size={15} />
                <span>Envoyer le lien sur WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. MODALE DE CRÉATION RAPIDE (15 SECONDES CHRONO)           */}
      {/* ============================================================ */}
      {isQuickCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Zap size={16} />
                </div>
                <h3 className="font-extrabold text-slate-950 text-sm">Facture Éclair</h3>
              </div>
              <button
                onClick={() => setIsQuickCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleQuickCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nom du client *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mauritel SA ou Client Partenaire"
                  value={quickForm.clientName}
                  onChange={(e) => setQuickForm({ ...quickForm, clientName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Montant Net (MRU) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={quickForm.amount}
                  onChange={(e) => setQuickForm({ ...quickForm, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 font-black text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Ex: Prestation de service"
                  value={quickForm.description}
                  onChange={(e) => setQuickForm({ ...quickForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Mode de règlement</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "bankily", label: "Bankily" },
                    { id: "masrvi", label: "Masrvi" },
                    { id: "sedad", label: "Sedad" },
                    { id: "bpm", label: "Virement BPM" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setQuickForm({ ...quickForm, paymentMethod: m.id as any })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        quickForm.paymentMethod === m.id
                          ? "bg-slate-950 text-white border-slate-950"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  Générer la facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
