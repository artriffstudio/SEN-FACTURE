"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  FileText,
  User,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { createInvoice } from "@/lib/services/invoiceService";
import { createClient } from "@/lib/services/clientService";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import { BankilyLogo, MasrviLogo, SedadLogo, BPMLogo } from "@/components/ui/PaymentLogos";

interface SimpleInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ItemLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function SimpleInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
}: SimpleInvoiceModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "bankily" | "masrvi" | "sedad" | "bpm" | "cash"
  >("bankily");

  const [items, setItems] = useState<ItemLine[]>([
    {
      id: "1",
      description: "Prestation de service / Vente",
      quantity: 1,
      unitPrice: 50000,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const total = items.reduce(
    (acc, it) => acc + (it.quantity || 0) * (it.unitPrice || 0),
    0
  );

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
      toast.error("La facture doit comporter au moins une ligne");
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (
    id: string,
    field: "description" | "quantity" | "unitPrice",
    val: any
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const handleSave = async (downloadPDFAfter: boolean = false) => {
    if (!clientName.trim()) {
      toast.error("Veuillez renseigner le nom du client");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading("Génération de la facture...", { id: "simple-inv" });

      // 1. Créer ou associer le client
      const createdClient = await createClient({
        name: clientName.trim(),
        email: clientEmail.trim() || `contact@${clientName.toLowerCase().replace(/\s+/g, "")}.mr`,
        phone: clientPhone.trim() || "+222 45 00 00 00",
        address: "Nouakchott",
        country: "Mauritanie",
      });

      // 2. Créer la facture
      const invoiceData = await createInvoice({
        clientId: createdClient.id,
        issueDate,
        dueDate: issueDate,
        status: "sent",
        notes: `Règlement via ${paymentMethod.toUpperCase()}. Merci pour votre confiance.`,
        items: items.map((it) => ({
          description: it.description.trim() || "Prestation",
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
        })),
      });

      if (downloadPDFAfter) {
        await downloadInvoicePDF({
          reference: invoiceData.invoiceNumber,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          date: new Date(issueDate).toLocaleDateString("fr-FR"),
          total,
          taxRate: 0,
          status: "sent",
          items: items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        });
      }

      toast.success(
        `Facture ${invoiceData.invoiceNumber} créée avec succès !`,
        { id: "simple-inv" }
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de la création", {
        id: "simple-inv",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* En-tête simple */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Nouvelle Facture
              </h3>
              <p className="text-[11px] text-slate-400">
                Saisie rapide et épurée
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Corps du formulaire */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Section 1 : Client */}
          <div className="space-y-3">
            <label className="block font-bold text-slate-800 text-xs">
              Client
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Nom du client ou entreprise *"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 font-medium"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Téléphone (ex: 45 00 00 00)"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 text-slate-900"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email (facultatif)"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2 : Prestations & Lignes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs">
                Articles / Prestations
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-[11px] text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <input
                    type="text"
                    placeholder="Description de la prestation..."
                    value={it.description}
                    onChange={(e) =>
                      updateItem(it.id, "description", e.target.value)
                    }
                    className="flex-1 bg-transparent text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <div className="w-16">
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) =>
                        updateItem(it.id, "quantity", Number(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-xs font-semibold"
                      title="Quantité"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      min={0}
                      value={it.unitPrice}
                      onChange={(e) =>
                        updateItem(it.id, "unitPrice", Number(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-right text-xs font-bold text-slate-900"
                      title="Prix unitaire (MRU)"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 : Mode de paiement */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              Moyen de règlement souhaité
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "bankily", label: "Bankily", icon: <BankilyLogo height={16} /> },
                { id: "masrvi", label: "Masrvi", icon: <MasrviLogo height={16} /> },
                { id: "sedad", label: "Sedad", icon: <SedadLogo height={16} /> },
                { id: "bpm", label: "Virement BPM", icon: <BPMLogo height={16} /> },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id as any)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === opt.id
                      ? "border-sky-500 bg-sky-50/80 shadow-xs ring-1 ring-sky-300 font-bold"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="h-6 flex items-center justify-center mb-1">
                    {opt.icon}
                  </div>
                  <span className="text-[10px] truncate max-w-full">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Récapitulatif du total */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 text-white shadow-sm">
            <span className="font-medium text-slate-300">Total Net :</span>
            <span className="text-base sm:text-lg font-black text-sky-400">
              {total.toLocaleString("fr-FR")} MRU
            </span>
          </div>
        </div>

        {/* Pied d'actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200/70 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>Créer &amp; Télécharger PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
