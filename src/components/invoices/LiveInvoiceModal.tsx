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
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import { getClients, createClient } from "@/lib/services/clientService";
import { createInvoice } from "@/lib/services/invoiceService";
import { getCompany } from "@/lib/services/companyService";
import { Client } from "@/lib/types";

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
  const [paymentTerms, setPaymentTerms] = useState("Paiement sous 30 jours");
  const [taxRate, setTaxRate] = useState<number>(18); // TVA standard Sénégal : 18%
  const [notes, setNotes] = useState(
    "Merci pour votre confiance. Règlements acceptés par virement bancaire, chèque ou Mobile Money (Wave / Orange Money)."
  );

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "Prestation de service",
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
  }, [isOpen]);

  useEffect(() => {
    const updateLogo = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sen_facture_company_logo");
        setCompanyLogo(saved || null);
      }
    };
    updateLogo();
    window.addEventListener("company-logo-updated", updateLogo);
    return () => window.removeEventListener("company-logo-updated", updateLogo);
  }, []);

  // Client sélectionné
  const currentClient = useMemo(() => {
    if (selectedClientId === "custom") {
      return {
        name: customClientName || "Nouveau Client Entreprise",
        email: "client@entreprise.sn",
        phone: "+221 77 000 00 00",
        address: "Dakar, Sénégal",
        taxId: "NINEA-EN-COURS",
      };
    }
    return (
      clientsList.find((c) => c.id === selectedClientId) || {
        name: "Client Inconnu",
        email: "contact@client.sn",
        phone: "+221 33 000 00 00",
        address: "Dakar, Sénégal",
        taxId: "NINEA-0000000",
      }
    );
  }, [selectedClientId, customClientName, clientsList]);

  // Calculs en temps réel
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return Math.round((subtotal * taxRate) / 100);
  }, [subtotal, taxRate]);

  const total = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  // Gestion des articles
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "Nouvelle prestation ou article",
        quantity: 1,
        unitPrice: 100000,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      toast.error("Une facture doit comporter au moins un article");
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  // Enregistrer la facture dans Supabase
  const handleSaveInvoice = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      toast.loading("Enregistrement dans Supabase...", { id: "save-inv" });

      let finalClientId = selectedClientId;
      if (selectedClientId === "custom" || !selectedClientId) {
        const createdClient = await createClient({
          name: customClientName.trim() || "Nouveau Client Entreprise",
          email: "contact@entreprise.sn",
          phone: "+221 77 000 00 00",
          address: "Dakar, Sénégal",
          country: "Sénégal",
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
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.quantity * it.unitPrice,
        })),
      });

      toast.success(`Facture ${created.invoiceNumber} enregistrée dans Supabase !`, {
        id: "save-inv",
      });

      if (onInvoiceCreated) {
        onInvoiceCreated(created);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("invoice-created", { detail: created })
        );
      }
      onClose();
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
    const message = `Bonjour ${currentClient.name},\nVoici votre facture *${invoiceNumber}* d'un montant de *${total.toLocaleString("fr-FR")} FCFA* émise par SEN FACTURE.\nDate d'échéance : ${dueDate}.\nMerci de votre confiance !`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("Lien WhatsApp généré !");
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

    toast.loading("Génération du document A4...", { id: "pdf-gen" });
    const ok = await downloadInvoicePDF(invoiceData);
    if (ok) {
      toast.success(`Facture ${invoiceNumber} téléchargée en PDF !`, { id: "pdf-gen" });
    } else {
      toast.error("Erreur lors de la création du fichier PDF", { id: "pdf-gen" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 lg:p-6 overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[96vh] overflow-hidden">
        {/* ======================================================== */}
        {/* EN-TÊTE DE LA MODAL / ATELIER DE CRÉATION */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Edit3 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Création de facture avec aperçu A4 en direct
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Direct
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Toutes vos modifications sont rendues en temps réel sur le document officiel
              </p>
            </div>
          </div>

          {/* Boutons d'actions et fermeture */}
          <div className="flex items-center gap-2">
            {/* Bascule Mobile Formulaire / Aperçu */}
            <div className="flex lg:hidden bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setMobileTab("form")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  mobileTab === "form"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500"
                }`}
              >
                Formulaire
              </button>
              <button
                onClick={() => setMobileTab("preview")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
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
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CORPS SPLIT 50/50 : FORMULAIRE À GAUCHE, APERÇU À DROITE */}
        {/* ======================================================== */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* PANNEAU GAUCHE : FORMULAIRE DE SAISIE */}
          <div
            className={`lg:col-span-6 p-4 sm:p-6 overflow-y-auto space-y-5 bg-white border-r border-slate-200 ${
              mobileTab === "form" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Section 1 : Client & Identifiants */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 size={14} className="text-sky-600" />
                <span>Destinataire de la facture</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sélectionner un client
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
                    <option value="custom">+ Autre client (personnalisé)</option>
                  </select>
                </div>

                {selectedClientId === "custom" && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nom de l&apos;entreprise cliente
                    </label>
                    <input
                      type="text"
                      value={customClientName}
                      onChange={(e) => setCustomClientName(e.target.value)}
                      placeholder="Ex: GIE Teranga Sénégal"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Numéro de référence
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date d&apos;émission
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date d&apos;échéance
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2 : Lignes d'articles et prestations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText size={14} className="text-sky-600" />
                  <span>Articles & Prestations</span>
                </h3>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  <span>Ajouter une ligne</span>
                </button>
              </div>

              {/* Liste dynamique des articles */}
              <div className="space-y-2.5">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-12 gap-2.5 items-center text-xs"
                  >
                    <div className="col-span-12 sm:col-span-6">
                      <label className="block font-medium text-slate-500 text-[10px] mb-0.5">
                        Désignation prestation / article #{index + 1}
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "description", e.target.value)
                        }
                        placeholder="Description..."
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
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            "quantity",
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold text-center focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label className="block font-medium text-slate-500 text-[10px] mb-0.5">
                        Prix unit. (FCFA)
                      </label>
                      <input
                        type="number"
                        step="500"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            "unitPrice",
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex justify-center pt-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                        title="Supprimer la ligne"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 : TVA et modalités */}
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
                  <option value={18}>18% (Taux légal standard Sénégal / UEMOA)</option>
                  <option value={0}>0% (Exonéré de TVA / Export)</option>
                  <option value={16}>16% (Taux Mauritanie pour plus tard)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Conditions de règlement
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
                Mentions & Coordonnées de paiement
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* PANNEAU DROIT : VRAIE FEUILLE A4 RENDUE EN TEMPS RÉEL */}
          {/* ======================================================== */}
          <div
            className={`lg:col-span-6 p-4 sm:p-6 overflow-y-auto bg-slate-200/60 flex flex-col items-center justify-start ${
              mobileTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Barre de contrôle de l'aperçu */}
            <div className="w-full max-w-[560px] flex items-center justify-between pb-3 text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1.5 text-slate-700">
                <Sparkles size={14} className="text-sky-600" />
                Aperçu officiel (Format A4)
              </span>
              <span className="text-[11px] text-slate-500">Mise à jour instantanée</span>
            </div>

            {/* La feuille A4 virtuelle */}
            <div id="live-invoice-preview-sheet" className="w-full max-w-[560px] bg-white rounded-xl shadow-xl border border-slate-300/80 p-6 sm:p-8 space-y-6 text-slate-800 text-xs transition-all">
              {/* En-tête de la facture A4 */}
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
                        SF
                      </div>
                    )}
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      SEN FACTURE
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                    <p className="font-medium text-slate-700">Teranga Digital SARL</p>
                    <p>46 Boulevard de la République, Dakar Plateau</p>
                    <p>NINEA : SN-009876543-2B</p>
                    <p>Tél : +221 77 123 45 67 | contact@senfacture.sn</p>
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

              {/* Bloc Client Facturé à */}
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
                    En cours d&apos;émission
                  </span>
                </div>
              </div>

              {/* Tableau A4 des prestations */}
              <div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-900 text-[11px] font-bold">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-center">Qté</th>
                      <th className="py-2 text-right">Prix unit.</th>
                      <th className="py-2 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.id} className="text-[11px]">
                        <td className="py-2.5 pr-2 font-medium text-slate-800">
                          {it.description}
                        </td>
                        <td className="py-2.5 text-center text-slate-600 font-semibold">
                          {it.quantity}
                        </td>
                        <td className="py-2.5 text-right text-slate-600">
                          {it.unitPrice.toLocaleString("fr-FR")} F
                        </td>
                        <td className="py-2.5 text-right font-bold text-slate-900">
                          {(it.quantity * it.unitPrice).toLocaleString("fr-FR")} FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bloc Récapitulatif et Totaux */}
              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <div className="w-64 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Sous-total HT :</span>
                    <span className="font-semibold text-slate-800">
                      {subtotal.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>

                  {taxRate > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>TVA ({taxRate}%) :</span>
                      <span className="font-semibold text-slate-800">
                        {taxAmount.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900 text-slate-900">
                    <span className="text-xs font-bold uppercase">Total TTC :</span>
                    <span className="text-sm sm:text-base font-black text-sky-600">
                      {total.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes et Pied de page A4 */}
              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1.5">
                <p>
                  <strong className="text-slate-700">Modalités :</strong> {paymentTerms}
                </p>
                <p className="leading-snug">{notes}</p>
                <div className="pt-2 text-center text-[9px] text-slate-400 font-medium">
                  SEN FACTURE — Document généré conformément à la réglementation fiscale OHADA / Sénégal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PIED DE LA MODAL : ACTIONS GLOBALES (WHATSAPP, PDF, ENREGISTRER) */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Montant total net :</span>
            <span className="font-extrabold text-sm text-sky-600">
              {total.toLocaleString("fr-FR")} FCFA
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Partage WhatsApp direct */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <Share2 size={15} />
              <span>Partager sur WhatsApp</span>
            </button>

            {/* Télécharger le PDF A4 officiel */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <Download size={15} />
              <span>Télécharger le PDF</span>
            </button>

            {/* Imprimer */}
            <button
              type="button"
              onClick={() => {
                window.print();
                toast.success("Impression lancée");
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Printer size={15} />
              <span>Imprimer</span>
            </button>

            {/* Enregistrer et valider la facture */}
            <button
              type="button"
              onClick={handleSaveInvoice}
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>{isSaving ? "Enregistrement..." : "Valider & Enregistrer"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
