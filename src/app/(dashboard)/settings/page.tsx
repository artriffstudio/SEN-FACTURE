"use client";

import { useState, useRef, useEffect } from "react";
import {
  Save,
  Building2,
  ShieldCheck,
  CreditCard,
  FileText,
  CheckCircle2,
  Upload,
  Sparkles,
  X,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import {
  getCompany,
  updateCompany,
  uploadCompanyLogo,
} from "@/lib/services/companyService";

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("ARTRIFF STUDIO");
  const [tradeName, setTradeName] = useState("SEN FACTURE");
  const [email, setEmail] = useState("contact@artriffstudio.com");
  const [phone, setPhone] = useState("+221 77 890 12 34");
  const [address, setAddress] = useState("Almadies, Zone 4");
  const [city, setCity] = useState("Dakar");
  const [taxId, setTaxId] = useState("SN-009876543-2B");
  const [rcNumber, setRcNumber] = useState("SN.DKR.2024.B.12345");
  const [taxRate, setTaxRate] = useState(18);
  const [currency, setCurrency] = useState("XOF");
  const [invoicePrefix, setInvoicePrefix] = useState("FAC-2025-");
  const [paymentTerms, setPaymentTerms] = useState(
    "Paiement sous 30 jours nets. Règlements acceptés par Wave Mobile Money, Orange Money ou virement bancaire."
  );
  const [bankDetails, setBankDetails] = useState(
    "SN012 01001 036156789012 45 (BICIS Sénégal)"
  );
  const [wavePhone, setWavePhone] = useState("+221 77 890 12 34");
  const [orangeMoneyPhone, setOrangeMoneyPhone] = useState("+221 78 543 21 00");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getCompany().then((comp) => {
      if (comp) {
        setCompanyName(comp.name);
        setEmail(comp.email);
        if (comp.phone) setPhone(comp.phone);
        if (comp.address) setAddress(comp.address);
        if (comp.city) setCity(comp.city);
        if (comp.taxId) setTaxId(comp.taxId);
        if (comp.taxRate) setTaxRate(comp.taxRate);
        if (comp.invoicePrefix) setInvoicePrefix(comp.invoicePrefix);
        if (comp.termsAndConditions) setPaymentTerms(comp.termsAndConditions);
        if (comp.logoUrl) {
          setLogoUrl(comp.logoUrl);
          if (typeof window !== "undefined") {
            localStorage.setItem("sen_facture_company_logo", comp.logoUrl);
          }
        }
      }
    });
  }, []);

  const handleLogoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP)."
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        "Le fichier dépasse 2 Mo. Veuillez choisir une image plus légère."
      );
      return;
    }

    toast.loading("Téléversement sur Supabase Storage...", {
      id: "upload-logo",
    });
    try {
      const publicUrl = await uploadCompanyLogo(file, file.name);
      setLogoUrl(publicUrl);
      if (typeof window !== "undefined") {
        localStorage.setItem("sen_facture_company_logo", publicUrl);
        window.dispatchEvent(
          new CustomEvent("company-logo-updated", { detail: publicUrl })
        );
      }
      toast.success(
        "Logo d'entreprise sauvegardé dans Supabase Storage !",
        { id: "upload-logo" }
      );
    } catch (err: any) {
      console.warn("Upload Cloud fallback local:", err);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        if (typeof window !== "undefined") {
          localStorage.setItem("sen_facture_company_logo", result);
          window.dispatchEvent(
            new CustomEvent("company-logo-updated", { detail: result })
          );
        }
        toast.success("Logo chargé localement", { id: "upload-logo" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoUrl(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sen_facture_company_logo");
      window.dispatchEvent(
        new CustomEvent("company-logo-updated", { detail: null })
      );
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    try {
      await updateCompany({ logoUrl: undefined });
    } catch (err) {
      console.error(err);
    }
    toast.success("Logo supprimé. Le logo standard SF sera utilisé.");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast.loading("Enregistrement dans Supabase...", { id: "settings" });

    try {
      await updateCompany({
        name: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        taxId: taxId.trim(),
        taxRate: Number(taxRate),
        invoicePrefix: invoicePrefix.trim(),
        termsAndConditions: paymentTerms.trim(),
        logoUrl: logoUrl || undefined,
      });
      toast.success(
        "Paramètres de l'entreprise mis à jour dans Supabase !",
        { id: "settings" }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de l'enregistrement", {
        id: "settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Input de fichier masqué */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoFileChange}
        accept="image/png, image/jpeg, image/svg+xml, image/webp"
        className="hidden"
      />

      {/* ======================================================== */}
      {/* EN-TÊTE DE LA PAGE */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Paramètres de l&apos;entreprise
            </h1>
            <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              SYSCOHADA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configurez vos identifiants fiscaux NINEA, vos coordonnées bancaires et vos mentions légales de facturation.
          </p>
        </div>

        {/* Bouton Enregistrer Principal (responsive et compact sur mobile) */}
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Save size={15} />
          <span className="hidden sm:inline">{isSaving ? "Enregistrement..." : "Enregistrer les modifications"}</span>
          <span className="sm:hidden">{isSaving ? "Envoi..." : "Enregistrer"}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* ======================================================== */}
        {/* CARTE 1 : INFORMATIONS DE L'ENTREPRISE (EXACTEMENT COMME SUR LA CAPTURE) */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
                <Building2 size={16} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Informations de l&apos;entreprise
                </h2>
                <p className="text-[11px] text-slate-500">
                  Ces informations apparaîtront sur vos factures.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full">
              Compte Vérifié
            </span>
          </div>

          {/* Section Téléversement de Logo Officiel */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 text-xs">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {/* Cadre pointillé de téléversement interactif */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-sky-400 bg-slate-50/80 hover:bg-sky-50/40 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group shrink-0 relative"
                title="Cliquez pour sélectionner votre logo"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo officiel"
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-sky-600 transition-colors">
                    <Upload size={22} className="stroke-[2]" />
                  </div>
                )}
              </div>

              {/* Textes et actions du logo */}
              <div className="space-y-1 min-w-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer block text-left"
                >
                  {logoUrl ? "Changer le logo" : "Télécharger un logo"}
                </button>
                <p className="text-[11px] text-slate-400">
                  PNG, JPG ou SVG. Max 2 Mo.
                </p>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer pt-0.5"
                  >
                    <X size={12} />
                    <span>Supprimer le logo personnalisé</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Raison sociale officielle *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nom commercial / Marque
              </label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email de facturation *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Téléphone professionnel
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Adresse du siège social (Sénégal)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARTE 2 : FISCALITÉ & NINEA (SÉNÉGAL / SYSCOHADA) */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Fiscalité & Identifiants Réglementaires
              </h2>
            </div>
            <span className="text-xs text-slate-400">DGID Sénégal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Numéro NINEA (Identifiant National) *
              </label>
              <input
                type="text"
                required
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registre du Commerce et du Crédit Mobilier (RCCM)
              </label>
              <input
                type="text"
                value={rcNumber}
                onChange={(e) => setRcNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Taux de TVA légal appliqué par défaut
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value={18}>18% — Taux légal standard Sénégal / UEMOA (SYSCOHADA)</option>
                <option value={0}>0% — Régime d&apos;exonération / Export</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Devise officielle
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="XOF">FCFA (Franc CFA) — Devise principale</option>
                <option value="EUR">EUR (Euro) — Parité fixe BCEAO</option>
                <option value="USD">USD (Dollar US) — Facturation export</option>
              </select>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARTE 3 : MODALITÉS DE PAIEMENT & MOBILE MONEY */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Modalités de Paiement & Passerelles Mobile Money
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Wave & Orange Money
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Numéro Wave Mobile Money pour encaissements
                </label>
                <input
                  type="text"
                  value={wavePhone}
                  onChange={(e) => setWavePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Numéro Orange Money (Marchand / Particulier)
                </label>
                <input
                  type="text"
                  value={orangeMoneyPhone}
                  onChange={(e) => setOrangeMoneyPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Coordonnées bancaires officielles (BICIS / CBAO / SGBS)
              </label>
              <input
                type="text"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Conditions générales et mentions en bas de facture A4
              </label>
              <textarea
                rows={2}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 resize-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
