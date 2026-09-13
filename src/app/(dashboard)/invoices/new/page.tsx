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
} from "lucide-react";
import toast from "react-hot-toast";
import { getClients, createClient } from "@/lib/services/clientService";
import { createInvoice } from "@/lib/services/invoiceService";
import { getCompany } from "@/lib/services/companyService";
import { Client } from "@/lib/types";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
  const [taxRate, setTaxRate] = useState<number>(18);
  const [paymentTerms, setPaymentTerms] = useState("Paiement sous 30 jours");
  const [notes, setNotes] = useState(
    "Merci pour votre confiance. Règlements acceptés par virement bancaire ou Mobile Money (Wave / Orange Money)."
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
      const saved = localStorage.getItem("sen_facture_company_logo");
      if (saved) setCompanyLogo(saved);
    }
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

  // Gestion des lignes
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "Nouvelle prestation...",
        quantity: 1,
        unitPrice: 150000,
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
    const msg = `Bonjour ${currentClient.name},\nVoici votre facture *${invoiceNumber}* émise par SEN FACTURE pour un montant total de *${total.toLocaleString("fr-FR")} FCFA*.\nDate d'échéance : ${dueDate}.\nMerci de votre confiance !`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("Lien WhatsApp prêt pour le partage !");
  };

  return (
    <div className="space-y-6">
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
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Share2 size={15} />
            <span className="hidden md:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.print();
              toast.success("Impression lancée");
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
          >
            <Printer size={15} />
            <span className="hidden md:inline">Imprimer</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>{isSaving ? "Enregistrement..." : "Valider la facture"}</span>
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
                      Prix unit. (FCFA)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(
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
                      onClick={() => removeItem(item.id)}
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
                <option value={18}>18% (Taux standard Sénégal)</option>
                <option value={0}>0% (Exonération)</option>
                <option value={16}>16% (Mauritanie - Prévu)</option>
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
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Synchronisé
            </span>
          </div>

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

            {/* Totaux */}
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

            {/* Pied de page */}
            <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1.5">
              <p>
                <strong className="text-slate-700">Modalités :</strong> {paymentTerms}
              </p>
              <p className="leading-snug">{notes}</p>
              <div className="pt-2 text-center text-[9px] text-slate-400 font-medium">
                SEN FACTURE — Document conforme aux normes comptables et fiscales du Sénégal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
