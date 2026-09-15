"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Download,
  Share2,
  Send,
  Eye,
  Edit3,
  CheckCircle2,
  Building2,
  FileText,
  Calendar,
  DollarSign,
  Printer,
  Sparkles,
  ChevronRight,
  Globe,
  QrCode,
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import { getClients, createClient } from "@/lib/services/clientService";
import { createInvoice } from "@/lib/services/invoiceService";
import { getCompany } from "@/lib/services/companyService";
import { Client } from "@/lib/types";
import { useTranslation } from "@/contexts/LanguageContext";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface LiveInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated?: (invoice: any) => void;
}

export default function LiveInvoiceModal({
  isOpen,
  onClose,
  onInvoiceCreated,
}: LiveInvoiceModalProps) {
  const { t, formatMoney } = useTranslation();

  // Mode mobile : bascule entre "formulaire" et "aperçu"
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  // Liste des clients réels
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Données de la facture en cours d'édition
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [customClientName, setCustomClientName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("FAC-2025-001");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [paymentTerms, setPaymentTerms] = useState("Paiement à 30 jours nets");
  const [taxRate, setTaxRate] = useState<number>(16); // TVA standard Mauritanie : 16%
  const [docLang, setDocLang] = useState<"bilingual" | "fr" | "ar">("bilingual");
  const [notes, setNotes] = useState(
    "Merci pour votre confiance. Règlements acceptés par virement bancaire BPM ou Mobile Money (Bankily : +222 45 12 34 56 / Masrvi / Seddap)."
  );

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "Prestation de service & ingénierie",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // Charger les clients et les infos de l'entreprise depuis Supabase à l'ouverture
  useEffect(() => {
    if (!isOpen) return;

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
        const num = String(comp.nextInvoiceNumber || 1).padStart(3, "0");
        setInvoiceNumber(`${comp.invoicePrefix || "FAC-2025-"}${num}`);
        if (comp.logoUrl) {
          setCompanyLogo(comp.logoUrl);
        }
      }
    });

    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("facturim_company_logo") ||
        localStorage.getItem("sen_facture_company_logo");
      if (stored) setCompanyLogo(stored);
    }
  }, [isOpen]);

  // Client actuellement sélectionné
  const currentClient = useMemo(() => {
    if (selectedClientId === "custom") {
      return {
        name: customClientName || "Client Professionnel",
        address: "Nouakchott, Mauritanie",
        email: "contact@client.mr",
        phone: "+222 45 00 00 00",
        taxId: "00123456-MR",
      };
    }
    const found = clientsList.find((c) => c.id === selectedClientId);
    if (found) {
      return {
        name: found.name,
        address: found.address || `${found.city || "Nouakchott"}, Mauritanie`,
        email: found.email,
        phone: found.phone || "+222 45 00 00 00",
        taxId: found.taxId || "NIF non renseigné",
      };
    }
    return {
      name: customClientName || "Client Professionnel",
      address: "Nouakchott, Mauritanie",
      email: "contact@client.mr",
      phone: "+222 45 00 00 00",
      taxId: "00123456-MR",
    };
  }, [selectedClientId, customClientName, clientsList]);

  // Calculs financiers automatiques
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.quantity || 0) * (it.unitPrice || 0), 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return Math.round(subtotal * (taxRate / 100));
  }, [subtotal, taxRate]);

  const total = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  // Gestion des lignes de prestations
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: "Nouvelle prestation",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      toast.error("La facture doit comporter au moins une ligne");
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return { ...it, [field]: value };
        }
        return it;
      })
    );
  };

  // Enregistrer la facture dans Supabase
  const handleSaveInvoice = async (markAsSent: boolean = false) => {
    if (items.some((it) => !it.description.trim() || it.unitPrice <= 0)) {
      toast.error("Veuillez renseigner un intitulé et un tarif unitaire pour chaque ligne.");
      return;
    }

    setIsSaving(true);
    toast.loading("Enregistrement de la facture...", { id: "save-inv" });

    try {
      let finalClientId = selectedClientId;

      // Si le client est nouveau / personnalisé, le créer d'abord
      if (selectedClientId === "custom") {
        if (!customClientName.trim()) {
          toast.error("Veuillez renseigner le nom du client.", { id: "save-inv" });
          setIsSaving(false);
          return;
        }
        const newC = await createClient({
          name: customClientName,
          email: `${customClientName.toLowerCase().replace(/\s+/g, "")}@client.mr`,
          city: "Nouakchott",
          country: "Mauritanie",
          address: "Avenue Moktar Ould Daddah",
        });
        if (newC) {
          finalClientId = newC.id;
        }
      }

      const invoicePayload = {
        clientId: finalClientId,
        invoiceNumber,
        status: markAsSent ? ("sent" as const) : ("draft" as const),
        issueDate,
        dueDate,
        taxRate,
        notes: notes || undefined,
        items: items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
        })),
      };

      const created = await createInvoice(invoicePayload as any);

      if (created) {
        toast.success(
          `Facture ${invoiceNumber} enregistrée avec succès !`,
          { id: "save-inv" }
        );
        if (onInvoiceCreated) {
          onInvoiceCreated(created);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("invoice-created", { detail: created }));
        }
        onClose();
      } else {
        throw new Error("Échec de création");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message || "Erreur lors de l'enregistrement de la facture",
        { id: "save-inv" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Partager sur WhatsApp
  const handleWhatsAppShare = () => {
    const payLink = `https://facturim.mr/pay/${invoiceNumber}`;
    const message = `Bonjour ${currentClient.name},\nVoici votre facture *${invoiceNumber}* d'un montant de *${total.toLocaleString("fr-FR")} MRU* émise par Facturim.\nDate d'échéance : ${dueDate}.\n\n💳 Régler en 1 clic via Bankily ou Masrvi : ${payLink}\n\nMerci de votre confiance !`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("Lien WhatsApp généré avec accès paiement Moosyl !");
  };

  // Télécharger le PDF officiel de la facture
  const handleDownloadPDF = async () => {
    const invoiceData = {
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
      documentLanguage: docLang,
      items: items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
      status: "unpaid",
      notes: notes,
      logoUrl: companyLogo || undefined,
    };

    toast.loading("Génération du document A4 certifié...", { id: "pdf-gen" });
    try {
      const ok = await downloadInvoicePDF(invoiceData);
      if (ok) {
        toast.success(`Facture ${invoiceNumber} téléchargée en PDF !`, { id: "pdf-gen" });
      } else {
        toast.error("Erreur lors de la création du fichier PDF", { id: "pdf-gen" });
      }
    } catch {
      toast.error("Erreur lors de la création du fichier PDF", { id: "pdf-gen" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 lg:p-6 overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[96vh] overflow-hidden">
        {/* ======================================================== */}
        {/* EN-TÊTE DE LA MODAL */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
              FI
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                {t.invoices.createModalTitle}
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Éditez vos prestations et visualisez instantanément le document A4 officiel (TVA 16% &amp; Moosyl).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Commutateur de langue du document A4 */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setDocLang("bilingual")}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  docLang === "bilingual" ? "bg-white text-sky-600 shadow-2xs" : "text-slate-600"
                }`}
              >
                Bilingue FR/AR
              </button>
              <button
                type="button"
                onClick={() => setDocLang("fr")}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  docLang === "fr" ? "bg-white text-sky-600 shadow-2xs" : "text-slate-600"
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => setDocLang("ar")}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  docLang === "ar" ? "bg-white text-sky-600 shadow-2xs" : "text-slate-600"
                }`}
              >
                العربية
              </button>
            </div>

            {/* Onglets Mobile : Formulaire / Aperçu */}
            <div className="flex lg:hidden bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setMobileTab("form")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  mobileTab === "form"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Edit3 size={13} />
                  Formulaire
                </span>
              </button>
              <button
                onClick={() => setMobileTab("preview")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  mobileTab === "preview"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Eye size={13} />
                  Aperçu A4
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CORPS DE LA MODAL : DOUBLE VOLET SPLIT-SCREEN */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* PANNEAU GAUCHE : FORMULAIRE D'ÉDITION */}
          <div
            className={`lg:col-span-6 p-4 sm:p-6 overflow-y-auto space-y-5 border-r border-slate-200 bg-white ${
              mobileTab === "form" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Section Client */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  {t.invoices.client}
                </label>
                <span className="text-[11px] text-sky-600 font-semibold cursor-pointer hover:underline" onClick={() => setSelectedClientId("custom")}>
                  + Nouveau client libre
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city || "Nouakchott"})
                      </option>
                    ))}
                    <option value="custom">✍️ Saisie libre (Nouveau client)</option>
                  </select>
                </div>

                {selectedClientId === "custom" && (
                  <div>
                    <input
                      type="text"
                      placeholder="Nom de l'entreprise cliente *"
                      value={customClientName}
                      onChange={(e) => setCustomClientName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section Numéro & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  N° Facture
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.invoices.issueDate}
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.invoices.dueDate}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Section Lignes de Prestations */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  {t.invoices.itemsTitle}
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{t.invoices.addItem}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((it, idx) => (
                  <div
                    key={it.id}
                    className="grid grid-cols-12 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 items-center text-xs"
                  >
                    <div className="col-span-12 sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Description de la prestation..."
                        value={it.description}
                        onChange={(e) =>
                          handleItemChange(it.id, "description", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qté"
                        value={it.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            it.id,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-center font-bold focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          placeholder="Prix HT"
                          value={it.unitPrice || ""}
                          onChange={(e) =>
                            handleItemChange(
                              it.id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full pl-2.5 pr-10 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-right font-bold focus:outline-none focus:border-sky-500"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-bold pointer-events-none">
                          MRU
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={t.invoices.removeItem}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section TVA et Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Régime Fiscal TVA (DGI)
                </label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                >
                  <option value={16}>TVA Standard Mauritanie (16%)</option>
                  <option value={0}>Exonéré de TVA (0% Export / Spécial)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.invoices.paymentTerms}
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Notes en bas de facture */}
            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                Mentions &amp; Coordonnées de paiement
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* PANNEAU DROIT : VRAIE FEUILLE A4 RENDUE EN TEMPS RÉEL */}
          <div
            className={`lg:col-span-6 p-4 sm:p-6 overflow-y-auto bg-slate-200/60 flex flex-col items-center justify-start ${
              mobileTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="w-full max-w-[560px] flex items-center justify-between pb-3 text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1.5 text-slate-700">
                <Sparkles size={14} className="text-sky-600" />
                {t.invoices.previewA4} ({docLang === "bilingual" ? "Bilingue FR/AR" : docLang === "ar" ? "العربية" : "Français"})
              </span>
              <span className="text-[11px] text-slate-500">Mise à jour instantanée</span>
            </div>

            {/* La feuille A4 virtuelle Facturim */}
            <div id="live-invoice-preview-sheet" className="w-full max-w-[560px] bg-white rounded-xl shadow-xl border border-slate-300/80 p-6 sm:p-8 space-y-5 text-slate-800 text-xs transition-all">
              {/* En-tête de la facture A4 */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
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
                    <div>
                      <span className="text-base font-black text-slate-900 tracking-tight">
                        FACTURIM
                      </span>
                      <span className="text-xs font-bold text-sky-600 ml-1.5">موريتانيا</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                    <p className="font-medium text-slate-700">Facturim Mauritanie SARL</p>
                    <p>Avenue du Roi Fayçal, Tevragh Zeina, Nouakchott</p>
                    <p>NIF : 00987654-MR | RC : MR.NKTT.2025.B.1234</p>
                    <p>Tél : +222 45 25 00 00 | contact@facturim.mr</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-sky-50 text-sky-700 font-extrabold text-xs px-2.5 py-1 rounded-md tracking-wider uppercase border border-sky-200">
                    {docLang === "bilingual" ? "FACTURE / فاتورة" : docLang === "ar" ? "فاتورة" : "FACTURE"}
                  </span>
                  <p className="text-sm font-black text-slate-900 mt-1.5">
                    {invoiceNumber}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Date : <span className="font-semibold text-slate-700">{issueDate}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Échéance : <span className="font-semibold text-slate-700">{dueDate}</span>
                  </p>
                </div>
              </div>

              {/* Bloc Client Facturé à */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {docLang === "bilingual" ? "FACTURÉ À / الفاتورة إلى" : docLang === "ar" ? "العميل" : "FACTURÉ À"}
                  </p>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {currentClient.name}
                  </h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">{currentClient.address}</p>
                  <p className="text-slate-600 text-[11px]">{currentClient.email} | {currentClient.phone}</p>
                </div>

                <div className="text-right text-[11px]">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Statut / الحالة
                  </p>
                  <span className="inline-block mt-1 bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                    En cours d&apos;émission
                  </span>
                </div>
              </div>

              {/* Tableau A4 des prestations */}
              <div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-900 text-[11px] font-bold">
                      <th className="py-2">
                        {docLang === "bilingual" ? "Désignation / البيان" : docLang === "ar" ? "البيان" : "Description"}
                      </th>
                      <th className="py-2 text-center">Qté</th>
                      <th className="py-2 text-right">Prix unit.</th>
                      <th className="py-2 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.id} className="text-[11px]">
                        <td className="py-2 pr-2 font-medium text-slate-800">
                          {it.description}
                        </td>
                        <td className="py-2 text-center text-slate-600 font-semibold">
                          {it.quantity}
                        </td>
                        <td className="py-2 text-right text-slate-600">
                          {it.unitPrice.toLocaleString("fr-FR")} MRU
                        </td>
                        <td className="py-2 text-right font-bold text-slate-900">
                          {(it.quantity * it.unitPrice).toLocaleString("fr-FR")} MRU
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bloc Récapitulatif et Totaux + Cartouche Moosyl */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                {/* Badge Moosyl Pay */}
                <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <div className="w-10 h-10 bg-white rounded border border-slate-200 flex items-center justify-center text-slate-700">
                    <QrCode size={22} />
                  </div>
                  <div className="text-[10px] text-slate-600 leading-tight">
                    <p className="font-bold text-slate-800">Moosyl Gateway</p>
                    <p className="text-emerald-700 font-semibold">🟢 Bankily • 🔵 Masrvi</p>
                  </div>
                </div>

                <div className="w-56 space-y-1 text-[11px]">
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

                  <div className="flex justify-between items-baseline pt-1.5 border-t-2 border-slate-900 text-slate-900">
                    <span className="text-xs font-bold uppercase">Total TTC :</span>
                    <span className="text-sm sm:text-base font-black text-sky-600">
                      {total.toLocaleString("fr-FR")} MRU
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes et Pied de page A4 */}
              <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                <p>
                  <strong className="text-slate-700">Modalités :</strong> {paymentTerms}
                </p>
                <p className="leading-snug">{notes}</p>
                <div className="pt-1 text-center text-[9px] text-slate-400 font-medium">
                  Facturim Mauritanie — Document officiel conforme DGI (TVA 16%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PIED DE LA MODAL : ACTIONS GLOBALES */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Montant total net :</span>
            <span className="font-extrabold text-sm text-sky-600">
              {formatMoney(total)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <Share2 size={14} />
              <span>WhatsApp + Moosyl</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <Download size={14} />
              <span>PDF A4 ({docLang === "bilingual" ? "FR/AR" : docLang.toUpperCase()})</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveInvoice(false)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <FileText size={14} />
              <span>Enregistrer Brouillon</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveInvoice(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <Send size={14} />
              <span>Émettre Facture</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
