"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Share2,
  Printer,
  CheckCircle2,
  Building2,
  FileText,
  Eye,
  Edit3,
  Sparkles,
  Download,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  downloadInvoicePDF,
  shareInvoicePDF,
  openInvoicePDF,
} from "@/lib/pdfGenerator";
import { getClients, createClient } from "@/lib/services/clientService";
import { createInvoice } from "@/lib/services/invoiceService";
import { getCompany } from "@/lib/services/companyService";
import { Client, Company } from "@/lib/types";
import DatePicker from "@/components/ui/DatePicker";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [previewZoom, setPreviewZoom] = useState<"fit" | "full">("fit");
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobileScale = useMemo(() => {
    if (viewportWidth >= 1024) return 1;
    const availableWidth = Math.max(300, viewportWidth - 32);
    return Math.max(0.48, Math.min(1, availableWidth / 560));
  }, [viewportWidth]);

  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Données de facturation
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [customClientName, setCustomClientName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("FAC-2025-001");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [taxRate, setTaxRate] = useState<number>(16);
  const [paymentTerms, setPaymentTerms] = useState("Paiement à 30 jours nets");
  const [notes, setNotes] = useState(
    "Merci pour votre confiance. Règlements acceptés par virement bancaire BPM ou Mobile Money (Bankily / Masrvi / Seddap)."
  );

  const [items, setItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "Prestation de service",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  useEffect(() => {
    getClients().then((res) => {
      if (res && res.length > 0) {
        setClientsList(res);
        setSelectedClientId(res[0].id);
      } else {
        setClientsList([]);
        setSelectedClientId("custom");
      }
    });

    getCompany().then((comp) => {
      if (comp) {
        setCompany(comp);
        const num = String(comp.nextInvoiceNumber || 1).padStart(3, "0");
        setInvoiceNumber(`${comp.invoicePrefix || "FAC-2025-"}${num}`);
        if (comp.logoUrl) {
          setCompanyLogo(comp.logoUrl);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("facturim_company_logo");
      if (saved) setCompanyLogo(saved);
    }
  }, []);

  // Client sélectionné
  const currentClient = useMemo(() => {
    if (selectedClientId === "custom") {
      return {
        name: customClientName || "Nouveau Client Entreprise",
        email: "client@entreprise.mr",
        phone: "+222 45 00 00 00",
        address: "Nouakchott, Mauritanie",
        taxId: "00123456-MR",
      };
    }
    return (
      clientsList.find((c) => c.id === selectedClientId) || {
        name: "Client Inconnu",
        email: "contact@client.mr",
        phone: "+222 45 00 00 00",
        address: "Nouakchott, Mauritanie",
        taxId: "00123456-MR",
      }
    );
  }, [selectedClientId, customClientName, clientsList]);

  // Calculs dynamiques
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return Math.round((subtotal * taxRate) / 100);
  }, [subtotal, taxRate]);

  const total = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  // Données pour le moteur PDF
  const getInvoicePayloadForPDF = () => ({
    reference: invoiceNumber,
    clientName: currentClient.name,
    clientAddress: currentClient.address,
    clientEmail: currentClient.email,
    clientPhone: currentClient.phone,
    date: issueDate,
    dueDate: dueDate,
    total: total,
    taxRate: taxRate,
    paymentTerms: paymentTerms,
    companyName: company?.name || "Facturim Mauritanie SARL",
    companyTradeName: company?.tradeName || "Facturim Entreprise",
    companyAddress: company?.address || "Avenue du Roi Fayçal, Tevragh Zeina, Nouakchott",
    companyTaxId: company?.taxId || "00987654-MR",
    companyPhone: company?.phone || "+222 45 25 00 00",
    companyEmail: company?.email || "contact@facturim.net",
    items: items.map((it) => ({
      id: it.id,
      description: it.description || "Prestation de service",
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
    notes: notes,
    logoUrl: companyLogo || undefined,
  });

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    toast.loading("Génération du document A4...", { id: "pdf-new" });
    try {
      const ok = await downloadInvoicePDF(getInvoicePayloadForPDF());
      if (ok) toast.success(`Facture ${invoiceNumber} téléchargée !`, { id: "pdf-new" });
      else toast.error("Erreur téléchargement", { id: "pdf-new" });
    } catch {
      toast.error("Erreur lors de la création du PDF", { id: "pdf-new" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSharePDF = async () => {
    setIsGeneratingPDF(true);
    toast.loading("Préparation du partage...", { id: "pdf-new" });
    try {
      const ok = await shareInvoicePDF(getInvoicePayloadForPDF());
      if (ok) toast.success("Document prêt au partage !", { id: "pdf-new" });
      else toast.error("Erreur de partage", { id: "pdf-new" });
    } catch {
      toast.error("Erreur lors du partage", { id: "pdf-new" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Gestion des lignes
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      toast.error("La facture doit comporter au moins une prestation");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Actions
  const handleSave = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      toast.loading("Enregistrement dans Supabase...", { id: "save-invoice" });

      let finalClientId = selectedClientId;
      if (selectedClientId === "custom" || !selectedClientId) {
        const createdClient = await createClient({
          name: customClientName.trim() || "Nouveau Client Entreprise",
          email: "contact@entreprise.mr",
          phone: "+222 45 00 00 00",
          address: "Nouakchott, Mauritanie",
          country: "Mauritanie",
        });
        finalClientId = createdClient.id;
      }

      const created = await createInvoice({
        clientId: finalClientId,
        issueDate,
        dueDate,
        status: "sent",
        notes,
        items: items.map((it) => ({
          description: it.description || "Prestation de service",
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.quantity * it.unitPrice,
        })),
      });

      toast.success(
        `Facture ${created.invoiceNumber} enregistrée avec succès !`,
        { id: "save-invoice" }
      );
      router.push(`/invoices/${created.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message || "Erreur lors de l'enregistrement de la facture",
        { id: "save-invoice" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsApp = () => {
    const payLink = `https://facturim.net/pay/${invoiceNumber}`;
    const msg = `Bonjour ${currentClient.name},\n\nVoici votre facture *${invoiceNumber}* d'un montant de *${total.toLocaleString("fr-FR")} MRU* émise par *${company?.name || "Facturim"}*.\nDate d'échéance : ${dueDate}.\n\n💳 Régler directement en 1 clic : ${payLink}\n\nMerci de votre confiance !`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("Lien WhatsApp prêt pour le partage !");
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Barre supérieure de navigation & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Retour à la liste"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                Création de facture
              </h1>
              <span className="bg-sky-50 text-sky-700 font-mono text-xs font-bold px-2 py-0.5 rounded-md border border-sky-200">
                {invoiceNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Édition en direct avec aperçu instantané du document A4
            </p>
          </div>
        </div>

        {/* Boutons d'actions */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {/* Bascule Mobile Formulaire / Aperçu */}
          <div className="flex lg:hidden bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMobileTab("form")}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                mobileTab === "form"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500"
              }`}
            >
              Formulaire
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                mobileTab === "preview"
                  ? "bg-white text-sky-600 shadow-2xs"
                  : "text-slate-500"
              }`}
            >
              <Eye size={13} />
              Aperçu A4
            </button>
          </div>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            disabled={isGeneratingPDF}
            onClick={handleSharePDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            title="Partager le PDF"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Partager PDF</span>
          </button>

          <button
            type="button"
            disabled={isGeneratingPDF}
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <Download size={14} />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
            <span>Émettre la facture</span>
          </button>
        </div>
      </div>

      {/* Disposition Split 50/50 : Formulaire & Aperçu A4 en direct */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FORMULAIRE GAUCHE */}
        <div
          className={`lg:col-span-6 space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs ${
            mobileTab === "form" ? "block" : "hidden lg:block"
          }`}
        >
          {/* Client & Réf */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 size={14} className="text-sky-600" />
              <span>Informations Client & Références</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Client destinataire
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                >
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="custom">+ Nouveau client</option>
                </select>
              </div>

              {selectedClientId === "custom" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nom du client
                  </label>
                  <input
                    type="text"
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    placeholder="Ex: Entreprise SARL"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  N° de Facture
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <DatePicker
                  label="Date d'émission"
                  value={issueDate}
                  onChange={(d) => setIssueDate(d)}
                />
              </div>

              <div>
                <DatePicker
                  label="Date d'échéance"
                  value={dueDate}
                  onChange={(d) => setDueDate(d)}
                />
              </div>
            </div>
          </div>

          {/* Articles dynamiques */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText size={14} className="text-sky-600" />
                <span>Prestations & Lignes d&apos;articles</span>
              </h3>

              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
              >
                <Plus size={14} />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-12 gap-2.5 items-center text-xs"
                >
                  <div className="col-span-12 sm:col-span-6">
                    <label className="block font-medium text-slate-500 text-[10px] mb-0.5">
                      Description #{index + 1}
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      placeholder="Désignation..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label className="block font-medium text-slate-500 text-[10px] mb-0.5">
                      Qté
                    </label>
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold text-center focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block font-medium text-slate-500 text-[10px] mb-0.5">
                      Prix unit. (MRU)
                    </label>
                    <input
                      type="number"
                      step="500"
                      inputMode="decimal"
                      value={item.unitPrice === 0 ? "" : item.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "unitPrice",
                          e.target.value === "" ? 0 : Math.max(0, parseFloat(e.target.value) || 0)
                        )
                      }
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-sky-500 text-right"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex justify-center pt-3">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                      title="Supprimer la ligne"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TVA et Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Taux de TVA
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
              >
                <option value={16}>TVA Standard Mauritanie (16%)</option>
                <option value={0}>Exonéré de TVA (0%)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Modalités de paiement
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Mentions de bas de page
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* APERÇU A4 DIRECT À DROITE */}
        <div
          className={`lg:col-span-6 space-y-3 ${
            mobileTab === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-bold flex items-center gap-1.5 text-slate-700">
              <Sparkles size={14} className="text-sky-600" />
              Rendu en direct de la facture A4
            </span>

            {/* Contrôles d'échelle sur mobile */}
            <div className="flex items-center gap-2">
              <div className="lg:hidden flex bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewZoom("fit")}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    previewZoom === "fit" ? "bg-sky-500 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ajuster
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom("full")}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    previewZoom === "full" ? "bg-sky-500 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  100%
                </button>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Synchronisé
              </span>
            </div>
          </div>

          {/* Conteneur auto-scale responsive pour Mobile */}
          <div className="w-full flex justify-center overflow-x-auto py-1">
            <div
              style={
                viewportWidth < 1024 && previewZoom === "fit"
                  ? {
                      transform: `scale(${mobileScale})`,
                      transformOrigin: "top center",
                      width: "560px",
                      marginBottom: `-${(1 - mobileScale) * 880}px`,
                    }
                  : { width: "100%", maxWidth: "560px" }
              }
              className="transition-transform duration-200 origin-top shrink-0"
            >
              {/* La feuille A4 */}
              <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-300/80 p-6 sm:p-8 space-y-6 text-slate-800 text-xs transition-all">
                {/* En-tête A4 */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt="Logo Entreprise"
                          className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-black text-sm flex items-center justify-center tracking-tighter shrink-0">
                          FI
                        </div>
                      )}
                      <span className="text-base font-black text-slate-900 tracking-tight">
                        {company?.name || "FACTURIM"}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                      <p className="font-medium text-slate-700">{company?.name || "Facturim Mauritanie SARL"}</p>
                      <p>{company?.address || "Avenue du Roi Fayçal, Tevragh Zeina, Nouakchott"}</p>
                      <p>NIF : {company?.taxId || "00987654-MR"} | RC : MR.NKTT.2025.B.1234</p>
                      <p>Tél : {company?.phone || "+222 45 25 00 00"} | {company?.email || "contact@facturim.net"}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-sky-50 text-sky-700 font-extrabold text-sm px-3 py-1 rounded-md tracking-wider uppercase border border-sky-200">
                      FACTURE
                    </span>
                    <p className="text-sm font-black text-slate-900 mt-2">
                      {invoiceNumber}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Émise le : <span className="font-semibold text-slate-700">{issueDate}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Échéance : <span className="font-semibold text-slate-700">{dueDate}</span>
                    </p>
                  </div>
                </div>

                {/* Facturé à */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Facturé à
                    </p>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {currentClient.name}
                    </h4>
                    <p className="text-slate-600 text-[11px] mt-0.5">{currentClient.address}</p>
                    <p className="text-slate-600 text-[11px]">{currentClient.email}</p>
                    <p className="text-slate-600 text-[11px]">{currentClient.phone}</p>
                  </div>

                  <div className="text-right text-[11px]">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Statut
                    </p>
                    <span className="inline-block mt-1 bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      Brouillon en cours
                    </span>
                  </div>
                </div>

                {/* Tableau A4 */}
                <div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-900 text-slate-900 text-[11px] font-bold">
                        <th className="py-2">Description</th>
                        <th className="py-2 text-center">Qté</th>
                        <th className="py-2 text-right">Prix unitaire</th>
                        <th className="py-2 text-right">Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it) => (
                        <tr key={it.id} className="text-[11px]">
                          <td className="py-2.5 pr-2 font-medium text-slate-800">
                            {it.description || "Prestation de service"}
                          </td>
                          <td className="py-2.5 text-center text-slate-600 font-semibold">
                            {it.quantity}
                          </td>
                          <td className="py-2.5 text-right text-slate-600">
                            {it.unitPrice.toLocaleString("fr-FR")} MRU
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-900">
                            {(it.quantity * it.unitPrice).toLocaleString("fr-FR")} MRU
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totaux */}
                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <div className="w-64 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Sous-total HT :</span>
                      <span className="font-semibold text-slate-800">
                        {subtotal.toLocaleString("fr-FR")} MRU
                      </span>
                    </div>

                    {taxRate > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>TVA ({taxRate}%) :</span>
                        <span className="font-semibold text-slate-800">
                          {taxAmount.toLocaleString("fr-FR")} MRU
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900 text-slate-900">
                      <span className="text-xs font-bold uppercase">Total TTC :</span>
                      <span className="text-sm sm:text-base font-black text-sky-600">
                        {total.toLocaleString("fr-FR")} MRU
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pied de page */}
                <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1.5">
                  <p>
                    <strong className="text-slate-700">Modalités :</strong> {paymentTerms}
                  </p>
                  <p className="leading-snug">{notes}</p>
                  <div className="pt-2 text-center text-[9px] text-slate-400 font-medium">
                    FACTURIM — Document conforme aux normes fiscales de Mauritanie (DGI)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'action mobile flottante en bas de l'écran */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Total Net</span>
          <span className="text-sm font-extrabold text-sky-600 tabular-nums">
            {total.toLocaleString("fr-FR")} MRU
          </span>
        </div>

        <div className="flex items-center gap-2">
          {mobileTab === "form" ? (
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Eye size={14} />
              <span>Aperçu A4</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMobileTab("form")}
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Edit3 size={14} />
              <span>Formulaire</span>
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={15} />
            <span>Émettre</span>
          </button>
        </div>
      </div>
    </div>
  );
}
