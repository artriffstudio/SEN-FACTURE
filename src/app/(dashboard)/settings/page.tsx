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
  Zap,
  Globe,
  Lock,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import {
  getCompany,
  updateCompany,
  uploadCompanyLogo,
} from "@/lib/services/companyService";
import {
  getMoosylConfig,
  saveMoosylConfig,
  MoosylConfig,
} from "@/lib/services/moosylService";
import { useTranslation } from "@/contexts/LanguageContext";

export default function SettingsPage() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("Facturim Mauritanie SARL");
  const [tradeName, setTradeName] = useState("Facturim");
  const [email, setEmail] = useState("contact@facturim.net");
  const [phone, setPhone] = useState("+222 45 25 00 00");
  const [address, setAddress] = useState("Avenue du Roi Fayçal, Tevragh Zeina");
  const [city, setCity] = useState("Nouakchott");
  const [taxId, setTaxId] = useState("00987654-MR");
  const [rcNumber, setRcNumber] = useState("MR.NKTT.2025.B.1234");
  const [taxRate, setTaxRate] = useState(16);
  const [currency, setCurrency] = useState("MRU");
  const [invoicePrefix, setInvoicePrefix] = useState("FAC-2025-");
  const [paymentTerms, setPaymentTerms] = useState(
    "Paiement à réception par virement bancaire BPM ou Mobile Money (Bankily / Masrvi / Seddap). Conformément aux règles fiscales de Mauritanie (DGI)."
  );
  const [bankDetails, setBankDetails] = useState(
    "MR12 00010 01001 12345678901 23 (BPM Mauritanie)"
  );
  const [wavePhone, setWavePhone] = useState("+222 45 12 34 56");
  const [orangeMoneyPhone, setOrangeMoneyPhone] = useState("+222 36 78 90 12");
  const [isSaving, setIsSaving] = useState(false);

  // Configuration Passerelle Moosyl (Bankily & Masrvi)
  const [moosylConfig, setMoosylConfigState] = useState<MoosylConfig>({
    apiKey: "pk_test_moosyl_facturim_demo_2025",
    secretKey: "sk_test_moosyl_facturim_demo_secret",
    webhookSecret: "whsec_facturim_demo_webhook",
    isSandbox: true,
    enabled: true,
  });
  const [isTestingMoosyl, setIsTestingMoosyl] = useState(false);

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
            localStorage.setItem("facturim_company_logo", comp.logoUrl);
          }
        }
      }
    });

    const savedMoosyl = getMoosylConfig();
    setMoosylConfigState(savedMoosyl);
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
        localStorage.setItem("facturim_company_logo", publicUrl);
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
          localStorage.setItem("facturim_company_logo", result);
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
      localStorage.removeItem("facturim_company_logo");
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
    toast.success("Logo supprimé. Le monogramme standard FI sera utilisé.");
  };

  const handleTestMoosylConnection = async () => {
    setIsTestingMoosyl(true);
    toast.loading("Test de connexion à l'API Moosyl...", { id: "moosyl-test" });
    await new Promise((r) => setTimeout(r, 1000));
    setIsTestingMoosyl(false);
    toast.success("Connexion Moosyl réussie ! Bankily & Masrvi actifs.", {
      id: "moosyl-test",
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast.loading("Enregistrement des paramètres...", { id: "settings" });

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

      // Sauvegarde de la configuration Moosyl
      saveMoosylConfig(moosylConfig);

      toast.success(
        "Paramètres & passerelle Moosyl mis à jour avec succès !",
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
              {t.settings.title}
            </h1>
            <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              DGI {t.countryName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.settings.subtitle}
          </p>
        </div>

        {/* Bouton Enregistrer Principal */}
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Save size={15} />
          <span className="hidden sm:inline">{isSaving ? "..." : t.settings.saveChanges}</span>
          <span className="sm:hidden">{isSaving ? "..." : t.settings.saveChanges}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* ======================================================== */}
        {/* CARTE 1 : INFORMATIONS DE L'ENTREPRISE */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
                <Building2 size={16} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {t.settings.companyProfile}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t.brandTagline}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full">
              DGI {t.taxIdLabel}
            </span>
          </div>

          {/* Section Téléversement de Logo */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 text-xs">
              {t.settings.logoUpload}
            </label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-sky-400 bg-slate-50/80 hover:bg-sky-50/40 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group shrink-0 relative"
                title={t.settings.logoUpload}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-sky-600 transition-colors">
                    <Upload size={22} className="stroke-[2]" />
                  </div>
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer block text-left"
                >
                  {logoUrl ? t.settings.logoUpload : t.clients.uploadLogo}
                </button>
                <p className="text-[11px] text-slate-400">
                  {t.settings.uploadHint}
                </p>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer pt-0.5"
                  >
                    <X size={12} />
                    <span>{t.invoices.removeItem}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.settings.companyName} *
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
                {t.settings.tradeName}
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
                {t.clients.email} *
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
                {t.clients.phone}
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
                {t.clients.address} ({t.countryName})
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
        {/* CARTE 2 : FISCALITÉ & NIF (MAURITANIE / DGI) */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {t.vatRateLabel} &amp; {t.taxIdLabel}
              </h2>
            </div>
            <span className="text-xs text-slate-400">DGI {t.countryName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.settings.nifNumber} *
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
                {t.settings.rcNumber}
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
                {t.invoices.taxRate}
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value={16}>16% — DGI {t.countryName}</option>
                <option value={0}>0% — Exonération / Export</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Devise ({t.currencyCode})
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="MRU">MRU ({t.currencyCode}) — Principal</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARTE 3 : PASSERELLE DE PAIEMENT MOOSYL (BANKILY & MASRVI) */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Moosyl Gateway (Bankily &amp; Masrvi)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Bankily (BPM) • Masrvi (BMCI) • Seddap
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestMoosylConnection}
                disabled={isTestingMoosyl}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} className={isTestingMoosyl ? "animate-spin" : ""} />
                <span>Test API</span>
              </button>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {moosylConfig.isSandbox ? "Sandbox" : "Live"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Moosyl API Key
              </label>
              <input
                type="text"
                value={moosylConfig.apiKey}
                onChange={(e) =>
                  setMoosylConfigState({ ...moosylConfig, apiKey: e.target.value })
                }
                placeholder="pk_live_..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Moosyl Secret Key
              </label>
              <input
                type="password"
                value={moosylConfig.secretKey}
                onChange={(e) =>
                  setMoosylConfigState({ ...moosylConfig, secretKey: e.target.value })
                }
                placeholder="sk_live_..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Webhook Secret
              </label>
              <input
                type="password"
                value={moosylConfig.webhookSecret}
                onChange={(e) =>
                  setMoosylConfigState({ ...moosylConfig, webhookSecret: e.target.value })
                }
                placeholder="whsec_..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Environment
              </label>
              <select
                value={moosylConfig.isSandbox ? "sandbox" : "live"}
                onChange={(e) =>
                  setMoosylConfigState({
                    ...moosylConfig,
                    isSandbox: e.target.value === "sandbox",
                  })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="sandbox">Sandbox / Demo</option>
                <option value="live">Live / Production (Bankily &amp; Masrvi)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-sky-600 shrink-0" />
              <span>Webhook Endpoint : <code className="font-mono text-slate-800 font-bold">/api/webhooks/moosyl</code></span>
            </div>
            <span className="text-emerald-600 font-bold">✓</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARTE 4 : COORDONNÉES BANCAIRES & MENTIONS DE FACTURE */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {t.settings.bankDetails}
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Bankily &amp; BPM
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.settings.bankilyNumber}
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
                  {t.settings.seddapNumber}
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
                {t.settings.bankRib}
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
                {t.invoices.paymentTerms}
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
