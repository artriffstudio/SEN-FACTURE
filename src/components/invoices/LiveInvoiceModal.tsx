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
  FileText,
  Calendar,
  DollarSign,
  Sparkles,
  QrCode,
  ExternalLink,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  downloadInvoicePDF,
  shareInvoicePDF,
  openInvoicePDF,
  isMobileUser,
  PDFInvoiceData,
} from "@/lib/pdfGenerator";
import { getClients, createClient } from "@/lib/services/clientService";
import { createInvoice } from "@/lib/services/invoiceService";
import { getCompany } from "@/lib/services/companyService";
import { Client, Company } from "@/lib/types";
import { useTranslation } from "@/contexts/LanguageContext";
import DatePicker from "@/components/ui/DatePicker";

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
  const { t, formatMoney, currentLanguage } = useTranslation();

  // Mode mobile : bascule entre "formulaire" et "aperçu"
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

  // Calcul du facteur d'échelle A4 sur mobile
  const mobileScale = useMemo(() => {
    if (viewportWidth >= 1024) return 1;
    const availableWidth = Math.max(300, viewportWidth - 36);
    return Math.max(0.48, Math.min(1, availableWidth / 560));
  }, [viewportWidth]);

  // Données de l'entreprise émettrice
  const [company, setCompany] = useState<Company | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // Liste des clients réels
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
  const [paymentTerms, setPaymentTerms] = useState("Paiement sous 30 jours");
  const [taxRate, setTaxRate] = useState<number>(16); // TVA standard : 16%
  
  // Langue de la facture : Français ou Arabe (RTL) uniquement
  const [docLang, setDocLang] = useState<"fr" | "ar">(currentLanguage === "ar" ? "ar" : "fr");
  
  // Gestion des acomptes
  const [depositType, setDepositType] = useState<"none" | "30" | "50" | "70" | "custom">("none");
  const [customDepositAmount, setCustomDepositAmount] = useState<number>(0);

  const [notes, setNotes] = useState(
    "Paiement par Bankily, Masrvi ou virement bancaire."
  );

  // Lignes de prestations (champ vide avec placeholder par défaut)
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  // Charger les clients et l'entreprise émettrice
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
        setCompany(comp);
        const num = String(comp.nextInvoiceNumber || 1).padStart(3, "0");
        setInvoiceNumber(`${comp.invoicePrefix || "FAC-2025-"}${num}`);
        if (comp.logoUrl) {
          setCompanyLogo(comp.logoUrl);
        }
      }
    });

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("facturim_company_logo");
      if (stored) setCompanyLogo(stored);
    }
  }, [isOpen]);

  // Client actuellement sélectionné
  const currentClient = useMemo(() => {
    if (selectedClientId === "custom") {
      return {
        name: customClientName || (docLang === "ar" ? "العميل الكريم" : "Client Entreprise"),
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
      name: customClientName || (docLang === "ar" ? "العميل الكريم" : "Client Entreprise"),
      address: "Nouakchott, Mauritanie",
      email: "contact@client.mr",
      phone: "+222 45 00 00 00",
      taxId: "00123456-MR",
    };
  }, [selectedClientId, customClientName, clientsList, docLang]);

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

  // Calculs d'acompte
  const depositAmount = useMemo(() => {
    if (depositType === "none") return 0;
    if (depositType === "custom") return Math.min(total, Math.max(0, customDepositAmount || 0));
    const pct = parseFloat(depositType) || 0;
    return Math.round(total * (pct / 100));
  }, [depositType, customDepositAmount, total]);

  const remainingAmount = useMemo(() => {
    return Math.max(0, total - depositAmount);
  }, [total, depositAmount]);

  const activeDepositPercentage = useMemo(() => {
    if (depositType === "none" || total === 0) return 0;
    if (depositType === "custom") return Math.round((depositAmount / total) * 100);
    return parseFloat(depositType) || 0;
  }, [depositType, depositAmount, total]);

  // Formatage des dates style "06/01/25"
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Gestion des lignes de prestations
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: "",
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

  // Enregistrer la facture
  const handleSaveInvoice = async (markAsSent: boolean = false) => {
    if (items.some((it) => !it.description.trim() || it.unitPrice <= 0)) {
      toast.error("Veuillez renseigner un intitulé et un tarif pour chaque ligne.");
      return;
    }

    setIsSaving(true);
    toast.loading("Enregistrement de la facture...", { id: "save-inv" });

    try {
      let finalClientId = selectedClientId;

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
        depositAmount: depositAmount > 0 ? depositAmount : undefined,
        depositPercentage: activeDepositPercentage > 0 ? activeDepositPercentage : undefined,
        remainingAmount: depositAmount > 0 ? remainingAmount : undefined,
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
    const payLink = `https://facturim.net/pay/${invoiceNumber}`;
    const acompteMention =
      depositAmount > 0
        ? `\n*Acompte exigible (${activeDepositPercentage}%) : ${depositAmount.toLocaleString("fr-FR")} MRU*\n*Solde restant : ${remainingAmount.toLocaleString("fr-FR")} MRU*`
        : "";
    const companyName = company?.name || "Notre Entreprise";
    const message = `Bonjour ${currentClient.name},\n\nVoici votre facture *${invoiceNumber}* d'un montant de *${total.toLocaleString("fr-FR")} MRU* émise par *${companyName}*.${acompteMention}\nDate d'échéance : ${dueDate}.\n\n💳 Régler en 1 clic via Bankily ou Masrvi : ${payLink}\n\nMerci de votre confiance !`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("Lien WhatsApp généré !");
  };

  // Préparer les données pour le moteur PDF
  const getInvoicePayloadForPDF = (): PDFInvoiceData => {
    return {
      reference: invoiceNumber,
      clientName: currentClient.name,
      clientAddress: currentClient.address,
      clientEmail: currentClient.email,
      clientPhone: currentClient.phone,
      date: issueDate,
      dueDate: dueDate,
      total: total,
      taxRate: taxRate,
      depositAmount: depositAmount > 0 ? depositAmount : undefined,
      depositPercentage: activeDepositPercentage > 0 ? activeDepositPercentage : undefined,
      remainingAmount: depositAmount > 0 ? remainingAmount : undefined,
      paymentTerms: paymentTerms,
      documentLanguage: docLang,
      companyName: company?.name || "Facturim Mauritanie SARL",
      companyTradeName: company?.tradeName || "Facturim Entreprise",
      companyAddress: company?.address || "Avenue du Roi Fayçal, Tevragh Zeina, Nouakchott",
      companyTaxId: company?.taxId || "00987654-MR",
      companyPhone: company?.phone || "+222 45 25 00 00",
      companyEmail: company?.email || "contact@facturim.net",
      items: items.map((it) => ({
        id: it.id,
        description: it.description || (docLang === "ar" ? "خدمات واستشارات" : "Prestation de service"),
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
      notes: notes,
      logoUrl: companyLogo || undefined,
    };
  };

  // Télécharger le PDF officiel de la facture
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    toast.loading("Génération du document A4 haute définition...", { id: "pdf-gen" });
    try {
      const invoiceData = getInvoicePayloadForPDF();
      const ok = await downloadInvoicePDF(invoiceData);
      if (ok) {
        toast.success(`Facture ${invoiceNumber} téléchargée en PDF !`, { id: "pdf-gen" });
      } else {
        toast.error("Erreur lors du téléchargement du PDF", { id: "pdf-gen" });
      }
    } catch {
      toast.error("Erreur lors de la création du fichier PDF", { id: "pdf-gen" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Partage direct du fichier PDF (WhatsApp / Fichiers / Mail sur mobile)
  const handleSharePDF = async () => {
    setIsGeneratingPDF(true);
    toast.loading("Préparation du partage...", { id: "pdf-share" });
    try {
      const invoiceData = getInvoicePayloadForPDF();
      const ok = await shareInvoicePDF(invoiceData);
      if (ok) {
        toast.success("Document prêt au partage !", { id: "pdf-share" });
      } else {
        toast.error("Partage non disponible sur ce navigateur", { id: "pdf-share" });
      }
    } catch {
      toast.error("Erreur lors du partage du document", { id: "pdf-share" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Ouvrir le PDF dans un nouvel onglet (prévisualisation plein écran)
  const handleOpenPDF = async () => {
    setIsGeneratingPDF(true);
    toast.loading("Ouverture du document PDF...", { id: "pdf-open" });
    try {
      const invoiceData = getInvoicePayloadForPDF();
      const ok = await openInvoicePDF(invoiceData);
      if (ok) {
        toast.success("PDF ouvert !", { id: "pdf-open" });
      } else {
        toast.error("Impossible d'ouvrir le document", { id: "pdf-open" });
      }
    } catch {
      toast.error("Erreur d'ouverture", { id: "pdf-open" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!isOpen) return null;

  const isAr = docLang === "ar";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 lg:p-6 overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* ======================================================== */}
        {/* EN-TÊTE DE LA MODAL */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
              FI
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                {t.invoices.createModalTitle}
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Éditez vos prestations et visualisez instantanément le document A4 officiel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Commutateur de langue : Français OU Arabe */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setDocLang("fr")}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  docLang === "fr" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => setDocLang("ar")}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  docLang === "ar" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
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
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  {t.invoices.client}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClientId("custom");
                    setCustomClientName("");
                  }}
                  className="text-[11px] text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  + Nouveau client
                </button>
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
                    <option value="custom">Nouveau client</option>
                  </select>
                </div>

                {selectedClientId === "custom" && (
                  <div>
                    <input
                      type="text"
                      placeholder="Nom de l'entreprise ou client..."
                      value={customClientName}
                      onChange={(e) => setCustomClientName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <DatePicker
                  label={t.invoices.issueDate}
                  value={issueDate}
                  onChange={(d) => setIssueDate(d)}
                />
              </div>

              <div>
                <DatePicker
                  label={t.invoices.dueDate}
                  value={dueDate}
                  onChange={(d) => setDueDate(d)}
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
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="grid grid-cols-12 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 items-center text-xs"
                  >
                    <div className="col-span-12 sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Description (ex: Création de logo, Câblage fibre, Audit...)"
                        value={it.description}
                        onChange={(e) =>
                          handleItemChange(it.id, "description", e.target.value)
                        }
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        placeholder="Qté"
                        value={it.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            it.id,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-center font-bold focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          inputMode="decimal"
                          placeholder="Prix HT"
                          value={it.unitPrice === 0 ? "" : it.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              it.id,
                              "unitPrice",
                              e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full pl-2.5 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-right font-bold placeholder-slate-300 focus:outline-none focus:border-sky-500"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-bold pointer-events-none">
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

            {/* Section Modalités de Paiement & Acompte */}
            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/90 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-sky-600" />
                  <span>Modalités de règlement &amp; Acompte</span>
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  {depositAmount > 0
                    ? `Acompte : ${depositAmount.toLocaleString("fr-FR")} MRU (${activeDepositPercentage}%)`
                    : "Paiement comptant (100%)"}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDepositType("none")}
                  className={`py-1.5 px-2 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                    depositType === "none"
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() => setDepositType("30")}
                  className={`py-1.5 px-2 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                    depositType === "30"
                      ? "bg-sky-500 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  30%
                </button>
                <button
                  type="button"
                  onClick={() => setDepositType("50")}
                  className={`py-1.5 px-2 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                    depositType === "50"
                      ? "bg-sky-500 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setDepositType("70")}
                  className={`py-1.5 px-2 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                    depositType === "70"
                      ? "bg-sky-500 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  70%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDepositType("custom");
                    if (!customDepositAmount && total > 0) {
                      setCustomDepositAmount(Math.round(total * 0.5));
                    }
                  }}
                  className={`py-1.5 px-2 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                    depositType === "custom"
                      ? "bg-sky-500 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Libre
                </button>
              </div>

              {depositType === "custom" && (
                <div className="pt-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max={total}
                      step="500"
                      inputMode="decimal"
                      placeholder="Montant d'acompte personnalisé en MRU"
                      value={customDepositAmount || ""}
                      onChange={(e) =>
                        setCustomDepositAmount(parseFloat(e.target.value) || 0)
                      }
                      className="w-full pl-3 pr-12 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-bold focus:outline-none focus:border-sky-500"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-bold pointer-events-none">
                      MRU
                    </span>
                  </div>
                </div>
              )}

              {depositAmount > 0 && (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-600 font-medium">Acompte exigible ({activeDepositPercentage}%) :</span>
                    <p className="text-slate-900 font-black text-xs">
                      {depositAmount.toLocaleString("fr-FR")} MRU
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 font-medium">Solde restant dû :</span>
                    <p className="text-slate-900 font-black text-xs">
                      {remainingAmount.toLocaleString("fr-FR")} MRU
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section TVA et Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Régime Fiscal TVA
                </label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                >
                  <option value={16}>TVA Standard (16%)</option>
                  <option value={0}>Exonéré de TVA (0%)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Conditions de paiement
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Coordonnées de paiement */}
            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                Mentions &amp; Coordonnées bancaires
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* PANNEAU DROIT : VRAIE FEUILLE A4 - MODÈLE ÉPURÉ HAUT DE GAMME AVEC BLEU SIGNATURE */}
          <div
            className={`lg:col-span-6 p-3 sm:p-6 overflow-y-auto bg-slate-200/70 flex flex-col items-center justify-start ${
              mobileTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Barre de contrôle de l'aperçu */}
            <div className="w-full max-w-[560px] flex items-center justify-between pb-2.5 text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1.5 text-slate-800">
                <Sparkles size={14} className="text-sky-600" />
                {t.invoices.previewA4} ({isAr ? "العربية" : "Français"})
              </span>

              {/* Contrôles d'échelle sur mobile */}
              <div className="flex items-center gap-1.5">
                <div className="lg:hidden flex bg-white/90 p-0.5 rounded-lg border border-slate-300 shadow-2xs text-[11px]">
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
                <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium">Modèle officiel Facturim</span>
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
                {/* Feuille A4 Virtuelle */}
                <div
                  id="live-invoice-preview-sheet"
                  dir={isAr ? "rtl" : "ltr"}
                  className="relative w-full bg-white rounded-xl shadow-xl border border-slate-300 p-6 sm:p-8 space-y-5 text-slate-900 text-xs font-sans overflow-hidden"
                >
                  {/* 1. EN-TÊTE ULTRA-MODERNE : IDENTITÉ ÉMETTEUR & TITRE AVEC PILULES CAPSULES */}
                  <div className="relative z-10 border-b-2 border-slate-200 pb-4">
                    <div className="flex justify-between items-start">
                      {/* Logo & Marque */}
                      <div className="flex items-center gap-3">
                        {companyLogo ? (
                          <img
                            src={companyLogo}
                            alt="Logo"
                            className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-white shadow-2xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
                            {company?.name ? company.name.substring(0, 2).toUpperCase() : "FI"}
                          </div>
                        )}
                        <div>
                          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            {company?.name || "Facturim Mauritanie SARL"}
                          </h2>
                          <p className="text-[10.5px] text-slate-500 font-medium">
                            {company?.tradeName || "Plateforme de Facturation & Services"}
                          </p>
                        </div>
                      </div>

                      {/* Titre FACTURE & Badges Métadonnées sur 2 lignes */}
                      <div className={`text-${isAr ? "left" : "right"}`}>
                        <h1 className="text-2xl font-black text-sky-600 uppercase tracking-wide">
                          {isAr ? "فاتورة" : "FACTURE"}
                        </h1>
                        <div className={`flex items-center gap-1.5 mt-1.5 justify-${isAr ? "start" : "end"}`}>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-700 font-extrabold text-[10px] font-mono whitespace-nowrap">
                            {isAr ? `فاتورة رقم ${invoiceNumber}` : `N° ${invoiceNumber}`}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] whitespace-nowrap">
                            {formatDateDisplay(issueDate)}
                          </span>
                        </div>
                        {dueDate && (
                          <div className={`flex justify-${isAr ? "start" : "end"} mt-1`}>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500 font-medium text-[10px] whitespace-nowrap">
                              {isAr ? `الاستحقاق : ${formatDateDisplay(dueDate)}` : `Échéance : ${formatDateDisplay(dueDate)}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. COORDONNÉES COMPLÈTES */}
                  <div className="relative z-10 flex justify-between items-start text-[11px] leading-relaxed pt-1">
                    {/* Émetteur à gauche */}
                    <div className="text-left space-y-0.5 max-w-[48%]">
                      <h3 className="font-black text-xs text-slate-900 uppercase">
                        {company?.name || "Facturim Mauritanie SARL"}
                      </h3>
                      <p className="text-slate-600">{company?.phone || "+222 45 25 00 00"}</p>
                      <p className="text-slate-600">{company?.email || "contact@facturim.net"}</p>
                      {company?.taxId ? (
                        <p className="text-slate-600 font-mono">NIF : {company.taxId}</p>
                      ) : (
                        <p className="text-slate-600 font-mono">NIF : 00987654-MR</p>
                      )}
                      <p className="text-slate-600">{company?.address || "Avenue du Roi Fayçal, Tevragh Zeina, Nouakchott"}</p>
                    </div>

                    {/* Destinataire complètement à droite */}
                    <div className={`space-y-0.5 max-w-[48%] ${isAr ? "text-left" : "text-right"}`}>
                      <h4 className="font-black text-xs text-slate-900">
                        {currentClient.name}
                      </h4>
                      <p className="text-slate-600">{currentClient.phone}</p>
                      <p className="text-slate-600">{currentClient.email}</p>
                      <p className="text-slate-600">{currentClient.address}</p>
                    </div>
                  </div>

                  {/* 3. TABLEAU DES PRESTATIONS AVEC COLONNE # ET EN-TÊTE EN BLEU SIGNATURE */}
                  <div className="relative z-10 pt-1">
                    <table className="w-full border-collapse border border-sky-600 text-xs">
                      <thead>
                        <tr className="bg-sky-600 text-white font-extrabold text-[10px] uppercase tracking-wider">
                          <th className="p-2 border border-sky-600 text-center w-8 whitespace-nowrap">
                            #
                          </th>
                          <th className={`p-2.5 border border-sky-600 ${isAr ? "text-right" : "text-left"}`}>
                            {isAr ? "البيان والخدمات" : "DESCRIPTION"}
                          </th>
                          <th className={`p-2.5 border border-sky-600 w-28 whitespace-nowrap ${isAr ? "text-left" : "text-right"}`}>
                            {isAr ? "السعر الفردي" : "PRIX UNITAIRE"}
                          </th>
                          <th className="p-2 border border-sky-600 text-center w-12 whitespace-nowrap">
                            {isAr ? "الكمية" : "QTÉ"}
                          </th>
                          <th className={`p-2.5 border border-sky-600 w-28 whitespace-nowrap ${isAr ? "text-left" : "text-right"}`}>
                            {isAr ? "الإجمالي" : "TOTAL HT"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, idx) => (
                          <tr key={it.id} className={`text-[11px] ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                            <td className="p-2 border border-slate-200 text-center text-slate-500 font-bold font-mono">
                              {String(idx + 1).padStart(2, "0")}
                            </td>
                            <td className={`p-2.5 border border-slate-200 font-semibold text-slate-900 ${isAr ? "text-right" : "text-left"}`}>
                              {it.description.trim() || (isAr ? "خدمات مهنية" : "Prestation de service")}
                            </td>
                            <td className={`p-2.5 border border-slate-200 text-slate-700 whitespace-nowrap ${isAr ? "text-left" : "text-right"}`}>
                              {it.unitPrice.toLocaleString("fr-FR")} MRU
                            </td>
                            <td className="p-2 border border-slate-200 text-center text-slate-700 font-mono">
                              {String(it.quantity || 1).padStart(2, "0")}
                            </td>
                            <td className={`p-2.5 border border-slate-200 font-bold text-slate-950 whitespace-nowrap ${isAr ? "text-left" : "text-right"}`}>
                              {((it.quantity || 1) * (it.unitPrice || 0)).toLocaleString("fr-FR")} MRU
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 4. BLOC BAS : CARTOUCHE QR DE PAIEMENT & TOTAUX EN BLEU */}
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-end gap-3 pt-1">
                    
                    {/* Cartouche QR Code autonome */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-center gap-3 shadow-2xs w-full sm:w-auto">
                      <div className="w-13 h-13 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0 shadow-2xs">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                            `https://facturim.net/pay/${invoiceNumber}`
                          )}&color=0f172a&bgcolor=ffffff`}
                          alt="QR Paiement"
                          className="w-11 h-11 object-contain"
                        />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <p className="font-extrabold text-slate-900 text-[11.5px] leading-tight">
                          {isAr ? "الدفع المباشر" : "Paiement direct"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-700">
                          Bankily • Masrvi • Sedad
                        </p>
                        <p className="text-[9.5px] text-slate-400">
                          {isAr ? "امسح الرمز للدفع في ثوانٍ" : "Scannez pour régler en 1 clic"}
                        </p>
                      </div>
                    </div>

                    {/* Totaux Chiffrés & Bandeau Bleu */}
                    <div className="w-full sm:w-64 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-medium">{isAr ? "المجموع قبل الضريبة :" : "Sous-total HT :"}</span>
                        <span className="font-bold text-slate-900">{subtotal.toLocaleString("fr-FR")} MRU</span>
                      </div>

                      {taxRate > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span className="font-medium">{isAr ? `ضريبة القيمة المضافة (${taxRate}%) :` : `TVA légale (${taxRate}%) :`}</span>
                          <span className="font-bold text-slate-900">{taxAmount.toLocaleString("fr-FR")} MRU</span>
                        </div>
                      )}

                      {depositAmount > 0 && (
                        <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200 text-[11px]">
                          <span className="font-medium">{isAr ? `العربون (${activeDepositPercentage}%) :` : `Acompte (${activeDepositPercentage}%) :`}</span>
                          <span className="font-bold text-slate-900">{depositAmount.toLocaleString("fr-FR")} MRU</span>
                        </div>
                      )}

                      {depositAmount > 0 && (
                        <div className="flex justify-between text-slate-600 text-[11px]">
                          <span className="font-medium">{isAr ? "المتبقي للتحصيل :" : "Solde restant :"}</span>
                          <span className="font-bold text-slate-900">{remainingAmount.toLocaleString("fr-FR")} MRU</span>
                        </div>
                      )}

                      {/* Bandeau TOTAL Plein Bleu Signature (#0284c7) */}
                      <div className="w-full bg-sky-600 text-white p-2.5 rounded-lg flex justify-between items-center mt-2 shadow-xs">
                        <span className="text-[11px] font-extrabold tracking-wider uppercase whitespace-nowrap">
                          {isAr ? "المجموع الكلي الصافي :" : "TOTAL NET TTC :"}
                        </span>
                        <span className="text-base font-black tracking-tight tabular-nums whitespace-nowrap">
                          {total.toLocaleString("fr-FR")} MRU
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* 5. COORDONNÉES DE PAIEMENT & CONDITIONS */}
                  <div className="relative z-10 border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 text-[10.5px]">
                    <div className="sm:col-span-8 space-y-0.5">
                      <p className="font-bold text-slate-900">
                        {isAr ? `الدفع لأمر : ${company?.name || "المؤسسة"}` : `Paiement à l'ordre de ${company?.name || "Facturim Mauritanie SARL"}`}
                      </p>
                      <p className="text-slate-600">
                        N° Bankily / Masrvi / Compte : <span className="font-bold text-slate-900 font-mono">{company?.phone || "+222 45 25 00 00"}</span>
                      </p>
                      <p className="text-slate-400 text-[9.5px]">
                        {notes || "Paiement par Bankily, Masrvi ou virement bancaire."}
                      </p>
                    </div>

                    <div className="sm:col-span-4 text-left sm:text-right space-y-0.5">
                      <p className="font-bold text-slate-900">{isAr ? "شروط الدفع" : "Conditions de paiement"}</p>
                      <p className="text-slate-600">{paymentTerms}</p>
                    </div>
                  </div>

                  {/* Mention de fin centrée & Facturim Année */}
                  <div className="relative z-10 text-center pt-2 border-t border-slate-100">
                    <div className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
                      {isAr ? "شكراً لثقتكم بنا" : "MERCI DE VOTRE CONFIANCE"}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-1 text-[9px] font-extrabold text-slate-400 tracking-wider">
                      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-sky-600 text-white text-[7px] font-black">FI</span>
                      <span className="text-slate-600 font-black">FACTURIM</span>
                      <span className="text-slate-300">•</span>
                      <span>{new Date(issueDate).getFullYear() || 2026}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PIED DE LA MODAL : ACTIONS GLOBALES & MOBILE RESPONSIVE */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Total net :</span>
            <span className="font-black text-sm text-sky-600 tabular-nums">
              {formatMoney(total)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Bouton Partager PDF universel (Mobile / Desktop) */}
            <button
              type="button"
              disabled={isGeneratingPDF}
              onClick={handleSharePDF}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              title="Partager le PDF via WhatsApp / Fichiers"
            >
              <Share2 size={14} />
              <span>Partager PDF</span>
            </button>

            {/* Bouton Télécharger PDF */}
            <button
              type="button"
              disabled={isGeneratingPDF}
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-60"
            >
              <Download size={14} />
              <span>Télécharger PDF ({isAr ? "العربية" : "FR"})</span>
            </button>

            {/* Bouton Voir / Ouvrir PDF (Fallback navigateur) */}
            <button
              type="button"
              disabled={isGeneratingPDF}
              onClick={handleOpenPDF}
              className="hidden md:inline-flex items-center justify-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink size={13} />
            </button>

            {/* Bouton Enregistrer Brouillon */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveInvoice(false)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <FileText size={14} />
              <span>Brouillon</span>
            </button>

            {/* Bouton Émettre Facture */}
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
